# Variant Images API Structure

## 🎯 Tổng Quan

Cấu trúc mới cho images của product variants, bao gồm `image_id`, `is_main`, và `sort_order`.

## 📊 API Structure

### Request Format (Create/Update Product)

```json
{
  "name": "Đèn led âm trần Diamond mặt Sâu",
  "slug": "den-led-am-tran-diamond-mat-sau",
  "variants": [
    {
      "sku": "DDLS-10SS-T105-DM",
      "name": "Ánh sáng đổi màu",
      "attributes": { ... },
      "price": 310000,
      "stock": 10,
      "images": [
        {
          "image_id": "img-001",
          "url": "https://cdn.example.com/image-1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-002",
          "url": "https://cdn.example.com/image-2.jpg",
          "is_main": false,
          "sort_order": 1
        }
      ],
      "is_active": true
    }
  ]
}
```

### Image Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_id` | string | Yes | Unique identifier for the image |
| `url` | string | Yes | Full URL to the image |
| `is_main` | boolean | Yes | Whether this is the main/thumbnail image |
| `sort_order` | number | Yes | Display order (0-based) |

### Rules

1. **First Image is Main**
   - Ảnh đầu tiên (`sort_order: 0`) luôn có `is_main: true`
   - Các ảnh khác có `is_main: false`

2. **Sort Order**
   - Bắt đầu từ 0
   - Tăng dần theo thứ tự
   - Không có gap (0, 1, 2, 3...)

3. **Image ID**
   - Unique cho mỗi ảnh
   - Format: `img-{timestamp}-{index}` hoặc custom ID từ backend

## 🔄 Form State Mapping

### Form State Structure

```javascript
{
  variants: [
    {
      id: "variant-id",
      variant_name: "Ánh sáng đổi màu",
      sku: "DDLS-10SS-T105-DM",
      images: [
        {
          id: 1234567890,           // Local ID for React key
          image_id: "img-001",      // Backend image ID
          url: "https://...",       // Image URL
          is_main: true,            // Is main image
          sort_order: 0,            // Display order
          file: null                // File object (for new uploads)
        }
      ]
    }
  ]
}
```

### Load Product (API → Form)

```javascript
useEffect(() => {
  if (product) {
    const mappedVariants = product.variants.map((v, index) => {
      return {
        // ... other fields
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
      }
    })
    setVariants(mappedVariants)
  }
}, [product])
```

### Save Product (Form → API)

```javascript
const submitData = {
  // ... other fields
  variants: variants.map(v => ({
    // ... other fields
    images: (v.images || []).map((img, index) => {
      const url = typeof img === 'string' ? img : img.url
      return {
        image_id: img.image_id || img.id || `img-${Date.now()}-${index}`,
        url: url,
        is_main: index === 0, // First image is always main
        sort_order: index
      }
    }).filter(img => img.url), // Only include images with URL
  })),
}
```

## 🔧 Implementation Details

### 1. Handle Images Change

Khi user thêm/xóa/sắp xếp lại ảnh, tự động cập nhật `is_main` và `sort_order`:

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

### 2. Generate Image ID

Nếu backend không trả về `image_id`, tự động generate:

```javascript
const generateImageId = (variantIndex, imageIndex) => {
  return `img-${Date.now()}-${variantIndex}-${imageIndex}`
}
```

### 3. Validate Images

```javascript
const validateImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return true // No images is valid
  }
  
  // Check if first image is main
  if (images[0].is_main !== true) {
    console.warn('First image should be main')
  }
  
  // Check sort_order sequence
  const sortOrders = images.map(img => img.sort_order)
  const expectedOrders = Array.from({ length: images.length }, (_, i) => i)
  if (JSON.stringify(sortOrders) !== JSON.stringify(expectedOrders)) {
    console.warn('Sort order should be sequential starting from 0')
  }
  
  return true
}
```

## 📝 Example Scenarios

### Scenario 1: Create Product with Images

**User Actions:**
1. Create new product
2. Add variant "Ánh sáng đổi màu"
3. Upload 3 images

**Form State:**
```javascript
{
  images: [
    { id: 1, url: "image1.jpg", is_main: true, sort_order: 0 },
    { id: 2, url: "image2.jpg", is_main: false, sort_order: 1 },
    { id: 3, url: "image3.jpg", is_main: false, sort_order: 2 }
  ]
}
```

**API Request:**
```json
{
  "images": [
    {
      "image_id": "img-1234567890-0",
      "url": "image1.jpg",
      "is_main": true,
      "sort_order": 0
    },
    {
      "image_id": "img-1234567890-1",
      "url": "image2.jpg",
      "is_main": false,
      "sort_order": 1
    },
    {
      "image_id": "img-1234567890-2",
      "url": "image3.jpg",
      "is_main": false,
      "sort_order": 2
    }
  ]
}
```

### Scenario 2: Edit Product - Reorder Images

**User Actions:**
1. Load existing product
2. Drag image 3 to position 1 (becomes main)

**Before:**
```javascript
[
  { id: "img-001", url: "image1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "image2.jpg", is_main: false, sort_order: 1 },
  { id: "img-003", url: "image3.jpg", is_main: false, sort_order: 2 }
]
```

**After:**
```javascript
[
  { id: "img-003", url: "image3.jpg", is_main: true, sort_order: 0 },  // Now main
  { id: "img-001", url: "image1.jpg", is_main: false, sort_order: 1 },
  { id: "img-002", url: "image2.jpg", is_main: false, sort_order: 2 }
]
```

### Scenario 3: Edit Product - Remove Main Image

**User Actions:**
1. Load existing product with 3 images
2. Delete first image (main image)

**Before:**
```javascript
[
  { id: "img-001", url: "image1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "image2.jpg", is_main: false, sort_order: 1 },
  { id: "img-003", url: "image3.jpg", is_main: false, sort_order: 2 }
]
```

**After:**
```javascript
[
  { id: "img-002", url: "image2.jpg", is_main: true, sort_order: 0 },  // Promoted to main
  { id: "img-003", url: "image3.jpg", is_main: false, sort_order: 1 }  // Re-indexed
]
```

## 🎨 UI Considerations

### Display Main Image

```jsx
<div className="grid grid-cols-4 gap-2">
  {variant.images.map((img, index) => (
    <div key={img.id} className="relative">
      <img src={img.url} alt={`Image ${index + 1}`} />
      {img.is_main && (
        <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Main
        </span>
      )}
      <span className="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">
        {img.sort_order + 1}
      </span>
    </div>
  ))}
</div>
```

### Help Text

```jsx
<p className="mt-2 text-xs text-gray-500">
  Tối đa 5 hình ảnh cho biến thể này. 
  <strong>Ảnh đầu tiên sẽ là ảnh đại diện.</strong>
</p>
```

## 🐛 Troubleshooting

### Issue: is_main not set correctly

**Problem:** Multiple images have `is_main: true` or no image has `is_main: true`

**Solution:**
```javascript
// Always ensure only first image is main
images = images.map((img, idx) => ({
  ...img,
  is_main: idx === 0
}))
```

### Issue: sort_order has gaps

**Problem:** sort_order is [0, 2, 4] instead of [0, 1, 2]

**Solution:**
```javascript
// Re-index after any add/remove operation
images = images.map((img, idx) => ({
  ...img,
  sort_order: idx
}))
```

### Issue: image_id conflicts

**Problem:** Multiple images have the same `image_id`

**Solution:**
```javascript
// Generate unique ID
const generateUniqueImageId = () => {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

## ✅ Testing Checklist

### Create Product
- [ ] Upload 1 image → is_main: true, sort_order: 0
- [ ] Upload 3 images → first is main, sort_order: 0,1,2
- [ ] Upload max images (5) → all have correct sort_order

### Edit Product
- [ ] Load existing images → is_main and sort_order preserved
- [ ] Add new image → appended with correct sort_order
- [ ] Remove first image → second becomes main
- [ ] Reorder images → is_main updates to new first image

### API Request
- [ ] All images have image_id
- [ ] All images have url
- [ ] Only first image has is_main: true
- [ ] sort_order is sequential (0,1,2,...)
- [ ] No duplicate image_ids

## 📚 Related Files

- `components/admin/ProductFormNew.jsx` - Form with image mapping
- `components/admin/ImageUploader.jsx` - Image upload component
- `services/api.js` - API calls

---

**Updated:** December 26, 2025
**Version:** 2.0.0
**Status:** ✅ Implemented

