// Main page - Product showcase with filters and grid
'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/Hero'
import SidebarFilters from '@/components/SidebarFilters'
import ProductGrid from '@/components/ProductGrid'
import MobileFilterDrawer from '@/components/MobileFilterDrawer'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { fetchCategories, fetchProducts } from '@/services/api'

export default function HomePage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  
  // API filter state - default only page and limit
  const [apiFilters, setApiFilters] = useState({
    page: 1,
    limit: 12,
  })

  // Fetch categories from API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories()
      setCategories(categoriesData)
    }
    loadCategories()
  }, [])

  // Fetch products from API whenever filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const result = await fetchProducts(apiFilters)
        setProducts(result.products || [])
        setMeta(result.meta || {})
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
        setMeta({})
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [apiFilters])

  // Handle filter changes from SidebarFilters
  const handleFilterChange = (newFilters) => {
    setApiFilters((prev) => {
      const updated = { ...prev, ...newFilters, page: 1 } // Reset to page 1 when filters change
      
      // Remove null/undefined values to clean up state
      Object.keys(updated).forEach(key => {
        if (updated[key] === null || updated[key] === undefined) {
          // Keep page and limit, remove other null/undefined filters
          if (key !== 'page' && key !== 'limit') {
            delete updated[key]
          }
        }
      })
      
      return updated
    })
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setApiFilters((prev) => ({
      ...prev,
      page,
    }))
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle sort change
  const handleSortChange = (sort) => {
    setApiFilters((prev) => ({
      ...prev,
      sort,
      page: 1, // Reset to page 1 when sort changes
    }))
  }

  return (
    <>
      <Hero />
      
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <SidebarFilters 
              categories={categories}
              filters={apiFilters}
              onFilterChange={handleFilterChange}
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

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <ProductGrid 
                products={products}
                meta={meta}
                sort={apiFilters.sort}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        filters={apiFilters}
        onFilterChange={handleFilterChange}
      />
    </>
  )
}
