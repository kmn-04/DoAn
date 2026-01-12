import faiss
import pickle
from sentence_transformers import SentenceTransformer
from openai import OpenAI
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from backend_config import DB_CONFIG, BACKEND_URL, FRONTEND_URL

# Khởi tạo ứng dụng
APP_CONTEXT = {}
IMAGE_SEARCH_THRESHOLD = 75

# Cấu hình OpenAI client với error handling
try:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="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"
    )
    print("[OK] OpenAI client initialized successfully")
except Exception as e:
    print(f"[WARNING] Error initializing OpenAI client: {e}")
    client = None

def init_app_context(app):
    print("--- TAI DU LIEU VAN BAN (TEXT RAG) ---")
    try:
        index = faiss.read_index("faiss_index.index")
        with open("chunks_with_metadata.pkl", "rb") as f:
            chunks_data = pickle.load(f)
        app.config['index'] = index
        app.config['chunks_data'] = chunks_data
        print("[OK] Da tai du lieu van ban thanh cong.")
        
        # Chuẩn bị dữ liệu cho LangChain
        texts = [chunk['text'] for chunk in chunks_data['chunks']]
        metadatas = [chunk['metadata'] for chunk in chunks_data['chunks']]
    except FileNotFoundError as e:
        app.config['index'] = None
        app.config['chunks_data'] = None
        print(f"[WARNING] Loi: {str(e)}. Chatbot se khong the tra loi cau hoi dua tren van ban.")

    print("--- TAI MODEL EMBEDDING VAN BAN ---")
    try:
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        app.config['embedder'] = embedder
        print("[OK] Mo hinh embedding van ban da san sang.")
    
        # Tạo vector store cho LangChain - Tạm thời disable để tránh lỗi
        # embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        # vectorstore = FAISS.from_texts(
        #     texts=texts, 
        #     embedding=embeddings,
        #     metadatas=metadatas
        # )
        # app.config['vectorstore'] = vectorstore
        # APP_CONTEXT['vectorstore'] = vectorstore
        app.config['vectorstore'] = None
        APP_CONTEXT['vectorstore'] = None
    except Exception as e:
        app.config['embedder'] = None
        print(f"[WARNING] Loi khi tai model embedding van ban: {str(e)}")

    print("--- TAI MODEL EMBEDDING HINH ANH ---")
    try:
        print("[LOADING] Dang tai model CLIP cho embedding hinh anh...")
        image_embedding_model = SentenceTransformer('clip-ViT-B-32')
        APP_CONTEXT['embedding_model'] = image_embedding_model
        print("[OK] Mo hinh embedding hinh anh da san sang.")
    except Exception as e:
        APP_CONTEXT['embedding_model'] = None
        print(f"[WARNING] Loi khi tai model embedding hinh anh: {str(e)}")
        print("Tinh nang phan tich anh se khong hoat dong.")

    print("--- TAI DU LIEU TIM KIEM HINH ANH ---")
    try:
        image_index = faiss.read_index("image_faiss.index") 
        with open("product_map.pkl", "rb") as f:
            product_map = pickle.load(f)
        APP_CONTEXT['image_index'] = image_index
        APP_CONTEXT['product_map'] = product_map
        print("[OK] Da tai du lieu hinh anh thanh cong.")
    except (FileNotFoundError, RuntimeError) as e:
        APP_CONTEXT['image_index'] = None
        APP_CONTEXT['product_map'] = None
        print(f"[WARNING] Loi: {str(e)}. Tinh nang tim kiem bang hinh anh se khong hoat dong.")
        print("[INFO] De su dung tinh nang tim kiem hinh anh, vui long chay image_indexer.py truoc.")