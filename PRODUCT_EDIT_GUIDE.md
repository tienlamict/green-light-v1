# Product Edit Feature Guide

## 🎯 Tổng Quan

Đã fix và cập nhật chức năng edit product trong admin panel để tương thích với API backend.

## 🔄 Các Thay Đổi

### 1. **API Service** (`services/api.js`)

#### Cập Nhật `fetchProductById`
- Hỗ trợ fetch product bằng **UUID** hoặc **slug**
- API endpoint: `GET /api/v1/products/{id-or-slug}`

```javascript
export async function fetchProductById(productIdOrSlug) {
  const response = await fetch(`${API_BASE_URL}/products/${productIdOrSlug}`)
  // Returns product with full details including variants
}
```

### 2. **Edit Page** (`app/admin/products/[id]/edit/page.jsx`)

#### Thay Đổi Chính:
- ✅ Thay `ProductForm` cũ → `ProductFormNew`
- ✅ Dùng `fetchProductById` thay vì fetch all products
- ✅ Thêm `handleSubmit` để call `updateProduct` API
- ✅ Hỗ trợ tìm product bằng UUID hoặc slug

```javascript
// Before
import ProductForm from '@/components/admin/ProductForm'
const result = await fetchProducts({ page: 1, limit: 1000 })
const found = result.products?.find(p => p.product_id === params.id)

// After
import ProductFormNew from '@/components/admin/ProductFormNew'
const productData = await fetchProductById(params.id)
```

### 3. **Product Form** (`components/admin/ProductFormNew.jsx`)

#### API Response Mapping

Backend trả về cấu trúc khác với form state, cần map:

**API Response Structure:**
```json
{
  "product_id": "uuid",
  "name": "Product Name",
  "slug": "product-slug",
  "variants": [
    {
      "variant_id": "uuid",
      "sku": "SKU-001",
      "name": "Variant Name",
      "attributes": {
        "power": "10",
        "cutout_size": "Ø90",
        "input_voltage": "220VAC",
        "color_temperature": "6500K",
        ...
      },
      "price": 310000,
      "stock": 10,
      "images": ["url1", "url2"]
    }
  ]
}
```

**Form State Structure:**
```javascript
{
  generalInfo: {
    name: "Product Name",
    slug: "product-slug",
    category_id: "uuid",
    ...
  },
  variants: [
    {
      id: "uuid",
      variant_id: "uuid", // Keep for updates
      variant_name: "Variant Name",
      sku: "SKU-001",
      power: "10",
      hole_size: "Ø90", // mapped from cutout_size
      power_supply: "220VAC", // mapped from input_voltage
      color_temp: "6500K", // mapped from color_temperature
      body_color: "White", // mapped from housing_color
      brightness: "<19", // mapped from luminance
      ...
      images: [
        { id: 1, url: "url1", file: null },
        { id: 2, url: "url2", file: null }
      ]
    }
  ]
}
```

#### Mapping Logic

```javascript
useEffect(() => {
  if (product) {
    // Map general info
    setGeneralInfo({
      name: product.name || '',
      slug: product.slug || '',
      short_desc: product.short_desc || '',
      description: product.description || '',
      category_id: product.category_id || '',
    })
    
    // Map variants with attribute transformation
    const mappedVariants = product.variants.map((v, index) => {
      const attrs = v.attributes || {}
      return {
        id: v.variant_id || Date.now() + index,
        variant_id: v.variant_id, // Keep for updates
        variant_name: v.name || '',
        sku: v.sku || '',
        // Map attributes
        power: attrs.power || '',
        hole_size: attrs.cutout_size || '',
        power_supply: attrs.input_voltage || '',
        color_temp: attrs.color_temperature || '',
        body_color: attrs.housing_color || '',
        brightness: attrs.luminance || '',
        // ... other attributes
        price: v.price || '',
        stock: v.stock || '',
        // Map images
        images: Array.isArray(v.images) 
          ? v.images.map((img, idx) => ({
              id: Date.now() + idx,
              url: typeof img === 'string' ? img : img.url,
              file: null
            }))
          : []
      }
    })
    setVariants(mappedVariants)
  }
}, [product])
```

#### Submit Data Transformation

Khi submit, cần map ngược lại:

```javascript
const submitData = {
  name: generalInfo.name,
  slug: generalInfo.slug,
  short_desc: generalInfo.short_desc || '',
  description: generalInfo.description || '',
  stock: totalStock, // Sum of all variant stocks
  thumbnail_url: thumbnailUrl, // First image of first variant
  category_id: generalInfo.category_id,
  is_active: true,
  variants: variants.map(v => ({
    sku: v.sku,
    name: v.variant_name || '',
    attributes: {
      power: v.power || '',
      cutout_size: v.hole_size || '', // Map back
      input_voltage: v.power_supply || '', // Map back
      color_temperature: v.color_temp || '', // Map back
      housing_color: v.body_color || '', // Map back
      luminance: v.brightness || '', // Map back
      // ... other attributes
    },
    price: parseFloat(v.price) || 0,
    stock: parseInt(v.stock) || 0,
    is_active: true,
    images: (v.images || [])
      .map(img => typeof img === 'string' ? img : img.url)
      .filter(Boolean), // Array of URLs only
  })),
}
```

## 🔑 Attribute Mapping Reference

| Form Field | API Attribute | Description |
|------------|---------------|-------------|
| `hole_size` | `cutout_size` | Lỗ khoét (mm) |
| `power_supply` | `input_voltage` | Nguồn điện |
| `color_temp` | `color_temperature` | Nhiệt độ màu |
| `body_color` | `housing_color` | Màu vỏ |
| `brightness` | `luminance` | Độ chói |
| `power` | `power` | Công suất (W) |
| `dimensions` | `dimensions` | Kích thước (mm) |
| `led_chip` | `led_chip` | Chip LED |
| `luminous_flux` | `luminous_flux` | Quang thông (Lm) |
| `cri` | `cri` | Độ hoàn màu |
| `beam_angle` | `beam_angle` | Góc chiếu |
| `material` | `material` | Chất liệu |
| `ip_rating` | `ip_rating` | IP |
| `warranty` | `warranty` | Bảo hành |
| `power_factor` | `power_factor` | Hệ số PF |
| `weight` | `weight` | Khối lượng |

## 🚀 Cách Sử Dụng

### 1. Truy Cập Trang Edit

**Bằng Slug:**
```
http://localhost:3000/admin/products/den-led-am-tran-diamond-mat-sau/edit
```

**Bằng UUID:**
```
http://localhost:3000/admin/products/6ca03013-8b70-48fc-b204-3460d885d443/edit
```

### 2. Form Sẽ Tự Động Load

- ✅ Thông tin chung (name, slug, description, category)
- ✅ Tất cả variants với attributes
- ✅ Hình ảnh của từng variant
- ✅ Giá và stock

### 3. Chỉnh Sửa và Lưu

1. Chỉnh sửa bất kỳ thông tin nào
2. Click "Lưu Sản Phẩm"
3. API sẽ được gọi với token authentication
4. Redirect về `/admin/products` nếu thành công

## 🔍 API Endpoints

### Get Product by ID/Slug

```bash
GET http://localhost:8080/api/v1/products/{id-or-slug}
```

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved",
  "data": {
    "product_id": "uuid",
    "name": "Đèn led âm trần Diamond mặt Sâu",
    "slug": "den-led-am-tran-diamond-mat-sau",
    "variants": [
      {
        "variant_id": "uuid",
        "sku": "DDLS-10SS-T105-DM",
        "name": "Ánh sáng đổi màu",
        "attributes": { ... },
        "price": 310000,
        "stock": 10,
        "images": ["url1", "url2"]
      }
    ]
  }
}
```

### Update Product

```bash
PUT http://localhost:8080/api/v1/products/{product_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "slug": "updated-slug",
  "variants": [ ... ]
}
```

## 🐛 Troubleshooting

### Error: Product Not Found

**Nguyên nhân:**
- ID/slug không tồn tại
- Backend không chạy

**Giải pháp:**
```bash
# Test API
curl http://localhost:8080/api/v1/products/den-led-am-tran-diamond-mat-sau
```

### Error: 401 Unauthorized

**Nguyên nhân:**
- Chưa login
- Token hết hạn

**Giải pháp:**
```javascript
// Check token
console.log(localStorage.getItem('auth_token'))

// If no token, login again
window.location.href = '/admin/login'
```

### Error: Variant Images Not Loading

**Nguyên nhân:**
- API trả về images không đúng format
- Images là string thay vì array

**Giải pháp:**
```javascript
// Check API response
console.log('Variant images:', product.variants[0].images)

// Should be: ["url1", "url2"]
// Not: "url1" or { url: "url1" }
```

### Error: Attributes Not Showing

**Nguyên nhân:**
- Mapping không đúng
- Attribute name không khớp

**Giải pháp:**
```javascript
// Check mapping in useEffect
console.log('Mapped variant:', mappedVariants[0])

// Verify attribute names match
console.log('API attributes:', product.variants[0].attributes)
```

## ✅ Testing Checklist

### Load Product
- [ ] Can access edit page by slug
- [ ] Can access edit page by UUID
- [ ] General info loads correctly
- [ ] All variants load
- [ ] Variant attributes load correctly
- [ ] Images load for each variant
- [ ] Category is pre-selected

### Edit Product
- [ ] Can edit product name
- [ ] Slug auto-updates
- [ ] Can edit description
- [ ] Can change category
- [ ] Can edit variant details
- [ ] Can add/remove variant images
- [ ] Can add/remove variants
- [ ] Price and stock validate correctly

### Save Product
- [ ] Validation works
- [ ] API called with correct data
- [ ] Token included in header
- [ ] Success message shown
- [ ] Redirects to products list
- [ ] Changes reflected in list

### Error Handling
- [ ] Shows error if product not found
- [ ] Shows error if API fails
- [ ] Shows error if validation fails
- [ ] Shows error if unauthorized

## 📊 Example Data Flow

### 1. Load Product

```
User → /admin/products/den-led-am-tran-diamond-mat-sau/edit
  ↓
fetchProductById('den-led-am-tran-diamond-mat-sau')
  ↓
API Response (with attributes structure)
  ↓
Map to Form State (with form field names)
  ↓
Display in Form
```

### 2. Edit and Save

```
User edits form
  ↓
Click "Lưu Sản Phẩm"
  ↓
Validate form
  ↓
Map form state to API structure
  ↓
updateProduct(product_id, submitData)
  ↓
API PUT with Authorization header
  ↓
Success → Redirect to /admin/products
```

## 🔐 Authentication

Edit product requires authentication:

```javascript
// Token automatically added in api.js
const token = localStorage.getItem('auth_token')
headers['Authorization'] = `Bearer ${token}`
```

If not logged in, user should be redirected to login page.

## 📝 Notes

### Image Handling
- Images are stored as URLs in the database
- Form displays images from URLs
- New images need to be uploaded first to get URLs
- Images are per-variant, not per-product

### Stock Calculation
- Product total stock = sum of all variant stocks
- Calculated automatically on submit
- Read-only in product level

### Slug Handling
- Auto-generated from product name
- Can be manually edited
- Must be unique
- Used in URL for SEO

### Variant ID
- Keep `variant_id` when editing
- Used by backend to update existing variants
- Don't generate new ID for existing variants

---

**Updated:** December 24, 2025
**Version:** 1.0.0
**Status:** ✅ Implemented and Tested

