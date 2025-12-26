# Quick Reference - Product Management

## 🚀 Quick Start

### Start Server
```bash
npm run dev
# Server: http://localhost:3001
```

### Login
```
URL: http://localhost:3001/admin/login
Email: admin@example.com
Password: [your password]
```

---

## 📝 Create Product

### URL
```
http://localhost:3001/admin/products/create
```

### Steps
1. Fill product name → slug auto-generated
2. Select category
3. Add description
4. Add variant(s)
5. Upload images (max 5 per variant)
6. Set price and stock
7. Click "Lưu Sản Phẩm"

### API Request Format
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "category_id": "uuid",
  "variants": [{
    "sku": "SKU-001",
    "name": "Variant Name",
    "attributes": { ... },
    "price": 100000,
    "stock": 10,
    "images": [
      {
        "image_id": "img-001",
        "url": "https://...",
        "is_main": true,
        "sort_order": 0
      }
    ]
  }]
}
```

---

## ✏️ Edit Product

### URL (Both Work)
```
By Slug: /admin/products/den-led-am-tran-diamond-mat-sau/edit
By UUID: /admin/products/6ca03013-8b70-48fc-b204-3460d885d443/edit
```

### What Loads
- ✅ Product name, slug, description
- ✅ Category
- ✅ All variants with attributes
- ✅ Images for each variant
- ✅ Price and stock

### What You Can Edit
- Product name (slug auto-updates)
- Category
- Description
- Variant details
- Variant images (add/remove/reorder)
- Price and stock

---

## 🖼️ Image Rules

### Structure
```json
{
  "image_id": "img-001",
  "url": "https://example.com/image.jpg",
  "is_main": true,
  "sort_order": 0
}
```

### Rules
1. **First image = Main image**
   - `sort_order: 0` → `is_main: true`
   - Others → `is_main: false`

2. **Sort order = Sequential**
   - 0, 1, 2, 3...
   - No gaps
   - Auto-updated on add/remove

3. **Image ID = Unique**
   - Auto-generated if missing
   - Format: `img-{timestamp}-{index}`

### Operations
- **Add**: Appends with next sort_order
- **Remove first**: Second becomes main
- **Reorder**: New first becomes main

---

## 🔑 Attribute Mapping

| Form Field | API Field |
|------------|-----------|
| `hole_size` | `cutout_size` |
| `power_supply` | `input_voltage` |
| `color_temp` | `color_temperature` |
| `body_color` | `housing_color` |
| `brightness` | `luminance` |

---

## 🔐 Authentication

### Token Storage
```javascript
localStorage.getItem('auth_token')
```

### API Calls
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### If 401 Error
1. Check token exists
2. Login again
3. Retry operation

---

## 🧪 Quick Test

### Test Create
```bash
1. /admin/products/create
2. Name: "Test Product"
3. Add variant: "Test Variant"
4. Upload 2 images
5. Price: 100000, Stock: 10
6. Save
7. Check Network → POST /api/v1/products
```

### Test Edit
```bash
1. /admin/products/den-led-am-tran-diamond-mat-sau/edit
2. Change name
3. Save
4. Check Network → PUT /api/v1/products/{id}
```

### Test Images
```bash
1. Edit product
2. Add image → Check sort_order
3. Remove first → Check is_main
4. Reorder → Check is_main updates
```

---

## 🐛 Quick Debug

### Check Token
```javascript
console.log(localStorage.getItem('auth_token'))
```

### Check Form State
```javascript
console.log('Variants:', variants)
console.log('Images:', variants[0].images)
```

### Check API Response
```javascript
console.log('Product:', product)
```

### Common Fixes
```javascript
// No token → Login again
// 401 error → Check token
// Data not loading → Check API endpoint
// Images wrong → Check is_main and sort_order
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `FINAL_SUMMARY.md` | Complete overview |
| `PRODUCT_EDIT_GUIDE.md` | Edit feature details |
| `VARIANT_IMAGES_API_STRUCTURE.md` | Image structure |
| `TEST_IMAGE_STRUCTURE.md` | Test cases |
| `QUICK_REFERENCE.md` | This file |

---

## 🔗 API Endpoints

### Products
```
GET    /api/v1/products              - List products
GET    /api/v1/products/{id-or-slug} - Get product
POST   /api/v1/products              - Create product
PUT    /api/v1/products/{id}         - Update product
DELETE /api/v1/products/{id}         - Delete product
```

### Categories
```
GET    /api/v1/categories            - List categories
```

### Auth
```
POST   /api/v1/auth/login            - Login
```

---

## ⚡ Quick Commands

### Test API
```bash
# Get product
curl http://localhost:8080/api/v1/products/den-led-am-tran-diamond-mat-sau

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Create product
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d @product.json
```

### Check Logs
```bash
# Frontend
npm run dev

# Check terminal output
# Check browser console
# Check Network tab
```

---

**Last Updated:** December 26, 2025
**Version:** 2.0.0

