# API Integration Guide

## Cấu hình Backend API

### 1. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Khởi động Backend

Đảm bảo backend API đang chạy tại `http://localhost:8080`

### 3. Các API đã tích hợp

#### Categories API
- **Endpoint**: `GET /api/v1/categories`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "category_id": "uuid",
      "name": "Tên danh mục",
      "slug": "slug",
      "description": "Mô tả",
      "is_active": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### 4. Cách sử dụng

Danh mục sẽ tự động được load từ API khi trang chủ được render. Người dùng có thể:
- Xem danh sách danh mục trong sidebar (desktop)
- Xem danh sách danh mục trong drawer (mobile)
- Click vào danh mục để lọc sản phẩm

### 5. Service Functions

File `services/api.js` cung cấp các hàm:

- `fetchCategories()`: Lấy danh sách danh mục
- `fetchProducts(filters)`: Lấy danh sách sản phẩm với bộ lọc (sẵn sàng để tích hợp)

### 6. Xử lý lỗi

Nếu API không khả dụng:
- Categories sẽ hiển thị "Đang tải danh mục..."
- Không có lỗi crash, app vẫn hoạt động bình thường

### 7. Testing

Để test API integration:

1. Khởi động backend:
```bash
# Backend phải chạy tại http://localhost:8080
```

2. Khởi động frontend:
```bash
npm run dev
```

3. Mở browser tại `http://localhost:3000`

4. Kiểm tra:
   - Danh mục hiển thị trong sidebar
   - Click vào danh mục để chọn
   - Console không có lỗi API

### 8. Môi trường Production

Khi deploy production, cập nhật `.env.local` hoặc `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

