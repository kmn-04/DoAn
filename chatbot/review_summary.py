"""
Review summary functionality for chatbot with caching
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import mysql.connector
from backend_config import DB_CONFIG

# TTL Cache system with expiration
class CacheManager:
    """
    Cache manager with TTL (Time To Live) support
    """
    def __init__(self, ttl_hours: int = 24, max_entries: int = 1000):
        self.cache: Dict[str, Tuple[Any, datetime]] = {}
        self.ttl = timedelta(hours=ttl_hours)
        self.max_entries = max_entries
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.ttl:
                return value
            else:
                # Expired, remove from cache
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any) -> None:
        """Set cache value with current timestamp"""
        self.cache[key] = (value, datetime.now())
        
        # Cleanup if cache too large
        if len(self.cache) > self.max_entries:
            self._cleanup_old_entries()
    
    def _cleanup_old_entries(self) -> None:
        """Remove 10% oldest entries to maintain cache size"""
        entries_to_remove = int(self.max_entries * 0.1)
        sorted_keys = sorted(
            self.cache.keys(),
            key=lambda k: self.cache[k][1]
        )[:entries_to_remove]
        
        for key in sorted_keys:
            del self.cache[key]
    
    def clear(self) -> None:
        """Clear all cache"""
        self.cache.clear()

# Global cache instances
review_cache = CacheManager(ttl_hours=24, max_entries=1000)
query_cache = CacheManager(ttl_hours=1, max_entries=500)  # Shorter TTL for queries

def get_reviews_for_product_from_db(product_id: int) -> List[Dict[str, Any]]:
    """
    Get reviews for a product from database with caching
    Cache TTL: 24 hours
    """
    cache_key = f"reviews_tour_{product_id}"
    
    # Try to get from cache first
    cached_reviews = review_cache.get(cache_key)
    if cached_reviews is not None:
        print(f"✅ Cache HIT: Reviews for tour {product_id}")
        return cached_reviews
    
    # Cache miss - fetch from database
    print(f"❌ Cache MISS: Fetching reviews for tour {product_id} from DB")
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
        
        # Store in cache
        review_cache.set(cache_key, reviews)
        
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
