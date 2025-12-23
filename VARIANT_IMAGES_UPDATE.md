# Cập Nhật: Upload Ảnh Theo Biến Thể

## 🎯 Thay Đổi Chính

Đã chuyển từ **upload ảnh chung cho sản phẩm** sang **upload ảnh riêng cho từng biến thể**.

## ❓ Tại Sao Thay Đổi?

### Trước đây (Không hợp lý)
```
Sản phẩm: Đèn LED Downlight
├── Ảnh chung (10 ảnh)
└── Variants:
    ├── Biến thể 1: 10W - Trắng
    ├── Biến thể 2: 10W - Đen
    └── Biến thể 3: 15W - Trắng
```

**Vấn đề:** Làm sao phân biệt ảnh nào của biến thể nào?

### Bây giờ (Hợp lý)
```
Sản phẩm: Đèn LED Downlight
└── Variants:
    ├── Biến thể 1: 10W - Trắng
    │   └── Ảnh: [anh1.jpg, anh2.jpg, anh3.jpg]
    ├── Biến thể 2: 10W - Đen
    │   └── Ảnh: [anh4.jpg, anh5.jpg]
    └── Biến thể 3: 15W - Trắng
        └── Ảnh: [anh6.jpg, anh7.jpg, anh8.jpg]
```

**Lợi ích:** Mỗi biến thể có ảnh riêng, rõ ràng!

## 📊 So Sánh

| Tính năng | Cũ | Mới |
|-----------|-----|-----|
| Upload ảnh | Chung cho sản phẩm | Riêng cho từng biến thể |
| Số ảnh tối đa | 10 ảnh/sản phẩm | 5 ảnh/biến thể |
| Vị trí upload | Sidebar (bên phải) | Trong mỗi biến thể |
| Phù hợp với | Sản phẩm 1 màu | Sản phẩm nhiều màu/kích thước |

## 🔄 Thay Đổi Kỹ Thuật

### 1. State Structure

**Trước:**
```javascript
const [images, setImages] = useState([])
const [variants, setVariants] = useState([
  { sku: '', price: '', stock: '' }
])
```

**Sau:**
```javascript
// Không còn state images chung
const [variants, setVariants] = useState([
  { 
    sku: '', 
    price: '', 
    stock: '',
    images: [] // Mỗi variant có images riêng
  }
])
```

### 2. Component Structure

**Trước:**
```jsx
<Sidebar>
  <ImageUploader 
    images={images} 
    onChange={setImages} 
    maxImages={10} 
  />
</Sidebar>
```

**Sau:**
```jsx
<VariantForm>
  {variants.map((variant, index) => (
    <div key={index}>
      {/* Các trường khác */}
      
      <ImageUploader 
        images={variant.images} 
        onChange={(imgs) => handleVariantImagesChange(index, imgs)}
        maxImages={5}
      />
    </div>
  ))}
</VariantForm>
```

### 3. API Request

**Trước:**
```json
{
  "name": "Đèn LED",
  "variants": [...],
  "images": [...]  // Ảnh chung
}
```

**Sau:**
```json
{
  "name": "Đèn LED",
  "variants": [
    {
      "sku": "DL-10W-W",
      "images": [...]  // Ảnh riêng của variant này
    },
    {
      "sku": "DL-10W-B",
      "images": [...]  // Ảnh riêng của variant này
    }
  ]
}
```

## 📁 Files Đã Thay Đổi

### 1. `components/admin/ProductFormNew.jsx`

#### Thêm mới:
```javascript
// Handler cho variant images
const handleVariantImagesChange = (index, images) => {
  setVariants(prev => {
    const updated = [...prev]
    updated[index] = { ...updated[index], images: images }
    return updated
  })
}
```

#### Xóa:
```javascript
// Không còn state images chung
- const [images, setImages] = useState([])
```

#### Cập nhật:
```javascript
// Thêm images vào mỗi variant
const [variants, setVariants] = useState([
  {
    ...otherFields,
+   images: []
  }
])
```

### 2. UI Changes

#### Xóa:
```jsx
{/* Sidebar - Product Images */}
- <div className="bg-white p-6 rounded-lg shadow">
-   <h2>Hình Ảnh</h2>
-   <ImageUploader images={images} onChange={setImages} maxImages={10} />
- </div>
```

#### Thêm:
```jsx
{/* Trong mỗi variant */}
<div className="pt-4 border-t border-gray-200">
  <label>Hình Ảnh Biến Thể</label>
  <ImageUploader
    images={variant.images || []}
    onChange={(images) => handleVariantImagesChange(index, images)}
    maxImages={5}
  />
  <p className="text-xs text-gray-500">
    Tối đa 5 hình ảnh cho biến thể này
  </p>
</div>
```

### 3. Summary Section

#### Thêm:
```jsx
<div className="flex justify-between">
  <span>Tổng hình ảnh:</span>
  <span>
    {variants.reduce((sum, v) => sum + ((v.images?.length) || 0), 0)}
  </span>
</div>
```

## 🎨 UI/UX Improvements

### 1. Trải Nghiệm Upload
- ✅ Upload ảnh ngay trong context của biến thể
- ✅ Không cần scroll lên/xuống giữa variant và sidebar
- ✅ Rõ ràng ảnh nào thuộc variant nào

### 2. Visual Feedback
- ✅ Mỗi variant hiển thị số ảnh đã upload
- ✅ Tóm tắt hiển thị tổng số ảnh của tất cả variants
- ✅ Preview ảnh ngay trong variant

### 3. Workflow
```
1. Mở rộng biến thể
2. Nhập thông tin (SKU, giá, thông số...)
3. Upload ảnh cho biến thể này
4. Thu gọn, chuyển sang biến thể khác
5. Lặp lại bước 1-4
```

## 📝 Use Cases

### Case 1: Sản Phẩm Nhiều Màu Sắc
```
Đèn LED Spotlight 10W

Variant 1: Màu Trắng
├── SKU: SP-10W-W
├── Màu vỏ: Trắng
└── Ảnh: [den-trang-1.jpg, den-trang-2.jpg, den-trang-3.jpg]

Variant 2: Màu Đen
├── SKU: SP-10W-B
├── Màu vỏ: Đen
└── Ảnh: [den-den-1.jpg, den-den-2.jpg, den-den-3.jpg]

Variant 3: Màu Bạc
├── SKU: SP-10W-S
├── Màu vỏ: Bạc
└── Ảnh: [den-bac-1.jpg, den-bac-2.jpg]
```

### Case 2: Sản Phẩm Nhiều Công Suất
```
Đèn LED Downlight

Variant 1: 7W
├── SKU: DL-7W
├── Công suất: 7W
├── Kích thước: Ø90mm
└── Ảnh: [7w-1.jpg, 7w-2.jpg]

Variant 2: 10W
├── SKU: DL-10W
├── Công suất: 10W
├── Kích thước: Ø100mm
└── Ảnh: [10w-1.jpg, 10w-2.jpg, 10w-3.jpg]

Variant 3: 15W
├── SKU: DL-15W
├── Công suất: 15W
├── Kích thước: Ø120mm
└── Ảnh: [15w-1.jpg, 15w-2.jpg]
```

### Case 3: Sản Phẩm Nhiều Nhiệt Độ Màu
```
Đèn LED Panel 40W

Variant 1: 3000K (Warm White)
├── SKU: PL-40W-3000K
├── Nhiệt độ màu: 3000K
└── Ảnh: [warm-1.jpg, warm-2.jpg]

Variant 2: 4000K (Natural White)
├── SKU: PL-40W-4000K
├── Nhiệt độ màu: 4000K
└── Ảnh: [natural-1.jpg, natural-2.jpg]

Variant 3: 6500K (Cool White)
├── SKU: PL-40W-6500K
├── Nhiệt độ màu: 6500K
└── Ảnh: [cool-1.jpg, cool-2.jpg]
```

## ✅ Validation & Rules

### Upload Rules
- ✅ Tối đa 5 ảnh/variant
- ✅ Format: JPG, PNG, WebP
- ✅ Size: Max 5MB/ảnh
- ✅ Ảnh đầu tiên = Ảnh đại diện

### Business Rules
- ⚠️ Variant có thể không có ảnh (optional)
- ✅ Nên có ít nhất 1 ảnh/variant
- ✅ Ảnh đại diện nên rõ nét, chất lượng cao

## 🔧 Backend Requirements

### Database Schema
```sql
-- Bảng product_variants
CREATE TABLE product_variants (
  variant_id UUID PRIMARY KEY,
  product_id UUID,
  sku VARCHAR(100),
  price DECIMAL,
  stock INT,
  -- ... các trường khác
);

-- Bảng variant_images (mới)
CREATE TABLE variant_images (
  image_id UUID PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(variant_id),
  url VARCHAR(500),
  display_order INT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

### API Endpoint
```
POST /api/v1/products
Body: {
  "name": "...",
  "variants": [
    {
      "sku": "...",
      "images": [
        { "url": "...", "is_main": true },
        { "url": "..." }
      ]
    }
  ]
}
```

## 🚀 Migration Guide

### Nếu Đã Có Dữ Liệu Cũ

```javascript
// Script migrate dữ liệu
async function migrateProductImages() {
  const products = await getOldProducts()
  
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      // Nếu chỉ có 1 variant, gán tất cả ảnh cho variant đó
      if (product.variants.length === 1) {
        product.variants[0].images = product.images
      } 
      // Nếu nhiều variants, chia đều ảnh hoặc để trống
      else {
        // Option 1: Gán ảnh đầu tiên cho tất cả variants
        product.variants.forEach(v => {
          v.images = [product.images[0]]
        })
        
        // Option 2: Để trống, yêu cầu admin upload lại
        product.variants.forEach(v => {
          v.images = []
        })
      }
    }
    
    await updateProduct(product)
  }
}
```

## 📈 Benefits

### 1. Cho Admin
- ✅ Dễ quản lý ảnh của từng biến thể
- ✅ Không bị nhầm lẫn ảnh
- ✅ Upload ảnh ngay tại chỗ

### 2. Cho Khách Hàng
- ✅ Xem đúng ảnh của biến thể đang chọn
- ✅ Không bị hiển thị nhầm ảnh
- ✅ Trải nghiệm mua hàng tốt hơn

### 3. Cho Developer
- ✅ Data structure rõ ràng
- ✅ Dễ maintain
- ✅ Dễ extend

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Không có bulk upload** - Phải upload từng variant
2. **Không copy ảnh giữa variants** - Phải upload lại
3. **Không có image library** - Không reuse ảnh đã upload

### Planned Features
- [ ] Bulk upload cho tất cả variants
- [ ] Copy ảnh từ variant này sang variant khác
- [ ] Image library để reuse
- [ ] Auto-suggest ảnh dựa trên SKU pattern

## 📞 Support

### FAQs

**Q: Tôi có thể không upload ảnh cho variant nào đó không?**
A: Có, ảnh là optional. Nhưng nên có ít nhất 1 ảnh để khách hàng xem.

**Q: Làm sao để copy ảnh từ variant này sang variant khác?**
A: Hiện tại phải download và upload lại. Feature "Copy images" sẽ có trong version sau.

**Q: Tối đa bao nhiêu ảnh cho 1 variant?**
A: 5 ảnh/variant. Nếu cần nhiều hơn, liên hệ admin để tăng limit.

**Q: Ảnh nào sẽ hiển thị trên trang sản phẩm?**
A: Ảnh đầu tiên (có dấu sao vàng) của variant đang được chọn.

---

**Updated:** December 23, 2025
**Version:** 1.1.0
**Status:** ✅ Implemented & Tested

