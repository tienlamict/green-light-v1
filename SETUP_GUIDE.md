# Setup Guide - Green Light V1

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 2. Run Development Server

```bash
npm run dev
```

or

```bash
yarn dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
green-light-v1/
├── app/
│   ├── layout.jsx          # Root layout with metadata
│   ├── page.jsx            # Main products page
│   └── globals.css         # Global styles & Tailwind directives
│
├── components/
│   ├── Header.jsx          # Navigation header with logo, menu, icons
│   ├── Hero.jsx            # Hero banner with category icons
│   ├── SidebarFilters.jsx  # Filter sidebar (categories, price, color, tags)
│   ├── ProductCard.jsx     # Individual product card
│   ├── ProductGrid.jsx     # Product grid with sorting
│   └── MobileFilterDrawer.jsx  # Mobile filter drawer
│
├── data/
│   └── products.js         # Product data array
│
├── tailwind.config.js      # Tailwind configuration
├── next.config.js          # Next.js configuration
├── jsconfig.json           # Path aliases configuration
└── package.json            # Dependencies
```

## 🎨 Customization

### Adding New Products

Edit `data/products.js`:

```javascript
{
  id: 17,
  name: 'Your Product Name',
  price: 49.99,
  originalPrice: 69.99,
  image: 'https://placehold.co/400x400/e5e5e5/999999?text=Product',
  category: 'Category Name',
  discount: true,
}
```

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#your-color',
        light: '#your-light-color',
      },
    },
  },
}
```

### Modifying Categories

Edit `components/SidebarFilters.jsx` - update the `categories` array.

### Changing Hero Categories

Edit `components/Hero.jsx` - update the `categories` array with your icons.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Key Features

✅ Responsive design (mobile, tablet, desktop)
✅ Product filtering sidebar
✅ Mobile filter drawer
✅ Price range slider
✅ Color filter
✅ Tag filtering
✅ Product sorting (Featured, Price, Name)
✅ Grid/List view toggle
✅ Discount badges
✅ Hover animations
✅ Add to cart functionality
✅ Favorite/wishlist toggle
✅ Pagination
✅ Modern UI with Tailwind

## 🎯 Component Props

### ProductCard
```javascript
<ProductCard product={productObject} />
```

### ProductGrid
```javascript
<ProductGrid products={productsArray} />
```

### SidebarFilters
```javascript
<SidebarFilters onFilterChange={(filters) => console.log(filters)} />
```

## 🐛 Troubleshooting

### Images not loading?
- Check `next.config.js` has correct image domains
- Verify image URLs are accessible

### Styles not applying?
- Ensure Tailwind is properly configured
- Check `globals.css` imports Tailwind directives
- Run `npm run dev` to rebuild

### Module not found errors?
- Check `jsconfig.json` for path aliases
- Verify all imports use correct paths
- Run `npm install` again

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
```

Deploy to Vercel with one click or via CLI:

```bash
vercel
```

### Other Platforms

Build the project:

```bash
npm run build
npm start
```

## 📄 License

MIT License - Feel free to use this in your projects!

## 🤝 Support

For issues or questions, please check:
- Next.js documentation: https://nextjs.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs

