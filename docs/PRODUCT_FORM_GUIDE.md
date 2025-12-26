# Hướng Dẫn Form Tạo Sản Phẩm

## Tổng Quan

Form tạo sản phẩm mới được thiết kế với 2 phần chính:
1. **Thông Tin Chung** - Thông tin cơ bản về sản phẩm
2. **Biến Thể Sản Phẩm** - Các phiên bản khác nhau của sản phẩm với thông số kỹ thuật chi tiết

## Cấu Trúc Form

### 1. Thông Tin Chung

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Tên Sản Phẩm | ✅ | Tên hiển thị của sản phẩm |
| Slug | - | Tự động tạo từ tên (dùng cho URL) |
| Danh Mục | ✅ | Chọn danh mục sản phẩm |
| Mô Tả Ngắn | - | Mô tả ngắn gọn về sản phẩm |
| Mô Tả Chi Tiết | - | Mô tả đầy đủ về sản phẩm |

### 2. Biến Thể Sản Phẩm

Mỗi sản phẩm có thể có nhiều biến thể với các thông số kỹ thuật khác nhau:

#### Thông Tin Bắt Buộc
- **Mã SKU** ✅ - Mã định danh duy nhất (VD: DL-10W-3000K)
- **Giá** ✅ - Giá bán (VNĐ)
- **Số Lượng** ✅ - Số lượng tồn kho

#### Thông Số Kỹ Thuật (Tùy chọn)

| Trường | Ví dụ | Mô tả |
|--------|-------|-------|
| Công Suất (W) | 10W, 15W, 20W | Công suất tiêu thụ |
| Lỗ Khoét (mm) | Ø90mm, Ø100mm | Kích thước lỗ cần khoét để lắp đặt |
| Nguồn Điện | 220V AC, 12V DC | Điện áp đầu vào |
| Nhiệt Độ Màu | 3000K, 4000K, 6500K | Màu sắc ánh sáng (Warm/Natural/Cool) |
| Kích Thước (mm) | Ø100 x H50mm | Kích thước sản phẩm |
| Chip LED | Samsung, Bridgelux, Epistar | Thương hiệu chip LED |
| Quang Thông (Lm) | 900Lm, 1200Lm | Độ sáng |
| Độ Hoàn Màu | CRI>80, CRI>90 | Chỉ số hoàn màu |
| Góc Chiếu | 24°, 36°, 60°, 120° | Góc chiếu sáng |
| Chất Liệu | Nhôm đúc, Nhựa PC | Vật liệu chế tạo |
| Chỉ Số IP | IP20, IP44, IP65 | Khả năng chống bụi/nước |
| Bảo Hành | 2 năm, 3 năm | Thời gian bảo hành |
| Hệ Số PF | >0.9, >0.95 | Power Factor |
| Màu Vỏ | Trắng, Đen, Bạc | Màu sắc vỏ đèn |
| Khối Lượng | 0.5kg, 1.2kg | Trọng lượng |
| Độ Chói | UGR<19, UGR<22 | Chỉ số chống chói |

## Tính Năng

### 1. Quản Lý Biến Thể
- ✅ Thêm nhiều biến thể cho 1 sản phẩm
- ✅ Xóa biến thể (tối thiểu 1 biến thể)
- ✅ Thu gọn/Mở rộng từng biến thể
- ✅ Hiển thị tóm tắt (số biến thể, tổng số lượng, tổng ảnh, giá min/max)

### 2. Auto-Generate Slug
- Tự động tạo slug từ tên sản phẩm
- Loại bỏ dấu tiếng Việt
- Chuyển thành lowercase và thay khoảng trắng bằng dấu gạch ngang

### 3. Validation
- Kiểm tra các trường bắt buộc
- Validate giá phải > 0
- Validate số lượng >= 0
- Hiển thị lỗi chi tiết cho từng trường

### 4. Upload Hình Ảnh Theo Biến Thể
- ✅ Mỗi biến thể có thể upload ảnh riêng
- ✅ Tối đa 5 hình ảnh/biến thể
- ✅ Preview trước khi lưu
- ✅ Drag & drop hỗ trợ
- ✅ Đặt ảnh đại diện cho mỗi biến thể

## API Integration

### Request Format

```json
{
  "name": "Đèn LED Downlight",
  "slug": "den-led-downlight",
  "short_desc": "Đèn LED âm trần tiết kiệm điện",
  "description": "Mô tả chi tiết về sản phẩm...",
  "category_id": "uuid-category",
  "variants": [
    {
      "sku": "DL-10W-3000K",
      "power": "10W",
      "hole_size": "Ø90mm",
      "power_supply": "220V AC",
      "color_temp": "3000K",
      "dimensions": "Ø100 x H50mm",
      "led_chip": "Samsung",
      "luminous_flux": "900Lm",
      "cri": "CRI>80",
      "beam_angle": "60°",
      "material": "Nhôm đúc",
      "ip_rating": "IP20",
      "warranty": "2 năm",
      "power_factor": ">0.9",
      "body_color": "Trắng",
      "weight": "0.5kg",
      "brightness": "UGR<19",
      "price": 250000,
      "stock": 100,
      "images": [
        { "url": "https://...", "preview": "https://..." },
        { "url": "https://...", "preview": "https://..." }
      ]
    },
    {
      "sku": "DL-10W-6500K",
      "power": "10W",
      "color_temp": "6500K",
      "price": 250000,
      "stock": 150,
      "images": [
        { "url": "https://...", "preview": "https://..." }
      ]
    }
  ]
}
```

**Lưu ý:** Mỗi variant có mảng `images` riêng để lưu hình ảnh của biến thể đó.

### API Endpoints

- **POST** `/api/v1/products` - Tạo sản phẩm mới
- **PUT** `/api/v1/products/:id` - Cập nhật sản phẩm
- **GET** `/api/v1/products/:id` - Lấy thông tin sản phẩm
- **DELETE** `/api/v1/products/:id` - Xóa sản phẩm

## Sử Dụng

### 1. Tạo Sản Phẩm Mới

```bash
# Truy cập trang tạo sản phẩm
/admin/products/create
```

### 2. Quy Trình Nhập Liệu

1. **Nhập thông tin chung**
   - Tên sản phẩm (slug tự động tạo)
   - Chọn danh mục
   - Nhập mô tả

2. **Thêm biến thể**
   - Click "Thêm Biến Thể" nếu cần nhiều phiên bản
   - Nhập mã SKU, giá, số lượng (bắt buộc)
   - Nhập các thông số kỹ thuật (tùy chọn)
   - Upload hình ảnh cho từng biến thể (tối đa 5 ảnh/biến thể)

3. **Lưu sản phẩm**
   - Click "Lưu Sản Phẩm"
   - Kiểm tra validation
   - Chờ xác nhận thành công

## Ví Dụ Thực Tế

### Sản Phẩm: Đèn LED Downlight

**Thông tin chung:**
- Tên: Đèn LED Downlight Âm Trần
- Slug: den-led-downlight-am-tran
- Danh mục: Đèn âm trần tán quang
- Mô tả ngắn: Đèn LED tiết kiệm điện, ánh sáng đều

**Biến thể 1:**
- Mã: DL-10W-3000K
- Công suất: 10W
- Nhiệt độ màu: 3000K (Warm White)
- Giá: 250,000đ
- Số lượng: 100

**Biến thể 2:**
- Mã: DL-10W-6500K
- Công suất: 10W
- Nhiệt độ màu: 6500K (Cool White)
- Giá: 250,000đ
- Số lượng: 150

**Biến thể 3:**
- Mã: DL-15W-3000K
- Công suất: 15W
- Nhiệt độ màu: 3000K (Warm White)
- Giá: 320,000đ
- Số lượng: 80

## Tips & Best Practices

### 1. Đặt Tên SKU
- Sử dụng format nhất quán: `[PREFIX]-[POWER]-[COLOR_TEMP]`
- VD: `DL-10W-3000K`, `SP-15W-4000K`
- Dễ nhận biết và quản lý

### 2. Nhập Thông Số
- Luôn ghi rõ đơn vị: `10W`, `Ø90mm`, `3000K`
- Sử dụng ký hiệu chuẩn: `>`, `<`, `±`
- VD: `CRI>80`, `PF>0.9`, `UGR<19`

### 3. Quản Lý Biến Thể
- Nhóm theo đặc điểm chính (công suất, màu sắc)
- Đặt giá hợp lý theo thông số
- Cập nhật số lượng thường xuyên

### 4. Hình Ảnh Biến Thể
- **Quan trọng:** Mỗi biến thể có ảnh riêng
- Sử dụng ảnh chất lượng cao
- Ảnh đầu tiên của mỗi biến thể là ảnh đại diện
- Thêm ảnh chi tiết từ nhiều góc độ
- Ví dụ: 
  - Biến thể màu trắng → Upload ảnh đèn màu trắng
  - Biến thể màu đen → Upload ảnh đèn màu đen
  - Biến thể 10W → Upload ảnh đèn 10W
  - Biến thể 15W → Upload ảnh đèn 15W

## Troubleshooting

### Lỗi Thường Gặp

**1. "Tên sản phẩm là bắt buộc"**
- Nhập tên sản phẩm vào trường "Tên Sản Phẩm"

**2. "Danh mục là bắt buộc"**
- Chọn 1 danh mục từ dropdown

**3. "Mã là bắt buộc"**
- Nhập mã SKU cho từng biến thể

**4. "Giá phải lớn hơn 0"**
- Nhập giá > 0 cho từng biến thể

**5. "Số lượng không hợp lệ"**
- Nhập số lượng >= 0

### API Errors

**Connection Error:**
- Kiểm tra backend đang chạy
- Kiểm tra `.env.local` có đúng API URL

**Validation Error:**
- Kiểm tra format dữ liệu
- Xem console để biết chi tiết lỗi

## Component Files

- `components/admin/ProductFormNew.jsx` - Form component chính
- `app/admin/products/create/page.jsx` - Trang tạo sản phẩm
- `services/api.js` - API service functions
- `components/admin/ImageUploader.jsx` - Upload hình ảnh

## Cập Nhật Tương Lai

- [ ] Rich text editor cho mô tả
- [ ] Bulk import từ Excel/CSV
- [ ] Template cho biến thể phổ biến
- [ ] Preview sản phẩm trước khi lưu
- [ ] Duplicate sản phẩm
- [ ] Version history

