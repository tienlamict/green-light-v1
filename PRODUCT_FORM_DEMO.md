# Demo Form Tạo Sản Phẩm

## Giao Diện Form

### Layout Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│  Tạo Sản Phẩm Mới                                               │
│  Thêm sản phẩm mới vào cửa hàng của bạn                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│  THÔNG TIN CHUNG             │  HÌNH ẢNH                        │
│  ════════════════             │  ═══════                         │
│                              │  [Upload Images]                 │
│  Tên Sản Phẩm *              │  [Preview 1] [Preview 2]         │
│  ┌─────────────────────────┐ │                                  │
│  │ Đèn LED Downlight       │ │  THAO TÁC                        │
│  └─────────────────────────┘ │  ═══════                         │
│                              │  ┌──────────────────────────┐    │
│  Slug (URL)                  │  │  💾 Lưu Sản Phẩm         │    │
│  ┌─────────────────────────┐ │  └──────────────────────────┘    │
│  │ den-led-downlight       │ │  ┌──────────────────────────┐    │
│  └─────────────────────────┘ │  │  ✖  Hủy                  │    │
│                              │  └──────────────────────────┘    │
│  Danh Mục *                  │                                  │
│  ┌─────────────────────────┐ │  TÓM TẮT                         │
│  │ Đèn âm trần tán quang ▼ │ │  ═══════                         │
│  └─────────────────────────┘ │  Số biến thể:        3           │
│                              │  Tổng số lượng:    330           │
│  Mô Tả Ngắn                  │  Giá thấp nhất:  250,000đ        │
│  ┌─────────────────────────┐ │  Giá cao nhất:   320,000đ        │
│  │ Đèn LED tiết kiệm điện  │ │                                  │
│  └─────────────────────────┘ │                                  │
│                              │                                  │
│  Mô Tả Chi Tiết              │                                  │
│  ┌─────────────────────────┐ │                                  │
│  │ Đèn LED âm trần chất    │ │                                  │
│  │ lượng cao...            │ │                                  │
│  │                         │ │                                  │
│  └─────────────────────────┘ │                                  │
│                              │                                  │
├──────────────────────────────┴──────────────────────────────────┤
│  BIẾN THỂ SẢN PHẨM                              [+ Thêm Biến Thể]│
│  ═══════════════════                                             │
│                                                                  │
│  ┌─ Biến Thể #1 - DL-10W-3000K ────────────────────── [🗑] ─┐  │
│  │  ▼                                                          │  │
│  │  Mã SKU *              Công Suất (W)                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐               │  │
│  │  │ DL-10W-3000K     │  │ 10W              │               │  │
│  │  └──────────────────┘  └──────────────────┘               │  │
│  │                                                            │  │
│  │  Lỗ Khoét (mm)         Nguồn Điện                         │  │
│  │  ┌──────────────────┐  ┌──────────────────┐               │  │
│  │  │ Ø90mm            │  │ 220V AC          │               │  │
│  │  └──────────────────┘  └──────────────────┘               │  │
│  │                                                            │  │
│  │  Nhiệt Độ Màu          Kích Thước (mm)                    │  │
│  │  ┌──────────────────┐  ┌──────────────────┐               │  │
│  │  │ 3000K            │  │ Ø100 x H50mm     │               │  │
│  │  └──────────────────┘  └──────────────────┘               │  │
│  │                                                            │  │
│  │  ... (các trường khác)                                     │  │
│  │                                                            │  │
│  │  Giá (VNĐ) *           Số Lượng *                         │  │
│  │  ┌──────────────────┐  ┌──────────────────┐               │  │
│  │  │ 250000           │  │ 100              │               │  │
│  │  └──────────────────┘  └──────────────────┘               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Biến Thể #2 - DL-10W-6500K ────────────────────── [🗑] ─┐  │
│  │  ▶ (Thu gọn)                                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Biến Thể #3 - DL-15W-3000K ────────────────────── [🗑] ─┐  │
│  │  ▶ (Thu gọn)                                               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Ví Dụ Dữ Liệu Nhập

### Sản Phẩm: Đèn LED Spotlight Âm Trần

#### Thông Tin Chung
```
Tên Sản Phẩm:    Đèn LED Spotlight Âm Trần 10W
Slug:            den-led-spotlight-am-tran-10w
Danh Mục:        Đèn spotlight âm trần
Mô Tả Ngắn:      Đèn LED chiếu rọi âm trần, tiết kiệm điện, ánh sáng tập trung
Mô Tả Chi Tiết:  Đèn LED spotlight âm trần là giải pháp chiếu sáng hiện đại,
                 được thiết kế để tạo điểm nhấn ánh sáng cho không gian nội thất.
                 Sản phẩm sử dụng chip LED chất lượng cao, tiết kiệm điện lên đến 80%
                 so với đèn halogen truyền thống.
```

#### Biến Thể 1: 10W - 3000K - Trắng
```
Mã SKU:          SP-10W-3000K-W
Công Suất:       10W
Lỗ Khoét:        Ø90mm
Nguồn Điện:      220V AC
Nhiệt Độ Màu:    3000K (Warm White)
Kích Thước:      Ø100 x H60mm
Chip LED:        Samsung LM301B
Quang Thông:     900Lm
Độ Hoàn Màu:     CRI>90
Góc Chiếu:       24°
Chất Liệu:       Nhôm đúc cao cấp
Chỉ Số IP:       IP20
Bảo Hành:        3 năm
Hệ Số PF:        >0.95
Màu Vỏ:          Trắng
Khối Lượng:      0.45kg
Độ Chói:         UGR<19
Giá:             385,000đ
Số Lượng:        150
```

#### Biến Thể 2: 10W - 4000K - Trắng
```
Mã SKU:          SP-10W-4000K-W
Công Suất:       10W
Lỗ Khoét:        Ø90mm
Nguồn Điện:      220V AC
Nhiệt Độ Màu:    4000K (Natural White)
Kích Thước:      Ø100 x H60mm
Chip LED:        Samsung LM301B
Quang Thông:     950Lm
Độ Hoàn Màu:     CRI>90
Góc Chiếu:       24°
Chất Liệu:       Nhôm đúc cao cấp
Chỉ Số IP:       IP20
Bảo Hành:        3 năm
Hệ Số PF:        >0.95
Màu Vỏ:          Trắng
Khối Lượng:      0.45kg
Độ Chói:         UGR<19
Giá:             385,000đ
Số Lượng:        200
```

#### Biến Thể 3: 15W - 3000K - Đen
```
Mã SKU:          SP-15W-3000K-B
Công Suất:       15W
Lỗ Khoét:        Ø110mm
Nguồn Điện:      220V AC
Nhiệt Độ Màu:    3000K (Warm White)
Kích Thước:      Ø120 x H70mm
Chip LED:        Samsung LM301B
Quang Thông:     1350Lm
Độ Hoàn Màu:     CRI>90
Góc Chiếu:       36°
Chất Liệu:       Nhôm đúc cao cấp
Chỉ Số IP:       IP20
Bảo Hành:        3 năm
Hệ Số PF:        >0.95
Màu Vỏ:          Đen
Khối Lượng:      0.65kg
Độ Chói:         UGR<19
Giá:             485,000đ
Số Lượng:        120
```

## Flow Sử Dụng

### 1. Truy Cập Form
```
Admin Dashboard → Products → Create New Product
URL: /admin/products/create
```

### 2. Nhập Thông Tin Chung
- Nhập tên sản phẩm → Slug tự động tạo
- Chọn danh mục từ dropdown
- Nhập mô tả ngắn và chi tiết

### 3. Thêm Biến Thể
- Form mặc định có 1 biến thể
- Click "Thêm Biến Thể" để thêm nhiều hơn
- Mỗi biến thể có thể thu gọn/mở rộng

### 4. Nhập Thông Tin Biến Thể
- **Bắt buộc:** Mã SKU, Giá, Số lượng
- **Tùy chọn:** Các thông số kỹ thuật khác
- Có thể bỏ trống các trường không cần thiết

### 5. Upload Hình Ảnh
- Kéo thả hoặc click để chọn file
- Hỗ trợ: JPG, PNG, WebP
- Tối đa 10 hình ảnh

### 6. Kiểm Tra & Lưu
- Xem tóm tắt ở sidebar bên phải
- Click "Lưu Sản Phẩm"
- Đợi xác nhận thành công

## Validation Messages

### Thông Tin Chung
```
❌ Tên sản phẩm là bắt buộc
❌ Danh mục là bắt buộc
```

### Biến Thể
```
❌ Mã là bắt buộc (Biến thể #1)
❌ Giá phải lớn hơn 0 (Biến thể #2)
❌ Số lượng không hợp lệ (Biến thể #3)
```

## Success Message
```
✅ Tạo sản phẩm thành công!
→ Redirect to /admin/products
```

## Error Handling

### Network Error
```
❌ Lỗi kết nối. Vui lòng kiểm tra:
   - Backend đang chạy?
   - API URL đúng chưa?
   - Internet connection?
```

### Validation Error
```
❌ Vui lòng kiểm tra lại thông tin
   - Xem các trường có lỗi (màu đỏ)
   - Đọc message lỗi bên dưới mỗi trường
```

### Server Error
```
❌ Lỗi server: [Error message from backend]
   - Kiểm tra console để biết chi tiết
   - Liên hệ admin nếu vấn đề tiếp diễn
```

## Keyboard Shortcuts

```
Ctrl/Cmd + S     : Lưu form (nếu valid)
Ctrl/Cmd + Enter : Lưu form (nếu valid)
Esc              : Hủy và quay lại danh sách
```

## Mobile Responsive

### Tablet (768px - 1024px)
- Layout 2 cột → 1 cột
- Sidebar xuống dưới
- Form fields full width

### Mobile (< 768px)
- Single column layout
- Sticky action buttons ở bottom
- Collapsible sections mặc định
- Touch-friendly buttons

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
❌ IE 11 (Not supported)

## Performance

- Form load: < 1s
- Auto-save draft: Every 30s (future feature)
- Image upload: Max 5MB per image
- Total payload: < 10MB

## Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Error announcements

## Testing Checklist

### Functional Testing
- [ ] Tạo sản phẩm với 1 biến thể
- [ ] Tạo sản phẩm với nhiều biến thể
- [ ] Thêm/xóa biến thể
- [ ] Thu gọn/mở rộng biến thể
- [ ] Upload hình ảnh
- [ ] Auto-generate slug
- [ ] Validation các trường bắt buộc
- [ ] Submit form thành công
- [ ] Cancel và quay lại

### Edge Cases
- [ ] Tên sản phẩm có ký tự đặc biệt
- [ ] Tên sản phẩm tiếng Việt có dấu
- [ ] Giá = 0
- [ ] Số lượng âm
- [ ] Upload file không phải ảnh
- [ ] Upload file > 5MB
- [ ] Mất kết nối khi submit
- [ ] Xóa biến thể cuối cùng (không cho phép)

## Known Issues

1. **Slug không update khi edit tên**
   - Workaround: Slug chỉ auto-generate lần đầu
   - Fix: Thêm button "Regenerate Slug"

2. **Image preview bị lỗi với file lớn**
   - Workaround: Resize ảnh trước khi upload
   - Fix: Implement client-side image compression

3. **Form không save draft**
   - Workaround: Copy data trước khi refresh
   - Fix: Implement auto-save to localStorage

## Future Enhancements

- [ ] Duplicate product
- [ ] Bulk create variants
- [ ] Import from Excel/CSV
- [ ] Rich text editor for description
- [ ] Image editing (crop, rotate)
- [ ] Variant templates
- [ ] Price calculator
- [ ] Stock alerts
- [ ] Multi-language support
- [ ] Version history

