# MinIO Upload Debug - Summary

## ✅ Đã Hoàn Thành

1. ✅ Tạo MinIO upload service (`services/imageUpload.js`)
2. ✅ Update ImageUploader component với 2 modes
3. ✅ Filter base64 images trong ProductFormNew
4. ✅ Update edit page để dùng MinIO mode
5. ✅ Tạo test component để debug
6. ✅ Thêm test component vào edit page

## 🎯 Cách Kiểm Tra Upload

### Quick Test

1. **Mở trang edit:**
   ```
   http://localhost:3000/admin/products/adffba72-8ab4-4e04-901e-8364ecb9c817/edit
   ```

2. **Thấy blue test box** ở đầu trang

3. **Mở Developer Tools:**
   - Press F12
   - Tab Console
   - Tab Network

4. **Upload ảnh:**
   - Click "Choose File"
   - Select ảnh
   - Xem console logs
   - Xem network requests

### Expected Results

**✅ Success:**
- Console: "=== UPLOAD SUCCESS ==="
- Network: 3 requests (presign, MinIO PUT, confirm)
- UI: Green box với image preview

**❌ Failed:**
- Console: Error logs
- Network: Failed request
- UI: Red box với error message

## 🔍 Debug Steps

### Step 1: Check Prerequisites

```javascript
// In console
console.log('Token:', localStorage.getItem('auth_token'))
console.log('Product ID:', product?.product_id)
console.log('Variant ID:', product?.variants?.[0]?.variant_id)
```

### Step 2: Check Backend Endpoint

```bash
# Test presign endpoint exists
curl http://localhost:8080/api/v1/products/test/images/presign

# Should return 401 (not 404)
```

### Step 3: Test Upload

1. Upload image in test box
2. Watch console for logs
3. Watch network for requests
4. Note which step fails

### Step 4: Fix Issues

**If Step 1 fails (presign):**
- Check backend endpoint
- Check authentication
- Check request format

**If Step 2 fails (MinIO):**
- Check MinIO server
- Check presigned URL
- Check CORS
- Check network

**If Step 3 fails (confirm):**
- Check backend validation
- Check database
- Retry confirm

## 📁 Files Changed

### New Files
- `services/imageUpload.js` - Upload service
- `components/admin/ImageUploadTest.jsx` - Test component
- `TEST_MINIO_UPLOAD.md` - Test guide
- `DEBUG_MINIO_UPLOAD.md` - Debug guide

### Updated Files
- `components/admin/ImageUploader.jsx` - Added MinIO mode
- `components/admin/ProductFormNew.jsx` - Filter base64, use MinIO mode
- `app/admin/products/[id]/edit/page.jsx` - Added test component

## 🎨 Test Component Features

### Display
- Product ID
- Variant ID
- File input
- Status indicator (yellow/green/red)
- Success: Image ID, Public URL, Preview
- Error: Error message

### Console Logs
- Detailed step-by-step logs
- Request/response data
- Error details

### Network Requests
- POST /images/presign
- PUT MinIO URL
- POST /images (confirm)

## 🐛 Common Issues

### Issue 1: "Product ID: Not set"
**Fix:** Wait for product to load

### Issue 2: 404 on presign
**Fix:** Backend endpoint not implemented

### Issue 3: 401 Unauthorized
**Fix:** Re-login to get fresh token

### Issue 4: 500 Server Error
**Fix:** Check backend logs, MinIO config

### Issue 5: MinIO upload failed
**Fix:** Check MinIO server, CORS, network

### Issue 6: Confirm failed
**Fix:** Check backend validation, database

## 📊 Upload Flow

```
Frontend (Test Component)
  ↓
services/imageUpload.js
  ↓
Step 1: POST /images/presign
  ← { upload_url, public_url, image_id }
  ↓
Step 2: PUT upload_url (to MinIO)
  ← 200 OK
  ↓
Step 3: POST /images (confirm)
  ← { success: true }
  ↓
Display success + image preview
```

## 🎯 Next Actions

### If Test Succeeds:
1. ✅ MinIO upload working
2. Remove test component
3. Test in normal form
4. Upload real product images

### If Test Fails:
1. Note error step
2. Copy console logs
3. Copy network requests
4. Check backend logs
5. Report issue with details

## 📝 Test Checklist

Before testing:
- [ ] Backend running (port 8080)
- [ ] MinIO server running
- [ ] Logged in (have token)
- [ ] On edit page
- [ ] Developer tools open

During test:
- [ ] See test box
- [ ] Product ID shown
- [ ] Variant ID shown
- [ ] Select image file
- [ ] Watch console logs
- [ ] Watch network requests

After test:
- [ ] Note success or failure
- [ ] Copy logs if failed
- [ ] Report results

## 🚀 Remove Test Component

After testing, remove from `app/admin/products/[id]/edit/page.jsx`:

```javascript
// Remove import
import ImageUploadTest from '@/components/admin/ImageUploadTest'

// Remove component
<ImageUploadTest 
  productId={product.product_id}
  variantId={product.variants?.[0]?.variant_id}
/>
```

## 📞 Need Help?

Provide these when asking for help:

1. **Console logs** (full output)
2. **Network tab** (screenshot or details)
3. **Error messages** (exact text)
4. **Which step failed** (1, 2, or 3)
5. **Backend logs** (if available)

---

**Test ngay và báo cáo kết quả!**

Refresh trang edit và bạn sẽ thấy test box màu xanh ở đầu trang.

