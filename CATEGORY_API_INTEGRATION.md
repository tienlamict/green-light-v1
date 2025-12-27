# Category API Integration Summary

## ✅ Đã Hoàn Thành

Tích hợp đầy đủ API backend cho quản lý Categories trong admin panel.

---

## 📋 API Endpoints

### 1. **GET** `/api/v1/categories`
Lấy danh sách tất cả categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "uuid",
      "name": "Đèn âm trần tán quang",
      "slug": "am-tran-downlight",
      "description": "...",
      "is_active": true,
      "created_at": "2025-12-19T05:58:37Z",
      "updated_at": "2025-12-19T05:58:37Z"
    }
  ]
}
```

---

### 2. **POST** `/api/v1/categories`
Tạo category mới

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Đèn âm trần tán quang",
  "slug": "am-tran-downlight",
  "description": "Đây là dòng đèn LED gắn âm vào trần...",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category_id": "uuid",
    "name": "Đèn âm trần tán quang",
    "slug": "am-tran-downlight",
    "description": "...",
    "is_active": true,
    "created_at": "2025-12-19T05:58:37Z",
    "updated_at": "2025-12-19T05:58:37Z"
  }
}
```

---

### 3. **PUT** `/api/v1/categories/{id}`
Cập nhật category

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (giống POST)

---

### 4. **DELETE** `/api/v1/categories/{id}`
Xóa category

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

### 5. **GET** `/api/v1/categories/{id}`
Lấy chi tiết 1 category (by ID hoặc slug)

---

## 🔧 Files Updated

### 1. `services/api.js`
**Đã thêm:**
- ✅ `createCategory(categoryData)` - Tạo category mới
- ✅ `updateCategory(categoryId, categoryData)` - Cập nhật category
- ✅ `deleteCategory(categoryId)` - Xóa category
- ✅ `fetchCategoryById(categoryIdOrSlug)` - Lấy 1 category

**Tất cả đều:**
- Tự động lấy `auth_token` từ localStorage
- Thêm `Authorization: Bearer {token}` vào header
- Xử lý lỗi và throw error với message từ backend

---

### 2. `components/admin/CategoryForm.jsx`
**Thay đổi:**
- ❌ Xóa logic lưu vào localStorage
- ✅ Import `createCategory`, `updateCategory` từ `services/api`
- ✅ Gọi API trong `handleSubmit`:
  - Nếu `category` tồn tại → `updateCategory()`
  - Nếu không → `createCategory()`
- ✅ Redirect về `/admin/categories` sau khi thành công

---

### 3. `app/admin/categories/page.jsx`
**Thay đổi:**
- ❌ Xóa fallback localStorage
- ✅ Import `deleteCategory` từ `services/api`
- ✅ `loadCategories()`: Chỉ fetch từ API
- ✅ `confirmDelete()`: 
  - Gọi `deleteCategory(category_id)`
  - Reload lại danh sách từ API
  - Hiển thị alert nếu lỗi

---

### 4. `app/admin/categories/[id]/edit/page.jsx`
**Thay đổi:**
- ❌ Xóa fallback localStorage
- ✅ Import `fetchCategoryById` từ `services/api`
- ✅ `loadCategory()`: 
  - Gọi `fetchCategoryById(params.id)`
  - Redirect về list nếu không tìm thấy

---

## 🧪 Test Checklist

### ✅ Create Category
1. Vào `/admin/categories/create`
2. Điền form:
   - Name: "Đèn âm trần tán quang"
   - Slug: "am-tran-downlight" (auto-generate)
   - Description: "..."
   - Active: checked
3. Click "Create Category"
4. **Expected:**
   - API call: `POST /api/v1/categories`
   - Header: `Authorization: Bearer {token}`
   - Redirect về `/admin/categories`
   - Category mới xuất hiện trong danh sách

---

### ✅ Edit Category
1. Vào `/admin/categories`
2. Click icon Edit ở 1 category
3. Sửa thông tin
4. Click "Update Category"
5. **Expected:**
   - API call: `PUT /api/v1/categories/{id}`
   - Header: `Authorization: Bearer {token}`
   - Redirect về `/admin/categories`
   - Thông tin đã được cập nhật

---

### ✅ Delete Category
1. Vào `/admin/categories`
2. Click icon Delete ở 1 category
3. Confirm trong modal
4. **Expected:**
   - API call: `DELETE /api/v1/categories/{id}`
   - Header: `Authorization: Bearer {token}`
   - Category biến mất khỏi danh sách

---

### ✅ List Categories
1. Vào `/admin/categories`
2. **Expected:**
   - API call: `GET /api/v1/categories`
   - Hiển thị tất cả categories từ backend
   - Không còn dữ liệu localStorage

---

## 🔐 Authentication

Tất cả các API **CREATE, UPDATE, DELETE** đều yêu cầu:

```javascript
const token = localStorage.getItem('auth_token')

headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

Token được lưu khi login thành công tại `AuthContext`.

---

## ❌ Đã Loại Bỏ

- ❌ `localStorage.getItem('admin_categories')`
- ❌ `localStorage.setItem('admin_categories')`
- ❌ Tất cả logic fallback localStorage
- ❌ Mock data trong components

---

## 🚀 Next Steps

Bây giờ có thể:
1. ✅ Tạo category mới → Lưu vào MySQL qua backend
2. ✅ Sửa category → Cập nhật trong MySQL
3. ✅ Xóa category → Xóa khỏi MySQL
4. ✅ Danh sách categories luôn sync với backend

---

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
**Nguyên nhân:** Chưa login hoặc token hết hạn

**Fix:**
1. Vào `/admin/login`
2. Login lại
3. Token mới sẽ được lưu vào localStorage

---

### Lỗi 500 Internal Server Error
**Nguyên nhân:** Backend error hoặc validation failed

**Fix:**
1. Kiểm tra console logs
2. Xem response error message
3. Kiểm tra backend logs

---

### Category không xuất hiện sau khi tạo
**Nguyên nhân:** API thành công nhưng không reload

**Fix:**
- Đã được xử lý: `router.push('/admin/categories')` sẽ tự động reload page và fetch lại từ API

---

## 📝 Code Examples

### Create Category
```javascript
import { createCategory } from '@/services/api'

const newCategory = {
  name: "Đèn âm trần tán quang",
  slug: "am-tran-downlight",
  description: "...",
  is_active: true
}

const result = await createCategory(newCategory)
// result = { category_id, name, slug, ... }
```

---

### Update Category
```javascript
import { updateCategory } from '@/services/api'

const updatedData = {
  name: "Đèn âm trần tán quang (Updated)",
  slug: "am-tran-downlight",
  description: "...",
  is_active: false
}

const result = await updateCategory('category-uuid', updatedData)
```

---

### Delete Category
```javascript
import { deleteCategory } from '@/services/api'

const success = await deleteCategory('category-uuid')
// success = true/false
```

---

## ✅ Summary

**Trước đây:**
- ❌ Lưu vào localStorage
- ❌ Dữ liệu không đồng bộ
- ❌ Không có backend integration

**Bây giờ:**
- ✅ Tất cả CRUD operations gọi API backend
- ✅ Dữ liệu lưu vào MySQL
- ✅ Tự động thêm Authorization header
- ✅ Xử lý lỗi đầy đủ
- ✅ UI/UX mượt mà với loading states

---

**🎉 Category API Integration Complete!**

