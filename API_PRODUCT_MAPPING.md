# API Product Mapping Guide

## 📋 Tổng Quan

Form tạo sản phẩm đã được cập nhật để map đúng theo API structure của backend.

## 🔄 Mapping Structure

### Request Body Structure

```json
{
  "name": "string",              // Tên sản phẩm
  "slug": "string",              // Auto-generated từ tên
  "short_desc": "string",        // Mô tả ngắn
  "description": "string",       // Mô tả chi tiết
  "stock": number,               // ⭐ Tổng stock = sum(variants.stock)
  "thumbnail_url": "string",     // URL ảnh thumbnail
  "category_id": "uuid",         // UUID danh mục
  "is_active": boolean,          // Mặc định: true
  "variants": [...]              // Mảng các biến thể
}
```

### Variant Structure

```json
{
  "sku": "string",               // Mã SKU (bắt buộc)
  "name": "string",              // Tên biến thể
  "attributes": {                // Object chứa các thuộc tính
    "power": "string",
    "cutout_size": "string",
    "input_voltage": "string",
    "color_temperature": "string",
    "dimensions": "string",
    "led_chip": "string",
    "luminous_flux": "string",
    "cri": "string",
    "beam_angle": "string",
    "material": "string",
    "ip_rating": "string",
    "warranty": "string",
    "power_factor": "string",
    "housing_color": "string",
    "weight": "string",
    "luminance": "string"
  },
  "price": number,               // Giá (bắt buộc)
  "stock": number,               // Số lượng (bắt buộc)
  "is_active": boolean,          // Mặc định: true
  "images": []                   // Mảng ảnh của variant
}
```

## 🗺️ Field Mapping

### Form Field → API Field

| Form Field (UI) | API Field | Location | Type |
|----------------|-----------|----------|------|
| **General Info** |
| Tên Sản Phẩm | `name` | Root | string |
| Slug | `slug` | Root | string |
| Mô Tả Ngắn | `short_desc` | Root | string |
| Mô Tả Chi Tiết | `description` | Root | string |
| Danh Mục | `category_id` | Root | uuid |
| - | `stock` | Root | number (auto-calculated) |
| - | `thumbnail_url` | Root | string (empty for now) |
| - | `is_active` | Root | boolean (true) |
| **Variant Info** |
| Tên Biến Thể | `variants[].name` | Variant | string |
| Mã SKU | `variants[].sku` | Variant | string |
| Công Suất (W) | `variants[].attributes.power` | Attributes | string |
| Lỗ Khoét (mm) | `variants[].attributes.cutout_size` | Attributes | string |
| Nguồn Điện | `variants[].attributes.input_voltage` | Attributes | string |
| Nhiệt Độ Màu | `variants[].attributes.color_temperature` | Attributes | string |
| Kích Thước (mm) | `variants[].attributes.dimensions` | Attributes | string |
| Chip LED | `variants[].attributes.led_chip` | Attributes | string |
| Quang Thông (Lm) | `variants[].attributes.luminous_flux` | Attributes | string |
| Độ Hoàn Màu (CRI) | `variants[].attributes.cri` | Attributes | string |
| Góc Chiếu | `variants[].attributes.beam_angle` | Attributes | string |
| Chất Liệu | `variants[].attributes.material` | Attributes | string |
| Chỉ Số IP | `variants[].attributes.ip_rating` | Attributes | string |
| Bảo Hành | `variants[].attributes.warranty` | Attributes | string |
| Hệ Số PF | `variants[].attributes.power_factor` | Attributes | string |
| Màu Vỏ | `variants[].attributes.housing_color` | Attributes | string |
| Khối Lượng | `variants[].attributes.weight` | Attributes | string |
| Độ Chói | `variants[].attributes.luminance` | Attributes | string |
| Giá (VNĐ) | `variants[].price` | Variant | number |
| Số Lượng | `variants[].stock` | Variant | number |
| - | `variants[].is_active` | Variant | boolean (true) |
| Hình Ảnh | `variants[].images` | Variant | array |

## 📊 Auto-Calculated Fields

### 1. Product Stock
```javascript
// Tổng stock = tổng stock của tất cả variants
const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
```

**Ví dụ:**
- Variant 1: stock = 10
- Variant 2: stock = 5
- **Product stock = 15**

### 2. Slug
```javascript
// Tự động tạo từ tên sản phẩm
const slug = name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
```

**Ví dụ:**
- Input: "Đèn LED Âm Trần Diamond Mặt Sâu"
- Output: "den-led-am-tran-diamond-mat-sau"

## 🔐 Authentication

### Authorization Header
```javascript
// Token lấy từ localStorage
const token = localStorage.getItem('auth_token')

headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

## 📝 Example Request

### Full Request Example

```bash
curl --location 'http://localhost:8080/api/v1/products' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Đèn led âm trần Diamond mặt Sâu",
  "slug": "den-led-am-tran-diamond-mat-sau",
  "short_desc": "Giải pháp chiếu sáng sang trọng, giảm chói lóa",
  "description": "Đèn LED âm trần Diamond Sâu...",
  "stock": 15,
  "thumbnail_url": "",
  "category_id": "3719d15a-3478-4300-95ea-1cfb4d24a203",
  "is_active": true,
  "variants": [
    {
      "sku": "DDLS-10SS-T105-DM",
      "name": "Ánh sáng đổi màu",
      "attributes": {
        "power": "10",
        "cutout_size": "Ø90",
        "input_voltage": "220VAC",
        "color_temperature": "6500K/3000K/4000K",
        "dimensions": "105*63",
        "led_chip": "Samsung 2835",
        "luminous_flux": "950-880-970 T-V-TT",
        "cri": "≥ 90",
        "beam_angle": "120",
        "material": "mặt nhôm - đế nhôm",
        "ip_rating": "44",
        "warranty": "24 tháng đổi mới",
        "power_factor": "0.5",
        "housing_color": "mặt trắng - đế đen sần",
        "weight": "0.23",
        "luminance": "<19"
      },
      "price": 310000,
      "stock": 10,
      "is_active": true
    },
    {
      "sku": "DDLS-10SS-T105-T",
      "name": "Ánh sáng trắng",
      "attributes": {
        "power": "10",
        "cutout_size": "Ø90",
        "input_voltage": "220VAC",
        "color_temperature": "6500K/3000K/4000K",
        "dimensions": "105*63",
        "led_chip": "Samsung 2835",
        "luminous_flux": "971",
        "cri": "≥ 90",
        "beam_angle": "120",
        "material": "mặt nhôm - đế nhôm",
        "ip_rating": "44",
        "warranty": "24 tháng đổi mới",
        "power_factor": "0.5",
        "housing_color": "mặt trắng - đế đen sần",
        "weight": "0.23",
        "luminance": "<19"
      },
      "price": 280000,
      "stock": 5,
      "is_active": true
    }
  ]
}'
```

## ✅ Validation Rules

### Required Fields

**Product Level:**
- ✅ `name` - Tên sản phẩm
- ✅ `category_id` - Danh mục

**Variant Level:**
- ✅ `sku` - Mã SKU
- ✅ `price` - Giá (> 0)
- ✅ `stock` - Số lượng (>= 0)

### Optional Fields

**Product Level:**
- `short_desc` - Mô tả ngắn
- `description` - Mô tả chi tiết
- `thumbnail_url` - URL ảnh

**Variant Level:**
- `name` - Tên biến thể
- All `attributes` fields - Các thuộc tính kỹ thuật
- `images` - Mảng ảnh

## 🔧 Code Implementation

### Submit Handler

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Tính tổng stock
  const totalStock = variants.reduce((sum, v) => 
    sum + (parseInt(v.stock) || 0), 0
  )
  
  // Map data theo API structure
  const submitData = {
    name: generalInfo.name,
    slug: generalInfo.slug,
    short_desc: generalInfo.short_desc || '',
    description: generalInfo.description || '',
    stock: totalStock, // ⭐ Auto-calculated
    thumbnail_url: '',
    category_id: generalInfo.category_id,
    is_active: true,
    variants: variants.map(v => ({
      sku: v.sku,
      name: v.variant_name || '',
      attributes: {
        power: v.power || '',
        cutout_size: v.hole_size || '',
        input_voltage: v.power_supply || '',
        color_temperature: v.color_temp || '',
        dimensions: v.dimensions || '',
        led_chip: v.led_chip || '',
        luminous_flux: v.luminous_flux || '',
        cri: v.cri || '',
        beam_angle: v.beam_angle || '',
        material: v.material || '',
        ip_rating: v.ip_rating || '',
        warranty: v.warranty || '',
        power_factor: v.power_factor || '',
        housing_color: v.body_color || '',
        weight: v.weight || '',
        luminance: v.brightness || '',
      },
      price: parseFloat(v.price) || 0,
      stock: parseInt(v.stock) || 0,
      is_active: true,
      images: v.images || [],
    })),
  }
  
  // Call API
  await createProduct(submitData)
}
```

## 🚀 Testing

### Test Case 1: Basic Product

```javascript
{
  name: "Test Product",
  slug: "test-product",
  category_id: "uuid-here",
  variants: [
    {
      sku: "TEST-001",
      price: 100000,
      stock: 10
    }
  ]
}
// Expected: product.stock = 10
```

### Test Case 2: Multiple Variants

```javascript
{
  name: "Test Product",
  variants: [
    { sku: "V1", stock: 10 },
    { sku: "V2", stock: 5 },
    { sku: "V3", stock: 15 }
  ]
}
// Expected: product.stock = 30
```

## 📞 Error Handling

### Common Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
→ Check token in localStorage

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {...}
}
```
→ Check required fields

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
→ Check backend logs

## 📋 Checklist

### Before Submit
- [ ] Tên sản phẩm đã nhập
- [ ] Danh mục đã chọn
- [ ] Ít nhất 1 variant
- [ ] Mỗi variant có SKU, giá, số lượng
- [ ] Token đã lưu trong localStorage

### After Submit
- [ ] Response success = true
- [ ] Product được tạo với đúng stock
- [ ] Variants được tạo với đúng attributes
- [ ] Redirect về trang danh sách

---

**Updated:** December 24, 2025
**Version:** 1.0.0
**Status:** ✅ Implemented & Ready

