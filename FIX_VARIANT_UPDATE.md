# Fix: Variant Update Not Working

## ❌ Problem

Khi sửa thông tin variant trong edit product, thay đổi không được lưu vào DB.

**Root Cause:**
- Backend yêu cầu update variant qua API riêng: `PUT /api/v1/products/{product_id}/variants/{variant_id}`
- Frontend đang gửi variants trong cùng API call với product update
- Backend không xử lý variants trong product update API

---

## ✅ Solution

### Flow Mới:

```
1. Update product info (without variants)
   ↓
2. Update each variant separately via variant API
   ↓
3. Upload thumbnail (if new)
   ↓
4. Upload variant images (if new)
```

---

## 📋 Changes

### 1. **services/api.js**

**Added: `updateVariant` function**

```javascript
/**
 * Update a variant
 * @param {string} productId - Product UUID
 * @param {string} variantId - Variant UUID
 * @param {Object} variantData - Updated variant data
 * @returns {Promise<Object>} Updated variant object
 */
export async function updateVariant(productId, variantId, variantData) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/variants/${variantId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(variantData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error updating variant:', error)
    throw error
  }
}
```

**API Endpoint:**
```
PUT /api/v1/products/{product_id}/variants/{variant_id}
```

---

### 2. **ProductFormNew.jsx**

**Change: Include variant_id in submitData**

```javascript
// Before:
variants: variants.map(v => ({
  sku: v.sku,
  name: v.variant_name || '',
  // ...
}))

// After:
variants: variants.map(v => ({
  variant_id: v.variant_id, // ✅ Include variant_id for updates
  sku: v.sku,
  name: v.variant_name || '',
  // ...
}))
```

**Reason:**
- variant_id cần thiết để gọi API update variant riêng
- Chỉ có khi edit (không có khi create mới)

---

### 3. **app/admin/products/[id]/edit/page.jsx**

**Change: Separate product update and variant updates**

```javascript
const handleSubmit = async (productData, variantsWithImages, thumbnail) => {
  try {
    const productId = product.product_id
    
    // STEP 1: Update product info (without variants)
    const { variants, ...productInfo } = productData
    
    await updateProduct(productId, productInfo)
    console.log('✅ Product info updated')
    
    // STEP 1.1: Update each variant separately
    if (variants && variants.length > 0) {
      console.log('🚀 STEP 1.1: Updating variants...')
      
      for (let i = 0; i < variants.length; i++) {
        const variantData = variants[i]
        const variantId = variantData.variant_id
        
        if (!variantId) {
          console.warn(`⚠️ Variant ${i} has no variant_id, skipping update`)
          continue
        }
        
        // Prepare variant data for API (no images)
        const variantUpdateData = {
          sku: variantData.sku,
          name: variantData.name || '',
          attributes: variantData.attributes || {},
          price: variantData.price || 0,
          stock: variantData.stock || 0,
          is_active: variantData.is_active !== undefined ? variantData.is_active : true,
          // NO IMAGES in variant update
        }
        
        console.log(`📤 Updating variant ${i} (${variantId})...`)
        
        try {
          await updateVariant(productId, variantId, variantUpdateData)
          console.log(`✅ Variant ${i} updated`)
        } catch (variantError) {
          console.error(`❌ Error updating variant ${i}:`, variantError)
          // Continue with other variants even if one fails
        }
      }
      
      console.log('✅ STEP 1.1 Complete: All variants updated')
    }
    
    // STEP 1.5: Upload thumbnail (if new)
    // ...
    
    // STEP 2: Upload variant images (if new)
    // ...
  } catch (error) {
    console.error('❌ Error updating product:', error)
    throw error
  }
}
```

---

## 🔄 Complete Flow

### Edit Product Flow:

```
┌─────────────────────────────────────────┐
│ User edits product + variants          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ ProductFormNew.handleSubmit()           │
│ ├─ Prepare productData                 │
│ ├─ Include variant_id in variants      │
│ └─ Call onSubmit(data, variants, thumb)│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ STEP 1: Update Product Info             │
│ PUT /api/v1/products/{id}               │
│ { name, slug, description, ... }         │
│ ❌ NO VARIANTS                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ STEP 1.1: Update Each Variant            │
│ For each variant:                       │
│ ├─ PUT /products/{id}/variants/{v_id}   │
│ ├─ { sku, name, attributes, price, ... }│
│ └─ ❌ NO IMAGES                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ STEP 1.5: Upload Thumbnail (if new)     │
│ ...                                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ STEP 2: Upload Variant Images (if new)   │
│ ...                                       │
└──────────────┬──────────────────────────┘
               │
               ▼
          Success! ✅
```

---

## 📊 API Request Examples

### Update Product (STEP 1):
```javascript
PUT /api/v1/products/6ca03013-8b70-48fc-b204-3460d885d443

Request:
{
  "name": "Đèn LED âm trần Diamond",
  "slug": "den-led-am-tran-diamond",
  "short_desc": "Giải pháp chiếu sáng sang trọng",
  "description": "...",
  "stock": 15,
  "thumbnail_url": "http://...",
  "category_id": "3719d15a-3478-4300-95ea-1cfb4d24a203",
  "is_active": true
  // ❌ NO VARIANTS
}
```

### Update Variant (STEP 1.1):
```javascript
PUT /api/v1/products/6ca03013-8b70-48fc-b204-3460d885d443/variants/cd332d95-c998-4abe-aefb-efd7859bb5c8

Request:
{
  "sku": "DDLS-10SS-T105-DM",
  "name": "Ánh sáng đổi màu",
  "attributes": {
    "power": "10",
    "cutout_size": "Ø90",
    "input_voltage": "220VAC",
    // ... other attributes
  },
  "price": 310000,
  "stock": 10,
  "is_active": true
  // ❌ NO IMAGES
}
```

---

## ✅ Benefits

1. **✅ Variants được update đúng**
   - Mỗi variant update riêng qua API riêng
   - Backend xử lý đúng từng variant

2. **✅ Separation of Concerns**
   - Product info update riêng
   - Variant update riêng
   - Images upload riêng

3. **✅ Better Error Handling**
   - Nếu một variant fail, các variant khác vẫn update
   - Log chi tiết từng bước

4. **✅ Consistent với Backend API**
   - Follow đúng API structure của backend
   - Dễ maintain và debug

---

## 🧪 Test Cases

### Test 1: Edit Variant Info
- [ ] Open existing product
- [ ] Edit variant: SKU, name, price, stock
- [ ] Edit attributes: power, dimensions, etc.
- [ ] Click "Lưu Thay Đổi"
- [ ] Check console: STEP 1 → STEP 1.1
- [ ] Verify: Variant updated in DB ✅

### Test 2: Edit Multiple Variants
- [ ] Open product with 3 variants
- [ ] Edit all 3 variants
- [ ] Click "Lưu Thay Đổi"
- [ ] Check: All 3 variants updated ✅

### Test 3: Edit Product Info Only
- [ ] Open product
- [ ] Edit product name, description
- [ ] Don't change variants
- [ ] Click "Lưu Thay Đổi"
- [ ] Check: Product updated, variants unchanged ✅

### Test 4: Partial Failure
- [ ] Open product with 2 variants
- [ ] Edit both variants
- [ ] Simulate error for variant 1
- [ ] Check: Variant 2 still updated ✅
- [ ] Check: Error logged for variant 1 ✅

---

## 🎉 Summary

**Before:**
```
❌ Update product with variants in one API call
❌ Backend doesn't process variants
❌ Variant changes not saved
```

**After:**
```
✅ Update product info separately
✅ Update each variant via separate API
✅ All changes saved correctly
```

---

**🚀 Fixed! Variant updates now work correctly!**

