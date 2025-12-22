'use client'

import { X } from 'lucide-react'
import SidebarFilters from './SidebarFilters'

const MobileFilterDrawer = ({ isOpen, onClose, categories = [], filters = {}, onFilterChange }) => {
  if (!isOpen) return null

  const handleFilterChange = (newFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
    // Optionally close drawer after applying filters on mobile
    // onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto lg:hidden transform transition-transform duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Bộ Lọc</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <SidebarFilters 
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange} 
          />
        </div>
      </div>
    </>
  )
}

export default MobileFilterDrawer

