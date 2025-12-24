# Authentication Setup Guide

## 🔐 Tổng Quan

Đã cập nhật authentication để call API thật và lưu token cho việc tạo/sửa sản phẩm.

## 🔄 Flow Authentication

### 1. Login Flow

```
User → Login Page → API Login → Save Token → Redirect to Admin
```

**Steps:**
1. User nhập email và password
2. Call API `POST /api/v1/auth/login`
3. Nhận token và user data
4. Lưu vào localStorage:
   - `auth_token` - JWT token
   - `admin_user` - User data
5. Redirect to `/admin`

### 2. API Request Flow

```
User Action → Get Token → Add to Header → Call API
```

**Steps:**
1. User click "Lưu Sản Phẩm"
2. Get token từ localStorage
3. Add Authorization header
4. Call API create/update product

## 📝 API Endpoints

### Login API

```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

### Create Product API

```bash
POST http://localhost:8080/api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "slug": "product-slug",
  ...
}
```

## 💾 LocalStorage Structure

### Stored Data

```javascript
// Token cho API calls
localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

// User data cho UI
localStorage.setItem('admin_user', JSON.stringify({
  user_id: "uuid",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin"
}))
```

## 🔧 Code Changes

### 1. AuthContext.jsx

**Before:**
```javascript
const login = async (email, password) => {
  // Mock login - accept any email/password
  const userData = { id: '1', email, name: 'Admin User' }
  localStorage.setItem('admin_user', JSON.stringify(userData))
  setUser(userData)
  return { success: true }
}
```

**After:**
```javascript
const login = async (email, password) => {
  // Call real API
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  const result = await response.json()
  const { token, user: userData } = result.data
  
  // Save token and user
  localStorage.setItem('auth_token', token)
  localStorage.setItem('admin_user', JSON.stringify(userData))
  
  setUser(userData)
  return { success: true }
}
```

### 2. services/api.js

**Create Product:**
```javascript
export async function createProduct(productData) {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData),
  })
  
  // Handle response...
}
```

## 🚀 Cách Sử Dụng

### Step 1: Login

1. Truy cập `/admin/login`
2. Nhập email và password
3. Click "Sign in"

**Credentials:**
```
Email: admin@example.com
Password: your_password
```

### Step 2: Verify Token

Kiểm tra token đã được lưu:
```javascript
// Open browser console
console.log(localStorage.getItem('auth_token'))
// Should show: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Create Product

1. Truy cập `/admin/products/create`
2. Điền thông tin sản phẩm
3. Click "Lưu Sản Phẩm"
4. Token sẽ tự động được thêm vào request

## 🐛 Troubleshooting

### Error 401 Unauthorized

**Nguyên nhân:**
- Token không tồn tại
- Token hết hạn
- Token không hợp lệ

**Giải pháp:**
```javascript
// 1. Check token exists
const token = localStorage.getItem('auth_token')
console.log('Token:', token)

// 2. If no token, login again
if (!token) {
  window.location.href = '/admin/login'
}

// 3. If token exists but still 401, token might be expired
// Clear and login again
localStorage.removeItem('auth_token')
localStorage.removeItem('admin_user')
window.location.href = '/admin/login'
```

### Error 400 Bad Request

**Nguyên nhân:**
- Request body không đúng format
- Thiếu required fields

**Giải pháp:**
```javascript
// Check request body
console.log('Request body:', JSON.stringify(productData, null, 2))

// Verify required fields
- name ✓
- category_id ✓
- variants[].sku ✓
- variants[].price ✓
- variants[].stock ✓
```

### Login Failed

**Nguyên nhân:**
- Backend không chạy
- Email/password sai
- API endpoint sai

**Giải pháp:**
```bash
# 1. Check backend is running
curl http://localhost:8080/health

# 2. Test login API
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 3. Check API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🔒 Security Best Practices

### 1. Token Storage

✅ **Current:** localStorage
- Pros: Simple, persists across tabs
- Cons: Vulnerable to XSS

⚠️ **Consider:** httpOnly cookies
- Pros: More secure, not accessible via JS
- Cons: More complex setup

### 2. Token Expiration

```javascript
// Check token expiration
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Auto-refresh before expiration
if (isTokenExpired(token)) {
  // Refresh token or logout
  logout()
}
```

### 3. Secure Headers

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Requested-With': 'XMLHttpRequest', // CSRF protection
}
```

## 📋 Testing Checklist

### Login Flow
- [ ] Can access login page
- [ ] Can submit login form
- [ ] Token saved to localStorage
- [ ] User data saved to localStorage
- [ ] Redirected to admin dashboard
- [ ] Can access protected routes

### API Calls
- [ ] Token added to headers
- [ ] Create product works (200/201)
- [ ] Update product works (200)
- [ ] Delete product works (200)
- [ ] Proper error handling (401, 400, 500)

### Logout Flow
- [ ] Token removed from localStorage
- [ ] User data removed from localStorage
- [ ] Redirected to login page
- [ ] Cannot access protected routes

## 🔄 Token Refresh (Future)

```javascript
// Implement token refresh
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  
  const result = await response.json()
  const { token } = result.data
  
  localStorage.setItem('auth_token', token)
  return token
}

// Auto-refresh before expiration
setInterval(() => {
  const token = localStorage.getItem('auth_token')
  if (isTokenExpired(token)) {
    refreshToken()
  }
}, 5 * 60 * 1000) // Check every 5 minutes
```

## 📞 Support

### Common Issues

**Q: Token không được lưu sau khi login?**
A: Check console for errors, verify API response format

**Q: Vẫn bị 401 sau khi login?**
A: Clear localStorage và login lại, check token format

**Q: Làm sao để test với Postman?**
A: 
1. Login để lấy token
2. Copy token
3. Add Authorization header: `Bearer {token}`

---

**Updated:** December 24, 2025
**Version:** 1.0.0
**Status:** ✅ Implemented

