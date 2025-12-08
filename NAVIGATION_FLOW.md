# 🗺️ Navigation Flow - Green Light V1

## 📊 Project Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GREEN LIGHT V1 PROJECT                    │
│                                                              │
│  ┌────────────────────┐         ┌────────────────────┐     │
│  │   TRANG CHÍNH      │         │  TRANG CHI TIẾT    │     │
│  │   (Giữ Nguyên)     │ ──────> │   (Mới Thêm)       │     │
│  │                    │  Click  │                    │     │
│  │   URL: /           │ Product │ URL: /products/[id]│     │
│  └────────────────────┘         └────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Navigation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. User visits homepage                                         │
│     http://localhost:3000/                                       │
│                                                                  │
│     ┌────────────────────────────────────────────────┐          │
│     │  Header: ALAMP | HOME SHOPS PRODUCTS BLOG      │          │
│     ├────────────────────────────────────────────────┤          │
│     │  Hero: Nature-Inspired + 6 Category Icons      │          │
│     ├────────────────────────────────────────────────┤          │
│     │  ┌──────────┐  ┌─────────────────────────┐    │          │
│     │  │ Sidebar  │  │  Product Grid           │    │          │
│     │  │ Filters  │  │  ┌────┐ ┌────┐ ┌────┐  │    │          │
│     │  │          │  │  │ P1 │ │ P2 │ │ P3 │  │    │          │
│     │  │ Category │  │  └────┘ └────┘ └────┘  │    │          │
│     │  │ Price    │  │  ┌────┐ ┌────┐ ┌────┐  │    │          │
│     │  │ Color    │  │  │ P4 │ │ P5 │ │ P6 │  │    │          │
│     │  │ Tags     │  │  └────┘ └────┘ └────┘  │    │          │
│     │  └──────────┘  └─────────────────────────┘    │          │
│     └────────────────────────────────────────────────┘          │
│                                                                  │
│  2. User clicks on Product Card (e.g., P1)                      │
│     ↓                                                            │
│                                                                  │
│  3. Navigate to Product Detail Page                             │
│     http://localhost:3000/products/1                            │
│                                                                  │
│     ┌────────────────────────────────────────────────┐          │
│     │  Header: ALAMP | HOME SHOPS PRODUCTS BLOG      │          │
│     ├────────────────────────────────────────────────┤          │
│     │  Breadcrumb: Home › Category › Product Name    │          │
│     ├────────────────────────────────────────────────┤          │
│     │  ┌────────────────┐  ┌──────────────────┐     │          │
│     │  │ Product Gallery│  │  Product Info    │     │          │
│     │  │                │  │                  │     │          │
│     │  │  [Main Image]  │  │  Title, Rating   │     │          │
│     │  │                │  │  Price, Badge    │     │          │
│     │  │  [Thumbnails]  │  │  Description     │     │          │
│     │  │  □ □ □ □ □     │  │  Quantity: [- 1 +]│   │          │
│     │  │                │  │  [Add to Cart]   │     │          │
│     │  │                │  │  [Buy It Now]    │     │          │
│     │  └────────────────┘  └──────────────────┘     │          │
│     ├────────────────────────────────────────────────┤          │
│     │  Tabs: Description | Shipping | Reviews       │          │
│     ├────────────────────────────────────────────────┤          │
│     │  Related Products:                             │          │
│     │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │          │
│     │  │ R1 │ │ R2 │ │ R3 │ │ R4 │                  │          │
│     │  └────┘ └────┘ └────┘ └────┘                  │          │
│     └────────────────────────────────────────────────┘          │
│                                                                  │
│  4. User can:                                                   │
│     - Click Related Product → Navigate to that product          │
│     - Click Breadcrumb "Home" → Back to homepage                │
│     - Click Header "PRODUCTS" → Back to homepage                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

### **Trang Chính (Homepage)**
```
app/page.jsx
├── Hero.jsx
│   └── 6 Category Icons
├── SidebarFilters.jsx (Desktop)
│   ├── Categories
│   ├── Price Range Slider
│   ├── Color Filter
│   ├── Tags
│   └── Brands
├── MobileFilterDrawer.jsx (Mobile)
│   └── Same as SidebarFilters
└── ProductGrid.jsx
    ├── Sorting Dropdown
    ├── View Toggle
    ├── ProductCard.jsx (x16)
    │   ├── Image
    │   ├── Discount Badge
    │   ├── Favorite Button
    │   ├── Title
    │   ├── Price
    │   └── Add to Cart Button
    └── Pagination
```

### **Trang Chi Tiết (Product Detail)**
```
app/products/[id]/page.jsx
├── Breadcrumbs.jsx
│   └── Home › Category › Product Name
├── ProductGallery.jsx
│   ├── Main Image (clickable → lightbox)
│   ├── Thumbnails (5 images)
│   └── Lightbox Modal
│       ├── Full Image
│       ├── Prev/Next Buttons
│       └── Close Button
├── ProductInfo.jsx
│   ├── Title
│   ├── Rating Stars + Review Count
│   ├── Price + Old Price + Sale Badge
│   ├── Description
│   ├── QuantitySelector.jsx
│   │   └── [- | Number | +]
│   ├── Add to Cart Button → Toast.jsx
│   ├── Buy It Now Button
│   ├── Wishlist Toggle (Heart Icon)
│   ├── Delivery Info (with icon)
│   ├── Return Policy (with icon)
│   └── Promotional Banner
├── Tabs.jsx
│   ├── Tab Headers (Description | Shipping | Reviews)
│   └── Tab Content
│       ├── Description Tab
│       ├── Shipping & Return Tab
│       └── Customer Reviews Tab
└── RelatedProducts.jsx
    └── ProductCard.jsx (x4)
```

---

## 🔀 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA FLOW                             │
└─────────────────────────────────────────────────────────────┘

data/products.js (16 products)
        │
        ├──────────────────────────┬─────────────────────────┐
        │                          │                         │
        ▼                          ▼                         ▼
app/page.jsx              app/products/[id]/page.jsx   RelatedProducts
(Product Listing)         (Product Detail)             (4 products)
        │                          │
        │                          │
        ▼                          ▼
ProductGrid                getProductData(id)
        │                          │
        ▼                          ├─> ProductGallery
ProductCard (x16)                  ├─> ProductInfo
        │                          ├─> Tabs
        │                          └─> RelatedProducts
        │
        └──> Click Product
                  │
                  ▼
        Navigate to /products/[id]
```

---

## 🎨 Responsive Behavior

### **Desktop (>1024px)**
```
┌────────────────────────────────────────────────────────┐
│  Header: Logo | Menu | Icons                          │
├────────────────────────────────────────────────────────┤
│  Breadcrumb: Home › Category › Product                │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │   Product Gallery    │  │   Product Info       │   │
│  │      (60%)           │  │      (40%)           │   │
│  │                      │  │                      │   │
│  │   [Main Image]       │  │  Title, Price        │   │
│  │   [Thumbnails]       │  │  Quantity Selector   │   │
│  │                      │  │  [Add to Cart]       │   │
│  │                      │  │  [Buy It Now]        │   │
│  └──────────────────────┘  └──────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  Tabs: Description | Shipping | Reviews               │
├────────────────────────────────────────────────────────┤
│  Related Products: [P1] [P2] [P3] [P4]                │
└────────────────────────────────────────────────────────┘
```

### **Mobile (<768px)**
```
┌────────────────────────────────────┐
│  Header: Logo | Menu | Icons       │
├────────────────────────────────────┤
│  Breadcrumb: Home › ... › Product  │
├────────────────────────────────────┤
│  Product Gallery (100%)            │
│  ┌──────────────────────────────┐  │
│  │   [Main Image]               │  │
│  │   [Thumbnails - Scroll →]   │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Product Info (100%)               │
│  Title, Price, Description         │
│  Quantity: [- 1 +]                 │
│  [Add to Cart]                     │
│  [Buy It Now]                      │
├────────────────────────────────────┤
│  Tabs (Stacked)                    │
├────────────────────────────────────┤
│  Related Products (2 columns)      │
│  ┌────────┐  ┌────────┐            │
│  │   P1   │  │   P2   │            │
│  └────────┘  └────────┘            │
│  ┌────────┐  ┌────────┐            │
│  │   P3   │  │   P4   │            │
│  └────────┘  └────────┘            │
├────────────────────────────────────┤
│  [Sticky Buy Bar]                  │
│  Price: $80.00  [Add to Cart]      │
└────────────────────────────────────┘
```

---

## 🚀 Quick Test Scenarios

### **Scenario 1: Homepage to Detail**
1. Visit `http://localhost:3000/`
2. See product grid with 16 products
3. Click on "Celestia Shine" (Product #1)
4. Navigate to `/products/1`
5. See product detail page
6. ✅ Success!

### **Scenario 2: Direct Access**
1. Visit `http://localhost:3000/products/5`
2. See "Opal Light" product detail
3. ✅ Success!

### **Scenario 3: Related Products**
1. Visit `/products/1`
2. Scroll to "Related Products"
3. Click on any related product
4. Navigate to that product's detail page
5. ✅ Success!

### **Scenario 4: Back to Homepage**
1. On any product detail page
2. Click breadcrumb "Home"
3. Navigate back to `/`
4. See product grid again
5. ✅ Success!

---

## 📱 Mobile Navigation

```
Mobile Menu
    │
    ├─ Home (/)
    ├─ Shops
    ├─ Products (/)
    ├─ Blog
    └─ Pages

Product Card (Mobile)
    │
    ├─ Tap Image → Navigate to Detail
    ├─ Tap Title → Navigate to Detail
    └─ Tap "Add to Cart" → Add to cart (no navigation)

Product Detail (Mobile)
    │
    ├─ Swipe Thumbnails → Change main image
    ├─ Tap Main Image → Open lightbox
    ├─ Sticky Buy Bar → Always visible at bottom
    └─ Tap Related Product → Navigate to that product
```

---

## 🎯 Summary

**Navigation hoàn chỉnh giữa 2 trang:**

1. **Homepage (/)** → Click Product → **Detail (/products/[id])**
2. **Detail** → Click Breadcrumb → **Homepage**
3. **Detail** → Click Related Product → **Another Detail**

**Tất cả đều hoạt động mượt mà!** ✨

---

**Ready to test!** Chạy `npm run dev` và thử navigation flow! 🚀

