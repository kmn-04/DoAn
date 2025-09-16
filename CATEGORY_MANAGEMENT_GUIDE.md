# Hướng dẫn Quản lý Danh mục Tour

## Tổng quan

Hệ thống quản lý danh mục tour đã được hoàn thiện với đầy đủ tính năng CRUD (Create, Read, Update, Delete) và giao diện kéo-thả để sắp xếp thứ tự hiển thị.

## Tính năng đã hoàn thành

### Backend (Spring Boot)

1. **Model Category** (`backend/model/Category.java`)
   - Các trường: id, name, slug, description, displayOrder, imageUrl, galleryImages, isActive
   - Tự động sinh slug từ tên danh mục
   - Hỗ trợ JSON cho gallery images
   - Validation đầy đủ

2. **Repository** (`backend/repository/CategoryRepository.java`)
   - Tìm kiếm theo slug, trạng thái active
   - Sắp xếp theo display_order
   - Các query tùy chỉnh cho thống kê

3. **Service** (`backend/service/CategoryService.java`)
   - CRUD operations đầy đủ
   - Sắp xếp lại thứ tự categories
   - Tìm kiếm và thống kê
   - Xử lý slug tự động và unique

4. **Controller** (`backend/controller/CategoryController.java`)
   - Public endpoints: lấy categories active
   - Admin endpoints: quản lý đầy đủ
   - Phân quyền bằng @PreAuthorize
   - API đầy đủ cho frontend

5. **DTOs**
   - `CategoryDto`: Data Transfer Object
   - `CategoryCreateRequest`: Request tạo mới
   - `CategoryUpdateRequest`: Request cập nhật
   - `CategoryReorderRequest`: Request sắp xếp lại

### Frontend (React)

1. **CategoryManagement Component** (`frontend/src/components/CategoryManagement.jsx`)
   - Bảng danh sách với drag-and-drop
   - Tìm kiếm theo tên
   - Thống kê tổng quan
   - Các action: thêm, sửa, xóa, toggle status

2. **CategoryFormModal Component** (`frontend/src/components/CategoryFormModal.jsx`)
   - Form thêm/sửa danh mục
   - Upload ảnh đại diện và gallery
   - Tự động sinh slug
   - Validation form

3. **Category Service** (`frontend/src/services/categoryService.js`)
   - API calls đầy đủ
   - Error handling
   - Utility functions
   - Validation helpers

4. **Styling** 
   - `CategoryManagement.css`: Responsive design
   - `CategoryFormModal.css`: Modal styling
   - Modern UI với hover effects
   - Mobile-friendly

5. **Routing**
   - Route `/categories` đã được thêm
   - Navigation sidebar đã có link
   - Phân quyền Admin/Staff

### Database

1. **Migration** (`migrations/step_03_categories_update.sql`)
   - Thêm cột `display_order`, `slug`, `gallery_images`
   - Indexes cho performance
   - Tương thích với dữ liệu hiện có

## Cách sử dụng

### 1. Cài đặt Database

```sql
-- Chạy migration mới để cập nhật schema
source migrations/step_03_categories_update.sql;
```

### 2. Khởi động Backend

```bash
cd backend
mvn spring-boot:run
```

### 3. Khởi động Frontend

```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react
npm start
```

### 4. Truy cập giao diện

1. Đăng nhập với tài khoản Admin
2. Click "Danh mục" trong sidebar
3. Sử dụng các tính năng:
   - **Thêm danh mục**: Click nút "Thêm danh mục mới"
   - **Sửa danh mục**: Click icon Edit trên hàng danh mục
   - **Xóa danh mục**: Click icon Delete và xác nhận
   - **Sắp xếp**: Kéo-thả icon "::" để thay đổi thứ tự
   - **Toggle trạng thái**: Click icon Eye/EyeOff
   - **Tìm kiếm**: Nhập tên danh mục vào ô tìm kiếm

## API Endpoints

### Public Endpoints
- `GET /api/categories/active` - Lấy danh mục đang active
- `GET /api/categories/{id}` - Lấy danh mục theo ID
- `GET /api/categories/slug/{slug}` - Lấy danh mục theo slug

### Admin Endpoints (Cần token)
- `GET /api/categories/admin` - Lấy tất cả danh mục với phân trang
- `GET /api/categories/admin/all` - Lấy tất cả danh mục theo thứ tự
- `GET /api/categories/admin/search` - Tìm kiếm danh mục
- `POST /api/categories/admin` - Tạo danh mục mới
- `PUT /api/categories/admin/{id}` - Cập nhật danh mục
- `DELETE /api/categories/admin/{id}` - Xóa danh mục
- `PUT /api/categories/admin/reorder` - Sắp xếp lại thứ tự
- `PATCH /api/categories/admin/{id}/toggle-status` - Toggle trạng thái
- `GET /api/categories/admin/stats` - Thống kê danh mục

## Tính năng nổi bật

### 1. Drag & Drop Reordering
- Sử dụng thư viện @dnd-kit
- Cập nhật real-time vào database
- Visual feedback khi kéo thả

### 2. Smart Slug Generation
- Tự động sinh slug từ tên tiếng Việt
- Xử lý ký tự đặc biệt và dấu
- Đảm bảo unique trong database

### 3. Image Management
- Upload ảnh đại diện
- Gallery với nhiều ảnh
- Preview trước khi lưu
- Remove individual images

### 4. Advanced Search & Filter
- Tìm kiếm theo tên
- Filter theo trạng thái
- Sorting theo nhiều tiêu chí

### 5. Responsive Design
- Mobile-friendly
- Tablet optimization
- Desktop full-featured

### 6. Error Handling
- Form validation
- API error handling
- User-friendly messages
- Loading states

## Cấu trúc file

```
backend/
├── src/main/java/backend/
│   ├── model/Category.java
│   ├── dto/
│   │   ├── CategoryDto.java
│   │   ├── CategoryCreateRequest.java
│   │   ├── CategoryUpdateRequest.java
│   │   └── CategoryReorderRequest.java
│   ├── repository/CategoryRepository.java
│   ├── service/CategoryService.java
│   └── controller/CategoryController.java

frontend/
├── src/
│   ├── components/
│   │   ├── CategoryManagement.jsx
│   │   └── CategoryFormModal.jsx
│   ├── services/categoryService.js
│   └── styles/components/
│       ├── CategoryManagement.css
│       └── CategoryFormModal.css

migrations/
└── step_03_categories_update.sql
```

## Bảo mật

- API endpoints được bảo vệ bằng JWT
- Phân quyền Admin/Staff cho các tính năng quản lý
- CORS configuration cho frontend
- Input validation và sanitization

## Performance

- Database indexes cho query optimization
- Lazy loading cho images
- Debounced search
- Pagination support
- Efficient drag & drop

## Tương lai mở rộng

1. **File Upload Service**: Tích hợp với cloud storage (AWS S3, Cloudinary)
2. **SEO Optimization**: Meta tags, sitemap generation
3. **Multi-language**: Hỗ trợ đa ngôn ngữ
4. **Analytics**: Tracking usage và performance
5. **Cache**: Redis cache cho API responses
6. **Bulk Operations**: Import/export Excel
7. **Version Control**: Track changes history

## Troubleshooting

### Lỗi thường gặp

1. **Migration fails**: Kiểm tra database connection và permissions
2. **Drag & drop không hoạt động**: Kiểm tra đã cài đặt @dnd-kit chưa
3. **Images không hiển thị**: Kiểm tra CORS và file paths
4. **401 Unauthorized**: Kiểm tra JWT token và phân quyền

### Debug tips

1. Kiểm tra browser console cho frontend errors
2. Kiểm tra backend logs cho API errors
3. Verify database schema với expected structure
4. Test API endpoints với Postman

## Kết luận

Hệ thống quản lý danh mục tour đã được hoàn thiện với đầy đủ tính năng theo yêu cầu:

✅ Giao diện trực quan với bảng danh sách  
✅ Drag & drop để sắp xếp thứ tự  
✅ CRUD operations đầy đủ  
✅ Form modal với upload ảnh  
✅ Tìm kiếm và lọc  
✅ Responsive design  
✅ API backend hoàn chỉnh  
✅ Database migration  
✅ Routing và navigation  

Hệ thống sẵn sàng cho production và có thể mở rộng thêm các tính năng trong tương lai.
