'use client'

import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const SidebarFilters = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedColors, setSelectedColors] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    color: true,
    brand: true,
  })

  const categories = [
    'Radiant Arc',
    'Optic Glow',
    'Aura Glow',
    'Stellar Light',
    'Spectrum',
    'Jade Light',
    'Ignite Form',
    'Kinetic Beam',
    'Lume Arc',
    'Mystic Glow',
  ]

  const colors = [
    { name: 'Đen', value: '#000000' },
    { name: 'Xanh Dương', value: '#1e40af' },
    { name: 'Xám', value: '#6b7280' },
  ]

  const brands = ['EcoShine', 'LuxeLights', 'ModernGlow', 'NatureBeam']

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const handleColorToggle = (colorValue) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue)
        ? prev.filter((c) => c !== colorValue)
        : [...prev, colorValue]
    )
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
            {categories.map((category, index) => (
              <li key={index}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`text-sm w-full text-left flex items-center space-x-2 py-1 px-2 rounded transition-all duration-200 ${
                    selectedCategory === category
                      ? 'text-black font-semibold bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {selectedCategory === category && (
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span className={selectedCategory === category ? 'ml-0' : 'ml-5'}>
                    {category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4">
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
              max="2000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
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

      {/* Color Filter */}
      <div className="border-b border-gray-200 pb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-4 group"
          onClick={() => toggleSection('color')}
        >
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-black"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Màu Sắc
            </h3>
          </div>
          <div className="transition-transform duration-300 ease-in-out">
            {expandedSections.color ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedSections.color ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex space-x-3 pt-2">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorToggle(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  selectedColors.includes(color.value)
                    ? 'border-gray-900 scale-110 shadow-md'
                    : 'border-gray-300 hover:scale-105 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer mb-4 group"
          onClick={() => toggleSection('brand')}
        >
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-black"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Thương Hiệu
            </h3>
          </div>
          <div className="transition-transform duration-300 ease-in-out">
            {expandedSections.brand ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedSections.brand ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="space-y-2 pt-2">
            {brands.map((brand, index) => (
              <li key={index}>
                <button className="text-sm text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-all duration-200 block w-full text-left py-1 px-2 rounded">
                  {brand}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SidebarFilters

