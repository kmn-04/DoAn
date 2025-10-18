#!/usr/bin/env python3
"""
Script khởi động chatbot service cho Laravel project
Kiểm tra dependencies và khởi động Flask app
"""

import sys
import os
import subprocess
import importlib.util

def check_python_version():
    """Kiểm tra phiên bản Python"""
    if sys.version_info < (3, 8):
        print("KHONG OK - Can Python 3.8 tro len. Phien ban hien tai:", sys.version)
        return False
    print(f"OK - Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def check_dependencies():
    """Kiểm tra các dependencies cần thiết"""
    required_packages = [
        'flask',
        'flask_cors', 
        'openai',
        'sentence_transformers',
        'faiss',
        'numpy',
        'mysql.connector',
        'requests',
        'PIL',
        'jwt'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'flask_cors':
                importlib.import_module('flask_cors')
            elif package == 'mysql.connector':
                importlib.import_module('mysql.connector')
            elif package == 'PIL':
                importlib.import_module('PIL')
            elif package == 'jwt':
                importlib.import_module('jwt')
            elif package == 'faiss':
                try:
                    importlib.import_module('faiss')
                except ImportError:
                    importlib.import_module('faiss_cpu')
            else:
                importlib.import_module(package)
            print(f"OK - {package}")
        except ImportError:
            print(f"THIEU - {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\nThieu {len(missing_packages)} package(s):")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nChay lenh: py -m pip install -r requirements.txt")
        return False
    
    return True

def check_files():
    """Kiểm tra các file cần thiết"""
    required_files = [
        'app.py',
        'config.py',
        'backend_config.py',
        'rag_utils.py',
        'requirements.txt'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"OK - {file}")
        else:
            print(f"THIEU - {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\nThieu {len(missing_files)} file(s) quan trong:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    return True

def check_laravel_env():
    """Kiểm tra file .env của Laravel"""
    laravel_env = os.path.join('..', '.env')
    if os.path.exists(laravel_env):
        print("OK - Laravel .env file found")
        return True
    else:
        print("CANH BAO - Laravel .env file not found - using default config")
        return True  # Not critical, will use defaults

def check_data_files():
    """Kiểm tra các file dữ liệu FAISS"""
    data_files = [
        'faiss_index.index',
        'chunks_with_metadata.pkl',
        'image_faiss.index',
        'product_map.pkl'
    ]
    
    missing_data = []
    
    for file in data_files:
        if os.path.exists(file):
            print(f"OK - {file}")
        else:
            print(f"CANH BAO - {file} - se tao khi can")
            missing_data.append(file)
    
    if missing_data:
        print(f"\nDe tao cac file du lieu thieu, chay: python setup_faiss.py")
    
    return True

def start_chatbot():
    """Khởi động chatbot service"""
    try:
        print("\nKHOI DONG AI Chatbot Service...")
        print("URL: http://localhost:5000")
        print("Laravel integration: /chatbot/*")
        print("\nNhan Ctrl+C de dung\n")
        
        # Import và chạy Flask app
        from app import app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\nChatbot service da dung.")
    except Exception as e:
        print(f"\nLoi khoi dong: {e}")
        sys.exit(1)

def main():
    """Hàm chính"""
    print("="*60)
    print("AI CHATBOT STARTUP SCRIPT")
    print("="*60)
    
    print("\nKIEM TRA HE THONG...")
    
    # Kiểm tra Python version
    if not check_python_version():
        sys.exit(1)
    
    print("\nKIEM TRA DEPENDENCIES...")
    if not check_dependencies():
        sys.exit(1)
    
    print("\nKIEM TRA FILES...")
    if not check_files():
        sys.exit(1)
    
    print("\nKIEM TRA CAU HINH...")
    check_laravel_env()
    
    print("\nKIEM TRA DU LIEU...")
    check_data_files()
    
    print("\nTAT CA KIEM TRA HOAN THANH!")
    
    # Khởi động service
    start_chatbot()

if __name__ == "__main__":
    main()
