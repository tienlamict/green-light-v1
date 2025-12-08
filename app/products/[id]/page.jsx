// Product Detail Page - displays full product information with gallery, specs, and related items
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductInfo from '@/components/ProductInfo'
import Tabs from '@/components/Tabs'
import RelatedProducts from '@/components/RelatedProducts'
import StickyBuyBar from '@/components/StickyBuyBar'
import { products } from '@/data/products'

// Get product data by ID from products array
const getProductData = (id) => {
  const product = products.find(p => p.id === parseInt(id))
  
  if (!product) {
    return null
  }

  // Enhance product data with additional details for detail page
  return {
    ...product,
    rating: 4.5,
    reviewCount: 0,
    description: 'Chiếu sáng không gian của bạn với phong cách nổi bật! Mỗi sản phẩm được làm từ chất liệu cao cấp, mang lại ánh sáng ấm áp và thoải mái cho mọi không gian. Thiết kế hiện đại, dễ lắp đặt và bền bỉ theo thời gian...',
    fullDescription: 'Chiếu sáng không gian của bạn với phong cách nổi bật! Mỗi sản phẩm được làm từ chất liệu cao cấp, mang lại ánh sáng ấm áp và thoải mái cho mọi không gian. Thiết kế hiện đại, dễ lắp đặt và bền bỉ theo thời gian. Sản phẩm phù hợp cho phòng khách, phòng ngủ, văn phòng và nhiều không gian khác.',
    images: [
      product.image,
      'https://placehold.co/600x600/F5F5F5/888888?text=View+2',
      'https://placehold.co/600x600/EFEFEF/777777?text=View+3',
      'https://placehold.co/600x600/E5E5E5/666666?text=View+4',
      'https://placehold.co/600x600/DADADA/555555?text=View+5',
    ],
    deliveryTime: {
      international: '12-26 ngày',
      domestic: '3-6 ngày',
    },
    returnPolicy: '45 ngày',
    inStock: true,
    oldPrice: product.originalPrice,
  }
}

// Get related products (random 4 products excluding current)
const getRelatedProducts = (currentId) => {
  return products
    .filter(p => p.id !== parseInt(currentId))
    .slice(0, 4)
    .map(p => ({
      ...p,
      rating: 4,
      oldPrice: p.originalPrice,
    }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const product = getProductData(params.id)
  
  if (!product) {
    return {
      title: 'Không Tìm Thấy Sản Phẩm - Green Light',
    }
  }
  
  return {
    title: `${product.name} - Green Light`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

// Main page component
export default function ProductDetailPage({ params }) {
  const product = getProductData(params.id)
  
  // Handle product not found
  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không Tìm Thấy Sản Phẩm</h1>
        <p className="text-gray-600 mb-8">Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
        <a href="/" className="btn-primary inline-block">
          Về Trang Chủ
        </a>
      </div>
    )
  }

  const relatedProducts = getRelatedProducts(params.id)

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: product.category, href: '/' },
    { label: product.name },
  ]

  return (
    <div className="container-custom py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
        {/* Left: Product Gallery (60%) */}
        <div className="lg:col-span-3">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Product Info (40%) */}
        <div className="lg:col-span-2">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs product={product} />

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      {/* Sticky Mobile Buy Bar */}
      <StickyBuyBar price={product.price} />
    </div>
  )
}

// For static generation - generate paths for all products
export async function generateStaticParams() {
  return products.map(product => ({
    id: product.id.toString(),
  }))
}

