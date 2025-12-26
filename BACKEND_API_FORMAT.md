# Backend API Format - Troubleshooting 400 Error

## 🔴 Error: 400 Bad Request

Lỗi 400 thường do request body không đúng format mà backend expect.

## 🔍 Các Format Có Thể

### Format 1: Camel Case (Hiện tại đang dùng)

```json
{
  "file_name": "image.jpg",
  "variant_id": "variant-uuid"
}
```

### Format 2: Snake Case

```json
{
  "file_name": "image.jpg",
  "variant_id": "variant-uuid"
}
```

### Format 3: Pascal Case

```json
{
  "FileName": "image.jpg",
  "VariantId": "variant-uuid"
}
```

### Format 4: Nested Object

```json
{
  "file": {
    "name": "image.jpg"
  },
  "variant_id": "variant-uuid"
}
```

### Format 5: Form Data (không phải JSON)

```
Content-Type: multipart/form-data

file_name=image.jpg
variant_id=variant-uuid
```

## 🧪 Test Backend API

### Bước 1: Check Backend Documentation

Xem backend code hoặc docs để biết format đúng:

```go
// Example Go struct
type PresignRequest struct {
    FileName  string `json:"file_name"`  // → file_name
    VariantID string `json:"variant_id"` // → variant_id
}

// Or
type PresignRequest struct {
    FileName  string `json:"fileName"`   // → fileName (camelCase)
    VariantID string `json:"variantId"`  // → variantId (camelCase)
}
```

### Bước 2: Test với curl

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# Test Format 1: snake_case
curl -X POST http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test.jpg",
    "variant_id": "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  }'

# Test Format 2: camelCase
curl -X POST http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "variantId": "cd332d95-c998-4abe-aefb-efd7859bb5c8"
  }'

# Test Format 3: Without variant_id
curl -X POST http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test.jpg"
  }'
```

## 🔧 Quick Fixes

### Fix 1: Try camelCase

Update `services/imageUpload.js`:

```javascript
const body = {
  fileName: fileName,  // Changed from file_name
}

if (variantId) {
  body.variantId = variantId  // Changed from variant_id
}
```

### Fix 2: Try without variant_id

```javascript
const body = {
  file_name: fileName,
}

// Don't send variant_id in presign
// Send it in confirm step instead
```

### Fix 3: Add content_type

```javascript
const body = {
  file_name: fileName,
  content_type: 'image/jpeg',  // Add this
}

if (variantId) {
  body.variant_id = variantId
}
```

### Fix 4: Use file extension

```javascript
const body = {
  file_name: fileName,
  file_extension: fileName.split('.').pop(),  // Add this
}
```

## 📊 Debug Steps

### Step 1: Check Console Logs

After adding logging, you should see:

```
🔵 Presign Request:
URL: http://localhost:8080/api/v1/products/.../images/presign
Headers: { Content-Type: "application/json", Authorization: "Bearer ..." }
Body: { file_name: "test.jpg", variant_id: "..." }

🔵 Presign Response Status: 400

🔴 Presign Error Response: { 
  error: "invalid request body",
  message: "field 'fileName' is required"
}
```

### Step 2: Check Network Tab

1. Open Network tab
2. Find the failed request
3. Click on it
4. Check:
   - **Request Headers**
   - **Request Payload**
   - **Response** (error message)

### Step 3: Check Backend Logs

Backend should log the error. Look for:
- Validation errors
- JSON parse errors
- Missing field errors

## 🎯 Common 400 Causes

### Cause 1: Wrong Field Names

**Backend expects:**
```json
{ "fileName": "...", "variantId": "..." }
```

**Frontend sends:**
```json
{ "file_name": "...", "variant_id": "..." }
```

**Fix:** Match field names exactly

### Cause 2: Missing Required Fields

**Backend requires:**
```json
{ "file_name": "...", "content_type": "..." }
```

**Frontend sends:**
```json
{ "file_name": "..." }
```

**Fix:** Add missing fields

### Cause 3: Wrong Data Types

**Backend expects:**
```json
{ "file_size": 123456 }  // number
```

**Frontend sends:**
```json
{ "file_size": "123456" }  // string
```

**Fix:** Convert to correct type

### Cause 4: Invalid UUID Format

**Backend validates UUID:**
```json
{ "variant_id": "not-a-valid-uuid" }  // ❌
```

**Fix:** Ensure valid UUID format

### Cause 5: Extra Fields Not Allowed

**Backend strict validation:**
```go
// Only allows file_name
type Request struct {
    FileName string `json:"file_name" binding:"required"`
}
```

**Frontend sends:**
```json
{
  "file_name": "test.jpg",
  "variant_id": "..."  // ❌ Not allowed
}
```

**Fix:** Remove extra fields

## 🔄 Try Different Formats

### Test 1: Minimal Request

```javascript
// Only file_name
const body = {
  file_name: fileName
}
// Don't send variant_id
```

### Test 2: CamelCase

```javascript
const body = {
  fileName: fileName
}
if (variantId) {
  body.variantId = variantId
}
```

### Test 3: With Content Type

```javascript
const body = {
  file_name: fileName,
  content_type: file.type
}
```

### Test 4: With File Info

```javascript
const body = {
  file_name: fileName,
  file_size: file.size,
  content_type: file.type
}
```

## 📝 Action Plan

1. **Check console logs** (with new logging)
2. **Check Network tab** (see exact request/response)
3. **Try curl command** (test backend directly)
4. **Check backend code** (see expected format)
5. **Try different formats** (camelCase, minimal, etc.)
6. **Report findings** (which format works)

## 🚀 Quick Test

Run this in console after page loads:

```javascript
// Test presign directly
async function testPresign() {
  const token = localStorage.getItem('auth_token')
  
  // Test 1: snake_case
  console.log('Test 1: snake_case')
  let response = await fetch('http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: 'test.jpg',
      variant_id: 'cd332d95-c998-4abe-aefb-efd7859bb5c8'
    })
  })
  console.log('Status:', response.status)
  console.log('Response:', await response.json())
  
  // Test 2: camelCase
  console.log('\nTest 2: camelCase')
  response = await fetch('http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: 'test.jpg',
      variantId: 'cd332d95-c998-4abe-aefb-efd7859bb5c8'
    })
  })
  console.log('Status:', response.status)
  console.log('Response:', await response.json())
  
  // Test 3: minimal
  console.log('\nTest 3: minimal')
  response = await fetch('http://localhost:8080/api/v1/products/adffba72-8ab4-4e04-901e-8364ecb9c817/images/presign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: 'test.jpg'
    })
  })
  console.log('Status:', response.status)
  console.log('Response:', await response.json())
}

testPresign()
```

---

**Hãy:**
1. Refresh trang edit
2. Upload ảnh lại
3. Check console logs (có thêm 🔵 và 🔴)
4. Copy toàn bộ logs
5. Check Network tab → Request Payload và Response
6. Báo cáo kết quả

