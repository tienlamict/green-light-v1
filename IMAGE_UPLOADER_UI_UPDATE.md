# Image Uploader UI Update

## ✅ Đã Cập Nhật UI Theo Mẫu Rare Beauty

Thiết kế lại component `ImageUploader` với style hiện đại, clean và user-friendly.

---

## 🎨 New Design Features

### 1. **Grid Layout 4 Cột**
- Hiển thị ảnh trong grid 4 cột
- Aspect ratio vuông (1:1) cho tất cả ảnh
- Gap 12px giữa các ảnh

### 2. **Image Cards**
- Border radius lớn hơn (rounded-xl)
- Border 2px với màu gray-200
- Hover effect: border chuyển sang gray-300
- Background gray-50 khi loading

### 3. **Cover Badge**
- Badge "Cover" với icon Star
- Background vàng (yellow-500)
- Hiển thị ở góc trên bên trái
- Font size nhỏ với padding compact

### 4. **Action Buttons**
- Nền trắng thay vì màu
- Icon màu gray-700 (set cover) và red-600 (remove)
- Shadow lớn hơn (shadow-lg)
- Hover: background chuyển màu nhẹ
- Smooth transition

### 5. **Add Image Button**
- Border dashed với màu blue-300
- Background blue-50, hover: blue-100
- Icon Plus trong circle blue-500
- Text "Add Image" bên dưới
- Khi uploading: hiển thị spinner + progress

### 6. **Info Bar**
- Hiển thị số lượng ảnh: "X of Y images"
- Icon cloud nếu upload mode = minio
- Text size nhỏ (text-xs)
- Màu gray-500

---

## 🎯 UI Components Breakdown

### Image Card Structure:
```
┌─────────────────┐
│ [Cover Badge]   │  ← Top-left corner
│                 │
│     IMAGE       │
│                 │
│  [Hover Actions]│  ← Center (on hover)
└─────────────────┘
```

### Add Button Structure:
```
┌─────────────────┐
│                 │
│   ┌───────┐     │
│   │   +   │     │  ← Blue circle with plus
│   └───────┘     │
│   Add Image     │  ← Text below
└─────────────────┘
```

---

## 📐 Layout Specs

### Grid:
- `grid-cols-4` - 4 columns
- `gap-3` - 12px gap
- `aspect-square` - 1:1 ratio

### Image Card:
- `rounded-xl` - 12px border radius
- `border-2` - 2px border
- `border-gray-200` - Default border color
- `hover:border-gray-300` - Hover border color

### Cover Badge:
- `bg-yellow-500` - Yellow background
- `text-white` - White text
- `px-2 py-0.5` - Compact padding
- `rounded-full` - Fully rounded
- `text-xs` - Small text
- `font-medium` - Medium weight

### Action Buttons:
- `bg-white` - White background
- `rounded-lg` - 8px border radius
- `shadow-lg` - Large shadow
- `p-2` - 8px padding
- `opacity-0 group-hover:opacity-100` - Show on hover

### Add Button:
- `border-2 border-dashed` - Dashed border
- `border-blue-300` - Blue border
- `bg-blue-50` - Light blue background
- `hover:bg-blue-100` - Darker on hover
- `rounded-xl` - 12px border radius

### Plus Icon Circle:
- `w-12 h-12` - 48px size
- `rounded-full` - Circle
- `bg-blue-500` - Blue background
- Icon: `w-6 h-6` white color

---

## 🎨 Color Palette

### Image Cards:
- Border: `gray-200` → `gray-300` (hover)
- Background: `gray-50`

### Cover Badge:
- Background: `yellow-500`
- Text: `white`

### Action Buttons:
- Background: `white`
- Set Cover Icon: `gray-700`
- Remove Icon: `red-600`
- Hover: `gray-100` / `red-50`

### Add Button:
- Border: `blue-300` → `blue-400` (hover)
- Background: `blue-50` → `blue-100` (hover)
- Circle: `blue-500`
- Text: `blue-600`

### Info Text:
- Default: `gray-500`
- Cloud storage: `blue-500`

---

## 🔄 Interactions

### 1. **Hover on Image Card**
- Border color changes
- Overlay appears (bg-black with 40% opacity)
- Action buttons fade in

### 2. **Click Set Cover Button**
- Current cover badge moves to new image
- Previous cover loses badge

### 3. **Click Remove Button**
- Image removed from grid
- If was cover → first image becomes cover
- Grid re-arranges automatically

### 4. **Click Add Button**
- Opens file picker
- Supports multiple selection
- Drag & drop also supported

### 5. **During Upload**
- Add button shows spinner
- Progress counter: "1/3"
- Button disabled

---

## 📱 Responsive Behavior

Current: Fixed 4 columns

**Có thể cải thiện:**
```jsx
// Mobile: 2 columns
// Tablet: 3 columns  
// Desktop: 4 columns
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
```

---

## ✨ Animation & Transitions

### All transitions use:
```css
transition-all
```

### Hover effects:
- Border color
- Background color
- Opacity (0 → 100)
- Shadow

### Smooth animations:
- Spinner rotation
- Fade in/out
- Color changes

---

## 🧪 Test Checklist

- [ ] Grid hiển thị đúng 4 cột
- [ ] Ảnh có aspect ratio 1:1
- [ ] Cover badge hiển thị đúng
- [ ] Hover hiển thị action buttons
- [ ] Set cover hoạt động
- [ ] Remove hoạt động
- [ ] Add button hiển thị đúng
- [ ] Upload progress hiển thị
- [ ] Drag & drop hoạt động
- [ ] Info bar hiển thị đúng số lượng

---

## 🎯 Before vs After

### Before:
- Upload area ở trên, preview grid ở dưới
- 5 columns grid
- Action buttons có màu (yellow, red)
- Main image indicator text ở dưới

### After:
- Grid thống nhất với add button
- 4 columns grid
- Action buttons màu trắng với icon màu
- Info bar compact ở dưới
- Cover badge trên ảnh
- Style giống Rare Beauty

---

## 🚀 Usage

Component không thay đổi props, chỉ thay đổi UI:

```jsx
<ImageUploader
  images={variant.images || []}
  onChange={(images) => handleVariantImagesChange(index, images)}
  maxImages={5}
  uploadMode={product ? 'minio' : 'preview'}
  productId={product?.product_id}
  variantId={variant.variant_id}
/>
```

---

**🎨 UI đã được cập nhật theo mẫu Rare Beauty - Clean, Modern, User-friendly!**

