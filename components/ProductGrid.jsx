'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { ChevronDown, LayoutGrid, List } from 'lucide-react'

const ProductGrid = ({ products = [], meta = {}, sort, onSortChange, onPageChange }) => {
  const [viewMode, setViewMode] = useState('grid')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Map sort value to API sort format
  const sortOptions = [
    { value: null, label: 'Nổi Bật', apiSort: null },
    { value: 'price-asc', label: 'Giá: Thấp đến Cao', apiSort: 'price_min ASC' },
    { value: 'price-desc', label: 'Giá: Cao đến Thấp', apiSort: 'price_min DESC' },
    { value: 'name-asc', label: 'Tên: A đến Z', apiSort: 'name ASC' },
    { value: 'name-desc', label: 'Tên: Z đến A', apiSort: 'name DESC' },
  ]

  // Find current sort option based on API sort value
  const currentSortOption = sortOptions.find(opt => opt.apiSort === sort) || sortOptions[0]
  const [sortBy, setSortBy] = useState(currentSortOption.value)

  // Update local sort state when prop changes
  useEffect(() => {
    const option = sortOptions.find(opt => opt.apiSort === sort) || sortOptions[0]
    setSortBy(option.value)
  }, [sort])

  const handleSortChange = (optionValue) => {
    setSortBy(optionValue)
    setIsDropdownOpen(false)
    const selectedOption = sortOptions.find(opt => opt.value === optionValue)
    if (onSortChange && selectedOption) {
      onSortChange(selectedOption.apiSort)
    }
  }

  // Generate pagination buttons
  const renderPagination = () => {
    const currentPage = meta.page || 1
    const totalPages = meta.total_pages || 1
    const pages = []

    // Always show first page
    if (totalPages > 0) {
      pages.push(1)
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push('ellipsis-start')
    }

    // Add pages around current
    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end')
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              {currentSortOption.label}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value || 'default'}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      sortBy === option.value
                        ? 'bg-gray-100 font-medium text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {products.map((product) => (
            <ProductCard key={product.product_id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          <button
            onClick={() => onPageChange && onPageChange((meta.page || 1) - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          
          {renderPagination().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              )
            }
            const isActive = page === (meta.page || 1)
            return (
              <button
                key={page}
                onClick={() => onPageChange && onPageChange(page)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => onPageChange && onPageChange((meta.page || 1) + 1)}
            disabled={meta.page >= meta.total_pages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductGrid

