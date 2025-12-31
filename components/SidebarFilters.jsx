'use client'

import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const SidebarFilters = ({ categories = [], filters = {}, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 1000000
  ])
  const [selectedCategory, setSelectedCategory] = useState(filters.category || null)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  })

  // Sync local state with filters prop
  useEffect(() => {
    if (filters.category !== undefined) {
      setSelectedCategory(filters.category)
    }
    if (filters.min_price !== undefined || filters.max_price !== undefined) {
      setPriceRange([
        filters.min_price || 0,
        filters.max_price || 1000000
      ])
    }
  }, [filters.category, filters.min_price, filters.max_price])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory === category.category_id ? null : category.category_id
    setSelectedCategory(newCategory)
    if (onFilterChange) {
      const updateFilters = { category: newCategory }
      // Remove category from filters if deselected
      if (!newCategory) {
        updateFilters.category = null
      }
      onFilterChange(updateFilters)
    }
  }

  const handlePriceRangeChange = (type, value) => {
    const newMaxPrice = parseInt(value)
    const newRange = [priceRange[0], newMaxPrice] // min always 0, max is adjustable
    setPriceRange(newRange)
    // Update API filters with price range - filter based on product price_min
    // Products with price_min within the range will be displayed
    if (onFilterChange) {
      onFilterChange({
        min_price: newRange[0],
        max_price: newRange[1],
      })
    }
  }



  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      {/* Categories */}
      <div className="border-b border-gray-200 pb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-4 group"
          onClick={() => toggleSection('categories')}
        >
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-black"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Danh Mục
            </h3>
          </div>
          <div className="transition-transform duration-300 ease-in-out">
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="space-y-2 pt-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <li key={category.category_id}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`text-sm w-full text-left flex items-center space-x-2 py-1 px-2 rounded transition-all duration-200 ${
                      selectedCategory === category.category_id
                        ? 'text-black font-semibold bg-gray-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {selectedCategory === category.category_id && (
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className={selectedCategory === category.category_id ? 'ml-0' : 'ml-5'}>
                      {category.name}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 py-2 px-2">
                Đang tải danh mục...
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer mb-4 group"
          onClick={() => toggleSection('price')}
        >
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-black"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Giá
            </h3>
          </div>
          <div className="transition-transform duration-300 ease-in-out">
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedSections.price ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-4 pt-2">
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 transition-all duration-200"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Giá: <span className="font-semibold text-gray-900">{priceRange[0].toLocaleString('vi-VN')}đ</span>
              </span>
              <span className="text-gray-600">
                - <span className="font-semibold text-gray-900">{priceRange[1].toLocaleString('vi-VN')}đ</span>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default SidebarFilters

