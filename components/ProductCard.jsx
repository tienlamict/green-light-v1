'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useState } from 'react'

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Support both id and product_id from API
  // Use slug if available, otherwise fallback to id/product_id
  const productSlug = product.slug || product.id || product.product_id
  const productId = product.id || product.product_id
  
  // Get price from API: price_min and price_max
  const priceMin = product.price_min || 0
  const priceMax = product.price_max || product.price_min || 0
  
  // Get image from API: thumbnail_url (priority)
  const productImage = product.thumbnail_url || product.image || product.image_url || product.thumbnail || '/placeholder-image.jpg'
  const productName = product.name || product.product_name || 'Unnamed Product'

  // Calculate discount percentage if price_max > price_min
  const discountPercentage = priceMax > priceMin
    ? Math.round(((priceMax - priceMin) / priceMax) * 100)
    : 0

  return (
    <div
      className="product-card group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg transform rotate-12">
            -{discountPercentage}%
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsFavorite(!isFavorite)
        }}
        className="absolute top-3 left-3 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <Heart
          className={`w-4 h-4 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </button>

      {/* Product Image - clickable to detail page */}
      <Link href={`/products/${productSlug}`}>
        <div className="relative h-64 bg-gray-100 overflow-hidden rounded-t-lg cursor-pointer">
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${productSlug}`}>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors cursor-pointer">
            {productName}
          </h3>
        </Link>

        {/* Price - Display min-max range */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="ml-1 text-base font-normal text-red-500">
            {priceMin.toLocaleString('vi-VN')}đ
            {priceMax > priceMin && (
              <span className="ml-1 text-base font-normal">- {priceMax.toLocaleString('vi-VN')}đ</span>
            )}
          </span>
        </div>

      </div>
    </div>
  )
}

export default ProductCard

