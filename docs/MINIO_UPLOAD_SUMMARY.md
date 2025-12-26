# MinIO Upload Integration - Summary

## ✅ Hoàn Thành

Đã tích hợp MinIO để upload ảnh sản phẩm với presigned URL flow.

## 🔄 Upload Flow

```
Frontend → Backend (presign) → MinIO (generate URL) 
→ Frontend (direct upload) → MinIO (store file)
→ Frontend (confirm) → Backend (save metadata) → MySQL
```

## 📁 Files Created/Updated

### 1. `services/imageUpload.js` ✅ NEW
Service xử lý upload ảnh qua MinIO presigned URLs.

**Functions:**
- `uploadProductImage(productId, file, variantId)` - Upload single image
- `uploadVariantImages(productId, variantId, files, onProgress)` - Upload multiple with progress
- `deleteProductImage(productId, imageId)` - Delete image

### 2. `components/admin/ImageUploader.jsx` ✅ UPDATED
Component upload ảnh với 2 modes:

**Preview Mode (Default):**
- Show base64 preview only
- No server upload
- For create product

**MinIO Mode:**
- Upload immediately to MinIO
- Show progress
- For edit product

**New Props:**
- `uploadMode`: 'preview' | 'minio'
- `productId`: Product UUID for MinIO upload
- `variantId`: Variant UUID for MinIO upload

### 3. `components/admin/ProductFormNew.jsx` ✅ UPDATED
**Changes:**
- Filter out base64 images when submitting
- Only send real URLs (from MinIO) to API
- Skip images with `data:image` prefix

## 🎯 How It Works

### Create Product Flow

```
1. User fills product info
   ↓
2. User uploads images (preview mode)
   → Shows base64 preview only
   → NOT uploaded to server
   ↓
3. Click "Lưu Sản Phẩm"
   → Filter out base64 images
   → Create product WITHOUT images
   ↓
4. Product created successfully
   ↓
5. Redirect to edit page
   ↓
6. User can upload images (MinIO mode)
   → Upload to MinIO immediately
   → Save to database
```

### Edit Product Flow

```
1. Load existing product
   → Show existing images from MinIO URLs
   ↓
2. User adds new images (MinIO mode)
   → Get presigned URL
   → Upload to MinIO directly
   → Confirm with backend
   → Add to variant images
   ↓
3. User removes images
   → Call delete API
   → Remove from MinIO and MySQL
   ↓
4. User saves product
   → Images already uploaded
   → Just update product metadata
```

## 📊 API Calls

### 1. Get Presigned URL
```http
POST /api/v1/products/{product_id}/images/presign
Authorization: Bearer {token}

{
  "file_name": "image.jpg",
  "variant_id": "variant-uuid"
}

Response:
{
  "success": true,
  "data": {
    "upload_url": "https://minio.../presigned-url",
    "public_url": "https://cdn.../image.jpg",
    "image_id": "img-uuid"
  }
}
```

### 2. Upload to MinIO
```http
PUT {upload_url}
Content-Type: image/jpeg

<binary file data>

Response: 200 OK
```

### 3. Confirm Upload
```http
POST /api/v1/products/{product_id}/images
Authorization: Bearer {token}

{
  "image_id": "img-uuid",
  "variant_id": "variant-uuid"
}

Response:
{
  "success": true,
  "message": "Image metadata saved"
}
```

### 4. Delete Image
```http
DELETE /api/v1/products/{product_id}/images/{image_id}
Authorization: Bearer {token}

Response:
{
  "success": true
}
```

## 🔧 Usage Examples

### Example 1: Upload Single Image

```javascript
import { uploadProductImage } from '@/services/imageUpload'

const result = await uploadProductImage(
  'product-uuid',
  fileObject,
  'variant-uuid'
)

if (result.success) {
  console.log('Image uploaded:', result.public_url)
}
```

### Example 2: Upload Multiple Images

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

console.log('Uploaded:', result.images)
console.log('Errors:', result.errors)
```

### Example 3: ImageUploader Component

**Preview Mode (Create):**
```jsx
<ImageUploader
  images={variant.images}
  onChange={(images) => handleVariantImagesChange(index, images)}
  maxImages={5}
  uploadMode="preview"  // Default
/>
```

**MinIO Mode (Edit):**
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

## 🎨 UI Features

### Upload Progress
```jsx
{uploading && (
  <div className="text-center">
    <Loader2 className="animate-spin" />
    <p>Uploading {uploadProgress.current} of {uploadProgress.total}</p>
  </div>
)}
```

### Success/Error Messages
```javascript
if (result.success) {
  alert('All images uploaded successfully!')
}

if (result.errors.length > 0) {
  alert(`Failed: ${result.errors.map(e => e.fileName).join(', ')}`)
}
```

## 🐛 Error Handling

### Handled Errors

1. **Presigned URL Failed**
   - Check authentication
   - Verify product exists

2. **MinIO Upload Failed**
   - Check network connection
   - Verify presigned URL not expired

3. **Confirm Upload Failed**
   - Image uploaded but metadata not saved
   - Can retry confirm step

4. **Partial Upload**
   - Some images succeed, some fail
   - Show which files failed
   - Allow retry

## ✅ Benefits

### 1. No 500 Error
- ❌ Before: Send base64 → Large payload → 500 error
- ✅ After: Filter base64 → Only URLs → Success

### 2. Direct Upload
- ❌ Before: File → Backend → MinIO (slow, heavy)
- ✅ After: File → MinIO directly (fast, light)

### 3. Progress Tracking
- ✅ Show upload progress
- ✅ Show which file is uploading
- ✅ Better UX

### 4. Separate Concerns
- ✅ Images independent of product
- ✅ Can upload/delete anytime
- ✅ No need to save product to upload images

## 🧪 Testing

### Test Create Product

```
1. Go to /admin/products/create
2. Fill product info
3. Upload 3 images (preview mode)
   → Should see base64 previews
   → NOT uploaded to server
4. Click "Lưu Sản Phẩm"
   → Should create product WITHOUT images
   → No 500 error
5. Redirect to edit page
6. Upload images there (MinIO mode)
```

### Test Edit Product

```
1. Go to /admin/products/{id}/edit
2. See existing images
3. Click "Add Image"
4. Select 2 images
5. Should see:
   - Loading spinner
   - "Uploading 1 of 2"
   - "Uploading 2 of 2"
   - Images appear
6. Check Network tab:
   - POST /images/presign (2x)
   - PUT to MinIO (2x)
   - POST /images (2x)
```

### Test Delete Image

```
1. In edit page
2. Hover over image
3. Click delete button
4. Should see:
   - DELETE /images/{id}
   - Image removed from UI
```

## 📝 Migration Path

### For Existing Products

If you have products with base64 images in database:

```javascript
// Migration script (run once)
async function migrateBase64Images() {
  const products = await fetchAllProducts()
  
  for (const product of products) {
    for (const variant of product.variants) {
      const base64Images = variant.images.filter(img => 
        img.url.startsWith('data:image')
      )
      
      if (base64Images.length > 0) {
        console.log(`Migrating ${base64Images.length} images for ${product.name}`)
        
        // Convert base64 to files
        const files = base64Images.map(img => base64ToFile(img.url))
        
        // Upload to MinIO
        const result = await uploadVariantImages(
          product.product_id,
          variant.variant_id,
          files
        )
        
        console.log(`Migrated: ${result.images.length} images`)
      }
    }
  }
}
```

## 🎯 Next Steps

### Required Backend Endpoints

Make sure backend implements these endpoints:

1. ✅ `POST /products/{id}/images/presign`
2. ✅ `POST /products/{id}/images`
3. ✅ `DELETE /products/{id}/images/{image_id}`

### Optional Enhancements

1. **Image Compression**
   - Compress before upload
   - Reduce file size

2. **Thumbnail Generation**
   - Generate thumbnails on backend
   - Faster loading

3. **Drag & Drop Reorder**
   - Reorder images
   - Update sort_order

4. **Bulk Delete**
   - Delete multiple images
   - Faster cleanup

## 📚 Documentation

- **MINIO_UPLOAD_GUIDE.md** - Complete guide
- **MINIO_UPLOAD_SUMMARY.md** - This file
- **services/imageUpload.js** - Service code
- **components/admin/ImageUploader.jsx** - Component code

## 🎉 Result

✅ **No more 500 error when creating products with images**
✅ **Fast direct upload to MinIO**
✅ **Progress tracking**
✅ **Better error handling**
✅ **Cleaner code separation**

---

**Date:** December 26, 2025
**Status:** ✅ Complete
**Version:** 1.0.0

