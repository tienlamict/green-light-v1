# 🚀 Quick Start Guide

## Installation (30 seconds)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Open:** http://localhost:3000

---

## 📂 What You Got

### ✅ Complete Next.js 14 App
- App Router structure
- Tailwind CSS configured
- 7 reusable components
- 16 dummy products
- Fully responsive

### ✅ Key Features
- Product showcase grid
- Filtering sidebar
- Mobile filter drawer
- Sorting & pagination
- Discount badges
- Add to cart buttons
- Hover animations

---

## 🎯 Quick Customization

### Add Your Products
**File:** `data/products.js`

```javascript
{
  id: 17,
  name: 'My Product',
  price: 49.99,
  originalPrice: 69.99,
  image: 'https://your-image.com/product.jpg',
  category: 'Category',
  discount: true,
}
```

### Change Colors
**File:** `tailwind.config.js`

```javascript
colors: {
  primary: {
    DEFAULT: '#your-color',
  },
}
```

### Replace Logo
**File:** `components/Header.jsx`

```jsx
<h1 className="text-2xl font-bold">Your Logo</h1>
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/page.jsx` | Main page |
| `components/ProductCard.jsx` | Product card |
| `components/Header.jsx` | Navigation |
| `data/products.js` | Product data |
| `tailwind.config.js` | Styles config |

---

## 🎨 Component Usage

### Import Components
```javascript
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import ProductGrid from '@/components/ProductGrid'
```

### Use Components
```jsx
<Header />
<ProductCard product={productObject} />
<ProductGrid products={productsArray} />
```

---

## 📱 Responsive Design

- **Mobile:** Single column, filter drawer
- **Tablet:** 2-3 columns, filter button
- **Desktop:** 4 columns, sidebar visible

---

## 🛠️ Available Commands

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Check code quality
```

---

## 🎯 Matches Screenshot

✅ Header with logo, menu, icons  
✅ Grey hero banner  
✅ Category icons (6 circles)  
✅ Sidebar filters (left)  
✅ Product grid (3-4 columns)  
✅ Discount badges (red, top right)  
✅ Price + strikethrough  
✅ Sorting dropdown  
✅ Pagination  
✅ Fully responsive  

---

## 📖 More Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup
- `PROJECT_OVERVIEW.md` - Complete features
- `FILE_TREE.txt` - File structure

---

## 🎉 You're Ready!

Your product showcase page is ready to use. Just install dependencies and start the dev server!

**Questions?** Check the other documentation files.

**Happy coding!** 🚀

