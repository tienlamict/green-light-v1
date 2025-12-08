// ProductInfo - product details card with price, rating, actions
'use client'
import { useState } from 'react'
import QuantitySelector from './QuantitySelector'

export default function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)

  const handleBuyNow = () => {
    // Navigate to checkout
    window.location.href = '/checkout'
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="space-y-6">
      {/* Title and Wishlist */}
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <button
          onClick={toggleWishlist}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <svg 
            className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400'}`}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">{product.reviewCount} đánh giá</span>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-3">
        <span className="text-4xl font-bold text-gray-900">{product.price.toLocaleString('vi-VN')}đ</span>
        <span className="text-xl text-gray-400 line-through">{product.oldPrice.toLocaleString('vi-VN')}đ</span>
        <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
          TIẾT KIỆM {discountPercent}%
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{product.description}</p>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
        <QuantitySelector 
          initialValue={quantity}
          onChange={setQuantity}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBuyNow}
          className="btn-primary flex-1"
        >
          MUA NGAY
        </button>
      </div>

      {/* Delivery & Return Info */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <div className="text-sm">
            <span className="text-gray-600">Thời gian giao hàng ước tính: </span>
            <span className="font-medium">{product.deliveryTime.international}</span>
            <span className="text-gray-600"> (Quốc tế), </span>
            <span className="font-medium">{product.deliveryTime.domestic}</span>
            <span className="text-gray-600"> (Việt Nam).</span>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <div className="text-sm">
            <span className="text-gray-600">Đổi trả trong vòng </span>
            <span className="font-medium">{product.returnPolicy}</span>
            <span className="text-gray-600"> kể từ ngày mua. Thuế và phí không được hoàn lại.</span>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-br from-green-300 to-green-500 rounded-lg p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-bold text-lg">shopify</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Tận hưởng dùng thử miễn phí 3 ngày.</h3>
          <p className="text-gray-900 font-semibold mb-1">Sau đó bắt đầu bán với giá $1/tháng</p>
          <p className="text-sm text-gray-800 mb-3">cho 3 tháng đầu tiên của bạn.</p>
          <p className="text-xs text-gray-700 mb-3">Khám phá, xây dựng và đưa doanh nghiệp của bạn<br />vào cuộc sống theo nhịp độ của riêng bạn.</p>
          <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors">
            Đăng Ký Ngay
          </button>
        </div>
        <div className="absolute right-4 bottom-4 opacity-20">
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
            <path d="M20 20h60v60H20z" />
          </svg>
        </div>
      </div>

    </div>
  )
}
