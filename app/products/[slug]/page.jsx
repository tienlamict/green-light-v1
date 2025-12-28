'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductInfo from '@/components/ProductInfo'
import Tabs from '@/components/Tabs'
import RelatedProducts from '@/components/RelatedProducts'
import StickyBuyBar from '@/components/StickyBuyBar'
import { fetchProductById, fetchProducts } from '@/services/api'

/**
 * Map API product data to component format
 */
function mapProductData(apiProduct) {
  if (!apiProduct) return null

  // Collect all images from all variants
  // Sort by is_main and sort_order to show main image first
  const allImages = []
  if (apiProduct.variants && apiProduct.variants.length > 0) {
    apiProduct.variants.forEach(variant => {
      if (variant.images && Array.isArray(variant.images)) {
        variant.images.forEach(img => {
          // Handle both string and object format
          const imageUrl = typeof img === 'string' 
            ? img 
            : (img.url || img.public_url)
          
          if (imageUrl && !allImages.includes(imageUrl)) {
            allImages.push(imageUrl)
          }
        })
      }
    })
  }

  // If no images found, try thumbnail_url
  if (allImages.length === 0 && apiProduct.thumbnail_url) {
    allImages.push(apiProduct.thumbnail_url)
  }

  // Fallback to placeholder if still no images
  if (allImages.length === 0) {
    allImages.push('/placeholder-product.jpg')
  }

  // Get first variant for price
  const firstVariant = apiProduct.variants && apiProduct.variants.length > 0 
    ? apiProduct.variants[0] 
    : null

  // Calculate price range
  let minPrice = firstVariant?.price || 0
  let maxPrice = firstVariant?.price || 0
  if (apiProduct.variants && apiProduct.variants.length > 1) {
    const prices = apiProduct.variants
      .filter(v => v.price)
      .map(v => v.price)
    if (prices.length > 0) {
      minPrice = Math.min(...prices)
      maxPrice = Math.max(...prices)
    }
  }

  // Format price display
  const displayPrice = minPrice === maxPrice 
    ? minPrice 
    : minPrice // Show min price for now

  return {
    id: apiProduct.product_id,
    product_id: apiProduct.product_id,
    name: apiProduct.name || '',
    slug: apiProduct.slug || apiProduct.product_id || '', // Always include slug
    description: apiProduct.short_desc || apiProduct.description || '',
    fullDescription: apiProduct.description || apiProduct.short_desc || '',
    price: displayPrice,
    oldPrice: displayPrice * 1.2, // Default old price (20% higher)
    rating: 4.5, // Default rating (can be fetched from reviews API later)
    reviewCount: 0, // Default (can be fetched from reviews API later)
    images: allImages,
    category: apiProduct.category?.name || '',
    category_id: apiProduct.category_id,
    inStock: apiProduct.stock > 0,
    stock: apiProduct.stock || 0,
    variants: apiProduct.variants || [],
    deliveryTime: {
      international: '12-26 ngày',
      domestic: '3-6 ngày',
    },
    returnPolicy: '45 ngày',
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProduct()
  }, [slug])

  const loadProduct = async () => {
    if (!slug) {
      setError('Slug không hợp lệ')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch product by slug
      const productData = await fetchProductById(slug)
      
      if (!productData) {
        setError('Không tìm thấy sản phẩm')
        setLoading(false)
        return
      }

      const mappedProduct = mapProductData(productData)
      setProduct(mappedProduct)

      // Load related products (same category, excluding current)
      if (productData.category_id) {
        const related = await fetchProducts({
          category: productData.category_id,
          limit: 5,
          page: 1,
        })
        
        if (related && related.data && Array.isArray(related.data)) {
          const filtered = related.data
            .filter(p => p.product_id !== productData.product_id)
            .slice(0, 4)
            .map(p => {
              const mapped = mapProductData(p)
              // Ensure slug is included
              if (!mapped.slug && p.slug) {
                mapped.slug = p.slug
              }
              // Ensure image is available for RelatedProducts component
              if (!mapped.image && mapped.images && mapped.images.length > 0) {
                mapped.image = mapped.images[0]
              }
              return mapped
            })
          setRelatedProducts(filtered)
        }
      }
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Lỗi khi tải thông tin sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không Tìm Thấy Sản Phẩm</h1>
        <p className="text-gray-600 mb-8">{error || 'Sản phẩm bạn đang tìm kiếm không tồn tại.'}</p>
        <a href="/" className="btn-primary inline-block">
          Về Trang Chủ
        </a>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: product.category || 'Sản phẩm', href: '/' },
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
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

      {/* Sticky Mobile Buy Bar */}
      <StickyBuyBar price={product.price} />
    </div>
  )
}

