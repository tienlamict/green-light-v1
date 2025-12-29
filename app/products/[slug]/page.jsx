'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductSpecs from '@/components/ProductSpecs'
import ProductVariantSelector from '@/components/ProductVariantSelector'
import Tabs from '@/components/Tabs'
import RelatedProducts from '@/components/RelatedProducts'
import StickyBuyBar from '@/components/StickyBuyBar'
import { fetchProductById, fetchProducts } from '@/services/api'

/**
 * Map API product data to component format
 * API Response structure:
 * {
 *   product_id, name, slug, short_desc, description,
 *   price_min, price_max, stock, thumbnail_url, gallery,
 *   category: { category_id, name, slug, ... },
 *   variants: [{ variant_id, name, price, stock, images: [{ image_id, url, is_main, sort_order }] }]
 * }
 */
function mapProductData(apiProduct) {
  console.log('🔵 mapProductData called with:', apiProduct)
  if (!apiProduct) {
    console.warn('⚠️ mapProductData: apiProduct is null/undefined')
    return null
  }

  // Collect all images from all variants
  // API structure: variants[].images[] = { image_id, url, is_main, sort_order }
  const allImages = []
  console.log('🔵 mapProductData: Starting image collection, variants count:', apiProduct.variants?.length)
  
  // First, try gallery if available
  if (apiProduct.gallery && Array.isArray(apiProduct.gallery) && apiProduct.gallery.length > 0) {
    apiProduct.gallery.forEach(imgUrl => {
      if (imgUrl && !allImages.includes(imgUrl)) {
        allImages.push(imgUrl)
      }
    })
  }

  // Then collect from variants
  // API structure: variants[].images[] = { image_id, url, is_main, sort_order }
  if (apiProduct.variants && Array.isArray(apiProduct.variants)) {
    // Collect all images from all variants with their metadata
    const imageEntries = [] // Array of { url, is_main, sort_order, variant_index }
    
    apiProduct.variants.forEach((variant, variantIndex) => {
      if (variant.images && Array.isArray(variant.images)) {
        variant.images.forEach(img => {
          // API format: { image_id, url, is_main, sort_order }
          const imageUrl = img.url
          if (imageUrl) {
            imageEntries.push({
              url: imageUrl,
              is_main: img.is_main === true,
              sort_order: img.sort_order !== undefined ? img.sort_order : 999,
              variant_index: variantIndex
            })
          }
        })
      }
    })

    // Sort by sort_order, then is_main (is_main first), then variant_index
    imageEntries.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order
      }
      // If sort_order is same, prioritize is_main
      if (a.is_main !== b.is_main) {
        return a.is_main ? -1 : 1
      }
      return a.variant_index - b.variant_index
    })

    // Extract unique URLs (keep first occurrence)
    const seenUrls = new Set()
    imageEntries.forEach(entry => {
      if (!seenUrls.has(entry.url)) {
        seenUrls.add(entry.url)
        if (!allImages.includes(entry.url)) {
          allImages.push(entry.url)
        }
      }
    })
  }

  // If still no images, use thumbnail_url
  if (allImages.length === 0 && apiProduct.thumbnail_url) {
    allImages.push(apiProduct.thumbnail_url)
  }

  // Fallback to placeholder if still no images
  if (allImages.length === 0) {
    allImages.push('/placeholder-product.jpg')
  }

  // Use price_min and price_max from API directly
  const minPrice = apiProduct.price_min || 0
  const maxPrice = apiProduct.price_max || apiProduct.price_min || 0
  
  // Display price: use price_min, show price range if different
  const displayPrice = minPrice
  const oldPrice = maxPrice > minPrice ? maxPrice : minPrice * 1.2 // Show maxPrice as oldPrice if range exists

  console.log('🔵 mapProductData: Mapped data -', {
    name: apiProduct.name,
    imagesCount: allImages.length,
    price: displayPrice,
    category: apiProduct.category?.name
  })

  return {
    id: apiProduct.product_id,
    product_id: apiProduct.product_id,
    name: apiProduct.name || '',
    slug: apiProduct.slug || '',
    description: apiProduct.short_desc || apiProduct.description || '',
    fullDescription: apiProduct.description || apiProduct.short_desc || '',
    price: displayPrice,
    price_min: minPrice,
    price_max: maxPrice,
    oldPrice: oldPrice,
    rating: 4.5, // Default rating (can be fetched from reviews API later)
    reviewCount: 0, // Default (can be fetched from reviews API later)
    images: allImages,
    image: allImages[0] || '', // First image for backward compatibility
    category: apiProduct.category?.name || '',
    category_id: apiProduct.category_id,
    category_slug: apiProduct.category?.slug || '',
    inStock: apiProduct.stock > 0,
    stock: apiProduct.stock || 0,
    variants: apiProduct.variants || [],
    thumbnail_url: apiProduct.thumbnail_url,
    deliveryTime: {
      international: '12-26 ngày',
      domestic: '3-6 ngày',
    },
    returnPolicy: '45 ngày',
  }
}

// Get images for selected variant, fallback to all product images
function getVariantImages(variant, product) {
  if (variant && variant.images && variant.images.length > 0) {
    // Map variant images (API format: { image_id, url, is_main, sort_order })
    const variantImages = variant.images
      .map(img => img.url || img.public_url)
      .filter(Boolean)
    if (variantImages.length > 0) {
      return variantImages
    }
  }
  // Fallback to all product images
  return product?.images || []
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    if (slug) {
      console.log('🔵 useEffect triggered, slug:', slug)
      loadProduct()
    } else {
      console.warn('⚠️ useEffect: No slug provided')
      setError('Slug không hợp lệ')
      setLoading(false)
    }
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
      console.log('🔵 Fetching product with slug:', slug)
      const productData = await fetchProductById(slug)
      console.log('🔵 Product data received:', productData)
      
      if (!productData) {
        console.error('❌ No product data returned')
        setError('Không tìm thấy sản phẩm')
        setLoading(false)
        return
      }

      const mappedProduct = mapProductData(productData)
      console.log('🔵 Mapped product:', mappedProduct)
      
      if (!mappedProduct) {
        console.error('❌ Failed to map product data')
        setError('Lỗi khi xử lý dữ liệu sản phẩm')
        setLoading(false)
        return
      }
      
      setProduct(mappedProduct)
      
      // Set initial selected variant
      if (mappedProduct.variants && mappedProduct.variants.length > 0) {
        setSelectedVariant(mappedProduct.variants[0])
      }

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

  // Debug logging
  console.log('🔵 ProductDetailPage Render:', {
    loading,
    error,
    hasProduct: !!product,
    product: product ? { name: product.name, images: product.images?.length } : null,
    slug
  })

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="ml-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không Tìm Thấy Sản Phẩm</h1>
        <p className="text-gray-600 mb-4">{error || 'Sản phẩm bạn đang tìm kiếm không tồn tại.'}</p>
        <p className="text-sm text-gray-500 mb-8">Slug: {slug}</p>
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

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    console.log('Selected variant:', variant)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-6">
        {/* Product Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{product.name}</h1>

        {/* Main Product Section - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 mb-8">
          {/* Column 1: Product Gallery (Larger) */}
          <div className="lg:col-span-6 mb-4 lg:mb-0">
            <div className="bg-white border border-gray-200 lg:border-r-0 rounded-lg lg:rounded-l-lg lg:rounded-r-none overflow-hidden h-full">
              <ProductGallery 
                images={getVariantImages(selectedVariant, product)} 
                productName={product.name} 
              />
            </div>
          </div>

          {/* Column 2: Product Specifications */}
          <div className="lg:col-span-3 mb-3 lg:mb-0">
            <div className="bg-white border border-gray-200 lg:border-l-0 lg:border-r-0 rounded-lg lg:rounded-none overflow-hidden h-full">
              <ProductSpecs 
                product={product} 
                selectedVariant={selectedVariant}
              />
            </div>
          </div>

          {/* Column 3: Variant Selector */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 lg:border-l-0 rounded-lg lg:rounded-r-lg lg:rounded-l-none overflow-hidden h-full">
              <ProductVariantSelector 
                product={product} 
                onVariantChange={handleVariantChange}
              />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}

        {/* Sticky Mobile Buy Bar */}
        <StickyBuyBar price={selectedVariant?.price || product.price_min || product.price} />
      </div>
    </div>
  )
}

