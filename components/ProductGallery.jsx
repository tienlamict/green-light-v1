// ProductGallery - main image viewer with thumbnails and lightbox modal
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Reset selected image when images change
  useEffect(() => {
    setSelectedImage(0)
  }, [images])

  const handleThumbnailClick = (index) => {
    setSelectedImage(index)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedImage(index)
    }
  }

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400">Không có hình ảnh</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-white cursor-zoom-in group flex-shrink-0"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={images[selectedImage]}
          alt={`${productName} - View ${selectedImage + 1}`}
          className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
      </div>

      {/* Thumbnails - Compact */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 border-t border-gray-200 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-gray-900'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-contain p-1 bg-white"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Đóng lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Ảnh trước"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Main Image */}
          <div className="max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedImage]}
              alt={`${productName} - Full view ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Ảnh sau"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
