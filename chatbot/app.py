from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from config import init_app_context, client, APP_CONTEXT
from backend_config import FRONTEND_URL, BACKEND_URL
import uuid
from collections import deque

# RAG and AI utilities
from rag_utils import (
    search_with_metadata_filtering,
    search_general_content,
    create_enhanced_context,
    create_general_context,
    get_tours_statistics,
    create_enhanced_context_for_booking
)
from image_search import (
    search_similar_images,
    create_image_search_context,
    verify_image_match_with_llm
)
from intent_classification import (
    classify_user_intent_with_ai,
    extract_filters_from_query,
    extract_tours_data_from_query_intent
)
from review_summary import get_reviews_for_product_from_db, review_cache, query_cache
import time
import json
import base64
import requests
from PIL import Image 
from datetime import datetime
import io

app = Flask(__name__)
# Cập nhật CORS để hỗ trợ React Frontend (Vite) và đảm bảo header có trên mọi phản hồi (kể cả SSE / lỗi)
_ALLOWED_ORIGINS = [
    FRONTEND_URL if 'FRONTEND_URL' in globals() and FRONTEND_URL else 'http://localhost:5173',
    'http://localhost:5173'
]

CORS(
    app,
    resources={r"/*": {
        "origins": _ALLOWED_ORIGINS,
        "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Cache-Control"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "expose_headers": ["Content-Type"]
    }},
    supports_credentials=False
)

# Đảm bảo mọi response đều có CORS headers (bao gồm cả SSE và lỗi 4xx/5xx)
@app.after_request
def add_cors_headers(response):
    origin = (request.headers.get('Origin') or '').rstrip('/')
    if origin in [o.rstrip('/') for o in _ALLOWED_ORIGINS]:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        # fallback dùng FRONTEND_URL mặc định khi không match
        response.headers['Access-Control-Allow-Origin'] = _ALLOWED_ORIGINS[0]
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control'
    response.headers['Access-Control-Max-Age'] = '86400'
    return response

# Bổ sung error handler để đảm bảo phản hồi lỗi cũng có CORS headers
@app.errorhandler(Exception)
def handle_exception(e):
    try:
        # Nếu là HTTPException, dùng status code sẵn có
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            status_code = e.code or 500
            message = getattr(e, 'description', 'Server error')
        else:
            status_code = 500
            message = 'Server error'
    except Exception:
        status_code = 500
        message = 'Server error'

    origin = (request.headers.get('Origin') or '').rstrip('/')
    allow_origin = origin if origin in [o.rstrip('/') for o in _ALLOWED_ORIGINS] else _ALLOWED_ORIGINS[0]

    resp = jsonify({'error': message})
    resp.status_code = status_code
    resp.headers['Access-Control-Allow-Origin'] = allow_origin
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control'
    resp.headers['Access-Control-Max-Age'] = '86400'
    return resp

# Khởi tạo ứng dụng
init_app_context(app)

# Biến toàn cục
answer_cache = {}
embedding_cache = {}

conversation_sessions = {}  # {session_id: {"history": deque, "last_activity": datetime}}
MAX_HISTORY_LENGTH = 20     # Giới hạn số tin nhắn trong lịch sử
SESSION_TIMEOUT = 30 * 60   # 30 phút timeout

index = app.config.get('index')
chunks_data = app.config.get('chunks_data')
embedder = app.config.get('embedder')


# 3. Thêm hàm helper để quản lý session
def get_or_create_session(session_id=None):
    """Lấy hoặc tạo session mới"""
    if not session_id:
        session_id = str(uuid.uuid4())
    
    current_time = datetime.now()
    
    # Làm sạch các session hết hạn
    expired_sessions = []
    for sid, session_data in conversation_sessions.items():
        if (current_time - session_data["last_activity"]).seconds > SESSION_TIMEOUT:
            expired_sessions.append(sid)
    
    for sid in expired_sessions:
        del conversation_sessions[sid]
    
    # Tạo session mới nếu chưa tồn tại
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = {
            "history": deque(maxlen=MAX_HISTORY_LENGTH),
            "last_activity": current_time
        }
    else:
        conversation_sessions[session_id]["last_activity"] = current_time
    
    return session_id

def add_to_conversation_history(session_id, role, content):
    """Thêm tin nhắn vào lịch sử hội thoại"""
    if session_id in conversation_sessions:
        conversation_sessions[session_id]["history"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

def get_conversation_context(session_id, max_messages=10):
    """Lấy ngữ cảnh hội thoại gần đây"""
    if session_id not in conversation_sessions:
        return []
    
    history = list(conversation_sessions[session_id]["history"])
    # Lấy max_messages tin nhắn gần nhất
    recent_history = history[-max_messages:] if len(history) > max_messages else history
    
    # Chuyển đổi format cho OpenAI API
    context_messages = []
    for msg in recent_history:
        context_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    return context_messages

@app.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    if request.method == 'OPTIONS':
        return Response('', status=204)
    print(f"=== NEW REQUEST TO /ask ===")
    print(f"Request content type: {request.content_type}")
    print(f"Request data: {request.get_data()[:200]}...")  # First 200 chars
    print(f"Request JSON: {request.json}")
    print(f"Raw query from JSON: {repr(request.json.get('query') if request.json else 'NO JSON')}")
    # Validation input
    try:
        raw_query = request.json.get('query', '')
        user_query = str(raw_query).strip() if raw_query is not None else ''
        session_id = request.json.get('session_id')
        
        # Kiểm tra query có hợp lệ không
        if not user_query or len(user_query) == 0:
            return Response(
                stream_with_context([
                    "data: " + json.dumps({'error': 'Query không được để trống', 'session_id': session_id}) + "\n\n"
                ]), 
                mimetype='text/event-stream'
            )
            
        if len(user_query) > 2000:  # Giới hạn độ dài query
            user_query = user_query[:2000]
            
    except Exception as e:
        return Response(
            stream_with_context([
                "data: " + json.dumps({'error': f'Invalid request format: {str(e)}'}) + "\n\n"
            ]), 
            mimetype='text/event-stream'
        )
    
    # Tạo hoặc lấy session
    session_id = get_or_create_session(session_id)
    
    # Kiểm tra cache với session_id
    cache_key = f"{session_id}:{user_query}"
    if cache_key in answer_cache:
        def cached_response():
            cached_answer = answer_cache[cache_key]
            words = cached_answer.split(' ')
            for i in range(0, len(words), 2):
                chunk = ' '.join(words[i:i+2])
                if i + 2 < len(words):
                    chunk += ' '
                yield "data: " + json.dumps({
                    'chunk': chunk, 
                    'session_id': session_id
                }) + "\n\n"
                time.sleep(0.05)
            yield "data: [DONE]\n\n"
        
        return Response(cached_response(), mimetype='text/event-stream', 
                       headers={'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no'})
    
    # Lấy ngữ cảnh hội thoại
    conversation_context = get_conversation_context(session_id, max_messages=6)
    print("conversation_context")
    print(conversation_context)
    
    user_intent = classify_user_intent_with_ai(user_query)
    print("User intent: " + user_intent)
    
    try:
        html_cards = ""  # HTML cards để trả về trực tiếp
        context = ""     # Plain context cho AI
        
        if user_intent == "tour_query":
            filters = extract_filters_from_query(user_query, user_intent)
            print("Extracted filters: " + str(filters))
            
            # Phát hiện trong nước vs nước ngoài
            query_lower = user_query.lower()
            if any(keyword in query_lower for keyword in ['trong nước', 'việt nam', 'nội địa', 'domestic']):
                print("🇻🇳 Detected: DOMESTIC tours only")
                # Chỉ tìm tour trong nước (Việt Nam)
                if not filters:
                    filters = {}
                filters['tour_type'] = 'domestic'
            elif any(keyword in query_lower for keyword in ['nước ngoài', 'quốc tế', 'international', 'châu á', 'châu âu', 'mỹ']):
                print("🌍 Detected: INTERNATIONAL tours only")
                # Chỉ tìm tour nước ngoài
                if not filters:
                    filters = {}
                filters['tour_type'] = 'international'
            
            search_results = search_with_metadata_filtering(user_query, top_k=5, filters=filters if filters else None,app=app)
            
            if not search_results:
                search_results = search_with_metadata_filtering(user_query, top_k=3, filters=None,app=app)
            
            context_data = create_enhanced_context(search_results)
            context = context_data['plain_context']
            html_cards = context_data['html_cards']
            # Whitelist slugs & tour names from search results to prevent hallucinated links
            allowed_slugs = [r.get('metadata', {}).get('slug') for r in search_results if r.get('metadata', {}).get('slug')]
            allowed_names = [r.get('metadata', {}).get('tour_name') for r in search_results if r.get('metadata', {}).get('tour_name')]
        
        elif user_intent == "booking_intent":
            tour_data = extract_tours_data_from_query_intent(user_query)
            print("tour_data: " + str(tour_data))
            tour_name = tour_data.get("tour_name", "").strip()
            filters = {}
            
            if tour_name:
                filters["tour_name"] = [tour_name.lower()]
                
            print("Filters being passed to search:")
            print(filters)
            print("Type of filters:", type(filters))
            
            search_results = search_with_metadata_filtering(tour_name, top_k=3, filters=filters if filters else None,app=app)
            
            print("search")
            print(search_results)
            
            if not search_results:
                search_results = search_with_metadata_filtering(tour_name, top_k=3, filters=None,app=app)
            
            if search_results:
                context_data = create_enhanced_context_for_booking(search_results, tour_data.get("num_people",1))
                context = context_data['plain_context']
                html_cards = context_data['html_cards']
            else:
                context = f"""=== KHÔNG TÌM THẤY TOUR ===
                Tour yêu cầu: {tour_name}
                Số người: {tour_data.get("num_people", 1)}
                
                Trạng thái: Không tìm thấy tour phù hợp """
                html_cards = f"""<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; margin: 12px 0;">
                    <p style="margin: 0; color: #856404;"><strong>⚠️ Không tìm thấy tour "{tour_name}"</strong></p>
                    <p style="margin: 8px 0 0 0; color: #856404;">Vui lòng thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi để được tư vấn.</p>
                </div>"""

            print("booking context")
            print(context)
                
        elif user_intent == "destination_query":
            stats = get_tours_statistics(app=app)
            destinations = stats.get('destinations', {})
            destination_list = list(destinations.keys())
            destination_count = len(destination_list)
            
            context = "=== THÔNG TIN ĐIỂM ĐẾN ===\n"
            context += "Tổng số điểm đến: " + str(destination_count) + "\n"
            context += "Danh sách điểm đến: " + ', '.join(destination_list) + "\n"
            html_cards = ""
            
        else:  # general_query
            search_results = search_general_content(user_query, top_k=3, app=app)
            context = create_general_context(search_results)
            html_cards = ""
        
    except Exception as e:
        print("Search error: " + str(e))
        context = "Xin lỗi, có lỗi xảy ra khi tìm kiếm thông tin."
        html_cards = ""
    
    def generate():
        # KHÔNG hiển thị HTML cards, chỉ dùng AI trả lời bằng text thuần
        yield "data: " + json.dumps({'chunk': '', 'session_id': session_id}) + "\n\n"
        time.sleep(0.1)
        
        # Tạo system message với context hiện tại
        if user_intent == "tour_query":
            system_content = f"""Bạn là trợ lý tư vấn du lịch chuyên nghiệp của Tour Booking System.

            CÂU HỎI CỦA KHÁCH: "{user_query}"
            
            THÔNG TIN TOUR TÌM ĐƯỢC:
            {context}
            
            HƯỚNG DẪN TRẢ LỜI:
            
            Bước 1: Phân tích câu hỏi
            - Khách hỏi về: trong nước/nước ngoài/cả hai?
            - Budget: rẻ/trung bình/cao cấp?
            - Loại tour: biển/núi/văn hóa/ẩm thực?
            - Thời gian: ngắn ngày/dài ngày?
            
            Bước 2: Lọc tour PHÙ HỢP với yêu cầu
            - CHỈ giới thiệu tour ĐÚNG với yêu cầu của khách
            - VD: Khách hỏi "trong nước" → KHÔNG giới thiệu tour nước ngoài
            - VD: Khách hỏi "giá rẻ" → CHỈ giới thiệu tour giá thấp
            
            Bước 3: Trả lời (1-2 câu ngắn gọn trả lời TRỰC TIẾP câu hỏi)
            
            Bước 4: Liệt kê 2-3 tour PHÙ HỢP NHẤT:
            
            **🌏 [Tên Tour chính xác]**
            - 📍 Điểm đến: [điểm đến]
            - ⏰ Thời gian: [X ngày Y đêm]
            - 💰 Giá: [giá chính xác] VNĐ/người
            - ✨ Nổi bật: [1-2 điểm đặc biệt]
            - 🔗 [Xem chi tiết](http://localhost:5173/tours/[slug chính xác từ context])
            
            Bước 5: Kết thúc (1 câu tư vấn/gợi ý phù hợp)
            
            LƯU Ý QUAN TRỌNG:
            - PHẢI copy CHÍNH XÁC slug từ context (tìm dòng "Slug: xxx")
            - KHÔNG được tự tạo slug, PHẢI dùng slug có sẵn trong context
            - Giá phải CHÍNH XÁC từ context
            - Tên tour phải CHÍNH XÁC từ context
            - Mỗi dòng XUỐNG DÒNG riêng
            - Dùng markdown (**, -, emoji)
            
            VÍ DỤ SLUG ĐÚNG:
            - Context có "Slug: ha-noi-ha-long-ninh-binh-3n2d" → Dùng slug này
            - KHÔNG được tạo "da-lat-2n1d" hay "phu-quoc-3n2d" tự do

            DANH SÁCH SLUG HỢP LỆ (CHỈ ĐƯỢC DÙNG NHỮNG SLUG NÀY):
            {', '.join(allowed_slugs) if 'allowed_slugs' in locals() and allowed_slugs else '(không có slug → KHÔNG chèn link)'}

            DANH SÁCH TÊN TOUR HỢP LỆ:
            {', '.join(allowed_names) if 'allowed_names' in locals() and allowed_names else '(không có)'}"""
            
        elif user_intent == "destination_query":
            system_content = f"""Bạn là một trợ lý tư vấn du lịch của Tour Booking System - hệ thống đặt tour du lịch hàng đầu.
            
            QUAN TRỌNG - XỬ LÝ NGỮ CẢNH:
            - Tham khảo cuộc hội thoại trước để hiểu rõ ngữ cảnh câu hỏi
            - Nếu khách hàng hỏi tiếp về điểm đến sau khi đã thảo luận tour, hãy liên kết thông tin
            
            NHIỆM VỤ:
            - Cung cấp thông tin về các điểm đến du lịch
            - Trả lời câu hỏi về số lượng điểm đến hoặc danh sách điểm đến
            - Nếu được yêu cầu, mô tả ngắn gọn về các điểm đến
            - Gợi ý các tour liên quan đến điểm đến
            
            THÔNG TIN ĐIỂM ĐẾN:
            {context}
            
            📍 Địa chỉ: Hà Nội, Việt Nam
            📧 Email: tourbooking@gmail.com
            📞 Hotline: 1900-xxxx
            Hãy trả lời câu hỏi của khách hàng một cách hữu ích."""
            
        elif user_intent == "booking_intent":
            system_content = f"""Bạn là trợ lý đặt tour chuyên nghiệp của Tour Booking System.
            
            CÂU HỎI: "{user_query}"
            
            THÔNG TIN TOUR:
            {context}
            
            YÊU CẦU TRẢ LỜI (format rõ ràng):
            
            **✅ Xác nhận đặt tour**
            [1-2 câu xác nhận]
            
            **📋 Thông tin tour:**
            - Tên tour: [tên đầy đủ]
            - Lịch trình: [X ngày Y đêm] 
            - Điểm đến: [điểm đến chính]
            - Giá/người: [giá] VNĐ
            - Tổng tiền: [tính nếu khách nói số người]
            
            **🎫 Tình trạng:** [còn chỗ/hết chỗ]
            
            **🔗 [Đặt tour ngay](http://localhost:5173/tours/[slug])**
            
            **📝 Cách đặt:**
            1. Click vào link "Đặt tour ngay" ở trên
            2. Chọn ngày khởi hành
            3. Điền thông tin khách hàng
            4. Thanh toán
            
            **ℹ️ Lưu ý:** [Chính sách hủy nếu có]
            
            PHẢI thêm link đặt tour với SLUG từ metadata (VD: da-lat-thanh-pho-ngan-hoa-3n2d). 
            SLUG phải viết thường, không dấu, cách nhau bằng dấu gạch ngang.
            Mỗi phần phải XUỐNG DÒNG riêng, dùng markdown."""

        else:  # general_query
            system_content = f"""Bạn là một trợ lý chăm sóc khách hàng của Tour Booking System - hệ thống đặt tour du lịch hàng đầu.
            
            QUAN TRỌNG - XỬ LÝ NGỮ CẢNH:
            - Luôn tham khảo cuộc hội thoại trước đó để đưa ra câu trả lời phù hợp
            - Nếu khách hàng hỏi về chính sách sau khi quan tâm tour cụ thể, hãy tư vấn có liên quan
            
            NHIỆM VỤ:
            - Trả lời các câu hỏi chung về dịch vụ du lịch, chính sách công ty
            - Hướng dẫn khách hàng về quy trình đặt tour, thanh toán, hủy tour
            - Cung cấp thông tin liên hệ, văn phòng công ty
            - Giải đáp thắc mắc về visa, hộ chiếu, bảo hiểm du lịch
            - Tư vấn về thời tiết, mùa du lịch tốt nhất
            
            THÔNG TIN TÌM KIẾM ĐƯỢC:
            {context}
            
            📍 Địa chỉ: Hà Nội, Việt Nam
            📧 Email: tourbooking@gmail.com
            📞 Hotline: 1900-xxxx
            🕒 Giờ làm việc: Thứ 2 - Chủ nhật (8:00 - 22:00)
            
            Hãy trả lời một cách hữu ích và chuyên nghiệp dựa trên thông tin có sẵn."""

        # Tạo prompt với lịch sử hội thoại
        messages = [{"role": "system", "content": system_content}]
        
        # Thêm lịch sử hội thoại vào prompt
        if conversation_context:
            messages.extend(conversation_context)
        
        # Thêm câu hỏi hiện tại - validation thêm một lần nữa
        if not user_query or len(user_query.strip()) == 0:
            yield "data: " + json.dumps({'error': 'Query không hợp lệ', 'session_id': session_id}) + "\n\n"
            return
            
        messages.append({"role": "user", "content": user_query})
        
        try:
            # Kiểm tra client có tồn tại không - NO FALLBACK ALLOWED
            if not client:
                print("CRITICAL ERROR: OpenAI client not available!")
                raise RuntimeError("OpenAI client required - no fallback allowed")
                
            stream = client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=1500  # Giảm max_tokens
            )
            
            full_answer = ""
            chunk_buffer = ""
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_answer += content
                    chunk_buffer += content
                    
                    if len(chunk_buffer) >= 10 or content in ['.', '!', '?', '\n']:
                        yield "data: " + json.dumps({
                            'chunk': chunk_buffer, 
                            'session_id': session_id
                        }) + "\n\n"
                        chunk_buffer = ""
                        time.sleep(0.03)
            
            if chunk_buffer:
                yield "data: " + json.dumps({
                    'chunk': chunk_buffer, 
                    'session_id': session_id
                }) + "\n\n"
            
            # Lưu vào cache với session_id
            answer_cache[cache_key] = full_answer
            
            # Lưu vào lịch sử hội thoại
            add_to_conversation_history(session_id, "user", user_query)
            add_to_conversation_history(session_id, "assistant", full_answer)
            
            print("Full Answer: " + full_answer)
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            print(f"=== ERROR IN MAIN CHAT API ===")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            print(f"Query: '{user_query}'")
            print(f"Session: {session_id}")
            print(f"=== END ERROR ===")
            yield "data: " + json.dumps({'error': str(e), 'session_id': session_id}) + "\n\n"
    
    cors_origin = (request.headers.get('Origin') or _ALLOWED_ORIGINS[0])
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': cors_origin
        }
    )

# 5. Thêm các route mới để quản lý session
@app.route('/session/new', methods=['POST', 'OPTIONS'])
def create_new_session():
    """Tạo session mới"""
    if request.method == 'OPTIONS':
        return Response('', status=204)
    session_id = get_or_create_session()
    return jsonify({
        'session_id': session_id,
        'message': 'Session mới đã được tạo'
    })

@app.route('/session/<session_id>/history', methods=['GET'])
def get_session_history(session_id):
    """Lấy lịch sử hội thoại của session"""
    if session_id not in conversation_sessions:
        return jsonify({'error': 'Session không tồn tại'}), 404
    
    history = list(conversation_sessions[session_id]["history"])
    return jsonify({
        'session_id': session_id,
        'history': history,
        'total_messages': len(history)
    })

@app.route('/session/<session_id>/clear', methods=['POST'])
def clear_session_history(session_id):
    """Xóa lịch sử hội thoại của session"""
    if session_id not in conversation_sessions:
        return jsonify({'error': 'Session không tồn tại'}), 404
    
    conversation_sessions[session_id]["history"].clear()
    return jsonify({
        'session_id': session_id,
        'message': 'Lịch sử hội thoại đã được xóa'
    })

@app.route('/sessions', methods=['GET'])
def get_all_sessions():
    """Lấy danh sách tất cả sessions"""
    current_time = datetime.now()
    sessions_info = []
    
    for session_id, session_data in conversation_sessions.items():
        last_activity = session_data["last_activity"]
        time_since_activity = (current_time - last_activity).seconds
        
        sessions_info.append({
            'session_id': session_id,
            'last_activity': last_activity.isoformat(),
            'messages_count': len(session_data["history"]),
            'time_since_activity_minutes': round(time_since_activity / 60, 1),
            'is_active': time_since_activity < SESSION_TIMEOUT
        })
    
    return jsonify({
        'total_sessions': len(sessions_info),
        'active_sessions': len([s for s in sessions_info if s['is_active']]),
        'sessions': sessions_info
    })
    
    
@app.route('/askimg', methods=['POST'])
def ask_endpoint():
    user_query = ''
    image_files = []
    session_id = None
    
    try:
        if 'multipart/form-data' in request.content_type:
            raw_query = request.form.get('query', '')
            user_query = str(raw_query).strip() if raw_query is not None else ''
            session_id = request.form.get('session_id')
            image_files = request.files.getlist('images')
        elif request.is_json:
            raw_query = request.json.get('query', '')
            user_query = str(raw_query).strip() if raw_query is not None else ''
            session_id = request.json.get('session_id')
        else:
            return jsonify({"error": "Unsupported Media Type"}), 415
            
        # Validation cho image requests
        if len(image_files) == 0 and (not user_query or len(user_query.strip()) == 0):
            return jsonify({"error": "Cần cung cấp ít nhất hình ảnh hoặc câu hỏi"}), 400
            
        # Giới hạn độ dài query cho image
        if user_query and len(user_query) > 1000:
            user_query = user_query[:1000]
            
    except Exception as e:
        return jsonify({"error": f"Invalid request: {str(e)}"}), 400

    # Tạo hoặc lấy session
    session_id = get_or_create_session(session_id)
    
    has_images = len(image_files) > 0

    if has_images:
        # Image search functionality
        embedding_model = APP_CONTEXT.get("embedding_model")
        if not all([APP_CONTEXT.get("image_index"), APP_CONTEXT.get("product_map"), embedding_model]):
            return jsonify({'error': 'Chức năng tìm kiếm hình ảnh chưa được cấu hình đúng trên server.'}), 500
        
        try:
            all_results = []
            
            # Process all images
            for idx, query_image_file in enumerate(image_files):
                print(f"Đang xử lý hình ảnh {idx + 1}/{len(image_files)}")
                
                query_image_bytes = query_image_file.read()
                query_image = Image.open(io.BytesIO(query_image_bytes)).convert("RGB")
                
                query_embedding = embedding_model.encode([query_image])[0]
                similar_products = search_similar_images(query_embedding, top_k=3)

                if similar_products:
                    best_match = similar_products[0]
                    best_match_info = best_match.get('product_info', {})
                    best_match_image_url = best_match_info.get('image_url')

                    is_match_verified = False
                    if best_match_image_url:
                        try:
                            response = requests.get(best_match_image_url, timeout=20)
                            response.raise_for_status()
                            best_match_image_bytes = response.content

                            user_image_b64 = base64.b64encode(query_image_bytes).decode('utf-8')
                            match_image_b64 = base64.b64encode(best_match_image_bytes).decode('utf-8')

                            is_match_verified = verify_image_match_with_llm(user_image_b64, match_image_b64)
                        except Exception as e:
                            print(f"Không thể xác thực ảnh {idx + 1}: {str(e)}")

                    if is_match_verified:
                        all_results.append({
                            'image_index': idx + 1,
                            'product_info': best_match_info,
                            'distance': best_match['distance'],
                            'similar_products': similar_products
                        })

            if not all_results:
                search_results = search_with_metadata_filtering(
                    "Du lịch và tour tham quan",
                    top_k=4,
                    filters=None,
                    app=app
                )
                context = (
                    "Không tìm thấy tour nào phù hợp với hình ảnh người dùng gửi. "
                    "Thay vào đó, xin gợi ý một số tour sau:\n\n"
                    + create_enhanced_context(search_results)
                )
            else:
                context = create_image_search_context(all_results)

            # Get conversation context for image search
            conversation_context = get_conversation_context(session_id, max_messages=6)

            def generate():
                yield "data: " + json.dumps({'chunk': '', 'session_id': session_id}) + "\n\n"
                time.sleep(0.1)
                
                system_content = f"""Bạn là một chuyên gia tư vấn du lịch của Tour Booking System - hệ thống đặt tour du lịch hàng đầu.

                QUAN TRỌNG - XỬ LÝ NGỮ CẢNH:
                - Tham khảo cuộc hội thoại trước đó để hiểu rõ hơn sở thích và nhu cầu du lịch của khách hàng
                - Nếu khách hàng đã thảo luận về loại tour nào đó trước đây, ưu tiên gợi ý những tour tương tự
                - Liên kết thông tin từ hình ảnh với các cuộc trò chuyện trước đó

                NHIỆM VỤ:
                - Phân tích hình ảnh mà khách hàng gửi và tư vấn tour phù hợp
                - Đưa ra gợi ý về tour dựa trên kết quả tìm kiếm
                - Tư vấn về giá cả, lịch trình, điểm đến của tour
                - So sánh các lựa chọn khác nhau nếu có
                - Gợi ý các dịch vụ bổ sung hoặc combo tour liên quan

                CÁCH HIỂN THỊ LINK:
                - Sử dụng format HTML: <a href="link_tour" target="_blank">🔗 Xem chi tiết tour</a>
                - Hoặc: ✈️ <a href="link_tour" target="_blank">Đặt tour ngay</a>

                CÂU HỎI CỦA KHÁCH HÀNG: "{user_query if user_query else 'Tư vấn tour dựa trên hình ảnh'}"

                THÔNG TIN TOUR TÌM ĐƯỢC:
                {context}

                📍 Địa chỉ: Hà Nội, Việt Nam
                📧 Email: tourbooking@gmail.com
                📞 Hotline: 1900-xxxx
                🕒 Giờ làm việc: Thứ 2 - Chủ nhật (8:00 - 22:00)
                
                Hãy tư vấn một cách chuyên nghiệp, chi tiết và hữu ích cho khách hàng."""

                # Tạo messages với lịch sử hội thoại
                messages = [{"role": "system", "content": system_content}]
                
                if conversation_context:
                    messages.extend(conversation_context)
                
                messages.append({
                    "role": "user", 
                    "content": user_query if user_query else "Tư vấn cho tôi về những sản phẩm phù hợp dựa trên hình ảnh tôi gửi."
                })
                
                try:
                    # Kiểm tra client có tồn tại không - NO FALLBACK ALLOWED
                    if not client:
                        print("CRITICAL ERROR: OpenAI client not available for image processing!")
                        raise RuntimeError("OpenAI client required for image processing - no fallback allowed")
                        
                    stream = client.chat.completions.create(
                        model="deepseek/deepseek-chat",
                        messages=messages,
                        stream=True,
                        temperature=0.7,
                        max_tokens=1500  # Giảm max_tokens
                    )
                    
                    full_answer = ""
                    chunk_buffer = ""
                    
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
                            content = chunk.choices[0].delta.content
                            full_answer += content
                            chunk_buffer += content
                            
                            if len(chunk_buffer) >= 10 or content in ['.', '!', '?', '\n']:
                                yield "data: " + json.dumps({
                                    'chunk': chunk_buffer, 
                                    'session_id': session_id
                                }) + "\n\n"
                                chunk_buffer = ""
                                time.sleep(0.03)
                    
                    if chunk_buffer:
                        yield "data: " + json.dumps({
                            'chunk': chunk_buffer, 
                            'session_id': session_id
                        }) + "\n\n"
                    
                    # Lưu vào lịch sử hội thoại
                    query_with_image = f"{user_query} [Đã gửi {len(image_files)} hình ảnh]"
                    add_to_conversation_history(session_id, "user", query_with_image)
                    add_to_conversation_history(session_id, "assistant", full_answer)
                    
                    print("Full Answer: " + full_answer)
                    yield "data: [DONE]\n\n"
                    
                except Exception as e:
                    print(f"=== ERROR IN IMAGE CHAT API ===")
                    print(f"Error: {str(e)}")
                    print(f"Error type: {type(e).__name__}")
                    print(f"Query: '{user_query}'")
                    print(f"Session: {session_id}")
                    print(f"=== END ERROR ===")
                    yield "data: " + json.dumps({'error': str(e), 'session_id': session_id}) + "\n\n"

            cors_origin = (request.headers.get('Origin') or _ALLOWED_ORIGINS[0])
            return Response(
                stream_with_context(generate()),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                    'Access-Control-Allow-Origin': cors_origin
                }
            )

        except Exception as e:
            print("Lỗi xử lý hình ảnh: " + str(e))
            return jsonify({'error': 'Đã có lỗi xảy ra khi xử lý hình ảnh của bạn.'}), 500
    
    else: 
        print("Không có hình ảnh, chuyển hướng nội bộ sang xử lý văn bản...")
        return ask()
    

@app.route('/search', methods=['POST'])
def search_products():
    data = request.json
    query = data.get('query', '')
    filters = data.get('filters', {})
    top_k = data.get('top_k', 5)
    
    try:
        results = search_with_metadata_filtering(query, top_k, filters, app=app)
        
        formatted_results = []
        for result in results:
            metadata = result['metadata']
            formatted_results.append({
                'product_name': metadata.get('product_name'),
                'brand_name': metadata.get('brand_name'),
                'price_range': {
                    'min': metadata.get('min_price'),
                    'max': metadata.get('max_price')
                },
                'rating': metadata.get('rating_value'),
                'in_stock': metadata.get('in_stock'),
                'stock_quantity': metadata.get('stock_quantity'),
                'categories': metadata.get('category_names', []),
                'attributes': metadata.get('attribute_names', []),
                'description': result['text'][:200] + '...',
                'relevance_score': result['relevance_score'],
                'image_url': metadata.get('image_url')
            })
        
        return jsonify({
            'results': formatted_results,
            'total': len(formatted_results),
            'query': query,
            'filters_applied': filters
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """
    Endpoint để lấy thống kê về database
    """
    try:
        # chunks_data đã được tải toàn cục
        if not chunks_data:
            return jsonify({'error': "Chunk data not loaded"}), 500

        stats = {
            'total_chunks': len(chunks_data.get('chunks', [])),
            'total_products': chunks_data.get('total_products', 0),
            'created_at': chunks_data.get('created_at'),
            'brands': {},
            'categories': {},
            'in_stock_products': 0,
            'out_of_stock_products': 0
        }
        
        product_ids_counted = set()
        
        for chunk in chunks_data.get('chunks', []):
            metadata = chunk['metadata']
            
            brand = metadata.get('brand_name')
            if brand:
                stats['brands'][brand] = stats['brands'].get(brand, 0) + 1
            
            categories = metadata.get('category_names', [])
            for cat in categories:
                stats['categories'][cat] = stats['categories'].get(cat, 0) + 1
            
            product_id = metadata.get('product_id')
            if product_id and product_id not in product_ids_counted:
                if metadata.get('in_stock'):
                    stats['in_stock_products'] += 1
                else:
                    stats['out_of_stock_products'] += 1
                product_ids_counted.add(product_id)

        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/SumaryReview', methods=['POST'])
def sumary_review():
    """
    Endpoint để tóm tắt đánh giá sản phẩm bằng AI với TTL cache system.
    Nhận: { "productId": "some_id", "forceRefresh": false }
    Trả về: { "positive": "...", "negative": "...", "summary": "...", "cached": true/false }
    """
    try:
        data = request.get_json()
        product_id = data.get('productId')
        force_refresh = data.get('forceRefresh', False)

        if not product_id:
            return jsonify({'error': 'Vui lòng cung cấp productId.'}), 400

        # Bước 1: Lấy tất cả đánh giá của sản phẩm từ MySQL
        reviews = get_reviews_for_product_from_db(product_id)

        if not reviews:
            return jsonify({
                "positive": "Sản phẩm này chưa có đánh giá nào từ khách hàng.",
                "negative": "Chưa có phản hồi tiêu cực nào được ghi nhận.",
                "summary": "Hiện tại chưa có đủ thông tin đánh giá từ khách hàng để tạo tóm tắt cho sản phẩm này.",
                "total_reviews": 0,
                "has_data": False,
                "cached": False
            }), 200

        # Bước 2: Cache handled by review_cache in get_reviews_for_product_from_db
        # Reviews are already cached with 24h TTL

        # Bước 3: Tính toán thống kê
        total_reviews = len(reviews)
        avg_rating = sum(review['rating'] for review in reviews) / total_reviews
        rating_distribution = {}
        for review in reviews:
            rating = review['rating']
            rating_distribution[rating] = rating_distribution.get(rating, 0) + 1

        # Tạo context từ các đánh giá
        reviews_text = "\n".join([
            f"- Đánh giá {review['rating']} sao: {review['comment']}" 
            for review in reviews if review['comment']
        ])
        
        summary_prompt = f"""Bạn là một chuyên gia phân tích đánh giá sản phẩm của cửa hàng HHQTV.
        Nhiệm vụ của bạn là đọc tất cả các đánh giá của khách hàng về một sản phẩm và rút ra những điểm chính.

        THÔNG TIN THỐNG KÊ:
        - Tổng số đánh giá: {total_reviews}
        - Điểm trung bình: {avg_rating:.1f}/5 sao
        - Phân bố điểm: {rating_distribution}

        DANH SÁCH CÁC ĐÁNH GIÁ:
        {reviews_text}

        Dựa trên các đánh giá trên, hãy tóm tắt lại theo định dạng JSON sau. Chỉ trả lời bằng JSON, không thêm bất kỳ văn bản nào khác.
        - "positive": Liệt kê 3-4 điểm cộng chính mà khách hàng khen ngợi (nếu có).
        - "negative": Liệt kê 2-3 điểm trừ chính mà khách hàng phàn nàn (nếu có).
        - "summary": Một đoạn văn ngắn (2-3 câu) tổng kết chung về sản phẩm dựa trên tất cả các ý kiến.

        Lưu ý: Nếu hầu hết đánh giá đều tích cực, có thể ghi "Không có khiếu nại đáng kể" trong phần negative.

        JSON:
        """

        # Bước 4: Gọi AI API
        print("Bắt đầu gọi AI để tóm tắt đánh giá...")
        
        # Kiểm tra client có tồn tại không - NO FALLBACK ALLOWED
        if not client:
            print("CRITICAL ERROR: OpenAI client not available for review summary!")
            raise RuntimeError("OpenAI client required for review summary - no fallback allowed")
            
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528-qwen3-8b:free",
            messages=[{"role": "user", "content": summary_prompt}],
            max_tokens=800,  # Giảm max_tokens
            temperature=0.5,
            response_format={"type": "json_object"}
        )

        # Bước 5: Xử lý kết quả
        result_content = response.choices[0].message.content
        print("AI đã trả về kết quả: " + result_content)
        
        summary_data = json.loads(result_content)
        
        # Thêm thông tin thống kê
        summary_data.update({
            "total_reviews": total_reviews,
            "average_rating": round(avg_rating, 1),
            "rating_distribution": rating_distribution,
            "has_data": True,
            "cached": False,
            "generated_at": datetime.now().isoformat()
        })
        
        # Bước 6: Cache already handled
        # review_cache automatically caches reviews for 24h
        
        return jsonify(summary_data)

    except json.JSONDecodeError:
        print("Lỗi: AI không trả về JSON hợp lệ.")
        return jsonify({'error': 'AI không thể tạo tóm tắt vào lúc này. Vui lòng thử lại.'}), 500
    except Exception as e:
        print("Đã xảy ra lỗi trong /SumaryReview: " + str(e))
        return jsonify({'error': 'Đã có lỗi xảy ra phía máy chủ.'}), 500

# Cache management endpoints - Updated for new CacheManager
@app.route('/CacheStats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = {
            'review_cache': {
                'entries': len(review_cache.cache),
                'max_entries': review_cache.max_entries,
                'ttl_hours': review_cache.ttl.total_seconds() / 3600
            },
            'query_cache': {
                'entries': len(query_cache.cache),
                'max_entries': query_cache.max_entries,
                'ttl_hours': query_cache.ttl.total_seconds() / 3600
            }
        }
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        print(f"Lỗi lấy cache stats: {e}")
        return jsonify({'error': 'Không thể lấy thống kê cache.'}), 500

@app.route('/ClearCache', methods=['POST'])
def clear_cache():
    """Clear cache for specific tour or all caches"""
    try:
        data = request.get_json()
        tour_id = data.get('tourId') or data.get('productId')
        clear_all = data.get('clearAll', False)
        
        if clear_all:
            review_cache.clear()
            query_cache.clear()
            return jsonify({
                'success': True,
                'message': 'Đã xóa toàn bộ cache'
            })
        
        if not tour_id:
            return jsonify({'error': 'Vui lòng cung cấp tourId hoặc clearAll=true'}), 400
        
        # Clear specific tour cache
        cache_key = f"reviews_tour_{tour_id}"
        if cache_key in review_cache.cache:
            del review_cache.cache[cache_key]
            success = True
        else:
            success = False
        
        return jsonify({
            'success': success,
            'message': f'Đã xóa cache cho tour {tour_id}' if success else 'Không tìm thấy cache để xóa'
        })
        
    except Exception as e:
        print(f"Lỗi xóa cache: {e}")
        return jsonify({'error': 'Không thể xóa cache.'}), 500

@app.route('/CacheConfig', methods=['GET'])
def cache_config():
    """Get cache configuration"""
    try:
        return jsonify({
            'review_cache': {
                'ttl_seconds': review_cache.ttl.total_seconds(),
                'ttl_hours': review_cache.ttl.total_seconds() / 3600,
                'max_entries': review_cache.max_entries,
                'current_entries': len(review_cache.cache)
            },
            'query_cache': {
                'ttl_seconds': query_cache.ttl.total_seconds(),
                'ttl_hours': query_cache.ttl.total_seconds() / 3600,
                'max_entries': query_cache.max_entries,
                'current_entries': len(query_cache.cache)
            }
        })
    except Exception as e:
        return jsonify({'error': f'Cannot get cache config: {e}'}), 500
#/////////////////////////////////////////////
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, threaded=True, port=5000)