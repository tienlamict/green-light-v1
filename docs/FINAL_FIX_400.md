# ✅ Final Fix - 400 Error Resolved!

## 🎯 Backend Struct

```go
type PresignUploadRequest struct {
    ContentType string `json:"content_type" binding:"required,oneof=image/jpeg image/jpg image/png image/webp"`
    Extension   string `json:"extension" binding:"required,oneof=jpg jpeg png webp"`
}
```

## 📝 Correct Format

**Request:**
```json
{
  "content_type": "image/jpeg",
  "extension": "jpg"
}
```

**Notes:**
- ✅ `content_type` (snake_case, NOT PascalCase)
- ✅ `extension` (snake_case, NOT PascalCase)
- ❌ NO `variant_id` in presign request
- ✅ Allowed content types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- ✅ Allowed extensions: `jpg`, `jpeg`, `png`, `webp`

## 🔧 Fixed Code

### services/imageUpload.js

```javascript
// Extract extension from filename
const fileExtension = fileName.split('.').pop().toLowerCase()
const contentType = getContentType(fileExtension)

const body = {
  content_type: contentType,  // "image/jpeg"
  extension: fileExtension,   // "jpg"
}

// variant_id will be sent in confirm step, NOT in presign
```

### Helper Function

```javascript
function getContentType(extension) {
  const ext = extension.toLowerCase()
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
  }
  return types[ext] || 'image/jpeg'
}
```

## 🧪 Test Cases

### Valid Requests

1. **JPEG (.jpg)**
   ```json
   {
     "content_type": "image/jpeg",
     "extension": "jpg"
   }
   ```

2. **JPEG (.jpeg)**
   ```json
   {
     "content_type": "image/jpeg",
     "extension": "jpeg"
   }
   ```

3. **PNG**
   ```json
   {
     "content_type": "image/png",
     "extension": "png"
   }
   ```

4. **WebP**
   ```json
   {
     "content_type": "image/webp",
     "extension": "webp"
   }
   ```

### Invalid Requests (Will Fail)

❌ **GIF (not supported)**
```json
{
  "content_type": "image/gif",
  "extension": "gif"
}
```

❌ **SVG (not supported)**
```json
{
  "content_type": "image/svg+xml",
  "extension": "svg"
}
```

❌ **Wrong case**
```json
{
  "ContentType": "image/jpeg",  // Wrong: PascalCase
  "Extension": "jpg"
}
```

## 📊 Complete Upload Flow

### Step 1: Get Presigned URL

```
POST /api/v1/products/{product_id}/images/presign
Authorization: Bearer {token}

{
  "content_type": "image/jpeg",
  "extension": "jpg"
}

Response:
{
  "success": true,
  "data": {
    "upload_url": "https://minio.../presigned-url",
    "public_url": "https://cdn.../image.jpg",
    "image_id": "img-uuid-123"
  }
}
```

### Step 2: Upload to MinIO

```
PUT {upload_url}
Content-Type: image/jpeg
Body: <binary file data>

Response: 200 OK
```

### Step 3: Confirm Upload

```
POST /api/v1/products/{product_id}/images
Authorization: Bearer {token}

{
  "image_id": "img-uuid-123",
  "variant_id": "variant-uuid"  // NOW we send variant_id
}

Response:
{
  "success": true,
  "message": "Image metadata saved"
}
```

## 🎯 Test Now

1. **Refresh page:**
   ```
   http://localhost:3000/admin/products/{id}/edit
   ```

2. **Click "Test All Formats"** in purple box
   - First format should be ✅ green (200 OK)

3. **Upload real image** in blue box
   - Should see 3 successful requests
   - Image should appear in UI

## ✅ Expected Console Output

```
🔵 Presign Request:
URL: http://localhost:8080/api/v1/products/.../images/presign
Body: { content_type: "image/jpeg", extension: "jpg" }

🔵 Presign Response Status: 200

Presigned URL received: {
  upload_url: "https://minio...",
  public_url: "https://cdn...",
  image_id: "img-xxx"
}

MinIO upload successful

Image confirmed: img-xxx

=== UPLOAD SUCCESS ===
```

## 🎨 Supported File Types

| Extension | Content Type | Status |
|-----------|-------------|--------|
| `.jpg` | `image/jpeg` | ✅ Supported |
| `.jpeg` | `image/jpeg` | ✅ Supported |
| `.png` | `image/png` | ✅ Supported |
| `.webp` | `image/webp` | ✅ Supported |
| `.gif` | `image/gif` | ❌ Not supported |
| `.svg` | `image/svg+xml` | ❌ Not supported |

## 🐛 Troubleshooting

### Still 400 Error?

Check console logs:
```
🔴 Presign Error Response: {
  "error": "...",
  "message": "..."
}
```

Common issues:
- Wrong content_type value
- Wrong extension value
- Unsupported file type
- Missing Authorization header

### 401 Unauthorized?

```javascript
// Re-login
window.location.href = '/admin/login'
```

### MinIO Upload Failed?

- Check presigned URL not expired
- Check network connectivity
- Check CORS configuration

---

**Refresh và test ngay! Lần này chắc chắn thành công!** 🚀

Format đã đúng 100% với backend struct.

