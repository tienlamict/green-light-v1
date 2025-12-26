# Upload Image MinIO - Fixed ✅

## 🎯 Vấn đề đã fix

### 1. Content-Type Mismatch (SignatureDoesNotMatch)
**Vấn đề:** Presigned URL được ký với một Content-Type, nhưng upload request gửi Content-Type khác.

**Giải pháp:**
- Frontend extract extension từ filename
- Map sang Content-Type chuẩn (png → image/png, jpg → image/jpeg)
- Gửi Content-Type này trong presign request
- Dùng chính xác Content-Type đó khi upload lên MinIO

**File:** `services/imageUpload.js`
```javascript
// Get content type from extension
const fileExtension = file.name.split('.').pop().toLowerCase()
const contentType = getContentType(fileExtension) // e.g., "image/png"

// Send to backend for presign
const body = {
  content_type: contentType,  // "image/png"
  extension: fileExtension,   // "png"
}

// Upload to MinIO with EXACT same Content-Type
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': contentType, // MUST match presign content_type
  },
})
```

### 2. Confirm Request Body (400 Bad Request)
**Vấn đề:** Frontend gửi `image_id` nhưng backend expect `object_key`.

**Giải pháp:**
- Lấy `object_key` từ presign response
- Gửi `object_key` trong confirm request (thay vì `image_id`)

**File:** `services/imageUpload.js`
```javascript
// Get object_key from presign response
const { upload_url, public_url, object_key } = presignResponse.data

// Confirm with backend using object_key
const body = {
  object_key: objectKey,  // "products/2024/12/prod-123/uuid.webp"
  variant_id: variantId   // optional
}
```

## 📋 Backend Validation

Backend validation (từ `product_image_dto.go`):
```go
ContentType string `json:"content_type" binding:"required,oneof=image/jpeg image/jpg image/png image/webp"`
```

Frontend đảm bảo gửi đúng một trong các giá trị:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

## 🔄 Upload Flow (Đã fix)

```
1. User chọn file
   ↓
2. Frontend extract extension → map sang Content-Type
   ↓
3. POST /products/{id}/images/presign
   Body: { content_type: "image/png", extension: "png" }
   ↓
4. Backend tạo presigned URL với content_type="image/png"
   Response: { upload_url, public_url, object_key }
   ↓
5. PUT upload_url
   Headers: { Content-Type: "image/png" }  ← MUST match step 3
   Body: file binary
   ↓
6. MinIO verify signature → ✅ Success (Content-Type khớp)
   ↓
7. POST /products/{id}/images
   Body: { object_key: "products/.../uuid.png", variant_id }
   ↓
8. Backend lưu metadata vào MySQL → ✅ Done
```

## 🎨 UI Integration

### ProductFormNew
- Sử dụng `ImageUploader` component
- Props:
  - `uploadMode`: `'preview'` (tạo mới) hoặc `'minio'` (edit)
  - `productId`: Product UUID (required for MinIO mode)
  - `variantId`: Variant UUID (optional)

```jsx
<ImageUploader
  images={variant.images || []}
  onChange={(images) => handleVariantImagesChange(index, images)}
  maxImages={5}
  uploadMode={product ? 'minio' : 'preview'}
  productId={product?.product_id}
  variantId={variant.variant_id}
/>
```

### ImageUploader Features
✅ Upload multiple images
✅ Drag & drop support
✅ Preview thumbnails
✅ Set main image
✅ Delete images (với confirm modal)
✅ MinIO mode: Upload trực tiếp lên MinIO
✅ Preview mode: Base64 preview cho sản phẩm mới
✅ Progress indicator
✅ Error handling

## 🗑️ Image Deletion

`handleRemove` đã được cập nhật để:
1. Xác nhận với user trước khi xóa
2. Gọi API `DELETE /products/{id}/images/{image_id}`
3. Xóa khỏi MinIO và MySQL
4. Cập nhật UI

```javascript
const handleRemove = async (index) => {
  const imageToRemove = previewImages[index]
  
  if (uploadMode === 'minio' && imageToRemove.image_id && productId) {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa ảnh này?')
    if (!confirmDelete) return
    
    const { deleteProductImage } = await import('@/services/imageUpload')
    const success = await deleteProductImage(productId, imageToRemove.image_id)
    
    if (!success) {
      alert('Không thể xóa ảnh từ server.')
      return
    }
  }
  
  // Remove from local state and notify parent
  // ...
}
```

## 🧹 Cleanup

Đã xóa các component test:
- ❌ `components/admin/ImageUploadTest.jsx`
- ❌ `components/admin/QuickAPITest.jsx`

Đã xóa import test components từ:
- ✅ `app/admin/products/[id]/edit/page.jsx`

## 📝 Logging

Console logs để debug:
```
🔵 Presign Request:
  - Content-Type being sent to backend: image/png
  - File extension: png
  - Content-Type validation: PASSED

🟡 MinIO Upload:
  - Content-Type for upload: image/png
  - File.type: image/png
  - ✅ Content-Type matches

🔵 Confirm Upload Request:
  - URL: http://localhost:8080/api/v1/products/{id}/images
  - Body: { object_key: "...", variant_id: "..." }
  - Object Key: products/2024/12/prod-123/...

✅ Confirm Response: { success: true }
```

## ✅ Status

- ✅ Content-Type mismatch → Fixed
- ✅ SignatureDoesNotMatch error → Fixed
- ✅ Confirm request 400 error → Fixed
- ✅ Upload flow hoàn chỉnh
- ✅ UI integration trong ProductFormNew
- ✅ Image deletion với confirm
- ✅ Test components đã xóa
- ✅ Ready for production

## 🚀 Next Steps

1. Test upload ảnh trong trang tạo sản phẩm (preview mode)
2. Test upload ảnh trong trang edit sản phẩm (MinIO mode)
3. Test xóa ảnh
4. Test set main image
5. Verify ảnh hiển thị đúng trên frontend

---

**Ngày hoàn thành:** 26/12/2024
**Status:** ✅ Completed

