# 🗄️ HƯỚNG DẪN IMPORT DATABASE

## 🚀 CÁCH 1: TỰ ĐỘNG (KHUYÊN DÙNG)

### Windows:
```bash
# Chạy script tự động
double-click import_database.bat

# Hoặc từ command line:
cd D:\DoAn
import_database.bat
```

### Linux/Mac:
```bash
# Phân quyền execute cho script
chmod +x import_database.sh

# Chạy script
./import_database.sh
```

### Từ Command Line trực tiếp:
```bash
# Windows/Linux/Mac
mysql -u root -p < csdl.sql
```

## 🖥️ CÁCH 2: SỬ DỤNG MYSQL WORKBENCH (THỦ CÔNG)

### Bước 1: Mở MySQL Workbench
1. Khởi động MySQL Workbench
2. Kết nối đến MySQL server (Local instance)

### Bước 2: Import Database
1. **Menu**: `Server` → `Data Import`
2. **Import Options**: Chọn `Import from Self-Contained File`
3. **File Path**: Browse và chọn file `D:\DoAn\csdl.sql`
4. **Default Target Schema**: 
   - Chọn `New...` 
   - Nhập tên: `doan`
5. Click `Start Import`

### Bước 3: Kiểm tra
1. Refresh schema list (F5)
2. Mở database `doan`
3. Kiểm tra table `users` đã được tạo
4. Xem dữ liệu: `SELECT * FROM users;`

## 🔧 CÁCH 3: TỪ MYSQL WORKBENCH QUERY EDITOR

### Bước 1: Mở Query Editor
1. Kết nối MySQL Workbench
2. Mở SQL Editor mới

### Bước 2: Load và Execute SQL
1. **Menu**: `File` → `Open SQL Script`
2. Chọn file `D:\DoAn\csdl.sql`
3. Click `Execute` (Lightning icon) hoặc `Ctrl+Shift+Enter`

### Bước 3: Kiểm tra kết quả
- Xem Output panel để kiểm tra lỗi
- Refresh Navigator để thấy database mới

## 🛠️ CÁCH 4: SỬ DỤNG MYSQLDUMP (RESTORE)

```bash
# Nếu bạn có backup file .sql từ mysqldump
mysql -u root -p doan < csdl.sql

# Hoặc tạo database trước rồi import
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS doan;"
mysql -u root -p doan < csdl.sql
```

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "Access denied for user 'root'"
```bash
# Kiểm tra password MySQL root
mysql -u root -p
# Nhập đúng password

# Hoặc reset password MySQL nếu quên
# Windows: Dùng MySQL Installer
# Linux: sudo mysql_secure_installation
```

### Lỗi 2: "MySQL service not running"
```bash
# Windows
net start mysql80

# Linux
sudo systemctl start mysql
# hoặc
sudo service mysql start

# Mac
brew services start mysql
```

### Lỗi 3: "Database exists"
```sql
-- Xóa database cũ nếu cần
DROP DATABASE IF EXISTS doan;
-- Rồi chạy lại import
```

### Lỗi 4: "File not found"
```bash
# Kiểm tra đường dẫn file
cd D:\DoAn
dir csdl.sql

# Hoặc dùng đường dẫn đầy đủ
mysql -u root -p < "D:\DoAn\csdl.sql"
```

## ✅ KIỂM TRA SAU KHI IMPORT

### 1. Kiểm tra Database:
```sql
SHOW DATABASES;
USE doan;
SHOW TABLES;
```

### 2. Kiểm tra Data:
```sql
SELECT * FROM users;
SELECT COUNT(*) FROM users;
SELECT role, COUNT(*) FROM users GROUP BY role;
```

### 3. Test Login Data:
- **Admin**: username=`admin`, password=`admin123`
- **Customer**: username=`customer1`, password=`customer123` 
- **User**: username=`user1`, password=`user123`

## 🔄 AUTO SCRIPT DETAILS

Script `import_database.bat` sẽ:
1. ✅ Kiểm tra MySQL service đang chạy
2. ✅ Import file `csdl.sql`
3. ✅ Hiển thị kết quả và thông tin test accounts
4. ✅ Xử lý lỗi cơ bản

## 📝 GHI CHÚ

- **Database name**: `doan`
- **Table**: `users` với 3 sample records
- **Passwords**: Đã hash bằng BCrypt
- **Charset**: UTF-8 support cho tiếng Việt
- **Engine**: InnoDB với foreign key support

---
**🎯 KHUYẾN NGHỊ**: Dùng script `import_database.bat` để import nhanh và tự động!
