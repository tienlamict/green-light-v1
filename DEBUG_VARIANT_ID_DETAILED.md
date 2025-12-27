# Debug: Variant ID Not Attached to Images

## 🔍 Đã Thêm Console Logs Chi Tiết

Để trace toàn bộ flow từ component → service → API

---

## 📋 Console Logs Sequence

Khi bạn upload ảnh cho variant, bạn sẽ thấy logs theo thứ tự:

### 1. **ProductFormNew - Mapping Variants**

```
🔍 Mapping variant 0: {
  variant_id: "cd332d95-c998-4abe-aefb-efd7859bb5c8",
  name: "Ánh sáng đổi màu",
  sku: "DDLS-10SS-T105-DM"
}
```

**Kiểm tra:** `variant_id` phải có giá trị UUID, không phải `undefined`

---

### 2. **ProductFormNew - Render ImageUploader**

```
🖼️ ImageUploader for variant 0: {
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8",
  sku: "DDLS-10SS-T105-DM",
  uploadMode: "minio",
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
}
```

**Kiểm tra:** 
- `variantId` phải có giá trị
- `uploadMode` phải là `"minio"` (không phải `"preview"`)
- `productId` phải có giá trị

---

### 3. **ImageUploader - handleMinIOUpload**

```
🔵 ImageUploader.handleMinIOUpload called
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  variantId type: "string"
  files count: 1

🔵 Calling uploadVariantImages with:
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  validFiles: 1
```

**Kiểm tra:**
- `variantId` phải là string UUID
- `variantId type` phải là `"string"` (không phải `"undefined"`)

---

### 4. **imageUpload.js - uploadVariantImages**

```
🟢 uploadVariantImages called
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  variantId type: "string"
  files: 1

🟢 Uploading file 1/1: image.jpg
  Passing variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
```

**Kiểm tra:**
- `variantId` vẫn còn giá trị khi truyền vào `uploadProductImage`

---

### 5. **imageUpload.js - confirmImageUpload**

```
🟡 confirmImageUpload - variantId received: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
🟡 variantId type: "string"
🟡 variantId is truthy? true
✅ variant_id ADDED to body: "cd332d95-c998-4abe-aefb-efd7859bb5c8"

🔵 Confirm Upload Request:
URL: http://localhost:8080/api/v1/products/6ca03013-8b70-48fc-b204-3460d885d443/images
Body: {
  "object_key": "products/2024/12/prod-123/uuid.webp",
  "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8"
}
```

**Kiểm tra:**
- `variant_id` phải có trong body
- Request body phải có cả `object_key` và `variant_id`

---

## ❌ Nếu Lỗi - Các Trường Hợp

### Trường hợp 1: `variant_id` là `undefined` ngay từ đầu

```
🔍 Mapping variant 0: {
  variant_id: undefined,  ← LỖI!
  name: "Ánh sáng đổi màu",
  sku: "DDLS-10SS-T105-DM"
}
```

**Nguyên nhân:** API response không có `variant_id`

**Fix:** Kiểm tra API response từ backend:

```bash
curl http://localhost:8080/api/v1/products/{slug}
```

Response phải có:

```json
{
  "variants": [
    {
      "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8",  ← Phải có!
      "name": "...",
      "sku": "..."
    }
  ]
}
```

---

### Trường hợp 2: `variantId` bị mất khi truyền vào ImageUploader

```
🖼️ ImageUploader for variant 0: {
  variantId: undefined,  ← LỖI!
  sku: "DDLS-10SS-T105-DM",
  uploadMode: "minio",
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
}
```

**Nguyên nhân:** `variant.variant_id` không được set trong state

**Fix:** Kiểm tra trong `ProductFormNew.jsx`:

```javascript
const mappedVariants = product.variants.map((v, index) => {
  return {
    id: v.variant_id,
    variant_id: v.variant_id,  // ← Phải có dòng này!
    variant_name: v.name,
    // ...
  }
})
```

---

### Trường hợp 3: `variantId` không được gửi trong confirm request

```
🟡 confirmImageUpload - variantId received: undefined
🟡 variantId type: "undefined"
🟡 variantId is truthy? false
❌ variant_id NOT added to body (variantId is falsy)

🔵 Body: {
  "object_key": "products/2024/12/prod-123/uuid.webp"
  // variant_id KHÔNG CÓ!
}
```

**Nguyên nhân:** `variantId` bị mất ở đâu đó trong chain

**Fix:** Trace lại logs từ bước 1-4 để xem `variantId` bị mất ở đâu

---

## 🧪 Test Steps

### 1. Mở trang Edit Product

```
http://localhost:3000/admin/products/{slug}/edit
```

### 2. Mở Console (F12)

### 3. Chọn 1 variant và upload ảnh

### 4. Copy TOÀN BỘ console logs

Bắt đầu từ:
```
🔍 Mapping variant 0: ...
```

Đến:
```
✅ Confirm Response: ...
```

### 5. Gửi logs cho tôi

---

## 🔧 Expected Full Log Sequence (Success)

```
🔍 Mapping variant 0: {
  variant_id: "cd332d95-c998-4abe-aefb-efd7859bb5c8",
  name: "Ánh sáng đổi màu",
  sku: "DDLS-10SS-T105-DM"
}

🖼️ ImageUploader for variant 0: {
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8",
  sku: "DDLS-10SS-T105-DM",
  uploadMode: "minio",
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
}

🔵 ImageUploader.handleMinIOUpload called
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  variantId type: "string"
  files count: 1

🔵 Calling uploadVariantImages with:
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  validFiles: 1

🟢 uploadVariantImages called
  productId: "6ca03013-8b70-48fc-b204-3460d885d443"
  variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  variantId type: "string"
  files: 1

🟢 Uploading file 1/1: image.jpg
  Passing variantId: "cd332d95-c998-4abe-aefb-efd7859bb5c8"

🔵 Presign Request:
URL: http://localhost:8080/api/v1/products/.../images/presign
Body: { content_type: "image/jpeg", extension: "jpg" }

🔵 Presign Response Status: 200 ✅

🟡 MinIO Upload:
URL: http://localhost:9000/...
File: { name: "image.jpg", size: 123456, type: "image/jpeg" }

🟡 MinIO Response Status: 200 OK ✅

🟡 confirmImageUpload - variantId received: "cd332d95-c998-4abe-aefb-efd7859bb5c8"
🟡 variantId type: "string"
🟡 variantId is truthy? true
✅ variant_id ADDED to body: "cd332d95-c998-4abe-aefb-efd7859bb5c8"

🔵 Confirm Upload Request:
URL: http://localhost:8080/api/v1/products/.../images
Body: {
  "object_key": "products/2024/12/prod-123/uuid.webp",
  "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8"
}

🔵 Confirm Response Status: 200 ✅
✅ Confirm Response: { success: true }
```

---

## 📝 Checklist

- [ ] Logs hiển thị `variant_id` ở bước 1 (Mapping)
- [ ] Logs hiển thị `variantId` ở bước 2 (Render)
- [ ] Logs hiển thị `variantId` ở bước 3 (handleMinIOUpload)
- [ ] Logs hiển thị `variantId` ở bước 4 (uploadVariantImages)
- [ ] Logs hiển thị `variant_id` trong body ở bước 5 (confirmImageUpload)
- [ ] Backend response 200 OK
- [ ] Kiểm tra MySQL: ảnh có `variant_id` field

---

**Hãy test và gửi cho tôi TOÀN BỘ console logs!** 🔍

