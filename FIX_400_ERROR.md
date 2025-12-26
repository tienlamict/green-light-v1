# Fix 400 Error - Quick Guide

## 🔴 Current Error

```
Error: HTTP error! status: 400
```

Lỗi 400 Bad Request → Request body không đúng format mà backend expect.

## 🚀 Quick Fix - Test All Formats

### Bước 1: Refresh Trang Edit

```
http://localhost:3000/admin/products/adffba72-8ab4-4e04-901e-8364ecb9c817/edit
```

### Bước 2: Thấy 2 Test Boxes

1. **🟣 Purple Box** - "Quick API Format Test"
   - Click button "Test All Formats"
   - Sẽ test 4 formats khác nhau
   - Hiển thị kết quả ngay

2. **🔵 Blue Box** - "MinIO Upload Test"
   - Upload ảnh thật
   - Test full flow

### Bước 3: Click "Test All Formats"

Button trong purple box sẽ test:

1. **snake_case** (hiện tại)
   ```json
   {
     "file_name": "test.jpg",
     "variant_id": "..."
   }
   ```

2. **camelCase**
   ```json
   {
     "fileName": "test.jpg",
     "variantId": "..."
   }
   ```

3. **minimal** (no variant)
   ```json
   {
     "file_name": "test.jpg"
   }
   ```

4. **with content_type**
   ```json
   {
     "file_name": "test.jpg",
     "content_type": "image/jpeg",
     "variant_id": "..."
   }
   ```

### Bước 4: Xem Kết Quả

Mỗi format sẽ hiển thị:
- ✅ **Green** = Success (200 OK)
- ❌ **Red** = Failed (400, 500, etc.)

**Response data** sẽ hiển thị trong box.

### Bước 5: Báo Cáo

Cho tôi biết:
1. **Format nào success?** (green box)
2. **Response data là gì?** (copy JSON)
3. **Console logs gì?** (F12 → Console)

## 🔧 Sau Khi Biết Format Đúng

### Nếu camelCase works:

Update `services/imageUpload.js`:

```javascript
const body = {
  fileName: fileName,      // Changed
  contentType: file.type   // Added
}

if (variantId) {
  body.variantId = variantId  // Changed
}
```

### Nếu minimal works:

```javascript
const body = {
  file_name: fileName
}
// Don't send variant_id in presign
```

### Nếu with content_type works:

```javascript
const body = {
  file_name: fileName,
  content_type: file.type  // Added
}

if (variantId) {
  body.variant_id = variantId
}
```

## 📊 Expected Results

### Success (200 OK):

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

### Failed (400):

```json
{
  "success": false,
  "error": "invalid request body",
  "message": "field 'fileName' is required"
}
```

## 🎯 Action Plan

1. **Refresh page** → See purple box
2. **Click "Test All Formats"** → Wait for results
3. **Find green box** → That's the correct format
4. **Copy response** → Share with me
5. **I'll update code** → Use correct format

## 💡 Tips

- **Open Console** (F12) để xem detailed logs
- **Check Network tab** để xem requests
- **All tests run automatically** - không cần upload file
- **Results show immediately** - green = success

---

**Refresh trang và click "Test All Formats" button!**

Sẽ biết ngay format nào đúng trong vài giây. 🚀

