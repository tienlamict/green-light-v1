# MinIO Image Upload Integration Guide

## 🎯 Overview

Tích hợp MinIO để upload ảnh sản phẩm với presigned URL flow.

## 🔄 Upload Flow

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ 1. POST /products/{id}/images/presign
       │    { file_name, variant_id }
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ 2. Generate presigned URL
       ▼
┌─────────────┐
│    MinIO    │
└──────┬──────┘
       │ 3. Return {upload_url, public_url, image_id}
       ▼
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ 4. PUT upload_url (direct upload to MinIO)
       │    Body: File binary
       ▼
┌─────────────┐
│    MinIO    │
└──────┬──────┘
       │ 5. Upload success (200 OK)
       ▼
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ 6. POST /products/{id}/images
       │    { image_id, variant_id }
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ 7. Verify & save metadata to MySQL
       ▼
┌─────────────┐
│    MySQL    │
└─────────────┘
```

## 📁 Files Created

### 1. `services/imageUpload.js`

Service để xử lý upload ảnh qua MinIO.

#### Main Functions:

**`uploadProductImage(productId, file, variantId)`**
- Upload single image
- Returns: `{ success, public_url, image_id }`

**`uploadVariantImages(productId, variantId, files, onProgress)`**
- Upload multiple images
- Progress callback
- Returns: `{ success, images[], errors[] }`

**`deleteProductImage(productId, imageId)`**
- Delete image from MinIO and MySQL
- Returns: `boolean`

### 2. `components/admin/ImageUploader.jsx` (Updated)

Updated to support 2 modes:

#### Mode 1: Preview (Default)
- Show base64 preview
- No upload to server
- For create product form

#### Mode 2: MinIO Upload
- Upload immediately to MinIO
- Show uploaded images
- For edit product form

## 🔧 Implementation

### Step 1: Upload Single Image

```javascript
import { uploadProductImage } from '@/services/imageUpload'

const result = await uploadProductImage(
  'product-uuid',  // Product ID
  fileObject,      // File from input
  'variant-uuid'   // Variant ID (optional)
)

if (result.success) {
  console.log('Image URL:', result.public_url)
  console.log('Image ID:', result.image_id)
} else {
  console.error('Upload failed:', result.error)
}
```

### Step 2: Upload Multiple Images

```javascript
import { uploadVariantImages } from '@/services/imageUpload'

const result = await uploadVariantImages(
  'product-uuid',
  'variant-uuid',
  [file1, file2, file3],
  (current, total) => {
    console.log(`Uploading ${current}/${total}`)
  }
)

if (result.success) {
  result.images.forEach(img => {
    console.log('Uploaded:', img.public_url)
  })
}

if (result.errors.length > 0) {
  console.error('Failed files:', result.errors)
}
```

### Step 3: Use ImageUploader Component

#### Preview Mode (Create Product)

```jsx
<ImageUploader
  images={variant.images}
  onChange={(images) => handleVariantImagesChange(index, images)}
  maxImages={5}
  uploadMode="preview"  // Default
/>
```

#### MinIO Mode (Edit Product)

```jsx
<ImageUploader
  images={variant.images}
  onChange={(images) => handleVariantImagesChange(index, images)}
  maxImages={5}
  uploadMode="minio"
  productId={product.product_id}
  variantId={variant.variant_id}
/>
```

## 📊 API Endpoints

### 1. Get Presigned URL

```http
POST /api/v1/products/{product_id}/images/presign
Authorization: Bearer {token}
Content-Type: application/json

{
  "file_name": "image.jpg",
  "variant_id": "variant-uuid" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_url": "https://minio.example.com/bucket/path?signature=...",
    "public_url": "https://cdn.example.com/products/image.jpg",
    "image_id": "img-uuid"
  }
}
```

### 2. Upload to MinIO

```http
PUT {upload_url}
Content-Type: image/jpeg

<binary file data>
```

**Response:** `200 OK`

### 3. Confirm Upload

```http
POST /api/v1/products/{product_id}/images
Authorization: Bearer {token}
Content-Type: application/json

{
  "image_id": "img-uuid",
  "variant_id": "variant-uuid" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image metadata saved"
}
```

### 4. Delete Image

```http
DELETE /api/v1/products/{product_id}/images/{image_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted"
}
```

## 🎨 UI/UX Flow

### Create Product Flow

1. **User fills product info**
   - Name, description, category
   - Click "Lưu Sản Phẩm"

2. **Product created without images**
   ```
   POST /api/v1/products
   {
     "name": "Product Name",
     "variants": [
       {
         "sku": "SKU-001",
         "images": []  // Empty initially
       }
     ]
   }
   ```

3. **Redirect to edit page**
   ```
   /admin/products/{product_id}/edit
   ```

4. **User uploads images**
   - Images upload to MinIO immediately
   - Each upload creates image record in MySQL

### Edit Product Flow

1. **Load existing product**
   ```
   GET /api/v1/products/{id}
   ```

2. **Show existing images**
   - Load from `public_url`
   - Display in ImageUploader

3. **User adds new images**
   - Upload to MinIO immediately
   - Show progress indicator
   - Add to variant images list

4. **User removes images**
   - Call delete API
   - Remove from MinIO and MySQL
   - Update UI

5. **User saves product**
   - Images already uploaded
   - Just update product metadata

## 🔐 Security

### Authentication
- All API calls require `Authorization: Bearer {token}`
- Token from `localStorage.getItem('auth_token')`

### Presigned URL
- Temporary URL (expires in 15 minutes)
- Direct upload to MinIO (no backend proxy)
- Secure signature validation

### Validation
- File type validation (image/*)
- File size validation (max 10MB)
- Max images per variant (5)

## 🐛 Error Handling

### Error Scenarios

#### 1. Presigned URL Failed
```javascript
{
  success: false,
  error: "Failed to get presigned URL"
}
```
**Solution:** Check authentication, product exists

#### 2. MinIO Upload Failed
```javascript
{
  success: false,
  error: "Failed to upload to MinIO"
}
```
**Solution:** Check network, presigned URL not expired

#### 3. Confirm Upload Failed
```javascript
{
  success: false,
  error: "Failed to confirm image upload"
}
```
**Solution:** Image uploaded but metadata not saved, retry confirm

#### 4. Partial Upload Success
```javascript
{
  success: true,
  images: [{ image_id, public_url }],
  errors: [
    { fileName: "image2.jpg", error: "Upload failed" }
  ]
}
```
**Solution:** Some images uploaded, show which failed

### Error Messages

```javascript
// In ImageUploader component
if (result.errors.length > 0) {
  alert(`Some images failed to upload:\n${result.errors.map(e => e.fileName).join('\n')}`)
}
```

## 🧪 Testing

### Test Upload Flow

```javascript
// 1. Create product
const product = await createProduct({
  name: "Test Product",
  variants: [{ sku: "TEST-001", images: [] }]
})

// 2. Upload image
const file = document.querySelector('input[type=file]').files[0]
const result = await uploadProductImage(
  product.product_id,
  file,
  product.variants[0].variant_id
)

console.log('Upload result:', result)

// 3. Verify image in product
const updated = await fetchProductById(product.product_id)
console.log('Product images:', updated.variants[0].images)
```

### Test Delete Flow

```javascript
// Delete image
const success = await deleteProductImage(
  'product-uuid',
  'image-uuid'
)

console.log('Delete success:', success)
```

### Manual Testing

#### Test Create Product
1. Go to `/admin/products/create`
2. Fill product info
3. **Don't upload images** (preview mode only)
4. Click "Lưu Sản Phẩm"
5. Should create product without images
6. Redirect to edit page

#### Test Upload Images
1. Go to `/admin/products/{id}/edit`
2. Click "Add Image" for variant
3. Select 3 images
4. Should see:
   - Loading spinner
   - Progress: "1 of 3 uploaded"
   - Images appear after upload
5. Check Network tab:
   - POST `/images/presign` (3 times)
   - PUT to MinIO (3 times)
   - POST `/images` (3 times)

#### Test Delete Image
1. In edit page
2. Hover over image
3. Click delete button
4. Should see:
   - DELETE request to API
   - Image removed from UI

## 📝 Example Code

### Complete Upload Example

```javascript
import { uploadVariantImages } from '@/services/imageUpload'

async function handleUploadImages(productId, variantId, files) {
  // Show loading
  setUploading(true)
  
  try {
    const result = await uploadVariantImages(
      productId,
      variantId,
      files,
      (current, total) => {
        setProgress({ current, total })
      }
    )
    
    if (result.success) {
      // Update variant images
      const uploadedImages = result.images.map((img, idx) => ({
        image_id: img.image_id,
        url: img.public_url,
        is_main: idx === 0,
        sort_order: idx
      }))
      
      setVariantImages(prev => [...prev, ...uploadedImages])
      
      // Show errors if any
      if (result.errors.length > 0) {
        alert(`Failed: ${result.errors.map(e => e.fileName).join(', ')}`)
      } else {
        alert('All images uploaded successfully!')
      }
    } else {
      alert('Upload failed. Please try again.')
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('An error occurred during upload')
  } finally {
    setUploading(false)
    setProgress({ current: 0, total: 0 })
  }
}
```

### Complete Delete Example

```javascript
import { deleteProductImage } from '@/services/imageUpload'

async function handleDeleteImage(productId, imageId, imageIndex) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return
  }
  
  try {
    const success = await deleteProductImage(productId, imageId)
    
    if (success) {
      // Remove from UI
      setVariantImages(prev => prev.filter((_, idx) => idx !== imageIndex))
      alert('Image deleted successfully')
    } else {
      alert('Failed to delete image')
    }
  } catch (error) {
    console.error('Delete error:', error)
    alert('An error occurred while deleting')
  }
}
```

## 🎯 Best Practices

### 1. Upload Strategy

**For Create Product:**
- Don't upload images during creation
- Create product first (get product_id)
- Redirect to edit page
- Upload images there

**For Edit Product:**
- Upload images immediately when selected
- No need to click "Save" for images
- Images are independent of product metadata

### 2. Progress Indication

```jsx
{uploading && (
  <div className="text-center">
    <Loader2 className="animate-spin" />
    <p>Uploading {uploadProgress.current} of {uploadProgress.total}</p>
  </div>
)}
```

### 3. Error Recovery

```javascript
// Retry failed uploads
if (result.errors.length > 0) {
  const failedFiles = result.errors.map(e => e.fileName)
  if (confirm(`Retry failed uploads: ${failedFiles.join(', ')}?`)) {
    // Get failed files and retry
    const retryFiles = files.filter(f => failedFiles.includes(f.name))
    await uploadVariantImages(productId, variantId, retryFiles)
  }
}
```

### 4. Image Validation

```javascript
function validateImage(file) {
  // Check type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Not an image file' }
  }
  
  // Check size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 10MB)' }
  }
  
  return { valid: true }
}
```

## 📚 Related Files

- `services/imageUpload.js` - Upload service
- `components/admin/ImageUploader.jsx` - Upload component
- `components/admin/ProductFormNew.jsx` - Product form
- `app/admin/products/create/page.jsx` - Create page
- `app/admin/products/[id]/edit/page.jsx` - Edit page

## ✅ Checklist

### Implementation
- [x] Create imageUpload service
- [x] Update ImageUploader component
- [x] Add preview mode
- [x] Add MinIO upload mode
- [x] Add progress indicator
- [x] Add error handling
- [ ] Update ProductFormNew for create flow
- [ ] Update edit page for MinIO mode
- [ ] Add delete image functionality

### Testing
- [ ] Test presigned URL generation
- [ ] Test MinIO upload
- [ ] Test confirm upload
- [ ] Test multiple images upload
- [ ] Test upload progress
- [ ] Test error handling
- [ ] Test delete image
- [ ] Test create product flow
- [ ] Test edit product flow

---

**Date:** December 26, 2025
**Status:** 🚧 In Progress
**Version:** 1.0.0

