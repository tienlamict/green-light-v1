# ✅ Fixed 400 Error!

## 🎯 Root Cause

Backend đang expect **PascalCase** fields:
- `ContentType` (required) - e.g., "image/jpeg"
- `Extension` (required) - e.g., "jpg"
- `VariantID` (optional) - UUID

**KHÔNG phải:**
- ❌ `file_name`
- ❌ `fileName`
- ❌ `variant_id`

## 🔧 Đã Fix

### File: `services/imageUpload.js`

**Before:**
```javascript
const body = {
  file_name: fileName,
  variant_id: variantId
}
```

**After:**
```javascript
const fileExtension = fileName.split('.').pop().toLowerCase()
const contentType = getContentType(fileExtension)

const body = {
  ContentType: contentType,    // "image/jpeg"
  Extension: fileExtension,    // "jpg"
}

if (variantId) {
  body.VariantID = variantId   // PascalCase
}
```

### Added Helper Function

```javascript
function getContentType(extension) {
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  }
  return types[extension.toLowerCase()] || 'image/jpeg'
}
```

## 🧪 Test Lại

### Bước 1: Refresh Trang

```
http://localhost:3000/admin/products/adffba72-8ab4-4e04-901e-8364ecb9c817/edit
```

### Bước 2: Test Format Mới

Click "Test All Formats" - Format đầu tiên (PascalCase) nên thành công!

### Bước 3: Upload Ảnh Thật

Trong blue box, upload một ảnh để test full flow.

## 📊 Expected Request

```json
POST /api/v1/products/{id}/images/presign

{
  "ContentType": "image/jpeg",
  "Extension": "jpg",
  "VariantID": "cd332d95-c998-4abe-aefb-efd7859bb5c8"
}
```

## ✅ Expected Response

```json
{
  "success": true,
  "data": {
    "upload_url": "https://minio.../presigned-url",
    "public_url": "https://cdn.../image.jpg",
    "image_id": "img-uuid-123"
  }
}
```

## 🎯 Next Steps

1. **Refresh page**
2. **Click "Test All Formats"** → First one should be green ✅
3. **Upload real image** in blue box
4. **Should see 3 successful requests:**
   - POST /images/presign → 200 OK
   - PUT MinIO URL → 200 OK
   - POST /images (confirm) → 200 OK
5. **Image appears in UI**

## 📝 Supported File Types

- `.jpg`, `.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.gif` → `image/gif`
- `.webp` → `image/webp`
- `.svg` → `image/svg+xml`

## 🐛 If Still Error

Check console for:
```
🔵 Presign Request:
Body: { ContentType: "image/jpeg", Extension: "jpg", VariantID: "..." }

🔵 Presign Response Status: 200 ✅
```

If still 400, backend might need additional fields. Check error message.

---

**Refresh và test ngay!** 🚀

