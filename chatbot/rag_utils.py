import numpy as np
from urllib.parse import quote, urlencode
from backend_config import BACKEND_URL, FRONTEND_URL


def extract_tours_data_from_query(query):
    """
    Trích xuất dữ liệu tour từ câu hỏi của người dùng
    Đơn giản hóa - chỉ lấy tên tour và số người
    """
    from intent_classification import client
    import json
    import re
    
    prompt = f"""Bạn là AI trích xuất thông tin đặt tour từ câu hỏi khách hàng.

Phân tích câu hỏi và trả về JSON với:
- "tour_name": tên tour cụ thể (ví dụ: "Du lịch Hạ Long", "Tour Phú Quốc 3 ngày 2 đêm")
- "num_people": số người muốn đặt (mặc định 1 nếu không nói rõ)
- "booking_intent": true/false (có ý định đặt hay chỉ hỏi thông tin)

Câu hỏi: "{query}"

Ví dụ output:
{{
  "tour_name": "Du lịch Hạ Long",
  "num_people": 2,
  "booking_intent": true
}}

Trả về JSON thuần túy, không có text khác:"""

    try:
        if not client:
            raise RuntimeError("OpenAI client required")
            
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip()
        
        # Parse JSON
        try:
            tour_data = json.loads(result)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                tour_data = json.loads(json_match.group())
            else:
                tour_data = {}
        
        # Clean data
        cleaned_data = {}
        if tour_data.get('tour_name'):
            cleaned_data['tour_name'] = tour_data['tour_name'].strip()
        
        if tour_data.get('num_people'):
            try:
                num = int(tour_data['num_people'])
                cleaned_data['num_people'] = num if num > 0 else 1
            except (ValueError, TypeError):
                cleaned_data['num_people'] = 1
        else:
            cleaned_data['num_people'] = 1
        
        if tour_data.get('booking_intent') is not None:
            cleaned_data['booking_intent'] = bool(tour_data['booking_intent'])
        
        return cleaned_data if cleaned_data else {}
        
    except Exception as e:
        print(f"Error extracting tour data: {e}")
        return {}


def search_with_metadata_filtering(query, top_k=5, filters=None, app=None):
    """
    Tìm kiếm với filtering theo metadata - Enhanced cho ProductResponse
    """
    
    index = app.config.get('index')
    chunks_data = app.config.get('chunks_data')
    embedder = app.config.get('embedder')
    
    if not index or not embedder:
        print("Lỗi: Text index hoặc embedding model chưa được tải.")
        return []
        
    # Tạo query embedding
    query_embedding = embedder.encode([query], convert_to_numpy=True)
    
    # Tìm kiếm trong FAISS (lấy nhiều hơn để có đủ sau khi filter)
    search_size = min(top_k * 5, len(chunks_data['chunks']))
    distances, indices = index.search(query_embedding, search_size)
    
    results = []
    seen_products = set()  # Để tránh duplicate products
    
    for i, idx in enumerate(indices[0]):
        chunk_data = chunks_data['chunks'][idx]
        metadata = chunk_data['metadata']
        
        source_endpoint = metadata.get('source_endpoint', '')
        if source_endpoint:
            expected_endpoint = f"{BACKEND_URL}/api/tours"
            if not expected_endpoint in source_endpoint.lower():
                continue
        
        # Áp dụng filters nếu có
        if filters:
            skip = False
            for key, value in filters.items():
                if key == 'tour_type':
                    # Filter cho tour trong nước vs ngoài nước - sử dụng field is_domestic
                    is_domestic = metadata.get('is_domestic', None)
                    
                    if value == 'domestic':
                        # Chỉ lấy tour trong nước
                        if is_domestic is not True:
                            skip = True
                            break
                    elif value == 'international':
                        # Chỉ lấy tour nước ngoài
                        if is_domestic is not False:
                            skip = True
                            break
                elif key == 'price_range':
                    # Special handling cho price range
                    min_price = metadata.get('min_price')
                    max_price = metadata.get('max_price')
                    # value dạng [min, max] với khả năng một trong hai là None (mở biên)
                    if min_price is not None and max_price is not None and isinstance(value, (list, tuple)) and len(value) == 2:
                        requested_min = value[0]
                        requested_max = value[1]

                        lower_ok = True
                        upper_ok = True

                        if requested_min is not None:
                            lower_ok = requested_min <= max_price

                        if requested_max is not None:
                            upper_ok = requested_max >= min_price

                        if not (lower_ok and upper_ok):
                            skip = True
                            break
                elif key == 'product_name':
                    product_name = metadata.get('product_name', '').lower()
                    if not any(name.lower() in product_name for name in value):
                        skip = True
                        break
                    
                elif key == 'in_stock_only':
                    if value and not metadata.get('in_stock', False):
                        skip = True
                        break
                    
                elif key == 'min_rating':
                    rating = metadata.get('rating_value')
                    if rating is None or rating < value:
                        skip = True
                        break
                elif key == 'categories':
                    # Check if any category matches
                    product_categories = metadata.get('category_names', [])
                    if not any(cat in product_categories for cat in value):
                        skip = True
                        break
                elif key == 'brands':
                    brand_name = metadata.get('brand_name')
                    if brand_name not in value:
                        skip = True
                        break
                elif key == 'variants':
                    # Filter by variants (color, size, etc.)
                    product_variants = metadata.get('variants', [])
                    
                    # Check if any of the required variants match
                    variant_matches = False
                    for required_variant in value:
                        required_attr_name = required_variant.get('attributeName', '').lower()
                        required_attr_value = required_variant.get('attributeValue', '').lower()
                        
                        print("attributeName")
                        print(required_attr_name)
                        print(required_attr_value)

                        # Check if this variant exists in product
                        for product_variant in product_variants:
                            product_attr_name = product_variant.get('attributeName', '').lower()
                            product_attr_value = product_variant.get('attributeValue', '').lower()
                            
                            if (product_attr_name == required_attr_name and 
                                product_attr_value == required_attr_value):
                                variant_matches = True
                                break
                        
                        if variant_matches:
                            break
                
                    if not variant_matches:
                        skip = True
                        break
                    
                elif key == 'attributes':
                    # Filter by attribute names only
                    attr_names = metadata.get('attribute_names', [])
                    
                    if isinstance(value, list):
                        # Filter by attribute names
                        if not any(attr in attr_names for attr in value):
                            skip = True
                            break
                    else:
                        # Single attribute name
                        if value not in attr_names:
                            skip = True
                            break
                else:
                    # Standard equality check
                    if key in metadata and metadata[key] != value:
                        skip = True
                        break
            
            if skip:
                continue
        
        # Calculate enhanced relevance score
        base_score = 1 / (1 + distances[0][i])
        
        # Boost score based on metadata
        boost_factor = 1.0
        
        # Boost for in-stock products
        if metadata.get('in_stock', False):
            boost_factor *= 1.2
        
        # Boost for high-rated products
        rating = metadata.get('rating_value')
        if rating and rating >= 4.0:
            boost_factor *= 1.1
        
        # Boost for products with rich attribute data
        if len(metadata.get('attribute_names', [])) > 3:
            boost_factor *= 1.05
        
        final_score = base_score * boost_factor
        
        results.append({
            'text': chunk_data['text'],
            'metadata': metadata,
            'distance': distances[0][i],
            'relevance_score': final_score
        })
        
        if len(results) >= top_k:
            break
    
    # Sort by final relevance score
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return results[:top_k]


def get_tours_statistics(app=None):
    """Lấy thống kê về tours trong vector store"""
    chunks_data = app.config.get('chunks_data')
    
    try:
        # chunks_data đã được tải toàn cục
        if not chunks_data:
            return {"error": "Vector store not found. Please run setup_vector_store_with_metadata first."}

        metadata_list = chunks_data['metadata']
        
        stats = {
            'total_chunks': len(metadata_list),
            'destinations': {},
            'categories': {},
            'price_ranges': [],
            'available_count': 0,
            'full_count': 0,
            'avg_rating': 0,
            'rating_count': 0
        }
        
        unique_destinations = set()  # Để đếm điểm đến duy nhất
        
        for metadata in metadata_list:
            # Destination stats
            destination = metadata.get('destination')
            if destination and destination not in unique_destinations:
                unique_destinations.add(destination)
                stats['destinations'][destination] = stats['destinations'].get(destination, 0) + 1
            
            # Category stats
            categories = metadata.get('category_names', [])
            for cat in categories:
                stats['categories'][cat] = stats['categories'].get(cat, 0) + 1
            
            # Price stats
            min_price = metadata.get('min_price')
            max_price = metadata.get('max_price')
            if min_price is not None and max_price is not None:
                stats['price_ranges'].append((min_price, max_price))
            
            # Available slots stats
            available_slots = metadata.get('available_slots', 0)
            if available_slots > 0:
                stats['available_count'] += 1
            else:
                stats['full_count'] += 1
            
            # Rating stats
            rating = metadata.get('rating_value')
            if rating is not None:
                stats['avg_rating'] += rating
                stats['rating_count'] += 1
        
        if stats['rating_count'] > 0:
            stats['avg_rating'] = stats['avg_rating'] / stats['rating_count']
        
        # Thêm số lượng điểm đến
        stats['total_destinations'] = len(unique_destinations)
        stats['destination_list'] = list(unique_destinations)
        
        return stats
        
    except Exception as e:
        return {"error": "An error occurred: " + str(e)}
    
    
def search_general_content(query, top_k=3, app=None):
    """
    Tìm kiếm nội dung chung không áp dụng metadata filtering
    Dành cho general_query như chính sách, dịch vụ, thông tin cửa hàng
    """
    
    index = app.config.get('index')
    chunks_data = app.config.get('chunks_data')
    embedder = app.config.get('embedder')
    
    if not index or not embedder:
        print("Lỗi: Text index hoặc embedding model chưa được tải.")
        return []

    # Tạo query embedding
    query_embedding = embedder.encode([query], convert_to_numpy=True)
    
    # Tìm kiếm trong FAISS
    distances, indices = index.search(query_embedding, top_k)
    
    results = []
    for i, idx in enumerate(indices[0]):
        chunk_data = chunks_data['chunks'][idx]
        
        # Tính toán relevance score đơn giản
        relevance_score = 1 / (1 + distances[0][i])
        
        results.append({
            'text': chunk_data['text'],
            'metadata': chunk_data['metadata'],
            'distance': distances[0][i],
            'relevance_score': relevance_score
        })
    
    return results


def create_enhanced_context(results):
    """
    Tạo context chi tiết từ search results với metadata cho tour - Format HTML
    """

    context_parts = []
    html_output = []
    
    for i, result in enumerate(results, 1):
        metadata = result['metadata']
        text = result['text']
        
        # Thông tin cơ bản cho AI context
        tour_info = []
        
        tour_name = metadata.get('tour_name', 'Tour du lịch')
        destination = metadata.get('destination', '')
        
        tour_info.append(f"Tên tour: {tour_name}")
        
        if destination:
            tour_info.append(f"Điểm đến: {destination}")
        
        # Link và ảnh
        image_url = metadata.get('image_url')
        tour_id = metadata.get('tour_id')
        slug = metadata.get('slug')  # Lấy slug từ metadata
        
        if image_url:
            if image_url.startswith('/uploads/'):
                image_link = f"{BACKEND_URL}{image_url}"
            elif image_url.startswith('http'):
                image_link = image_url
            else:
                image_link = f"{BACKEND_URL}/uploads/{image_url}"
            tour_info.append(f"Link ảnh: {image_link}")
        
        # Ưu tiên dùng slug, fallback về tour_id nếu không có slug
        if slug:
            tour_link = f"{FRONTEND_URL}/tours/{slug}"
            tour_info.append(f"Link chi tiết: {tour_link}")
            tour_info.append(f"Slug: {slug}")
        elif tour_id:
            tour_link = f"{FRONTEND_URL}/tours/{tour_id}"
            tour_info.append(f"Link chi tiết: {tour_link}")
        
        # Giá
        min_price = metadata.get('min_price')
        max_price = metadata.get('max_price')
        if min_price is not None and max_price is not None:
            if min_price == max_price:
                price_str = "{:,.0f} VND".format(float(min_price))
                tour_info.append(f"Giá: {price_str}/người")
            else:
                price_str = "{:,.0f} - {:,.0f} VND".format(float(min_price), float(max_price))
                tour_info.append(f"Giá: {price_str}/người")
        
        # Thời gian
        duration = metadata.get('duration')
        if duration:
            tour_info.append(f"Thời gian: {duration}")
        
        # Tình trạng
        available_slots = metadata.get('available_slots')
        if available_slots is not None:
            status = "Còn chỗ" if available_slots > 0 else "Hết chỗ"
            tour_info.append(f"Tình trạng: {status} ({available_slots} chỗ)")
        
        # Rating
        rating = metadata.get('rating_value')
        if rating:
            tour_info.append(f"Đánh giá: {rating}/5 sao")
        
        # Mô tả
        tour_info.append(f"Mô tả: {text[:200]}...")
        
        # Context cho AI (plain text)
        context_entry = f"\n--- TOUR {i}: {tour_name} ---\n"
        context_entry += "\n".join(tour_info)
        context_parts.append(context_entry)
    
        # HTML output (để AI trả về trực tiếp)
        html_card = f"""
<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 12px 0; background: #fafafa;">
    {"<img src='" + image_link + "' alt='" + tour_name + "' style='width: 100%; max-width: 320px; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;' />" if image_url else ""}
    <h4 style="margin: 8px 0; color: #1a1a1a;">✈️ {tour_name}</h4>
    {"<p style='margin: 4px 0; color: #666;'><strong>🌏 Điểm đến:</strong> " + destination + "</p>" if destination else ""}
    {"<p style='margin: 4px 0; color: #666;'><strong>⏱️ Thời gian:</strong> " + str(duration) + "</p>" if duration else ""}
    {"<p style='margin: 4px 0; color: #d32f2f;'><strong>💰 Giá:</strong> " + price_str + "/người</p>" if min_price else ""}
    {"<p style='margin: 4px 0; color: #2e7d32;'><strong>📊 Tình trạng:</strong> " + status + " (" + str(available_slots) + " chỗ)</p>" if available_slots is not None else ""}
    {"<p style='margin: 4px 0; color: #f57c00;'><strong>⭐ Đánh giá:</strong> " + str(rating) + "/5 sao</p>" if rating else ""}
    <p style="margin: 8px 0 12px 0; color: #555; font-size: 14px; line-height: 1.5;">{text[:150]}...</p>
    {"<a href='" + tour_link + "' target='_blank' style='display: inline-block; background: #1976d2; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-weight: 500; margin-top: 8px;'>🔗 Xem chi tiết tour</a>" if tour_id else ""}
</div>"""
        html_output.append(html_card)
    
    # Return both plain context and HTML
    return {
        'plain_context': "\n".join(context_parts),
        'html_cards': "\n".join(html_output)
    }

def create_enhanced_context_for_booking(results, num_people):
    """
    Tạo context chi tiết cho đặt tour - Format HTML
    """
    context_parts = []
    html_output = []
    
    for i, result in enumerate(results, 1):
        metadata = result['metadata']        
        tour_info = []
        
        tour_name = metadata.get('tour_name', 'Tour du lịch')
        destination = metadata.get('destination', '')
        
        tour_info.append(f"Tên tour: {tour_name}")
        
        if destination:
            tour_info.append(f"Điểm đến: {destination}")
            
        image_url = metadata.get('image_url')
        tour_id = metadata.get('tour_id')
        slug = metadata.get('slug')  # Lấy slug từ metadata
        
        if image_url:
            if image_url.startswith('/uploads/'):
                image_link = f"{BACKEND_URL}{image_url}"
            elif image_url.startswith('http'):
                image_link = image_url
            else:
                image_link = f"{BACKEND_URL}/uploads/{image_url}"
            tour_info.append(f"Link ảnh: {image_link}")
        
        # Ưu tiên dùng slug, fallback về tour_id nếu không có slug
        if slug:
            tour_link = f"{FRONTEND_URL}/tours/{slug}"
            tour_info.append(f"Link đặt tour: {tour_link}")
            tour_info.append(f"Slug: {slug}")
        elif tour_id:
            tour_link = f"{FRONTEND_URL}/tours/{tour_id}"
            tour_info.append(f"Link đặt tour: {tour_link}")
        
        # Tính giá theo số người
        min_price = metadata.get('min_price')
        max_price = metadata.get('max_price')
        price_per_person = ""
        total_price = ""
        
        if min_price is not None and max_price is not None:
            total_min_price = min_price * num_people
            total_max_price = max_price * num_people
            if min_price == max_price:
                price_per_person = "{:,.0f} VND".format(float(min_price))
                total_price = "{:,.0f} VND".format(float(total_min_price))
                tour_info.append(f"Giá/người: {price_per_person}")
                tour_info.append(f"Tổng giá ({num_people} người): {total_price}")
            else:
                price_per_person = "{:,.0f} - {:,.0f} VND".format(float(min_price), float(max_price))
                total_price = "{:,.0f} - {:,.0f} VND".format(float(total_min_price), float(total_max_price))
                tour_info.append(f"Giá/người: {price_per_person}")
                tour_info.append(f"Tổng giá ({num_people} người): {total_price}")
        
        tour_info.append(f"Số người: {num_people}")
        
        # Link đặt tour
        booking_link = ""
        if tour_id:
            booking_link = f"{FRONTEND_URL}/booking/{tour_id}?numPeople={num_people}"
            tour_info.append(f"Link đặt tour: {booking_link}")
        
        # Thời gian
        duration = metadata.get('duration')
        if duration:
            tour_info.append(f"Thời gian: {duration}")
        
        # Tình trạng
        available_slots = metadata.get('available_slots')
        status = ""
        if available_slots is not None:
            status = "Còn chỗ" if available_slots > 0 else "Hết chỗ"
            tour_info.append(f"Tình trạng: {status} ({available_slots} chỗ)")
        
        # Rating
        rating = metadata.get('rating_value')
        if rating:
            tour_info.append(f"Đánh giá: {rating}/5 sao")
        
        # Context cho AI
        context_entry = f"\n--- TOUR ĐẶT {i}: {tour_name} ---\n"
        context_entry += "\n".join(tour_info)
        context_parts.append(context_entry)
    
        # HTML output
        html_card = f"""
<div style="border: 2px solid #1976d2; border-radius: 10px; padding: 18px; margin: 14px 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    {"<img src='" + image_link + "' alt='" + tour_name + "' style='width: 100%; max-width: 340px; height: 190px; object-fit: cover; border-radius: 8px; margin-bottom: 14px; border: 2px solid white;' />" if image_url else ""}
    <h3 style="margin: 10px 0; color: #1565c0;">✈️ {tour_name}</h3>
    {"<p style='margin: 6px 0; color: #424242;'><strong>🌏 Điểm đến:</strong> " + destination + "</p>" if destination else ""}
    {"<p style='margin: 6px 0; color: #424242;'><strong>⏱️ Thời gian:</strong> " + duration + "</p>" if duration else ""}
    <div style="background: white; padding: 12px; border-radius: 6px; margin: 10px 0;">
        <p style='margin: 4px 0; color: #424242;'><strong>👥 Số người:</strong> {num_people} người</p>
        {"<p style='margin: 4px 0; color: #1976d2;'><strong>💰 Giá/người:</strong> " + price_per_person + "</p>" if price_per_person else ""}
        {"<p style='margin: 4px 0; color: #d32f2f; font-size: 16px;'><strong>💰 TỔNG TIỀN:</strong> " + total_price + "</p>" if total_price else ""}
    </div>
    {"<p style='margin: 6px 0; color: " + ("#2e7d32" if available_slots > 0 else "#d32f2f") + ";'><strong>📊 Tình trạng:</strong> " + status + " (" + str(available_slots) + " chỗ)</p>" if available_slots is not None else ""}
    {"<p style='margin: 6px 0; color: #f57c00;'><strong>⭐ Đánh giá:</strong> " + str(rating) + "/5 sao</p>" if rating else ""}
    {"<a href='" + booking_link + "' target='_blank' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>🎫 ĐẶT TOUR NGAY</a>" if tour_id else ""}
</div>"""
        html_output.append(html_card)
    
    return {
        'plain_context': "\n".join(context_parts),
        'html_cards': "\n".join(html_output)
    }


def create_general_context(results):
    """
    Tạo context đơn giản cho general queries
    """
    context_parts = []
    
    for i, result in enumerate(results, 1):
        text = result['text']
        
        context_entry = "=== THÔNG TIN " + str(i) + " ===\n"
        context_entry += text + "\n"
        context_entry += "Độ liên quan: {:.3f}\n".format(result['relevance_score'])
        
        context_parts.append(context_entry)
    
    return "\n" + "="*50 + "\n".join(context_parts)