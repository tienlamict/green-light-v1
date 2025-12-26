# Backend Proxy Upload - Fix CORS Issue

## 🎯 Problem

`TypeError: Failed to fetch` khi upload trực tiếp lên MinIO từ browser.

**Nguyên nhân:** CORS policy blocking direct upload to MinIO.

## ✅ Solution: Backend Proxy Upload

Thay vì:
```
Frontend → MinIO (CORS blocked ❌)
```

Dùng:
```
Frontend → Backend → MinIO (No CORS ✅)
```

## 🔧 Backend Implementation

### Option 1: Single Endpoint (Recommended)

```go
// POST /api/v1/products/:product_id/images/upload
// Upload file directly through backend

func UploadProductImage(c *gin.Context) {
    productID := c.Param("product_id")
    variantID := c.PostForm("variant_id") // Optional
    
    // Get file from form
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{
            "success": false,
            "error": "No file uploaded",
        })
        return
    }
    
    // Validate file type
    contentType := file.Header.Get("Content-Type")
    if !isValidImageType(contentType) {
        c.JSON(400, gin.H{
            "success": false,
            "error": "Invalid file type",
        })
        return
    }
    
    // Open file
    src, err := file.Open()
    if err != nil {
        c.JSON(500, gin.H{
            "success": false,
            "error": "Failed to read file",
        })
        return
    }
    defer src.Close()
    
    // Generate unique filename
    extension := filepath.Ext(file.Filename)
    imageID := uuid.New().String()
    objectName := fmt.Sprintf("products/%s/%s%s", productID, imageID, extension)
    
    // Upload to MinIO
    _, err = minioClient.PutObject(
        context.Background(),
        bucketName,
        objectName,
        src,
        file.Size,
        minio.PutObjectOptions{
            ContentType: contentType,
        },
    )
    if err != nil {
        c.JSON(500, gin.H{
            "success": false,
            "error": "Failed to upload to storage",
        })
        return
    }
    
    // Generate public URL
    publicURL := fmt.Sprintf("https://cdn.example.com/%s/%s", bucketName, objectName)
    
    // Save metadata to database
    image := &models.ProductImage{
        ImageID:    imageID,
        ProductID:  productID,
        VariantID:  variantID, // Can be null
        URL:        publicURL,
        IsMain:     false, // Will be set later
        SortOrder:  0,     // Will be set later
        CreatedAt:  time.Now(),
    }
    
    if err := db.Create(image).Error; err != nil {
        // Image uploaded but DB save failed
        // Could delete from MinIO or leave it
        c.JSON(500, gin.H{
            "success": false,
            "error": "Failed to save image metadata",
        })
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "image_id":   imageID,
            "public_url": publicURL,
        },
    })
}

func isValidImageType(contentType string) bool {
    validTypes := []string{
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }
    
    for _, t := range validTypes {
        if t == contentType {
            return true
        }
    }
    return false
}
```

### Option 2: Keep Presign + Add Proxy Fallback

Keep existing presign endpoint, add proxy as fallback:

```go
// POST /api/v1/products/:product_id/images/upload-proxy
// Fallback endpoint when presign fails due to CORS

func UploadProductImageProxy(c *gin.Context) {
    // Same implementation as above
}
```

## 📊 API Specification

### Request

```http
POST /api/v1/products/{product_id}/images/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary file data>
variant_id: <uuid> (optional)
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "image_id": "img-uuid-123",
    "public_url": "https://cdn.example.com/products/image.jpg"
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Invalid file type"
}
```

## 🔄 Frontend Update

Update `services/imageUpload.js`:

```javascript
export async function uploadProductImage(productId, file, variantId = null) {
  try {
    console.log('=== START UPLOAD (Proxy Mode) ===')
    
    const token = localStorage.getItem('auth_token')
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    
    if (variantId) {
      formData.append('variant_id', variantId)
    }

    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/images/upload`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      console.log('=== UPLOAD SUCCESS ===')
      return {
        success: true,
        public_url: result.data.public_url,
        image_id: result.data.image_id
      }
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('=== UPLOAD ERROR ===', error)
    return {
      success: false,
      error: error.message
    }
  }
}
```

## 🎯 Benefits

### Proxy Upload (Backend)
- ✅ No CORS issues
- ✅ Simpler frontend code
- ✅ Better security (backend validates)
- ✅ Can add image processing (resize, compress)
- ✅ Centralized error handling
- ❌ More backend load
- ❌ Slower (goes through backend)

### Direct Upload (Presign)
- ✅ Faster (direct to MinIO)
- ✅ Less backend load
- ✅ Better for large files
- ❌ CORS configuration required
- ❌ More complex frontend code
- ❌ Less control over validation

## 🚀 Implementation Steps

### Step 1: Backend

1. Add new endpoint: `POST /products/:id/images/upload`
2. Handle multipart/form-data
3. Validate file type and size
4. Upload to MinIO
5. Save metadata to database
6. Return image_id and public_url

### Step 2: Frontend

1. Update `services/imageUpload.js`
2. Use FormData instead of presign flow
3. Remove presign and confirm steps
4. Single POST request with file

### Step 3: Test

1. Upload image in test component
2. Should see single POST request
3. No CORS error
4. Image appears in UI

## 📝 Testing

### Test Upload

```bash
# Get token
TOKEN="your-token"

# Upload image
curl -X POST http://localhost:8080/api/v1/products/{product_id}/images/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.jpg" \
  -F "variant_id={variant_id}"

# Expected response
{
  "success": true,
  "data": {
    "image_id": "img-xxx",
    "public_url": "https://cdn.../image.jpg"
  }
}
```

### Test in Browser

1. Open edit page
2. Upload image in test component
3. Check Network tab:
   - Single POST request to `/images/upload`
   - Status: 200 OK
   - Response: { success: true, data: {...} }
4. Image appears in UI

## 🔧 Migration Path

### Phase 1: Add Proxy Endpoint (Keep Presign)

- Add `/images/upload` endpoint
- Keep `/images/presign` endpoint
- Frontend can use either

### Phase 2: Switch to Proxy (Recommended)

- Update frontend to use proxy
- Test thoroughly
- Remove presign endpoint if not needed

### Phase 3: Optimize (Optional)

- Add image compression
- Add thumbnail generation
- Add CDN integration

---

**Recommend:** Implement backend proxy upload endpoint.

It's simpler, no CORS issues, and easier to maintain.

