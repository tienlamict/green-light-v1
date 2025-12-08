# Green Light V1 - Product Showcase

A modern Next.js e-commerce product showcase page with TailwindCSS.

## 🚀 Getting Started

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TailwindCSS 3**
- **Lucide React** (Icons)

## 📁 Project Structure

```
green-light-v1/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── globals.css         # Global styles
│   └── page.jsx            # Home/Products page
├── components/
│   ├── Header.jsx          # Navigation header
│   ├── Hero.jsx            # Hero banner section
│   ├── SidebarFilters.jsx  # Product filters
│   ├── ProductCard.jsx     # Product card component
│   └── ProductGrid.jsx     # Product grid layout
├── data/
│   └── products.js         # Dummy product data
├── tailwind.config.js
├── next.config.js
└── package.json
```

## ✨ Features

- Responsive design (mobile, tablet, desktop)
- Product filtering (categories, price, color, tags)
- Product grid with hover effects
- Discount badges
- Price display with strikethrough
- Modern UI with smooth animations

## 📦 Components

- **Header**: Logo, navigation menu, search, user, and cart icons
- **Hero**: Category showcase with icons
- **SidebarFilters**: Categories, price slider, color filter, tags
- **ProductCard**: Image, name, price, discount badge
- **ProductGrid**: Responsive grid layout with sorting

## 🎨 Customization

Edit the product data in `data/products.js` to add your own products.
Customize colors and styles in `tailwind.config.js`.

## 📄 License

MIT

