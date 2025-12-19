// Main page - Product showcase with filters and grid
'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/Hero'
import SidebarFilters from '@/components/SidebarFilters'
import ProductGrid from '@/components/ProductGrid'
import MobileFilterDrawer from '@/components/MobileFilterDrawer'
import { products } from '@/data/products'
import { fetchCategories } from '@/services/api'

export default function HomePage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 80],
    colors: [],
    tags: [],
    brands: [],
  })

  // Fetch categories from API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories()
      setCategories(categoriesData)
    }
    loadCategories()
  }, [])

  return (
    <>
      <Hero />
      
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <SidebarFilters 
              categories={categories}
              filters={filters} 
              setFilters={setFilters} 
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden mb-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Bộ Lọc
          </button>

            <ProductGrid products={products} filters={filters} />
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  )
}
