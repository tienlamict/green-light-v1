# Debug MinIO Upload - Quick Guide

## 🎯 Đã Thêm Test Component

Đã thêm component test vào trang edit product để debug upload flow.

## 🧪 Cách Test

### Bước 1: Mở Trang Edit

```
http://localhost:3000/admin/products/{product-id}/edit
```

Bạn sẽ thấy một **blue box** ở đầu trang với title "🧪 MinIO Upload Test"

### Bước 2: Mở Developer Tools

1. Press `F12` hoặc Right-click → Inspect
2. Chọn tab **Console**
3. Chọn tab **Network**

### Bước 3: Upload Test Image

1. Click "Choose File" trong test box
2. Select một ảnh bất kỳ
3. Quan sát:
   - **Console logs** - Xem chi tiết từng bước
   - **Network requests** - Xem API calls

## 📊 Kết Quả Mong Đợi

### ✅ Nếu Thành Công

**Console sẽ hiển thị:**
```
=== TEST UPLOAD START ===
Product ID: adffba72-8ab4-4e04-901e-8364ecb9c817
Variant ID: variant-uuid-123
File: test-image.jpg 123456 image/jpeg
=== START UPLOAD ===
Step 1: Getting presigned URL...
Presign response: { success: true, data: {...} }
Got URLs: { upload_url: "...", public_url: "...", image_id: "..." }
Step 2: Uploading to MinIO...
MinIO upload result: true
Step 3: Confirming upload...
Confirm response: { success: true }
=== UPLOAD SUCCESS ===
Upload result: { success: true, public_url: "...", image_id: "..." }
```

**Network sẽ có 3 requests:**
1. `POST /api/v1/products/{id}/images/presign` → 200 OK
2. `PUT https://minio.../presigned-url` → 200 OK
3. `POST /api/v1/products/{id}/images` → 200 OK

**UI sẽ hiển thị:**
- ✅ Status: Success!
- Image ID: img-xxx
- Public URL: https://...
- Ảnh được hiển thị

### ❌ Nếu Thất Bại

Kiểm tra **từng bước** để tìm lỗi:

## 🔍 Debug Từng Bước

### Lỗi 1: Product ID hoặc Variant ID không có

**Hiển thị trong test box:**
```
Product ID: Not set
Variant ID: Not set
```

**Nguyên nhân:**
- Product chưa load xong
- Product không có variants

**Fix:**
- Đợi product load xong
- Thêm variant cho product

### Lỗi 2: POST /images/presign → 404 Not Found

**Console:**
```
Step 1: Getting presigned URL...
Error: HTTP error! status: 404
```

**Nguyên nhân:**
- Backend endpoint chưa được implement

**Fix:**
```bash
# Check backend có endpoint này không
curl http://localhost:8080/api/v1/products/test/images/presign

# Nếu 404 → Backend chưa có endpoint
# Cần implement endpoint này trong backend
```

### Lỗi 3: POST /images/presign → 401 Unauthorized

**Console:**
```
Step 1: Getting presigned URL...
Error: HTTP error! status: 401
```

**Nguyên nhân:**
- Token không có hoặc hết hạn

**Fix:**
```javascript
// Check token
console.log(localStorage.getItem('auth_token'))

// If null or expired, re-login
window.location.href = '/admin/login'
```

### Lỗi 4: POST /images/presign → 500 Internal Server Error

**Console:**
```
Step 1: Getting presigned URL...
Error: HTTP error! status: 500
```

**Nguyên nhân:**
- Backend error
- MinIO not configured
- Database error

**Fix:**
- Check backend logs
- Check MinIO connection
- Check database

### Lỗi 5: PUT MinIO → Failed

**Console:**
```
Step 2: Uploading to MinIO...
MinIO upload result: false
```

**Nguyên nhân:**
- Presigned URL không đúng
- MinIO không accessible
- CORS issue
- Network error

**Fix:**
```javascript
// Check presigned URL
console.log('Upload URL:', upload_url)

// Try manual upload
fetch(upload_url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Error:', e))
```

### Lỗi 6: POST /images (confirm) → Failed

**Console:**
```
Step 3: Confirming upload...
Error: Failed to confirm image upload
```

**Nguyên nhân:**
- Image uploaded to MinIO but metadata not saved
- Backend validation error

**Fix:**
- Check backend logs
- Retry confirm step
- Check database

## 🎯 Quick Checklist

### Frontend
- [ ] Product ID exists and is valid UUID
- [ ] Variant ID exists and is valid UUID
- [ ] Token exists in localStorage
- [ ] No console errors before upload
- [ ] Network tab is open

### Backend
- [ ] Backend server is running (port 8080)
- [ ] Presign endpoint exists: `POST /products/{id}/images/presign`
- [ ] Confirm endpoint exists: `POST /products/{id}/images`
- [ ] Authentication middleware working
- [ ] MinIO client configured

### MinIO
- [ ] MinIO server is running
- [ ] Bucket exists
- [ ] Bucket policy allows public read
- [ ] Presigned URL generation working
- [ ] Network accessible from browser

## 📝 Test Commands

### Test Backend Presign

```bash
# Get token first
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# Test presign
curl -X POST http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test.jpg",
    "variant_id": "variant-id"
  }'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "upload_url": "https://minio.../presigned-url",
    "public_url": "https://cdn.../image.jpg",
    "image_id": "img-uuid"
  }
}
```

### Test MinIO Direct Upload

```bash
# Get presigned URL from above
UPLOAD_URL="https://minio.../presigned-url"

# Upload test file
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-image.jpg"

# Should return 200 OK
```

### Test Confirm

```bash
curl -X POST http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_id": "img-uuid",
    "variant_id": "variant-id"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Image metadata saved"
}
```

## 🎨 Test Box Features

### Status Colors

- 🟡 **Yellow** - Uploading...
- 🟢 **Green** - Success!
- 🔴 **Red** - Failed / Error

### Information Displayed

- Product ID
- Variant ID
- Upload status
- Image ID (on success)
- Public URL (on success)
- Uploaded image preview (on success)
- Error message (on failure)

## 🚀 Next Steps

### If Test Succeeds:
1. ✅ MinIO upload is working
2. Remove test component
3. Use normal ImageUploader in form
4. Upload images for variants

### If Test Fails:
1. Note which step fails
2. Check console logs
3. Check network requests
4. Check backend logs
5. Fix the failing step
6. Retry

## 📞 Report Issues

When reporting issues, provide:

1. **Console logs** (copy all logs)
2. **Network requests** (screenshot or copy)
3. **Error messages** (exact text)
4. **Which step fails** (Step 1, 2, or 3)
5. **Backend logs** (if available)

### Example Report:

```
❌ Upload Failed at Step 1

Console:
=== TEST UPLOAD START ===
Product ID: adffba72-8ab4-4e04-901e-8364ecb9c817
Variant ID: cd332d95-c998-4abe-aefb-efd7859bb5c8
File: test.jpg 123456 image/jpeg
Step 1: Getting presigned URL...
Error: HTTP error! status: 404

Network:
POST http://localhost:8080/api/v1/products/.../images/presign
Status: 404 Not Found

Issue: Backend endpoint not found
```

## 🔧 Remove Test Component

Sau khi test xong, remove test component:

```javascript
// In app/admin/products/[id]/edit/page.jsx
// Remove these lines:
import ImageUploadTest from '@/components/admin/ImageUploadTest'

<ImageUploadTest 
  productId={product.product_id}
  variantId={product.variants?.[0]?.variant_id}
/>
```

---

**Hãy test ngay và báo cáo kết quả!**

1. Mở trang edit
2. Thấy blue test box
3. Upload một ảnh
4. Xem console và network
5. Báo cáo kết quả hoặc lỗi

