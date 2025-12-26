# Test MinIO Upload Flow

## 🧪 Kiểm Tra Từng Bước

### Bước 1: Kiểm Tra Backend API

#### Test Presign Endpoint

```bash
# Login trước để lấy token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Response sẽ có token
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  }
}

# Lưu token vào biến
TOKEN="eyJhbGc..."

# Test presign endpoint
curl -X POST http://localhost:8080/api/v1/products/{product_id}/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test-image.jpg",
    "variant_id": "{variant_id}"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "upload_url": "https://minio.example.com/bucket/path?signature=...",
    "public_url": "https://cdn.example.com/products/test-image.jpg",
    "image_id": "img-uuid-123"
  }
}
```

**Nếu lỗi:**
- ❌ 404: Endpoint chưa được implement
- ❌ 401: Token không hợp lệ
- ❌ 500: Backend error

### Bước 2: Kiểm Tra Frontend Console

Mở Browser Console (F12) và chạy:

```javascript
// Test import service
import { uploadProductImage } from '@/services/imageUpload'

// Check if function exists
console.log('uploadProductImage:', typeof uploadProductImage)
// Should print: "function"

// Check localStorage token
const token = localStorage.getItem('auth_token')
console.log('Token:', token ? 'exists' : 'missing')

// Check product ID
console.log('Product ID:', product?.product_id)
```

### Bước 3: Test Upload từ UI

#### Trong Edit Page:

1. **Mở Network Tab** (F12 → Network)
2. **Click "Add Image"** cho một variant
3. **Select một ảnh**
4. **Quan sát Network Tab:**

**Nên thấy 3 requests:**

```
1. POST /api/v1/products/{id}/images/presign
   Request:
   {
     "file_name": "image.jpg",
     "variant_id": "variant-uuid"
   }
   
   Response:
   {
     "upload_url": "...",
     "public_url": "...",
     "image_id": "..."
   }

2. PUT https://minio.../presigned-url
   Body: <binary image data>
   
   Response: 200 OK

3. POST /api/v1/products/{id}/images
   Request:
   {
     "image_id": "img-uuid",
     "variant_id": "variant-uuid"
   }
   
   Response:
   {
     "success": true
   }
```

### Bước 4: Kiểm Tra Console Logs

Trong Browser Console, nên thấy:

```javascript
// If upload starts
"Uploading image..."

// If presign succeeds
"Presigned URL received:", { upload_url, public_url, image_id }

// If MinIO upload succeeds
"MinIO upload successful"

// If confirm succeeds
"Image confirmed:", image_id

// If complete
"Upload complete:", { success: true, public_url, image_id }
```

### Bước 5: Debug Service

Thêm console.log vào `services/imageUpload.js`:

```javascript
export async function uploadProductImage(productId, file, variantId = null) {
  console.log('=== START UPLOAD ===')
  console.log('Product ID:', productId)
  console.log('File:', file.name, file.size, file.type)
  console.log('Variant ID:', variantId)
  
  try {
    // Step 1
    console.log('Step 1: Getting presigned URL...')
    const presignResponse = await getPresignedUrl(productId, file.name, variantId)
    console.log('Presign response:', presignResponse)
    
    if (!presignResponse.success) {
      console.error('Presign failed:', presignResponse.error)
      throw new Error(presignResponse.error)
    }

    const { upload_url, public_url, image_id } = presignResponse.data
    console.log('Got URLs:', { upload_url, public_url, image_id })

    // Step 2
    console.log('Step 2: Uploading to MinIO...')
    const uploadSuccess = await uploadToMinIO(upload_url, file)
    console.log('MinIO upload result:', uploadSuccess)
    
    if (!uploadSuccess) {
      console.error('MinIO upload failed')
      throw new Error('Failed to upload to MinIO')
    }

    // Step 3
    console.log('Step 3: Confirming upload...')
    const confirmResponse = await confirmImageUpload(productId, image_id, variantId)
    console.log('Confirm response:', confirmResponse)
    
    if (!confirmResponse.success) {
      console.error('Confirm failed')
      throw new Error('Failed to confirm image upload')
    }

    console.log('=== UPLOAD SUCCESS ===')
    return {
      success: true,
      public_url,
      image_id
    }
  } catch (error) {
    console.error('=== UPLOAD ERROR ===', error)
    return {
      success: false,
      error: error.message
    }
  }
}
```

## 🔍 Common Issues

### Issue 1: Không thấy request nào

**Nguyên nhân:**
- `uploadMode` vẫn là 'preview'
- `productId` hoặc `variantId` bị null

**Kiểm tra:**
```javascript
// In ProductFormNew, add console.log
<ImageUploader
  uploadMode={product ? 'minio' : 'preview'}  // Check this
  productId={product?.product_id}  // Check this
  variantId={variant.variant_id}   // Check this
/>

// Add before ImageUploader
console.log('Upload mode:', product ? 'minio' : 'preview')
console.log('Product ID:', product?.product_id)
console.log('Variant ID:', variant.variant_id)
```

### Issue 2: Request 404 Not Found

**Nguyên nhân:**
- Backend endpoint chưa được implement
- URL không đúng

**Kiểm tra:**
```bash
# Test endpoint exists
curl http://localhost:8080/api/v1/products/test-id/images/presign

# Should return 401 (unauthorized) not 404
```

**Fix:**
- Implement backend endpoint
- Check API_BASE_URL in `.env.local`

### Issue 3: Request 401 Unauthorized

**Nguyên nhân:**
- Token không có hoặc hết hạn
- Token không được gửi trong header

**Kiểm tra:**
```javascript
// Check token
const token = localStorage.getItem('auth_token')
console.log('Token:', token)

// Check if token is sent
// In Network tab, check request headers:
// Authorization: Bearer eyJhbGc...
```

**Fix:**
```javascript
// Re-login
window.location.href = '/admin/login'
```

### Issue 4: Request 500 Internal Server Error

**Nguyên nhân:**
- Backend error
- MinIO not configured
- Database error

**Kiểm tra:**
- Check backend logs
- Check MinIO connection
- Check database

### Issue 5: MinIO Upload Failed

**Nguyên nhân:**
- Presigned URL expired
- Network error
- CORS issue

**Kiểm tra:**
```javascript
// In uploadToMinIO, add logs
async function uploadToMinIO(uploadUrl, file) {
  console.log('Uploading to:', uploadUrl)
  console.log('File type:', file.type)
  
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
    
    console.log('MinIO response status:', response.status)
    console.log('MinIO response ok:', response.ok)
    
    return response.ok
  } catch (error) {
    console.error('MinIO upload error:', error)
    return false
  }
}
```

### Issue 6: Confirm Failed

**Nguyên nhân:**
- Image uploaded but metadata not saved
- Backend validation error

**Kiểm tra:**
- Check backend logs
- Check if image exists in MinIO
- Retry confirm step

## 🎯 Quick Debug Checklist

### Frontend Checklist
- [ ] Token exists in localStorage
- [ ] Product ID is valid UUID
- [ ] Variant ID is valid UUID
- [ ] uploadMode is 'minio' (not 'preview')
- [ ] ImageUploader receives correct props
- [ ] No console errors
- [ ] Network tab shows requests

### Backend Checklist
- [ ] Presign endpoint implemented
- [ ] Confirm endpoint implemented
- [ ] MinIO configured
- [ ] Database connection OK
- [ ] Authentication working
- [ ] CORS configured for MinIO

### MinIO Checklist
- [ ] MinIO server running
- [ ] Bucket exists
- [ ] Bucket policy allows upload
- [ ] Presigned URL not expired
- [ ] Network accessible

## 🧪 Manual Test Script

Copy paste vào Browser Console:

```javascript
// Test complete upload flow
async function testUpload() {
  console.log('=== TESTING UPLOAD FLOW ===')
  
  // 1. Check prerequisites
  const token = localStorage.getItem('auth_token')
  if (!token) {
    console.error('❌ No auth token')
    return
  }
  console.log('✅ Token exists')
  
  // 2. Get product ID from URL
  const url = window.location.pathname
  const match = url.match(/\/products\/([^\/]+)\/edit/)
  if (!match) {
    console.error('❌ Not on edit page')
    return
  }
  const productId = match[1]
  console.log('✅ Product ID:', productId)
  
  // 3. Create test file
  const canvas = document.createElement('canvas')
  canvas.width = 100
  canvas.height = 100
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 100, 100)
  
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
    console.log('✅ Test file created:', file.name, file.size)
    
    // 4. Import and call upload function
    const { uploadProductImage } = await import('./services/imageUpload.js')
    
    console.log('📤 Starting upload...')
    const result = await uploadProductImage(productId, file, null)
    
    if (result.success) {
      console.log('✅ UPLOAD SUCCESS!')
      console.log('Public URL:', result.public_url)
      console.log('Image ID:', result.image_id)
    } else {
      console.error('❌ UPLOAD FAILED:', result.error)
    }
  }, 'image/jpeg')
}

// Run test
testUpload()
```

## 📊 Expected Flow

### Success Flow:

```
1. User clicks "Add Image"
   ↓
2. File selected
   ↓
3. handleFileSelect triggered
   ↓
4. uploadMode === 'minio' → handleMinIOUpload
   ↓
5. POST /images/presign
   → Response: { upload_url, public_url, image_id }
   ↓
6. PUT upload_url (to MinIO)
   → Response: 200 OK
   ↓
7. POST /images (confirm)
   → Response: { success: true }
   ↓
8. Image added to UI
   ↓
9. User sees uploaded image
```

### Error Flow:

```
1. User clicks "Add Image"
   ↓
2. File selected
   ↓
3. handleFileSelect triggered
   ↓
4. POST /images/presign
   → Response: 401 Unauthorized
   ↓
5. Alert: "Failed to upload images"
   ↓
6. Check console for error details
```

## 🎯 Next Steps

### If presign works but MinIO fails:
1. Check MinIO server status
2. Check presigned URL format
3. Check CORS configuration
4. Check network connectivity

### If presign fails:
1. Check backend logs
2. Verify endpoint exists
3. Check authentication
4. Check request format

### If confirm fails:
1. Image is in MinIO but not in database
2. Check backend validation
3. Retry confirm step
4. Check database connection

---

**Run these tests and report back:**
1. What do you see in Network tab?
2. What do you see in Console?
3. Any error messages?
4. Which step fails?

