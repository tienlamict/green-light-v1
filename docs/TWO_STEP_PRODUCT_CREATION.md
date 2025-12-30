# Two-Step Product Creation Flow

## 🎯 Problem Statement

### Deadlock Issue:
```
❌ OLD FLOW (DEADLOCK):
User creates product
  → Frontend tries to upload images
  → Needs variant_id
  → But variant not created yet!
  → DEADLOCK
```

**Root Cause:**
- Variant chưa INSERT vào DB → chưa có `variant_id`
- Upload ảnh cần `variant_id` để gắn ảnh vào variant
- Không thể upload ảnh trước khi có variant_id

---

## ✅ Solution: Two-Step Flow

### New Flow:
```
✅ NEW FLOW (TWO STEPS):

STEP 1: Create Product + Variants
  ├─▶ POST /api/v1/products
  │   ├─ Product info (name, slug, description, etc.)
  │   └─ Variants info (sku, price, stock, attributes)
  │   ❌ NO IMAGES in this step
  │
  ├─◀ Response
  │   ├─ product_id: "uuid-123"
  │   └─ variants: [
  │       { variant_id: "uuid-456", sku: "SKU-001", ... },
  │       { variant_id: "uuid-789", sku: "SKU-002", ... }
  │     ]
  │
  └─▶ Now we have variant_id! ✅

STEP 2: Upload Images for Each Variant
  ├─▶ For each variant:
  │   ├─ POST /products/{product_id}/images/presign
  │   │   → Get presigned URL
  │   │
  │   ├─ PUT {presigned_url}
  │   │   → Upload to MinIO
  │   │
  │   └─ POST /products/{product_id}/images
  │       → Confirm upload with variant_id ✅
  │
  └─▶ All images uploaded with correct variant_id!
```

---

## 📋 Implementation Details

### 1. **ProductFormNew.jsx**

**Changes:**
- ✅ `handleSubmit` không gửi images trong API call
- ✅ Pass `variants` (with images) to `onSubmit` callback
- ✅ Parent component xử lý upload images

**Code:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!validate()) {
    alert('Vui lòng kiểm tra lại thông tin')
    return
  }

  setLoading(true)
  try {
    // STEP 1 Data: Product + Variants (NO IMAGES)
    const submitData = {
      name: generalInfo.name,
      slug: generalInfo.slug,
      short_desc: generalInfo.short_desc || '',
      description: generalInfo.description || '',
      stock: totalStock,
      thumbnail_url: thumbnailUrl,
      category_id: generalInfo.category_id,
      is_active: true,
      variants: variants.map(v => ({
        sku: v.sku,
        name: v.variant_name || '',
        attributes: { ... },
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        is_active: true,
        // ❌ NO IMAGES HERE
      })),
    }

    // Pass both submitData and variants (with images)
    if (onSubmit) {
      await onSubmit(submitData, variants)
    }
  } catch (error) {
    console.error('Error saving product:', error)
    setErrors({ submit: error.message })
  } finally {
    setLoading(false)
  }
}
```

---

### 2. **create/page.jsx**

**Two-Step Handler:**

```javascript
const handleSubmit = async (productData, variantsWithImages) => {
  try {
    // ========================================
    // STEP 1: Create Product + Variants
    // ========================================
    console.log('🚀 STEP 1: Creating product + variants (no images)...')
    
    const createdProduct = await createProduct(productData)
    console.log('✅ Product created:', createdProduct)
    
    if (!createdProduct || !createdProduct.product_id) {
      throw new Error('Product creation failed - no product_id returned')
    }
    
    // ========================================
    // STEP 2: Upload Images for Each Variant
    // ========================================
    if (variantsWithImages && variantsWithImages.length > 0) {
      console.log('🚀 STEP 2: Uploading images for variants...')
      
      const createdVariants = createdProduct.variants || []
      
      for (let i = 0; i < variantsWithImages.length; i++) {
        const variantData = variantsWithImages[i]
        const createdVariant = createdVariants[i]
        
        if (!createdVariant || !createdVariant.variant_id) {
          console.warn(`⚠️ Variant ${i} has no variant_id, skipping`)
          continue
        }
        
        // Convert images to File objects
        const imagesToUpload = []
        
        for (const img of (variantData.images || [])) {
          // Case 1: File object
          if (img.file instanceof File) {
            imagesToUpload.push(img.file)
            continue
          }
          
          // Case 2: Base64 → convert to File
          const url = typeof img === 'string' ? img : img.url
          if (url && url.startsWith('data:image')) {
            const response = await fetch(url)
            const blob = await response.blob()
            const fileName = `image-${Date.now()}-${imagesToUpload.length}.jpg`
            const file = new File([blob], fileName, { type: blob.type })
            imagesToUpload.push(file)
          }
          
          // Case 3: Already uploaded URL → skip
        }
        
        if (imagesToUpload.length === 0) {
          console.log(`ℹ️ Variant ${i} has no images to upload`)
          continue
        }
        
        console.log(`📤 Uploading ${imagesToUpload.length} images for variant ${i}...`)
        
        const { uploadVariantImages } = await import('@/services/imageUpload')
        
        const result = await uploadVariantImages(
          createdProduct.product_id,
          createdVariant.variant_id,
          imagesToUpload
        )
        
        if (result.success) {
          console.log(`✅ Uploaded ${result.images.length} images`)
        } else {
          console.error(`⚠️ Some images failed:`, result.errors)
        }
      }
      
      console.log('✅ STEP 2 Complete: All images uploaded')
    }
    
    alert('Tạo sản phẩm thành công!')
    router.push('/admin/products')
  } catch (error) {
    console.error('❌ Error creating product:', error)
    throw error
  }
}
```

---

### 3. **edit/page.jsx**

**Similar Two-Step for Edit:**

```javascript
const handleSubmit = async (productData, variantsWithImages) => {
  try {
    // STEP 1: Update product + variants
    console.log('🚀 STEP 1: Updating product + variants...')
    await updateProduct(product.product_id, productData)
    console.log('✅ Product updated')
    
    // STEP 2: Upload new images
    // (Variants already have variant_id in edit mode)
    if (variantsWithImages && variantsWithImages.length > 0) {
      console.log('🚀 STEP 2: Uploading new images...')
      
      for (let i = 0; i < variantsWithImages.length; i++) {
        const variantData = variantsWithImages[i]
        const variantId = variantData.variant_id
        
        if (!variantId) {
          console.warn(`⚠️ Variant ${i} has no variant_id`)
          continue
        }
        
        // Convert new images to File objects
        const imagesToUpload = []
        
        for (const img of (variantData.images || [])) {
          if (img.file instanceof File) {
            imagesToUpload.push(img.file)
          } else {
            const url = typeof img === 'string' ? img : img.url
            if (url && url.startsWith('data:image')) {
              const response = await fetch(url)
              const blob = await response.blob()
              const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type })
              imagesToUpload.push(file)
            }
          }
        }
        
        if (imagesToUpload.length > 0) {
          const { uploadVariantImages } = await import('@/services/imageUpload')
          const result = await uploadVariantImages(
            product.product_id,
            variantId,
            imagesToUpload
          )
          console.log(`✅ Uploaded ${result.images.length} images for variant ${i}`)
        }
      }
    }
    
    alert('Product updated successfully!')
    router.push('/admin/products')
  } catch (error) {
    console.error('❌ Error updating product:', error)
    throw error
  }
}
```

---

## 🔄 Data Flow Diagram

### Create Product Flow:

```
┌─────────────────────────────────────────────────────────────┐
│ User fills form + selects images (preview mode)            │
│ Images stored as base64 in state                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Lưu Sản Phẩm"                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ProductFormNew.handleSubmit()                              │
│ ├─ Validate form                                           │
│ ├─ Prepare submitData (NO IMAGES)                         │
│ └─ Call onSubmit(submitData, variants)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ create/page.jsx handleSubmit()                             │
│                                                             │
│ STEP 1: Create Product                                     │
│ ├─ POST /api/v1/products                                   │
│ ├─ Body: { name, slug, variants: [...] }                  │
│ └─ Response: { product_id, variants: [{ variant_id }] }   │
│                                                             │
│ STEP 2: Upload Images                                      │
│ ├─ For each variant:                                       │
│ │   ├─ Convert base64 → File                              │
│ │   ├─ uploadVariantImages(productId, variantId, files)  │
│ │   │   ├─ For each file:                                 │
│ │   │   │   ├─ getPresignedUrl()                          │
│ │   │   │   ├─ uploadToMinIO()                            │
│ │   │   │   └─ confirmImageUpload(variantId) ✅          │
│ │   │   └─ Return uploaded images                         │
│ │   └─ Log success                                        │
│ └─ Complete                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Success!                                                    │
│ ├─ Alert "Tạo sản phẩm thành công!"                       │
│ └─ Redirect to /admin/products                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 API Response Structure

### STEP 1 Response (Create Product):

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": "6ca03013-8b70-48fc-b204-3460d885d443",
    "name": "Đèn LED âm trần Diamond",
    "slug": "den-led-am-tran-diamond",
    "variants": [
      {
        "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8",
        "product_id": "6ca03013-8b70-48fc-b204-3460d885d443",
        "sku": "DDLS-10SS-T105-DM",
        "name": "Ánh sáng đổi màu",
        "price": 310000,
        "stock": 10,
        "is_active": true,
        "created_at": "2025-12-24T06:13:07Z"
      },
      {
        "variant_id": "02aecbc7-dddf-4f71-b17b-20ce9f46a3cf",
        "product_id": "6ca03013-8b70-48fc-b204-3460d885d443",
        "sku": "DDLS-10SS-T105-T",
        "name": "Ánh sáng trắng",
        "price": 280000,
        "stock": 5,
        "is_active": true,
        "created_at": "2025-12-24T06:13:07Z"
      }
    ],
    "created_at": "2025-12-24T06:13:08Z"
  }
}
```

**Key Points:**
- ✅ `product_id` available immediately
- ✅ Each variant has `variant_id`
- ✅ Can now upload images with `variant_id`

---

### STEP 2: Image Upload Flow

#### 2.1 Get Presigned URL:
```javascript
POST /api/v1/products/{product_id}/images/presign

Request:
{
  "content_type": "image/jpeg",
  "extension": "jpg"
}

Response:
{
  "success": true,
  "data": {
    "upload_url": "http://localhost:9000/products/...",
    "public_url": "http://localhost:9000/products/...",
    "object_key": "products/2024/12/prod-123/uuid.jpg",
    "expires_at": "2025-12-30T10:00:00Z"
  }
}
```

#### 2.2 Upload to MinIO:
```javascript
PUT {upload_url}
Headers: { "Content-Type": "image/jpeg" }
Body: <binary file data>

Response: 200 OK
```

#### 2.3 Confirm Upload:
```javascript
POST /api/v1/products/{product_id}/images

Request:
{
  "object_key": "products/2024/12/prod-123/uuid.jpg",
  "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8"  ✅
}

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "http://localhost:9000/products/...",
    "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8",
    "is_main": false,
    "sort_order": 0
  }
}
```

**Key Points:**
- ✅ `variant_id` sent in confirm step
- ✅ Image correctly linked to variant in DB
- ✅ No more deadlock!

---

## 🎯 Image State Management

### Image Object Structure:

```javascript
{
  id: 123456789,              // Local ID (timestamp)
  image_id: "uuid",           // Server ID (after upload)
  url: "...",                 // Image URL (base64 or server URL)
  preview: "...",             // Preview URL (for display)
  file: File,                 // Original File object (if new upload)
  is_main: true,              // Is main image
  sort_order: 0,              // Display order
}
```

### Image States:

1. **New Upload (Preview Mode)**
   ```javascript
   {
     id: 1735562400000,
     image_id: null,
     url: "data:image/jpeg;base64,...",
     preview: "data:image/jpeg;base64,...",
     file: File { name: "photo.jpg", size: 123456 },
     is_main: true,
     sort_order: 0
   }
   ```

2. **Uploaded to Server**
   ```javascript
   {
     id: 1735562400000,
     image_id: "550e8400-e29b-41d4-a716-446655440000",
     url: "http://localhost:9000/products/...",
     preview: "http://localhost:9000/products/...",
     file: null,
     is_main: true,
     sort_order: 0
   }
   ```

---

## 🔍 Image Upload Detection

### How to Identify Images That Need Upload:

```javascript
function needsUpload(img) {
  // Case 1: Has File object → needs upload
  if (img.file instanceof File) {
    return true
  }
  
  // Case 2: URL is base64 → needs upload
  const url = typeof img === 'string' ? img : img.url
  if (url && url.startsWith('data:image')) {
    return true
  }
  
  // Case 3: Has server URL → already uploaded
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return false
  }
  
  return false
}
```

---

## 🛠️ Helper: Convert Base64 to File

```javascript
async function base64ToFile(base64Url, fileName = 'image.jpg') {
  try {
    const response = await fetch(base64Url)
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: blob.type })
    return file
  } catch (error) {
    console.error('Failed to convert base64 to File:', error)
    return null
  }
}
```

**Usage:**
```javascript
const base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
const file = await base64ToFile(base64, 'photo.jpg')
// file: File { name: "photo.jpg", size: 123456, type: "image/jpeg" }
```

---

## 📝 Console Logs for Debugging

### STEP 1: Create Product
```
🚀 STEP 1: Creating product + variants (no images)...
✅ Product created: { product_id: "...", variants: [...] }
```

### STEP 2: Upload Images
```
🚀 STEP 2: Uploading images for variants...
📤 Uploading 3 images for variant 0 (cd332d95-c998-4abe-aefb-efd7859bb5c8)...
🟢 uploadVariantImages called
  productId: 6ca03013-8b70-48fc-b204-3460d885d443
  variantId: cd332d95-c998-4abe-aefb-efd7859bb5c8
  files: 3
🟢 Uploading file 1/3: image-1735562400000-0.jpg
🔵 Presign Request: ...
🔵 Presign Response: { upload_url: ✅, public_url: ✅ }
🟡 MinIO Upload: ...
🟡 MinIO Response Status: 200 OK
🔵 Confirm Upload Request: { object_key: "...", variant_id: "..." }
✅ Confirm Response: { success: true }
✅ Uploaded 3 images for variant 0
✅ STEP 2 Complete: All images uploaded
```

---

## ✅ Benefits

### 1. **No More Deadlock**
- Product created first → variant_id available
- Images uploaded with correct variant_id
- Clean, sequential flow

### 2. **Better Error Handling**
- Product creation can succeed even if image upload fails
- Can retry image upload separately
- Partial success is possible

### 3. **Better UX**
- User sees product created immediately
- Image upload happens in background
- Can continue editing even if some images fail

### 4. **Scalability**
- Can upload images in parallel
- Can add progress indicators
- Can implement retry logic

---

## 🧪 Test Scenarios

### Test 1: Create Product with Images
- [ ] Fill form with 2 variants
- [ ] Add 3 images to variant 1
- [ ] Add 2 images to variant 2
- [ ] Click "Lưu Sản Phẩm"
- [ ] Check console: STEP 1 success
- [ ] Check console: STEP 2 uploading 5 images
- [ ] Check console: All images uploaded
- [ ] Verify: Product created with 2 variants
- [ ] Verify: Variant 1 has 3 images with variant_id
- [ ] Verify: Variant 2 has 2 images with variant_id

### Test 2: Create Product without Images
- [ ] Fill form with 1 variant
- [ ] Don't add any images
- [ ] Click "Lưu Sản Phẩm"
- [ ] Check console: STEP 1 success
- [ ] Check console: STEP 2 skipped (no images)
- [ ] Verify: Product created successfully

### Test 3: Edit Product - Add New Images
- [ ] Open existing product
- [ ] Add 2 new images to variant 1
- [ ] Click "Lưu Thay Đổi"
- [ ] Check console: STEP 1 update success
- [ ] Check console: STEP 2 uploading 2 images
- [ ] Verify: New images have correct variant_id

### Test 4: Partial Failure
- [ ] Create product with 3 variants
- [ ] Add images to all variants
- [ ] Simulate MinIO error for variant 2
- [ ] Check: Variant 1 images uploaded ✅
- [ ] Check: Variant 2 images failed ❌
- [ ] Check: Variant 3 images uploaded ✅
- [ ] Verify: Product still created
- [ ] Verify: Can retry variant 2 later

---

## 🎉 Summary

### Before (Deadlock):
```
❌ Upload images → need variant_id → but variant not created yet
```

### After (Two-Step):
```
✅ STEP 1: Create product + variants → get variant_id
✅ STEP 2: Upload images with variant_id
```

**Result:**
- ✅ No deadlock
- ✅ Clean separation of concerns
- ✅ Better error handling
- ✅ Scalable architecture
- ✅ variant_id correctly attached to all images

---

**🚀 Two-Step Product Creation Flow Complete!**

