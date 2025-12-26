# Test Image Structure

## 🧪 Test Cases

### Test 1: Create Product with Images

#### Input (Form State)
```javascript
{
  generalInfo: {
    name: "Đèn LED Test",
    slug: "den-led-test",
    category_id: "cat-123"
  },
  variants: [
    {
      variant_name: "Ánh sáng trắng",
      sku: "TEST-001",
      price: "100000",
      stock: "10",
      images: [
        { id: 1, url: "https://example.com/img1.jpg", file: null },
        { id: 2, url: "https://example.com/img2.jpg", file: null },
        { id: 3, url: "https://example.com/img3.jpg", file: null }
      ]
    }
  ]
}
```

#### Expected API Request
```json
{
  "name": "Đèn LED Test",
  "slug": "den-led-test",
  "category_id": "cat-123",
  "variants": [
    {
      "sku": "TEST-001",
      "name": "Ánh sáng trắng",
      "price": 100000,
      "stock": 10,
      "images": [
        {
          "image_id": "img-1234567890-0",
          "url": "https://example.com/img1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-1234567890-1",
          "url": "https://example.com/img2.jpg",
          "is_main": false,
          "sort_order": 1
        },
        {
          "image_id": "img-1234567890-2",
          "url": "https://example.com/img3.jpg",
          "is_main": false,
          "sort_order": 2
        }
      ]
    }
  ]
}
```

#### Verification
- [x] First image has `is_main: true`
- [x] Other images have `is_main: false`
- [x] `sort_order` is sequential: 0, 1, 2
- [x] All images have `image_id`
- [x] All images have `url`

---

### Test 2: Edit Product - Load Existing Images

#### API Response
```json
{
  "product_id": "prod-123",
  "name": "Đèn LED Test",
  "variants": [
    {
      "variant_id": "var-123",
      "name": "Ánh sáng trắng",
      "sku": "TEST-001",
      "images": [
        {
          "image_id": "img-001",
          "url": "https://example.com/img1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-002",
          "url": "https://example.com/img2.jpg",
          "is_main": false,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

#### Expected Form State
```javascript
{
  variants: [
    {
      variant_id: "var-123",
      variant_name: "Ánh sáng trắng",
      sku: "TEST-001",
      images: [
        {
          id: "img-001",
          image_id: "img-001",
          url: "https://example.com/img1.jpg",
          is_main: true,
          sort_order: 0,
          file: null
        },
        {
          id: "img-002",
          image_id: "img-002",
          url: "https://example.com/img2.jpg",
          is_main: false,
          sort_order: 1,
          file: null
        }
      ]
    }
  ]
}
```

#### Verification
- [x] `image_id` preserved from API
- [x] `is_main` preserved
- [x] `sort_order` preserved
- [x] `file` set to null (existing images)

---

### Test 3: Edit Product - Add New Image

#### Initial State
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 }
]
```

#### User Action
Upload new image "img3.jpg"

#### Expected State After Add
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 },
  { id: 3, url: "img3.jpg", is_main: false, sort_order: 2 }  // ✅ New image
]
```

#### Verification
- [x] New image appended to end
- [x] New image has `is_main: false`
- [x] New image has correct `sort_order: 2`
- [x] Existing images unchanged

---

### Test 4: Edit Product - Remove First Image

#### Initial State
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 },
  { id: "img-003", url: "img3.jpg", is_main: false, sort_order: 2 }
]
```

#### User Action
Delete first image (img-001)

#### Expected State After Delete
```javascript
images: [
  { id: "img-002", url: "img2.jpg", is_main: true, sort_order: 0 },   // ✅ Now main
  { id: "img-003", url: "img3.jpg", is_main: false, sort_order: 1 }   // ✅ Re-indexed
]
```

#### Verification
- [x] Second image becomes main
- [x] `sort_order` re-indexed to 0, 1
- [x] Only one image has `is_main: true`

---

### Test 5: Edit Product - Remove Middle Image

#### Initial State
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 },
  { id: "img-003", url: "img3.jpg", is_main: false, sort_order: 2 }
]
```

#### User Action
Delete second image (img-002)

#### Expected State After Delete
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },   // ✅ Still main
  { id: "img-003", url: "img3.jpg", is_main: false, sort_order: 1 }   // ✅ Re-indexed
]
```

#### Verification
- [x] First image still main
- [x] Third image re-indexed to sort_order: 1
- [x] No gaps in sort_order

---

### Test 6: Edit Product - Reorder Images

#### Initial State
```javascript
images: [
  { id: "img-001", url: "img1.jpg", is_main: true, sort_order: 0 },
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 1 },
  { id: "img-003", url: "img3.jpg", is_main: false, sort_order: 2 }
]
```

#### User Action
Drag img-003 to first position

#### Expected State After Reorder
```javascript
images: [
  { id: "img-003", url: "img3.jpg", is_main: true, sort_order: 0 },   // ✅ Now main
  { id: "img-001", url: "img1.jpg", is_main: false, sort_order: 1 },  // ✅ Not main anymore
  { id: "img-002", url: "img2.jpg", is_main: false, sort_order: 2 }
]
```

#### Verification
- [x] New first image becomes main
- [x] Old main image becomes not main
- [x] All `sort_order` updated
- [x] Only one image has `is_main: true`

---

### Test 7: Backward Compatibility - Old Format (String Array)

#### API Response (Old Format)
```json
{
  "variants": [
    {
      "images": [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg"
      ]
    }
  ]
}
```

#### Expected Form State
```javascript
{
  variants: [
    {
      images: [
        {
          id: 1234567890,
          image_id: null,
          url: "https://example.com/img1.jpg",
          is_main: true,
          sort_order: 0,
          file: null
        },
        {
          id: 1234567891,
          image_id: null,
          url: "https://example.com/img2.jpg",
          is_main: false,
          sort_order: 1,
          file: null
        }
      ]
    }
  ]
}
```

#### Verification
- [x] String URLs converted to objects
- [x] `is_main` and `sort_order` auto-assigned
- [x] `image_id` set to null (will be generated on save)

---

### Test 8: Multiple Variants with Images

#### Input (Form State)
```javascript
{
  variants: [
    {
      variant_name: "Ánh sáng trắng",
      sku: "TEST-001",
      images: [
        { id: 1, url: "white1.jpg" },
        { id: 2, url: "white2.jpg" }
      ]
    },
    {
      variant_name: "Ánh sáng vàng",
      sku: "TEST-002",
      images: [
        { id: 3, url: "yellow1.jpg" },
        { id: 4, url: "yellow2.jpg" },
        { id: 5, url: "yellow3.jpg" }
      ]
    }
  ]
}
```

#### Expected API Request
```json
{
  "variants": [
    {
      "name": "Ánh sáng trắng",
      "sku": "TEST-001",
      "images": [
        {
          "image_id": "img-1234567890-0-0",
          "url": "white1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-1234567890-0-1",
          "url": "white2.jpg",
          "is_main": false,
          "sort_order": 1
        }
      ]
    },
    {
      "name": "Ánh sáng vàng",
      "sku": "TEST-002",
      "images": [
        {
          "image_id": "img-1234567890-1-0",
          "url": "yellow1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-1234567890-1-1",
          "url": "yellow2.jpg",
          "is_main": false,
          "sort_order": 1
        },
        {
          "image_id": "img-1234567890-1-2",
          "url": "yellow3.jpg",
          "is_main": false,
          "sort_order": 2
        }
      ]
    }
  ]
}
```

#### Verification
- [x] Each variant has its own main image
- [x] Each variant's images have independent sort_order
- [x] `image_id` unique across all variants

---

### Test 9: Variant with No Images

#### Input (Form State)
```javascript
{
  variants: [
    {
      variant_name: "Ánh sáng trắng",
      sku: "TEST-001",
      images: []
    }
  ]
}
```

#### Expected API Request
```json
{
  "variants": [
    {
      "name": "Ánh sáng trắng",
      "sku": "TEST-001",
      "images": []
    }
  ]
}
```

#### Verification
- [x] Empty images array is valid
- [x] No errors thrown
- [x] Product can be created/updated

---

### Test 10: Image with Invalid URL

#### Input (Form State)
```javascript
{
  variants: [
    {
      images: [
        { id: 1, url: "valid.jpg" },
        { id: 2, url: "" },           // Empty URL
        { id: 3, url: null },         // Null URL
        { id: 4, url: "valid2.jpg" }
      ]
    }
  ]
}
```

#### Expected API Request
```json
{
  "variants": [
    {
      "images": [
        {
          "image_id": "img-1",
          "url": "valid.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "image_id": "img-4",
          "url": "valid2.jpg",
          "is_main": false,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

#### Verification
- [x] Images with empty/null URL filtered out
- [x] Remaining images re-indexed
- [x] First valid image becomes main

---

## 🎯 Manual Testing Steps

### Step 1: Create Product
1. Go to `/admin/products/create`
2. Fill in product name: "Test Product"
3. Add variant: "Test Variant"
4. Upload 3 images
5. Click "Lưu Sản Phẩm"
6. Open Network tab → Check POST request
7. Verify images structure:
   ```json
   {
     "images": [
       { "image_id": "...", "url": "...", "is_main": true, "sort_order": 0 },
       { "image_id": "...", "url": "...", "is_main": false, "sort_order": 1 },
       { "image_id": "...", "url": "...", "is_main": false, "sort_order": 2 }
     ]
   }
   ```

### Step 2: Edit Product
1. Go to `/admin/products/den-led-am-tran-diamond-mat-sau/edit`
2. Verify images load correctly
3. Check console: `console.log(variants[0].images)`
4. Should see:
   ```javascript
   [
     { image_id: "img-001", url: "...", is_main: true, sort_order: 0 },
     { image_id: "img-002", url: "...", is_main: false, sort_order: 1 }
   ]
   ```

### Step 3: Add Image
1. In edit page, click "Add Image" for a variant
2. Upload new image
3. Check state: `console.log(variants[0].images)`
4. New image should have:
   - `is_main: false`
   - `sort_order: <last_index + 1>`

### Step 4: Remove First Image
1. Delete first image (main image)
2. Check state
3. Second image should become main:
   - `is_main: true`
   - `sort_order: 0`

### Step 5: Reorder Images
1. Drag third image to first position
2. Check state
3. Third image should become main
4. All sort_order should update

### Step 6: Save Changes
1. Click "Lưu Sản Phẩm"
2. Open Network tab → Check PUT request
3. Verify images structure matches API format

---

## 📊 Console Testing

### Test in Browser Console

```javascript
// Get form component
const form = document.querySelector('form')

// Check variants state (add this temporarily to ProductFormNew)
console.log('Variants:', variants)

// Check first variant images
console.log('First variant images:', variants[0].images)

// Verify structure
variants[0].images.forEach((img, idx) => {
  console.log(`Image ${idx}:`, {
    image_id: img.image_id,
    url: img.url,
    is_main: img.is_main,
    sort_order: img.sort_order
  })
})

// Verify only first is main
const mainCount = variants[0].images.filter(img => img.is_main).length
console.log('Main images count:', mainCount) // Should be 1

// Verify sort_order is sequential
const sortOrders = variants[0].images.map(img => img.sort_order)
console.log('Sort orders:', sortOrders) // Should be [0, 1, 2, ...]
```

---

## ✅ Success Criteria

### All Tests Pass When:
- [x] First image always has `is_main: true`
- [x] Other images have `is_main: false`
- [x] `sort_order` is sequential (0, 1, 2, ...)
- [x] All images have `image_id`
- [x] All images have valid `url`
- [x] Adding image updates sort_order
- [x] Removing image re-indexes sort_order
- [x] Reordering updates is_main and sort_order
- [x] API request matches expected format
- [x] Backward compatible with old format

---

**Date:** December 26, 2025
**Status:** Ready for Testing

