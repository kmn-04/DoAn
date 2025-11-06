# 🔄 HƯỚNG DẪN RE-INDEX FAISS CHO TOUR INTERNATIONAL

## ❌ VẤN ĐỀ

Chatbot không tìm được tour INTERNATIONAL vì **metadata cũ** trong FAISS index không có thông tin `tour_type` chính xác.

## ✅ GIẢI PHÁP

Re-index lại toàn bộ FAISS database để cập nhật metadata mới với `tourType` từ backend.

---

## 📝 CÁCH THỰC HIỆN

### Bước 1: Backup dữ liệu cũ (tùy chọn)

```bash
cd chatbot
mkdir backup_faiss
copy faiss_index.index backup_faiss\
copy chunks_with_metadata.pkl backup_faiss\
```

### Bước 2: Xóa index cũ

```bash
del faiss_index.index
del chunks_with_metadata.pkl
```

### Bước 3: Chạy lại setup_faiss.py

```bash
python setup_faiss.py
```

**Quá trình sẽ:**
1. ✅ Fetch toàn bộ tours từ backend API `http://localhost:8080/api/tours`
2. ✅ Đọc field `tourType` từ mỗi tour (DOMESTIC/INTERNATIONAL)
3. ✅ Tạo metadata với `is_domestic: true/false` dựa trên `tourType`
4. ✅ Tạo embeddings và lưu vào FAISS index mới

### Bước 4: Restart chatbot

```bash
# Nếu đang chạy, nhấn Ctrl+C để dừng
# Sau đó chạy lại:
python start_chatbot.py
```

---

## ✨ KẾT QUẢ

Sau khi re-index, chatbot sẽ:
- ✅ Tìm được tour INTERNATIONAL khi user hỏi "tour nước ngoài"
- ✅ Tìm được tour DOMESTIC khi user hỏi "tour trong nước"
- ✅ Filter chính xác theo `tourType`

---

## 📊 CHECK METADATA SAU KHI RE-INDEX

Mở Python console và kiểm tra:

```python
import pickle

# Load metadata
with open('chunks_with_metadata.pkl', 'rb') as f:
    data = pickle.load(f)

# Check một tour INTERNATIONAL (ví dụ: Singapore)
for chunk in data['chunks'][:50]:
    meta = chunk['metadata']
    if 'Singapore' in meta.get('tour_name', ''):
        print(f"Tour: {meta['tour_name']}")
        print(f"is_domestic: {meta.get('is_domestic')}")
        print(f"Should be: False (for INTERNATIONAL)")
        print("---")
        break

# Check một tour DOMESTIC (ví dụ: Đà Nẵng)
for chunk in data['chunks'][:50]:
    meta = chunk['metadata']
    if 'Đà Nẵng' in meta.get('tour_name', ''):
        print(f"Tour: {meta['tour_name']}")
        print(f"is_domestic: {meta.get('is_domestic')}")
        print(f"Should be: True (for DOMESTIC)")
        print("---")
        break
```

---

## ⚠️ LƯU Ý

1. **Backend phải chạy** trước khi re-index (`http://localhost:8080`)
2. **Có internet** để tải model embedding (nếu chưa có cache)
3. **Đủ RAM** (~2GB) để process embeddings
4. **Thời gian:** ~5-10 phút tùy số lượng tours

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to backend"
```bash
# Kiểm tra backend đang chạy:
curl http://localhost:8080/api/tours
```

### Lỗi: "Out of memory"
```bash
# Giảm batch size trong setup_faiss.py
# Tìm dòng có batch_size và giảm xuống (ví dụ: 32 -> 16)
```

### Metadata vẫn sai sau re-index
```bash
# Xóa cache của sentence-transformers
cd %USERPROFILE%\.cache\torch\sentence_transformers
del /s /q *

# Re-index lại
cd D:\DoAn\chatbot
python setup_faiss.py
```

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề, check log trong `setup_faiss.py` và tìm dòng:

```
[OK] Fetched X tours from backend
[INFO] Processing tour: <tour_name> | Type: DOMESTIC/INTERNATIONAL
```

Đảm bảo `tourType` được hiển thị đúng cho mỗi tour.


