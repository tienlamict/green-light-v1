# Product Thumbnail Upload Feature

## ✅ Đã Thêm Upload Thumbnail Riêng

Thêm ô upload ảnh đại diện (thumbnail) riêng cho product, hiển thị trong phần **Tóm Tắt**.

---

## 🎨 UI Design

### Vị Trí:
- **Sidebar phải** - Phần "Tóm Tắt"
- **Trên cùng** - Trước thông tin sản phẩm
- **Full width** của sidebar

### Style:
- Aspect ratio **1:1** (vuông)
- Border radius `rounded-xl` (12px)
- Border dashed khi chưa có ảnh
- Hover effects mượt mà

---

## 📐 Layout

```
┌─────────────────────────┐
│      Tóm Tắt            │
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   THUMBNAIL     │   │  ← Upload area
│   │                 │   │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│ Tên Sản Phẩm: ...      │
│ Slug: ...               │
│ Danh Mục: ...           │
│ ...                     │
└─────────────────────────┘
```

---

## 🎯 States

### 1. **Empty State** (Chưa có ảnh)

```
┌─────────────────────────┐
│                         │
│       ┌─────┐           │
│       │ 🖼️  │           │  ← Icon
│       └─────┘           │
│   Upload Thumbnail      │  ← Text
│                         │
└─────────────────────────┘
```

**Style:**
- Border: `border-2 border-dashed border-gray-300`
- Background: `bg-gray-50`
- Hover: `bg-gray-100`, `border-gray-400`
- Icon: Circle gray với ImageIcon
- Cursor: `pointer`

---

### 2. **With Image** (Đã có ảnh)

```
┌─────────────────────────┐
│                         │
│      [IMAGE PREVIEW]    │
│                         │
│    [X Remove] (hover)   │  ← Button on hover
│                         │
└─────────────────────────┘
```

**Style:**
- Border: `border-2 border-gray-200`
- Image: `object-cover` full size
- Hover overlay: `bg-black bg-opacity-40`
- Remove button: White background, red icon

---

## 🔧 Component Structure

### ThumbnailUploader Component

```jsx
function ThumbnailUploader({ thumbnail, onChange }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    // Read file as base64
    // Call onChange with { file, preview, url }
  }

  const handleRemove = () => {
    // Clear thumbnail
    // Reset file input
  }

  return (
    // Render upload area or preview
  )
}
```

**Props:**
- `thumbnail`: Object `{ file, preview, url }` hoặc `null`
- `onChange`: Function để update thumbnail state

---

## 📊 State Management

### In ProductFormNew:

```javascript
// State
const [thumbnail, setThumbnail] = useState(null)

// Load from product (edit mode)
useEffect(() => {
  if (product && product.thumbnail_url) {
    setThumbnail({
      url: product.thumbnail_url,
      preview: product.thumbnail_url
    })
  }
}, [product])

// Submit logic
const thumbnailUrl = thumbnail?.url || ''
```

---

## 🔄 Data Flow

### Create Product Flow:

```
1. User clicks upload area
2. File picker opens
3. User selects image
4. Image converted to base64 (preview)
5. Thumbnail state updated
6. Preview displayed
7. On submit:
   - If thumbnail has base64 → Skip (or upload to MinIO first)
   - If thumbnail has real URL → Send to backend
```

### Edit Product Flow:

```
1. Load product from API
2. If product.thumbnail_url exists → Set thumbnail state
3. Display existing thumbnail
4. User can:
   - Keep existing (do nothing)
   - Remove (set null)
   - Replace (upload new)
5. On submit → Send thumbnail_url to backend
```

---

## 📝 API Integration

### Request Body:

```json
{
  "name": "Đèn LED...",
  "slug": "den-led...",
  "thumbnail_url": "https://cdn.example.com/thumbnail.jpg",  ← Thumbnail URL
  "category_id": "uuid",
  "variants": [...]
}
```

### Priority Logic:

```javascript
let thumbnailUrl = ''

// 1. Ưu tiên thumbnail upload riêng
if (thumbnail && thumbnail.url && !thumbnail.url.startsWith('data:image')) {
  thumbnailUrl = thumbnail.url
}
// 2. Fallback: Lấy ảnh đầu tiên của variant đầu tiên
else if (variants[0]?.images?.[0]) {
  thumbnailUrl = variants[0].images[0].url
}
```

---

## 🎨 UI Specs

### Empty State:
- Width: Full sidebar width
- Height: Same as width (aspect-square)
- Border: 2px dashed gray-300
- Background: gray-50
- Icon circle: 48px (w-12 h-12)
- Icon: 24px (w-6 h-6)
- Text: text-xs, gray-500, font-medium

### With Image:
- Border: 2px solid gray-200
- Image: object-cover, full size
- Overlay: bg-black bg-opacity-40 (on hover)
- Remove button:
  - Background: white
  - Icon: red-600 (w-4 h-4)
  - Padding: p-2
  - Border radius: rounded-lg
  - Shadow: shadow-lg

---

## 🔄 Interactions

### 1. Click Upload Area
- Opens native file picker
- Accept: `image/*`
- Single file only

### 2. File Selected
- Read file as DataURL
- Create thumbnail object:
  ```javascript
  {
    file: File,
    preview: "data:image/jpeg;base64,...",
    url: "data:image/jpeg;base64,..."
  }
  ```
- Update state
- Display preview

### 3. Hover on Image
- Show dark overlay
- Show remove button
- Smooth transition

### 4. Click Remove
- Clear thumbnail state (set to null)
- Reset file input
- Show empty state

---

## 📱 Responsive

Thumbnail tự động scale theo width của sidebar:
- Desktop: ~300-400px
- Tablet: ~250-300px
- Mobile: Full width

Aspect ratio luôn 1:1 (vuông)

---

## ✨ Features

### ✅ Single Image Upload
- Chỉ 1 ảnh duy nhất
- Replace khi upload ảnh mới
- Không có gallery

### ✅ Preview
- Hiển thị ngay sau khi chọn
- Base64 preview (không cần upload ngay)

### ✅ Remove
- Button remove on hover
- Confirm không cần (vì chỉ local state)

### ✅ Priority Logic
- Ưu tiên thumbnail riêng
- Fallback về ảnh variant đầu tiên
- Tránh gửi base64 trong API request

---

## 🧪 Test Cases

### 1. Create Product - No Thumbnail
- [ ] Upload area hiển thị
- [ ] Click mở file picker
- [ ] Select image → Preview hiển thị
- [ ] Remove → Về empty state
- [ ] Submit → thumbnail_url = "" hoặc ảnh variant đầu

### 2. Create Product - With Thumbnail
- [ ] Upload thumbnail
- [ ] Preview hiển thị
- [ ] Submit → thumbnail_url được gửi

### 3. Edit Product - Has Thumbnail
- [ ] Load product → Thumbnail hiển thị
- [ ] Hover → Remove button xuất hiện
- [ ] Remove → Thumbnail cleared
- [ ] Submit → thumbnail_url = ""

### 4. Edit Product - Replace Thumbnail
- [ ] Load product → Thumbnail hiển thị
- [ ] Click upload → File picker mở
- [ ] Select new image → Preview updated
- [ ] Submit → New thumbnail_url

---

## 🎯 Benefits

### 1. **Flexible**
- Có thể upload thumbnail riêng
- Hoặc dùng ảnh variant (auto)

### 2. **User-Friendly**
- UI đơn giản, dễ hiểu
- Preview ngay lập tức
- Remove dễ dàng

### 3. **Clean Code**
- Component riêng biệt
- State management rõ ràng
- Reusable

### 4. **SEO & UX**
- Thumbnail riêng cho product listing
- Không phụ thuộc vào variant images
- Tối ưu cho card/grid display

---

## 📋 Summary

**Location:** Sidebar "Tóm Tắt" - Top section

**Component:** `ThumbnailUploader` (inline trong ProductFormNew)

**State:** `thumbnail` - Object hoặc null

**Features:**
- ✅ Single image upload
- ✅ Base64 preview
- ✅ Remove button
- ✅ Priority logic (thumbnail → variant image)
- ✅ Edit mode support

**UI:** Clean, modern, giống style ImageUploader

---

**🎉 Feature Complete! Thumbnail upload đã sẵn sàng!**

