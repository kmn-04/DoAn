# Setup FAISS index for Tour Booking System
import requests
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import json
from datetime import datetime

def detect_domestic_status(tour_data):
    """
    Tự động detect tour trong nước vs nước ngoài dựa trên destination
    """
    destination = tour_data.get('destination', '').lower()
    departure = tour_data.get('departureLocation', '').lower()
    
    # Danh sách các điểm đến quốc tế phổ biến
    international_keywords = [
        'singapore', 'malaysia', 'thailand', 'thái lan', 'campuchia', 'cambodia',
        'lào', 'laos', 'myanmar', 'indonesia', 'philippines', 'brunei',
        'japan', 'nhật bản', 'korea', 'hàn quốc', 'china', 'trung quốc',
        'taiwan', 'đài loan', 'hong kong', 'macau', 'macaos',
        'usa', 'mỹ', 'america', 'canada', 'australia', 'úc', 'new zealand',
        'europe', 'châu âu', 'france', 'pháp', 'germany', 'đức', 'italy', 'ý',
        'spain', 'tây ban nha', 'uk', 'anh', 'england', 'switzerland', 'thụy sĩ',
        'austria', 'áo', 'netherlands', 'hà lan', 'belgium', 'bỉ',
        'dubai', 'uae', 'qatar', 'saudi', 'arabia', 'turkey', 'thổ nhĩ kỳ',
        'india', 'ấn độ', 'nepal', 'bhutan', 'sri lanka', 'maldives',
        'africa', 'châu phi', 'egypt', 'ai cập', 'south africa', 'nam phi',
        'brazil', 'argentina', 'chile', 'peru', 'mexico', 'cuba'
    ]
    
    # Kiểm tra destination
    for keyword in international_keywords:
        if keyword in destination or keyword in departure:
            return False  # International
    
    # Kiểm tra tên tour có chứa từ khóa quốc tế
    tour_name = tour_data.get('name', '').lower()
    for keyword in international_keywords:
        if keyword in tour_name:
            return False  # International
    
    # Mặc định là trong nước
    return True  # Domestic

def get_data_from_api(api_endpoints):
    """Lấy dữ liệu từ các API endpoints"""
    all_data = []

    for endpoint in api_endpoints:
        try:
            response = requests.get(endpoint, timeout=100)
            response.raise_for_status()
            data = response.json()
            
            # Extract actual data from Spring Boot response wrapper
            if isinstance(data, dict) and 'data' in data:
                actual_data = data['data']
                # Check if it's a Page response with 'content' field
                if isinstance(actual_data, dict) and 'content' in actual_data:
                    actual_data = actual_data['content']
            else:
                actual_data = data
            
            all_data.append({
                'endpoint': endpoint,
                'data': actual_data,
                'timestamp': datetime.now().isoformat()
            })
            print(f"[OK] Successfully fetched: {endpoint}")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Error fetching {endpoint}: {e}")
            continue

    return all_data

def create_chunks_with_metadata(data_item, text_splitter):
    """
    Tạo chunks với metadata chi tiết - Updated để xử lý List<ProductResponse>
    """
    data = data_item['data']
    endpoint = data_item['endpoint']

    chunks_with_metadata = []

    # Kiểm tra xem data có phải là list không
    if isinstance(data, list):
        # Xử lý từng product trong list
        for product_index, product_data in enumerate(data):
            product_chunks = create_product_chunks(
                product_data,
                endpoint,
                data_item['timestamp'],
                text_splitter,
                product_index
            )
            chunks_with_metadata.extend(product_chunks)
    else:
        # Xử lý single product (backward compatibility)
        product_chunks = create_product_chunks(
            data,
            endpoint,
            data_item['timestamp'],
            text_splitter,
            0
        )
        chunks_with_metadata.extend(product_chunks)

    return chunks_with_metadata

def create_product_chunks(product_data, endpoint, timestamp, text_splitter, product_index):
    """
    Tạo chunks cho một product cụ thể
    """
    chunks_with_metadata = []

    # Trích xuất metadata từ product
    base_metadata = {
        'source_endpoint': endpoint,
        'fetch_timestamp': timestamp,
        'data_type': detect_data_type(endpoint),
        'product_index': product_index,  # Thêm index trong list
    }

    # Thêm metadata specific cho product hoặc tour
    if 'tours' in endpoint.lower():
        # Xử lý Tour data
        base_metadata.update({
            'tour_id': product_data.get('id'),
            'tour_name': product_data.get('name'),
            'slug': product_data.get('slug'),
            'destination': product_data.get('destination'),
            'departure_location': product_data.get('departureLocation'),
            'duration': product_data.get('duration'),
            'min_price': product_data.get('price'),
            'max_price': product_data.get('price'),
            'available_slots': product_data.get('availableSlots'),
            'rating_value': product_data.get('averageRating'),
            'total_reviews': product_data.get('totalReviews'),
            'image_url': product_data.get('imagePath'),
            'description': product_data.get('description'),
            'short_description': product_data.get('shortDescription'),
            'category_name': product_data.get('categoryName'),
            'is_domestic': product_data.get('tourType') == 'DOMESTIC',
        })
    elif 'product' in endpoint.lower() or 'id' in product_data:

        variants_processed = []
        if product_data.get("variants"):
            for variant in product_data.get("variants", []):
                # Lấy attributeValueResponses từ mỗi variant
                attribute_responses = variant.get("attributeValueResponses", [])
                for attr_response in attribute_responses:
                    variants_processed.append({
                        "variantId" : variant.get("id",""),
                        "attributeName": attr_response.get("attributeName", "").lower(),
                        "attributeValue": attr_response.get("attributeValue", "").lower()
                    })


        base_metadata.update({
            'product_id': product_data.get('id'),
            'product_name': product_data.get('name'),
            'brand_name': product_data.get('brand'),
            'category_names': [product_data.get('category')] if product_data.get('category') else [],
            'min_price': product_data.get('price'),
            'max_price': product_data.get('price'),
            'in_stock': product_data.get('stock', 0) > 0 if product_data.get('stock') is not None else None,
            'stock_quantity': product_data.get('stock'),
            'rating_value': product_data.get('rating'),
            'sold_quantity': product_data.get('sold_quantity'),
            'variants': variants_processed,
            'image_url': product_data.get('imagePath'),
            'short_description': product_data.get('short_description'),
            'description': product_data.get('description'),
            'tag_names': [],
            'slug': product_data.get('slug'),
        })

        # Process attributes properly according to Java DTO structure
        attributes_info = process_product_attributes(product_data.get('attributeResponses', []))

        base_metadata.update(attributes_info)

    elif 'brands' in endpoint.lower():
        base_metadata.update({
            'brand_id': product_data.get('id'),
            'brand_name': product_data.get('name'),
            'brand_category': product_data.get('category'),
            'brand_description': product_data.get('description'),
            'totalProducts': product_data.get('totalProducts'),
            'brand_origin': product_data.get('origin'),
            'brand_establish': product_data.get('establish'),

        })
    elif 'categories' in endpoint.lower():
        base_metadata.update({
            'category_id': product_data.get('id'),
            'category_name': product_data.get('name'),
            'totalProduct': product_data.get('totalProduct'),
            'category_description': product_data.get('categoryDescription'),

        })
    elif 'policy' in endpoint.lower():
        base_metadata.update({
            'policy_type': extract_policy_type(endpoint),
            'last_updated': product_data.get('last_updated'),
        })

    # Tạo text content cho product này
    text_content = extract_text_from_product(product_data, endpoint)

    # Chia thành chunks
    chunks = text_splitter.split_text(text_content)

    # Gắn metadata cho từng chunk
    for i, chunk in enumerate(chunks):
        chunk_metadata = base_metadata.copy()
        chunk_metadata.update({
            'chunk_index': i,
            'chunk_size': len(chunk),
            'total_chunks': len(chunks),
            'chunk_type': classify_chunk_content(chunk),
        })

        chunks_with_metadata.append({
            'text': chunk,
            'metadata': chunk_metadata
        })

    return chunks_with_metadata

def process_product_attributes(attribute_responses):
    """
    Xử lý attributes - chỉ lấy attribute names, bỏ attribute values
    """
    attributes_info = {
        'attribute_names': [],
        'attributes_text': []
    }


    if not attribute_responses:
        return attributes_info

    for attr_response in attribute_responses:
        # Lấy thông tin từ AttributeProductResponse
        attr_name = attr_response.get('attributeName')
        is_active = attr_response.get('active', True)

        if not attr_name or not is_active:
            continue

        # Chỉ lưu attribute name
        attributes_info['attribute_names'].append(attr_name)
        attributes_info['attributes_text'].append(attr_name)

    return attributes_info

def detect_data_type(endpoint):
    """Phát hiện loại dữ liệu từ endpoint"""
    endpoint_lower = endpoint.lower()
    if 'product' in endpoint_lower:
        return 'product'
    elif 'brands' in endpoint_lower:
        return 'brands'
    elif 'categories' in endpoint_lower:
        return 'categories'
    elif 'customize' in endpoint_lower:
        return 'customization'
    elif 'attribute' in endpoint_lower:
        return 'attribute'
    else:
        return 'general'

def extract_policy_type(endpoint):
    """Trích xuất loại policy từ endpoint"""
    if 'warranty' in endpoint:
        return 'warranty'
    elif 'return' in endpoint:
        return 'return'
    elif 'payment' in endpoint:
        return 'payment'
    elif 'privacy' in endpoint:
        return 'privacy'
    else:
        return 'general'

def classify_chunk_content(chunk):
    """Phân loại nội dung của chunk"""
    chunk_lower = chunk.lower()

    if any(word in chunk_lower for word in ['price', 'cost', 'fee', '$', 'payment']):
        return 'pricing'
    elif any(word in chunk_lower for word in ['specification', 'material', 'size', 'weight', 'attribute']):
        return 'technical'
    elif any(word in chunk_lower for word in ['description', 'feature', 'benefit']):
        return 'descriptive'
    elif any(word in chunk_lower for word in ['warranty', 'return', 'policy', 'terms']):
        return 'policy'
    else:
        return 'general'

def extract_text_from_product(product_data, endpoint):
    """
    Trích xuất text từ một product cụ thể
    """
    text_parts = []
    text_parts.append(f"Source: {endpoint}")

    # Priority fields cho products
    if 'product' in endpoint.lower():
        # Thông tin cơ bản (priority cao)
        if product_data.get('productName'):
            text_parts.append(f"Product Name: {product_data['productName']}")

        if product_data.get('shortDescription'):
            text_parts.append(f"Short Description: {product_data['shortDescription']}")

        if product_data.get('description'):
            text_parts.append(f"Description: {product_data['description']}")

        # Brand info
        brand_info = product_data.get('brandResponse', {})
        if brand_info and brand_info.get('name'):
            text_parts.append(f"Brand: {brand_info['name']}")

        # Pricing
        min_price = product_data.get('minPrice')
        max_price = product_data.get('maxPrice')
        if min_price is not None and max_price is not None:
            if min_price == max_price:
                text_parts.append(f"Price: ${min_price}")
            else:
                text_parts.append(f"Price Range: ${min_price} - ${max_price}")

        # Stock & Availability
        stock = product_data.get('stock')
        if stock is not None:
            status = "In Stock" if stock > 0 else "Out of Stock"
            text_parts.append(f"Availability: {status} ({stock} units)")

        # Categories
        categories = product_data.get('categories', [])
        if categories:
            cat_names = [cat.get('name') for cat in categories if cat.get('name')]
            if cat_names:
                text_parts.append(f"Categories: {', '.join(cat_names)}")

        # Tags
        tags = product_data.get('tags', [])
        if tags:
            tag_names = [tag.get('tagName') for tag in tags if tag.get('tagName')]
            if tag_names:
                text_parts.append(f"Tags: {', '.join(tag_names)}")

        # Attributes/Specifications - Chỉ hiển thị attribute names
        attributes = product_data.get('attributeResponses', [])
        if attributes:
            attr_names = []
            for attr in attributes:
                attr_name = attr.get('attributeName')
                is_active = attr.get('active', True)

                if attr_name and is_active:
                    attr_names.append(attr_name)

            if attr_names:
                text_parts.append(f"Specifications: {', '.join(attr_names)}")

        # Rating
        rating = product_data.get('ratingValue')
        if rating is not None:
            text_parts.append(f"Rating: {rating}/5")

        # Sales info
        sold = product_data.get('solded')
        if sold is not None:
            text_parts.append(f"Sold: {sold} units")

    else:
        # Fallback cho non-product data
        def extract_recursive(obj, prefix=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if isinstance(value, str) and value.strip():
                        if key.lower() not in ['id', 'created_at', 'updated_at', 'image_path', 'model_path']:
                            text_parts.append(f"{prefix}{key}: {value}")
                    elif isinstance(value, (dict, list)) and key.lower() not in ['created_by', 'updated_by']:
                        extract_recursive(value, f"{prefix}{key} ")
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    if i < 5:  # Limit để tránh quá dài
                        extract_recursive(item, f"{prefix}[{i}] ")

        extract_recursive(product_data)

    return "\n".join(text_parts)

def extract_text_from_json(data_item):
    """
    Wrapper function để maintain backward compatibility
    """
    data = data_item['data']
    endpoint = data_item['endpoint']

    if isinstance(data, list):
        # Nếu là list, chỉ lấy text từ product đầu tiên cho compatibility
        if data:
            return extract_text_from_product(data[0], endpoint)
        else:
            return f"Source: {endpoint}\nEmpty product list"
    else:
        return extract_text_from_product(data, endpoint)

def setup_vector_store_with_metadata(api_endpoints):
    """
    Tạo vector store với metadata - Updated để xử lý List<ProductResponse>
    """
    all_chunks_with_metadata = []
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

    # Lấy dữ liệu từ API
    print("Fetching data from APIs...")
    api_data = get_data_from_api(api_endpoints)

    # Xử lý từng API response
    for data_item in api_data:
        try:
            chunks_with_metadata = create_chunks_with_metadata(data_item, text_splitter)
            all_chunks_with_metadata.extend(chunks_with_metadata)

            # Tính số products được xử lý
            data = data_item['data']
            product_count = len(data) if isinstance(data, list) else 1

            print(f"\n========= API: {data_item['endpoint']} =========")
            print(f"Processed {product_count} product(s)")
            print(f"Generated {len(chunks_with_metadata)} chunks with metadata")

            # In preview
            if chunks_with_metadata:
                sample = chunks_with_metadata[0]
                print(f"Sample metadata: {json.dumps(sample['metadata'], indent=2, default=str)}")
                print(f"Sample text: {sample['text'][:200]}...")

        except Exception as e:  # noqa: E722
            print(f"[ERROR] Error processing {data_item['endpoint']}: {e}")
            continue

    if not all_chunks_with_metadata:
        print("[ERROR] No chunks generated.")
        return

    print(f"\n[PROCESSING] Creating embeddings for {len(all_chunks_with_metadata)} chunks...")

    # Tách text và metadata
    texts = [item['text'] for item in all_chunks_with_metadata]
    metadata_list = [item['metadata'] for item in all_chunks_with_metadata]

    # Tạo embeddings
    embeddings = embedder.encode(texts, convert_to_numpy=True)

    # Lưu chunks với metadata
    chunks_data = {
        'chunks': all_chunks_with_metadata,
        'texts': texts,
        'metadata': metadata_list,
        'created_at': datetime.now().isoformat(),
        'total_chunks': len(all_chunks_with_metadata),
        'total_products': count_unique_products(metadata_list)
    }
    with open("chunks_with_metadata.pkl", "wb") as f:
        pickle.dump(chunks_data, f)
    print("[OK] Chunks with metadata saved to chunks_with_metadata.pkl")

    # Tạo và lưu FAISS index
    dimension = int(embeddings.shape[1])
    index = faiss.IndexFlatL2(dimension)
    embeddings_float32 = embeddings.astype('float32')
    index.add(embeddings_float32)  # type: ignore
    faiss.write_index(index, "faiss_index.index")
    print("[OK] FAISS index saved to faiss_index.index")
    print(f"\n[SUCCESS] Vector store with metadata created successfully!")
    print(f"Total products: {chunks_data['total_products']}")
    print(f"Total chunks: {len(all_chunks_with_metadata)}")
    print(f"Embedding dimension: {dimension}")

def count_unique_products(metadata_list):
    """
    Đếm số lượng products duy nhất
    """
    unique_products = set()
    for metadata in metadata_list:
        if metadata.get('product_id'):
            unique_products.add(metadata['product_id'])
    return len(unique_products)

def search_with_metadata_filtering(query, top_k=5, filters=None):
    """
    Tìm kiếm với filtering theo metadata - Enhanced cho ProductResponse
    """
    # Load data
    with open("chunks_with_metadata.pkl", "rb") as f:
        chunks_data = pickle.load(f)

    index = faiss.read_index("faiss_index.index")
    embedder = SentenceTransformer('all-MiniLM-L6-v2')

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

        # Áp dụng filters nếu có
        if filters:
            skip = False
            for key, value in filters.items():
                if key == 'price_range':
                    # Special handling cho price range
                    min_price = metadata.get('min_price')
                    max_price = metadata.get('max_price')
                    if min_price is not None and max_price is not None:
                        if not (value[0] <= max_price and value[1] >= min_price):
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

# Thêm helper functions cho advanced search
def search_products_by_criteria(query, **criteria):
    """
    Tìm kiếm products với các criteria cụ thể
    """
    filters = {}

    # Convert criteria to filters
    if 'price_min' in criteria or 'price_max' in criteria:
        price_min = criteria.get('price_min', 0)
        price_max = criteria.get('price_max', float('inf'))
        filters['price_range'] = [price_min, price_max]

    if 'in_stock' in criteria:
        filters['in_stock_only'] = criteria['in_stock']

    if 'min_rating' in criteria:
        filters['min_rating'] = criteria['min_rating']

    if 'categories' in criteria:
        filters['categories'] = criteria['categories'] if isinstance(criteria['categories'], list) else [criteria['categories']]

    if 'brands' in criteria:
        filters['brands'] = criteria['brands'] if isinstance(criteria['brands'], list) else [criteria['brands']]

    if 'attributes' in criteria:
        filters['attributes'] = criteria['attributes']

    return search_with_metadata_filtering(query, filters=filters)

def search_by_attributes(query, attribute_names, top_k=5):
    """
    Tìm kiếm theo attribute names cụ thể
    Example: search_by_attributes("shoes", ["Color", "Size"])
    """
    return search_products_by_criteria(query, attributes=attribute_names, top_k=top_k)

def get_product_summary(metadata):
    """
    Tạo summary ngắn gọn cho product từ metadata
    """
    summary_parts = []

    if metadata.get('product_name'):
        summary_parts.append(f"**{metadata['product_name']}**")

    if metadata.get('brand_name'):
        summary_parts.append(f"by {metadata['brand_name']}")

    # Price
    min_price = metadata.get('min_price')
    max_price = metadata.get('max_price')
    if min_price is not None and max_price is not None:
        if min_price == max_price:
            summary_parts.append(f"${min_price}")
        else:
            summary_parts.append(f"${min_price}-${max_price}")

    # Rating
    rating = metadata.get('rating_value')
    if rating:
        summary_parts.append(f"*{rating}/5")

    # Stock status
    if metadata.get('in_stock'):
        summary_parts.append("[OK] In Stock")
    else:
        summary_parts.append("[X] Out of Stock")

    # Key attributes
    attr_names = metadata.get('attribute_names', [])
    if attr_names:
        summary_parts.append(f"Attrs: {', '.join(attr_names[:3])}")

    return " | ".join(summary_parts)

def get_products_statistics():
    """
    Lấy thống kê về products trong vector store
    """
    try:
        with open("chunks_with_metadata.pkl", "rb") as f:
            chunks_data = pickle.load(f)

        metadata_list = chunks_data['metadata']

        # Thống kê cơ bản
        stats = {
            'total_chunks': len(metadata_list),
            'total_products': count_unique_products(metadata_list),
            'brands': {},
            'categories': {},
            'price_ranges': [],
            'in_stock_count': 0,
            'out_of_stock_count': 0,
            'avg_rating': 0,
            'rating_count': 0
        }

        # Phân tích metadata
        for metadata in metadata_list:
            # Brand stats
            brand_name = metadata.get('brand_name')
            if brand_name:
                stats['brands'][brand_name] = stats['brands'].get(brand_name, 0) + 1

            # Category stats
            categories = metadata.get('category_names', [])
            for cat in categories:
                stats['categories'][cat] = stats['categories'].get(cat, 0) + 1

            # Price stats
            min_price = metadata.get('min_price')
            max_price = metadata.get('max_price')
            if min_price is not None and max_price is not None:
                stats['price_ranges'].append((min_price, max_price))

            # Stock stats
            if metadata.get('in_stock'):
                stats['in_stock_count'] += 1
            else:
                stats['out_of_stock_count'] += 1

            # Rating stats
            rating = metadata.get('rating_value')
            if rating is not None:
                stats['avg_rating'] += rating
                stats['rating_count'] += 1

        # Tính trung bình rating
        if stats['rating_count'] > 0:
            stats['avg_rating'] = stats['avg_rating'] / stats['rating_count']

        return stats

    except FileNotFoundError:
        return {"error": "Vector store not found. Please run setup_vector_store_with_metadata first."}

def add_plain_texts_from_file(file_path, overwrite_existing=False, chunk_size=500, chunk_overlap=50, encoding='utf-8'):
    """
    Đọc nội dung từ file txt và thêm vào FAISS index

    Args:
        file_path (str): Đường dẫn đến file txt
        overwrite_existing (bool): True để ghi đè, False để append
        chunk_size (int): Kích thước mỗi chunk
        chunk_overlap (int): Độ overlap giữa các chunks
        encoding (str): Encoding của file (mặc định utf-8)

    Returns:
        dict: Thông tin về kết quả
    """
    try:
        # Đọc nội dung từ file
        print(f"📖 Reading content from: {file_path}")
        with open(file_path, 'r', encoding=encoding) as file:
            content = file.read()

        if not content.strip():
            return {
                'success': False,
                'error': 'File is empty or contains only whitespace'
            }

        print(f"[OK] Read {len(content)} characters from file")

        # Chia nội dung thành chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        chunks = text_splitter.split_text(content)

        print(f"Split content into {len(chunks)} chunks")

        # Gọi hàm add_plain_texts_to_faiss với chunks
        return add_plain_texts_to_faiss(chunks, overwrite_existing)

    except FileNotFoundError:
        error_msg = f"File not found: {file_path}"
        print(f"[ERROR] {error_msg}")
        return {
            'success': False,
            'error': error_msg
        }
    except UnicodeDecodeError as e:
        error_msg = f"Encoding error reading file: {e}. Try different encoding."
        print(f"[ERROR] {error_msg}")
        return {
            'success': False,
            'error': error_msg
        }
    except Exception as e:
        error_msg = f"Error reading file: {e}"
        print(f"[ERROR] {error_msg}")
        return {
            'success': False,
            'error': error_msg
        }

def add_plain_texts_to_faiss(texts, overwrite_existing=False):
    """
    Thêm các text thuần vào FAISS index và ghi đè lên file hiện tại

    Args:
        texts (list): Danh sách các text cần thêm vào
        overwrite_existing (bool): True để ghi đè, False để append

    Returns:
        dict: Thông tin về kết quả
    """
    try:
        embedder = SentenceTransformer('all-MiniLM-L6-v2')

        # Tạo embeddings cho texts mới
        print(f"[PROCESSING] Creating embeddings for {len(texts)} texts...")
        new_embeddings = embedder.encode(texts, convert_to_numpy=True)
        dimension = int(new_embeddings.shape[1])

        if overwrite_existing:
            # Ghi đè hoàn toàn - tạo index mới
            print("[PROCESSING] Creating new FAISS index (overwriting existing)...")
            index = faiss.IndexFlatL2(dimension)
            embeddings_float32 = new_embeddings.astype('float32')
            index.add(embeddings_float32)  # type: ignore
            # Tạo chunks data mới cho plain texts
            chunks_with_metadata = []
            for i, text in enumerate(texts):
                chunks_with_metadata.append({
                    'text': text,
                    'metadata': {
                        'source_type': 'plain_text',
                        'text_index': i,
                        'chunk_size': len(text),
                        'added_at': datetime.now().isoformat(),
                        'data_type': 'plain_text',
                        'chunk_type': 'text_chunk'
                    }
                })

            # Lưu chunks data mới
            chunks_data = {
                'chunks': chunks_with_metadata,
                'texts': texts,
                'metadata': [chunk['metadata'] for chunk in chunks_with_metadata],
                'created_at': datetime.now().isoformat(),
                'total_chunks': len(texts),
                'total_products': 0,  # Không có products
                'data_source': 'plain_texts_only'
            }

            total_vectors = len(texts)

        else:
            # Append vào index hiện tại
            try:
                # Load existing data
                index = faiss.read_index("faiss_index.index")
                with open("chunks_with_metadata.pkl", "rb") as f:
                    existing_chunks_data = pickle.load(f)

                print(f"[PROCESSING] Appending to existing index with {index.ntotal} vectors...")

                # Kiểm tra dimension compatibility
                if index.d != dimension:
                    raise ValueError(f"Dimension mismatch: existing={index.d}, new={dimension}")

                # Add new embeddings
                embeddings_float32 = new_embeddings.astype('float32')
                index.add(embeddings_float32)  # type: ignore

                # Merge chunks data
                new_chunks = []
                for i, text in enumerate(texts):
                    new_chunks.append({
                        'text': text,
                        'metadata': {
                            'source_type': 'plain_text',
                            'text_index': i + len(existing_chunks_data['chunks']),
                            'chunk_size': len(text),
                            'added_at': datetime.now().isoformat(),
                            'data_type': 'plain_text',
                            'chunk_type': 'text_chunk'
                        }
                    })

                # Update chunks data
                chunks_data = {
                    'chunks': existing_chunks_data['chunks'] + new_chunks,
                    'texts': existing_chunks_data['texts'] + texts,
                    'metadata': existing_chunks_data['metadata'] + [chunk['metadata'] for chunk in new_chunks],
                    'created_at': existing_chunks_data.get('created_at'),
                    'updated_at': datetime.now().isoformat(),
                    'total_chunks': len(existing_chunks_data['chunks']) + len(texts),
                    'total_products': existing_chunks_data.get('total_products', 0),
                    'data_source': 'mixed'  # Có cả product data và plain text
                }

                total_vectors = index.ntotal

            except FileNotFoundError:
                print("[WARNING] No existing index found, creating new one...")
                return add_plain_texts_to_faiss(texts, overwrite_existing=True)

        # Lưu index và chunks data
        faiss.write_index(index, "faiss_index.index")
        print("[OK] FAISS index saved to faiss_index.index")

        with open("chunks_with_metadata.pkl", "wb") as f:
            pickle.dump(chunks_data, f)
        print("[OK] Chunks data saved to chunks_with_metadata.pkl")

        result = {
            'success': True,
            'total_vectors': total_vectors,
            'new_texts_added': len(texts),
            'embedding_dimension': dimension,
            'operation': 'overwrite' if overwrite_existing else 'append',
            'index_file': 'faiss_index.index',
            'metadata_file': 'chunks_with_metadata.pkl'
        }

        print(f"\n[SUCCESS] Plain texts added to FAISS successfully!")
        print(f"Operation: {'Overwrite' if overwrite_existing else 'Append'}")
        print(f"Total vectors in index: {total_vectors}")
        print(f"New texts added: {len(texts)}")
        print(f"Embedding dimension: {dimension}")

        return result

    except Exception as e:
        print(f"[ERROR] Error adding plain texts to FAISS: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def add_multiple_text_files_to_faiss(file_paths, overwrite_existing=False, chunk_size=500, chunk_overlap=50):
    """
    Đọc nội dung từ nhiều file txt và thêm vào FAISS index

    Args:
        file_paths (list): Danh sách đường dẫn đến các file txt
        overwrite_existing (bool): True để ghi đè, False để append
        chunk_size (int): Kích thước mỗi chunk
        chunk_overlap (int): Độ overlap giữa các chunks

    Returns:
        dict: Thông tin về kết quả
    """
    all_chunks = []
    processed_files = []
    failed_files = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    for file_path in file_paths:
        try:
            print(f"📖 Processing file: {file_path}")
            # Thử các encoding khác nhau
            encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
            content = None
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as file:
                        content = file.read()
                    print(f"[OK] Successfully read with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue

            if content is None:
                failed_files.append({'file': file_path, 'error': 'Unable to decode with any encoding'})
                continue

            if not content.strip():
                failed_files.append({'file': file_path, 'error': 'File is empty'})
                continue
            # Chia thành chunks
            chunks = text_splitter.split_text(content)

            # Thêm metadata về file source cho mỗi chunk
            for i, chunk in enumerate(chunks):
                chunk_with_source = {
                    'text': chunk,
                    'source_file': file_path,
                    'chunk_in_file': i,
                    'total_chunks_in_file': len(chunks)
                }
                all_chunks.append(chunk_with_source)

            processed_files.append({
                'file': file_path,
                'chunks_count': len(chunks),
                'content_length': len(content)
            })

            print(f"[OK] Processed {file_path}: {len(chunks)} chunks")

        except Exception as e:
            failed_files.append({'file': file_path, 'error': str(e)})
            print(f"[ERROR] Failed to process {file_path}: {e}")

    if not all_chunks:
        return {
            'success': False,
            'error': 'No valid chunks extracted from any file',
            'failed_files': failed_files
        }

    # Tạo texts list từ chunks
    texts = []
    chunks_with_file_metadata = []

    for chunk_data in all_chunks:
        texts.append(chunk_data['text'])
        chunks_with_file_metadata.append(chunk_data)

    # Gọi hàm add_plain_texts_to_faiss
    result = add_plain_texts_to_faiss(texts, overwrite_existing)

    # Thêm thông tin về files vào result
    if result['success']:
        result.update({
            'processed_files': processed_files,
            'failed_files': failed_files,
            'total_files_processed': len(processed_files),
            'total_files_failed': len(failed_files)
        })

    return result


# Ví dụ sử dụng
if __name__ == "__main__":
    # API endpoints cho Tour Booking System (Spring Boot backend port 8080)
    api_endpoints = [
        "http://localhost:8080/api/tours",  # API trả về List<TourResponse>
        "http://localhost:8080/api/destinations",  # Điểm đến
        "http://localhost:8080/api/categories",  # Loại tour
    ]

    # Thiết lập vector store với dữ liệu tour
    setup_vector_store_with_metadata(api_endpoints)

    # Thêm các file text về chính sách tour
    files = ["text1.txt", "text2.txt", "text3.txt", "text4.txt", "policies_tour.txt", "faq_tour.txt"]
    result = add_multiple_text_files_to_faiss(files, overwrite_existing=False)

    # Lấy thống kê tours
    stats = get_products_statistics()  # Hàm này sẽ đọc từ chunks_data
    print(f"\nTours Statistics:")
    print(stats)
    print(f"Total tours: {stats.get('total_products', 0)}")
    print(f"Total chunks: {stats.get('total_chunks', 0)}")
    print(f"Top destinations: {list(stats.get('destinations', {}).keys())[:5] if 'destinations' in stats else 'N/A'}")
    print(f"Top categories: {list(stats.get('categories', {}).keys())[:5]}")
    print(f"Average rating: {stats.get('avg_rating', 0):.2f}")

    # Ví dụ tìm kiếm tour
    print(f"\n🔍 Search Example:")
    results = search_with_metadata_filtering("du lịch biển", top_k=3)
    for i, result in enumerate(results, 1):
        metadata = result['metadata']
        tour_name = metadata.get('tour_name', metadata.get('product_name', 'Unknown'))
        destination = metadata.get('destination', 'N/A')
        print(f"{i}. {tour_name} - {destination}")
        print(f"   Score: {result['relevance_score']:.3f}")
        print()