# Image Structure Update - Summary

## ✅ Đã Hoàn Thành

Cập nhật cấu trúc images cho product variants theo format mới với `image_id`, `is_main`, và `sort_order`.

## 🔄 Thay Đổi

### Cấu Trúc Cũ (String Array)
```json
{
  "images": [
    "https://cdn.example.com/image1.jpg",
    "https://cdn.example.com/image2.jpg"
  ]
}
```

### Cấu Trúc Mới (Object Array)
```json
{
  "images": [
    {
      "image_id": "img-001",
      "url": "https://cdn.example.com/image1.jpg",
      "is_main": true,
      "sort_order": 0
    },
    {
      "image_id": "img-002",
      "url": "https://cdn.example.com/image2.jpg",
      "is_main": false,
      "sort_order": 1
    }
  ]
}
```

## 📊 Quy Tắc

### 1. Ảnh Đầu Tiên Là Main
- `sort_order: 0` → `is_main: true`
- Các ảnh khác → `is_main: false`

### 2. Sort Order Liên Tục
- Bắt đầu từ 0
- Không có gap: 0, 1, 2, 3...
- Tự động re-index khi thêm/xóa

### 3. Image ID Unique
- Format: `img-{timestamp}-{index}`
- Hoặc custom ID từ backend

## 🔧 Implementation

### File: `components/admin/ProductFormNew.jsx`

#### 1. Load Product (API → Form)

```javascript
images: Array.isArray(v.images) 
  ? v.images.map((img, idx) => {
      // Handle both old format (string) and new format (object)
      if (typeof img === 'string') {
        return {
          id: Date.now() + idx,
          image_id: null,
          url: img,
          is_main: idx === 0,
          sort_order: idx,
          file: null
        }
      }
      return {
        id: img.image_id || Date.now() + idx,
        image_id: img.image_id,
        url: img.url,
        is_main: img.is_main !== undefined ? img.is_main : idx === 0,
        sort_order: img.sort_order !== undefined ? img.sort_order : idx,
        file: null
      }
    })
  : []
```

#### 2. Save Product (Form → API)

```javascript
images: (v.images || []).map((img, index) => {
  const url = typeof img === 'string' ? img : img.url
  return {
    image_id: img.image_id || img.id || `img-${Date.now()}-${index}`,
    url: url,
    is_main: index === 0, // Ảnh đầu tiên là main
    sort_order: index
  }
}).filter(img => img.url) // Chỉ lấy images có URL
```

#### 3. Handle Images Change

```javascript
const handleVariantImagesChange = (index, images) => {
  setVariants(prev => {
    const updated = [...prev]
    // Ensure each image has is_main and sort_order
    const processedImages = images.map((img, idx) => ({
      ...img,
      is_main: idx === 0, // First image is always main
      sort_order: idx
    }))
    updated[index] = { ...updated[index], images: processedImages }
    return updated
  })
}
```

## 📝 Examples

### Example 1: Create Product with 3 Images

**Form State:**
```javascript
{
  variant_name: "Ánh sáng đổi màu",
  images: [
    { id: 1, url: "img1.jpg", file: File },
    { id: 2, url: "img2.jpg", file: File },
    { id: 3, url: "img3.jpg", file: File }
  ]
}
```

**API Request:**
```json
{
  "name": "Ánh sáng đổi màu",
  "images": [
    {
      "image_id": "img-1234567890-0",
      "url": "img1.jpg",
      "is_main": true,
      "sort_order": 0
    },
    {
      "image_id": "img-1234567890-1",
      "url": "img2.jpg",
      "is_main": false,
      "sort_order": 1
    },
    {
      "image_id": "img-1234567890-2",
      "url": "img3.jpg",
      "is_main": false,
      "sort_order": 2
    }
  ]
}
```

### Example 2: Edit Product - Remove First Image

**Before:**
```javascript
[
  { image_id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { image_id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 },
  { image_id: "img-003", url: "img3.jpg", is_main: false, sort_order: 2 }
]
```

**After Delete:**
```javascript
[
  { image_id: "img-002", url: "img2.jpg", is_main: true, sort_order: 0 },  // ✅ Now main
  { image_id: "img-003", url: "img3.jpg", is_main: false, sort_order: 1 }  // ✅ Re-indexed
]
```

### Example 3: Edit Product - Reorder Images

**User drags image 3 to position 1:**

**Before:**
```javascript
[img1 (main), img2, img3]
```

**After:**
```javascript
[img3 (main), img1, img2]  // ✅ img3 is now main
```

## 🎯 Key Features

### ✅ Backward Compatible
- Hỗ trợ cả format cũ (string) và mới (object)
- Tự động convert khi load

### ✅ Auto-Update is_main
- Luôn đảm bảo ảnh đầu tiên là main
- Tự động update khi reorder

### ✅ Auto-Update sort_order
- Tự động re-index khi thêm/xóa
- Không có gap trong sequence

### ✅ Generate image_id
- Tự động generate nếu không có
- Unique cho mỗi ảnh

## 🧪 Testing

### Test Cases

1. **Create Product**
   - [ ] Upload 1 image → `is_main: true`, `sort_order: 0`
   - [ ] Upload 3 images → first is main, others are not
   - [ ] Upload 5 images → all have sequential sort_order

2. **Edit Product**
   - [ ] Load existing images → preserve image_id
   - [ ] Add new image → correct sort_order
   - [ ] Remove first image → second becomes main
   - [ ] Reorder images → is_main updates

3. **API Request**
   - [ ] All images have `image_id`
   - [ ] All images have `url`
   - [ ] Only first has `is_main: true`
   - [ ] `sort_order` is 0,1,2,3...

### Test with Real API

```bash
# Create product
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "variants": [{
      "sku": "TEST-001",
      "name": "Test Variant",
      "images": [
        {
          "image_id": "img-001",
          "url": "https://example.com/img1.jpg",
          "is_main": true,
          "sort_order": 0
        }
      ]
    }]
  }'
```

## 📊 Data Flow

### Create Product Flow

```
User uploads images
  ↓
ImageUploader component
  ↓
handleVariantImagesChange
  ↓
Add is_main and sort_order
  ↓
Store in form state
  ↓
handleSubmit
  ↓
Map to API format with image_id
  ↓
POST /api/v1/products
```

### Edit Product Flow

```
Load product from API
  ↓
Map API response to form state
  ↓
Preserve image_id, is_main, sort_order
  ↓
User edits images
  ↓
Auto-update is_main and sort_order
  ↓
handleSubmit
  ↓
PUT /api/v1/products/{id}
```

## 🔍 Validation

### Image Object Validation

```javascript
function validateImageObject(img) {
  return (
    img.image_id &&           // Has ID
    img.url &&                // Has URL
    typeof img.is_main === 'boolean' &&  // Has boolean is_main
    typeof img.sort_order === 'number'   // Has numeric sort_order
  )
}
```

### Images Array Validation

```javascript
function validateImagesArray(images) {
  if (!Array.isArray(images)) return false
  if (images.length === 0) return true // Empty is valid
  
  // First image must be main
  if (images[0].is_main !== true) return false
  
  // Only first image can be main
  const mainCount = images.filter(img => img.is_main).length
  if (mainCount !== 1) return false
  
  // sort_order must be sequential
  const sortOrders = images.map(img => img.sort_order)
  const expected = Array.from({ length: images.length }, (_, i) => i)
  if (JSON.stringify(sortOrders) !== JSON.stringify(expected)) return false
  
  return true
}
```

## 🐛 Common Issues

### Issue 1: Multiple Main Images
**Problem:** More than one image has `is_main: true`

**Solution:**
```javascript
images = images.map((img, idx) => ({
  ...img,
  is_main: idx === 0
}))
```

### Issue 2: Sort Order Gaps
**Problem:** sort_order is [0, 2, 4] instead of [0, 1, 2]

**Solution:**
```javascript
images = images.map((img, idx) => ({
  ...img,
  sort_order: idx
}))
```

### Issue 3: Missing image_id
**Problem:** Some images don't have `image_id`

**Solution:**
```javascript
const generateImageId = () => {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

images = images.map(img => ({
  ...img,
  image_id: img.image_id || generateImageId()
}))
```

## 📚 Documentation

- **VARIANT_IMAGES_API_STRUCTURE.md** - Chi tiết về cấu trúc API
- **PRODUCT_EDIT_GUIDE.md** - Hướng dẫn edit product
- **PRODUCT_FORM_GUIDE.md** - Hướng dẫn product form

## ✅ Checklist

- [x] Update `useEffect` to map API response
- [x] Update `handleSubmit` to map to API format
- [x] Update `handleVariantImagesChange` to set is_main and sort_order
- [x] Support backward compatibility (string format)
- [x] Auto-generate image_id if missing
- [x] Validate images array
- [x] Create documentation

---

**Date:** December 26, 2025
**Status:** ✅ Complete
**Version:** 2.0.0

