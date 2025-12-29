// ProductVariantSelector - Display and select product variants
'use client'
import { useState, useEffect } from 'react'
import ProductAttributeFilters from './ProductAttributeFilters'

export default function ProductVariantSelector({ product, onVariantChange }) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.variant_id || null
  )
  const [filteredVariants, setFilteredVariants] = useState(product.variants || [])
  const [selectedFilters, setSelectedFilters] = useState({})

  useEffect(() => {
    // Filter variants based on selected attributes
    if (!product.variants) return

    let filtered = product.variants

    if (Object.keys(selectedFilters).length > 0) {
      filtered = product.variants.filter(variant => {
        if (!variant.attributes) return false

        return Object.keys(selectedFilters).every(filterKey => {
          const filterValue = selectedFilters[filterKey]
          const variantValue = variant.attributes[filterKey]
          
          if (!variantValue) return false

          // Handle multiple values (e.g., "3000K/4000K/6500K")
          const variantValues = String(variantValue).split(/[\/,]/).map(v => v.trim())
          return variantValues.includes(filterValue)
        })
      })
    }

    setFilteredVariants(filtered)

    // Auto-select first filtered variant if current selection is not in filtered list
    if (filtered.length > 0) {
      const isCurrentInFiltered = filtered.some(v => v.variant_id === selectedVariantId)
      if (!isCurrentInFiltered) {
        handleVariantSelect(filtered[0].variant_id)
      }
    }
  }, [selectedFilters, product.variants])

  if (!product || !product.variants || product.variants.length === 0) {
    return null
  }

  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId)
    const variant = product.variants.find(v => v.variant_id === variantId)
    if (onVariantChange) {
      onVariantChange(variant)
    }
  }

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters)
  }

  const selectedVariant = product.variants.find(v => v.variant_id === selectedVariantId)

  // Get price from selected variant
  const selectedVariantObj = product.variants?.find(v => v.variant_id === selectedVariantId)
  const displayPrice = selectedVariantObj?.price || product.price_min || 0

  return (
    <div className="p-4">
      {/* Price - Show selected variant price */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-1">Giá tham khảo</p>
        <div className="flex items-baseline">
          <span className="text-lg font-bold text-red-600">
            {displayPrice?.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Attribute Filters */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <ProductAttributeFilters 
          product={product}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Variant List - Only SKU */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Mã sản phẩm {filteredVariants.length > 0 && `(${filteredVariants.length})`}
        </h2>
        
        {filteredVariants.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-500">
            <p>Không tìm thấy sản phẩm phù hợp</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVariants.map((variant) => {
              const isSelected = variant.variant_id === selectedVariantId
              const isInStock = variant.stock > 0

              return (
                <button
                  key={variant.variant_id}
                  onClick={() => handleVariantSelect(variant.variant_id)}
                  disabled={!isInStock}
                  className={`
                    w-full text-left p-2 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!isInStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{variant.sku}</span>
                    {!isInStock && (
                      <span className="text-xs text-red-600 font-medium ml-auto">Hết hàng</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

