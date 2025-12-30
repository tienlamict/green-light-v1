# Quick Fix: variant_id Deadlock Issue

## ❌ Problem
```
User creates product
  → Upload images
  → Need variant_id
  → But variant not created yet!
  → DEADLOCK ❌
```

## ✅ Solution: Two-Step Flow

### STEP 1: Create Product (No Images)
```javascript
POST /api/v1/products
{
  "name": "Product Name",
  "variants": [
    { "sku": "SKU-001", "price": 100, ... }
    // ❌ NO IMAGES
  ]
}

Response:
{
  "product_id": "uuid-123",
  "variants": [
    { "variant_id": "uuid-456", ... }  // ✅ Now we have variant_id!
  ]
}
```

### STEP 2: Upload Images with variant_id
```javascript
// For each variant with images:
uploadVariantImages(productId, variantId, files)
  → getPresignedUrl()
  → uploadToMinIO()
  → confirmImageUpload(variantId)  // ✅ variant_id attached!
```

---

## 📋 Files Changed

### 1. `ProductFormNew.jsx`
```javascript
// Don't send images in API call
const submitData = {
  variants: variants.map(v => ({
    sku: v.sku,
    price: v.price,
    // ❌ NO images here
  }))
}

// Pass variants with images to parent
await onSubmit(submitData, variants)
```

### 2. `create/page.jsx`
```javascript
const handleSubmit = async (productData, variantsWithImages) => {
  // STEP 1: Create product
  const created = await createProduct(productData)
  
  // STEP 2: Upload images
  for (let i = 0; i < variantsWithImages.length; i++) {
    const variant = variantsWithImages[i]
    const variantId = created.variants[i].variant_id  // ✅ Now available!
    
    await uploadVariantImages(
      created.product_id,
      variantId,  // ✅ Pass variant_id
      variant.images
    )
  }
}
```

### 3. `edit/page.jsx`
```javascript
// Similar logic, but variants already have variant_id
const handleSubmit = async (productData, variantsWithImages) => {
  // STEP 1: Update product
  await updateProduct(product.product_id, productData)
  
  // STEP 2: Upload new images
  for (const variant of variantsWithImages) {
    if (variant.variant_id) {  // ✅ Already exists in edit mode
      await uploadVariantImages(
        product.product_id,
        variant.variant_id,
        variant.images
      )
    }
  }
}
```

---

## 🔄 Flow Diagram

```
User clicks "Lưu Sản Phẩm"
        │
        ▼
┌───────────────────────┐
│ STEP 1: Create Product│
│ ❌ No images          │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Response:             │
│ ✅ product_id         │
│ ✅ variant_id (each)  │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ STEP 2: Upload Images │
│ ✅ With variant_id    │
└───────┬───────────────┘
        │
        ▼
      Done! ✅
```

---

## ✅ Result

- ✅ No deadlock
- ✅ variant_id correctly attached to images
- ✅ Clean separation: create → upload
- ✅ Better error handling

---

**🎉 Fixed!**

