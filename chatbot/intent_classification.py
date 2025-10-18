import json
import re

from config import client


def classify_user_intent_with_ai(query):
    # Validation input trước khi gửi API
    if not query or len(str(query).strip()) == 0:
        print("Empty query - STOPPING! No fallback allowed")
        raise ValueError("Query cannot be empty - API call required")
    
    intent_prompt = f"""Bạn là một AI chuyên phân tích ý định khách hàng trong hệ thống đặt tour du lịch.

Phân tích câu hỏi sau và trả về CHÍNH XÁC một trong các loại:
- "tour_query": Khách hàng muốn tìm kiếm, hỏi về tour du lịch (VD: "tour trong nước", "tour nước ngoài", "tour Hạ Long", "tour biển", "gợi ý tour", "có tour nào")
- "general_query": Khách hỏi chung về dịch vụ, chính sách, thanh toán, hủy tour, công ty, chào hỏi, cảm ơn (KHÔNG phải về tour cụ thể)
- "destination_query": Khách hỏi về thông tin điểm đến, số lượng điểm đến, danh sách điểm đến
- "booking_intent": Khách hàng muốn đặt tour, book tour cụ thể

Câu hỏi: "{query}"

Chỉ trả về một từ: tour_query, general_query, destination_query, booking_intent"""

    # Kiểm tra client có tồn tại không
    if not client:
        print("OpenAI client not available - CRITICAL ERROR!")
        raise RuntimeError("OpenAI client not initialized - cannot proceed without API")
        
    print(f"Sending intent classification request for query: {query[:100]}...")
    print(f"Query type: {type(query)}, Query repr: {repr(query)}")
    print(f"Attempting API call with model: deepseek/deepseek-chat")
    
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": intent_prompt}],
        max_tokens=10,  # Chỉ cần rất ít tokens cho 1 từ
        temperature=0.1
    )
    
    print("API Response received successfully")
    result = response.choices[0].message.content.strip().lower()
    print(f"Raw AI result: '{result}'")
    
    # Validate response
    if "tour_query" in result:
        return "tour_query"
    elif "general_query" in result:
        return "general_query"
    elif "destination_query" in result:
        return "destination_query"
    elif "booking_intent" in result:
        return "booking_intent"
    else:
        print(f"Unrecognized AI response: {result} - STOPPING!")
        raise ValueError(f"Invalid AI response: {result}")

# FALLBACK FUNCTION REMOVED - NO FALLBACK ALLOWED
# All functions must use actual API calls
    

def extract_filters_from_query(query, intent):
    """
    Trích xuất filters từ câu hỏi của người dùng dựa trên intent
    """
    if intent == "general_query":
        return None
    
    filter_prompt = f"""Bạn là một AI trích xuất thông tin tìm kiếm tour du lịch từ câu hỏi của khách hàng.

Phân tích câu hỏi và trả về JSON với các filter sau (chỉ bao gồm những filter có thể xác định được):

Các filter có thể có:
- "tour_type": "domestic" (tour trong nước) hoặc "international" (tour ngoài nước/nước ngoài)
- "tour_name": [danh sách tour như "Du lịch Hạ Long", "Tour Phú Quốc 3N2Đ", "Tour Sapa Mùa Tuyết"]
- "destinations": [danh sách điểm đến như "Hạ Long", "Phú Quốc", "Sapa", "Đà Nẵng", "Nha Trang"]
- "categories": [danh sách loại tour như "Tour biển", "Tour núi", "Tour văn hóa", "Tour ẩm thực"]
- "price_range": [giá_min, giá_max] (đơn vị VND/người)
- "min_rating": số sao tối thiểu (1-5)
- "available_only": true/false (chỉ hiển thị tour còn chỗ)
- "duration": thời gian tour (ví dụ: "3 ngày 2 đêm", "5 ngày 4 đêm")

LƯU Ý QUAN TRỌNG:
- Nếu khách hỏi "tour trong nước", "du lịch trong nước" -> set "tour_type": "domestic"
- Nếu khách hỏi "tour ngoài nước", "tour nước ngoài", "đi nước ngoài" -> set "tour_type": "international"

Câu hỏi: "{query}"

Trả về JSON thuần túy, không có text khác:"""

    # Kiểm tra client có tồn tại không
    if not client:
        print("OpenAI client not available for filter extraction - CRITICAL ERROR!")
        raise RuntimeError("OpenAI client required for filter extraction")
        
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": filter_prompt}],
        max_tokens=500,  # Giảm max_tokens
        temperature=0.1
    )
    
    result = response.choices[0].message.content.strip()
    
    json_match = re.search(r'\{.*\}', result, re.DOTALL)
    if json_match:
        filters = json.loads(json_match.group())
        
        # Xử lý filters cho tour du lịch (không cần variants như product)
        # Filters đã được trích xuất từ AI, chỉ cần validate
        
        return filters if filters else None
    
    # No fallback - if we can't extract filters, return None
    print("Could not extract filters from AI response")
    return None



def extract_tours_data_from_query_intent(query):
    """
    Trích xuất tour data từ câu hỏi của người dùng với focus vào booking intent
    Bao gồm tên tour, số người và thông tin đặt tour
    """
    
    filter_prompt = f"""Bạn là một AI trích xuất thông tin đặt tour từ câu hỏi của khách hàng.

Phân tích câu hỏi và trả về JSON với các thông tin sau (chỉ bao gồm những thông tin có thể xác định được):

THÔNG TIN TOUR:
- "tour_name": tên tour cụ thể (ví dụ: "Du lịch Hạ Long", "Tour Phú Quốc 3N2Đ", "Tour Sapa Mùa Tuyết")

THÔNG TIN ĐẶT TOUR:
- "num_people": số người muốn đặt (mặc định là 1 nếu không nói rõ)
- "booking_intent": true/false (có ý định đặt hay chỉ hỏi thông tin)

HƯỚNG DẪN PHÂN TÍCH:
- Chú ý các từ khóa đặt tour: "đặt", "book", "đăng ký", "tôi muốn đi"
- Trích xuất số người từ: "2 người", "1 gia đình 4 người", "3 người lớn"
- Nếu không rõ tên tour cụ thể, chỉ ghi điểm đến

Câu hỏi: "{query}"

Ví dụ output:
{{
  "tour_name": "Du lịch Hạ Long",
  "num_people": 2,
  "booking_intent": true
}}

Trả về JSON thuần túy, không có text khác:"""

    # Kiểm tra client có tồn tại không
    if not client:
        print("OpenAI client not available for tour data extraction - CRITICAL ERROR!")
        raise RuntimeError("OpenAI client required for tour data extraction")
        
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": filter_prompt}],
        max_tokens=300,
        temperature=0.1
    )
    
    result = response.choices[0].message.content.strip()
    print("result")
    print(result)
    
    # Thử parse JSON trực tiếp trước
    try:
        filters = json.loads(result)
        print(f"Direct JSON parse successful: {filters}")
        
    except json.JSONDecodeError:
        # Nếu không được, thử tìm trong markdown code block
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', result, re.DOTALL)
        if json_match:
            try:
                json_content = json_match.group(1)
                filters = json.loads(json_content)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Raw result: {result}")
                raise ValueError(f"Cannot parse AI response: {result}")
        else:
            print("No JSON found in response")
            print(f"Raw result: {result}")
            raise ValueError(f"Invalid AI response format: {result}")
    
    # Validation và làm sạch data
    cleaned_filters = {}
    
    # Xử lý tên tour
    if filters.get('tour_name'):
        cleaned_filters['tour_name'] = filters['tour_name'].strip()
    
    # Xử lý num_people
    if filters.get('num_people'):
        try:
            num = int(filters['num_people'])
            if num > 0:
                cleaned_filters['num_people'] = num
        except (ValueError, TypeError):
            cleaned_filters['num_people'] = 1
    else:
        cleaned_filters['num_people'] = 1
    
    # Xử lý booking_intent
    if filters.get('booking_intent') is not None:
        cleaned_filters['booking_intent'] = bool(filters['booking_intent'])
                 
    print(f"Extracted tour data: {cleaned_filters}")
    return cleaned_filters if cleaned_filters else {}
