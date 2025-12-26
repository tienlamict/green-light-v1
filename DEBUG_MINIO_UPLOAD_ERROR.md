# Debug MinIO Upload Error

## 🔴 Current Error

```
Error: Failed to upload to MinIO
```

Presign thành công ✅, nhưng upload lên MinIO thất bại ❌

## 🔍 Debug Steps

### Bước 1: Check Console Logs

Sau khi thêm logging, refresh và upload lại. Console sẽ hiển thị:

```
🔵 Presign Response Status: 200 ✅

🟡 MinIO Upload:
URL: https://minio.../presigned-url?signature=...
File: { name: "test.jpg", size: 123456, type: "image/jpeg" }

🟡 MinIO Response Status: ??? 
🟡 MinIO Response OK: false ❌

🔴 MinIO Error Response: ...
```

**Cần biết:**
1. MinIO Response Status là gì? (403, 404, 500?)
2. MinIO Error Response nói gì?

### Bước 2: Common Issues

#### Issue 1: CORS Error

**Console shows:**
```
Access to fetch at 'https://minio...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Cause:** MinIO CORS not configured for localhost

**Fix:** Configure MinIO CORS:
```bash
mc alias set myminio http://minio-server:9000 ACCESS_KEY SECRET_KEY
mc anonymous set-json myminio/bucket-name cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

#### Issue 2: Presigned URL Expired

**Console shows:**
```
🟡 MinIO Response Status: 403 Forbidden
```

**Cause:** Presigned URL has expired (usually 15 min)

**Fix:** 
- Upload immediately after getting presigned URL
- Backend should increase expiry time

#### Issue 3: Wrong Content-Type

**Console shows:**
```
🟡 MinIO Response Status: 400 Bad Request
```

**Cause:** Content-Type in PUT request doesn't match presigned URL

**Fix:** Ensure file.type matches content_type in presign request

#### Issue 4: MinIO Server Not Accessible

**Console shows:**
```
🔴 MinIO Upload Error: TypeError: Failed to fetch
```

**Cause:** 
- MinIO server not running
- Network issue
- Wrong URL

**Fix:**
- Check MinIO server status
- Verify presigned URL is accessible
- Test URL in browser

#### Issue 5: File Too Large

**Console shows:**
```
🟡 MinIO Response Status: 413 Payload Too Large
```

**Cause:** File exceeds MinIO size limit

**Fix:** 
- Compress image before upload
- Increase MinIO size limit

### Bước 3: Test Presigned URL Manually

Copy presigned URL from console and test:

```bash
# Get the presigned URL from console
PRESIGNED_URL="https://minio.../path?signature=..."

# Test with curl
curl -X PUT "$PRESIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-image.jpg" \
  -v

# Should return 200 OK
```

If curl works but browser doesn't → CORS issue

### Bước 4: Check MinIO Server

```bash
# Check MinIO is running
curl http://minio-server:9000/minio/health/live

# Should return 200 OK

# Check bucket exists
mc ls myminio/bucket-name

# Check bucket policy
mc policy get myminio/bucket-name
```

## 🔧 Quick Fixes

### Fix 1: Add CORS to MinIO

```bash
# Create CORS config
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length"]
    }
  ]
}
EOF

# Apply CORS
mc anonymous set-json myminio/bucket-name cors.json
```

### Fix 2: Test Without CORS (Backend Proxy)

If CORS is the issue, upload through backend instead:

```javascript
// Alternative: Upload through backend
async function uploadViaBackend(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  return response.json()
}
```

### Fix 3: Increase Presigned URL Expiry

In backend:
```go
// Increase expiry from 15 min to 1 hour
presignedURL, err := minioClient.PresignedPutObject(
    ctx, 
    bucketName, 
    objectName, 
    time.Hour, // Changed from 15*time.Minute
)
```

## 📊 Expected Flow

### Success Flow:

```
1. Get Presign URL
   POST /images/presign
   → 200 OK
   → { upload_url, public_url, image_id }

2. Upload to MinIO
   PUT upload_url
   → 200 OK ✅

3. Confirm Upload
   POST /images
   → 200 OK
```

### Current Flow (Failed):

```
1. Get Presign URL
   POST /images/presign
   → 200 OK ✅

2. Upload to MinIO
   PUT upload_url
   → ??? (Failed) ❌

3. Confirm Upload
   (Not reached)
```

## 🎯 Action Items

1. **Refresh page and upload again**
2. **Check console logs** - Copy all logs with 🟡 and 🔴
3. **Note MinIO Response Status** (403? 404? 500? CORS?)
4. **Copy presigned URL** and test with curl
5. **Report findings:**
   - What status code?
   - What error message?
   - CORS error?
   - Network error?

## 📝 Report Template

```
MinIO Upload Failed

Console Logs:
🟡 MinIO Response Status: ???
🟡 MinIO Response OK: false
🔴 MinIO Error Response: ???

Presigned URL:
https://minio.../...?signature=...

File Info:
- Name: test.jpg
- Size: 123456
- Type: image/jpeg

Browser: Chrome/Firefox/Safari
Network Tab: (screenshot or details)
```

---

**Refresh page, upload lại, và copy toàn bộ console logs!**

Đặc biệt chú ý:
- MinIO Response Status (số nào?)
- Error message (nội dung gì?)
- Có CORS error không?

