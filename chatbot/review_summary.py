"""
Review summary functionality for chatbot
"""
from typing import List, Dict, Any
import mysql.connector
from backend_config import DB_CONFIG

# TTL Cache system
ttl_cache_system = {}

def get_reviews_for_product_from_db(product_id: int) -> List[Dict[str, Any]]:
    """
    Get reviews for a product from database
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.tour_id = %s AND r.status = 'APPROVED'
        ORDER BY r.created_at DESC
        """
        
        cursor.execute(query, (product_id,))
        reviews = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return reviews
    except Exception as e:
        print(f"Error getting reviews: {e}")
        return []

def summarize_reviews(reviews: List[Dict[str, Any]]) -> str:
    """
    Summarize customer reviews
    """
    if not reviews:
        return "Chưa có đánh giá nào."
    
    total_reviews = len(reviews)
    avg_rating = sum(r.get('rating', 0) for r in reviews) / total_reviews if total_reviews > 0 else 0
    
    return f"Có {total_reviews} đánh giá với điểm trung bình {avg_rating:.1f}/5."

def extract_review_sentiment(review_text: str) -> str:
    """
    Extract sentiment from review text
    """
    # Placeholder implementation
    return "positive"
