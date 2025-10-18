"""
Cấu hình để tích hợp chatbot với Spring Boot Backend cho Tour Booking System
"""
import os
from pathlib import Path

# URL Configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_DATABASE', 'doan'),
    'user': os.getenv('DB_USERNAME', 'root'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'charset': 'utf8mb4'
}

# API Endpoints
API_BASE = f"{BACKEND_URL}/api"
TOURS_API_ENDPOINT = f"{API_BASE}/tours"
DESTINATIONS_API_ENDPOINT = f"{API_BASE}/destinations"
CATEGORIES_API_ENDPOINT = f"{API_BASE}/categories"
COUNTRIES_API_ENDPOINT = f"{API_BASE}/countries"
REVIEWS_API_ENDPOINT = f"{API_BASE}/reviews"

print(f"Backend URL: {BACKEND_URL}")
print(f"Frontend URL: {FRONTEND_URL}")
print(f"Database: {DB_CONFIG['database']} on {DB_CONFIG['host']}:{DB_CONFIG['port']}")

