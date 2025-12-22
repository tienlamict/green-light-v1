'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { fetchProducts, fetchCategories } from '@/services/api'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load categories
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories)
      } else {
        const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
        setCategories(stored)
      }

      // Load product
      const result = await fetchProducts({ page: 1, limit: 1000 })
      const found = result.products?.find(p => (p.product_id || p.id) === params.id)
      
      if (found) {
        setProduct(found)
      } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('admin_products') || '[]')
        const foundStored = stored.find(p => (p.product_id || p.id) === params.id)
        if (foundStored) {
          setProduct(foundStored)
        } else {
          router.push('/admin/products')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage
      const storedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]')
      const found = storedProducts.find(p => (p.product_id || p.id) === params.id)
      if (found) {
        setProduct(found)
      } else {
        router.push('/admin/products')
      }
      
      const storedCategories = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(storedCategories)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-500">Update product information</p>
        </div>
        <ProductForm product={product} categories={categories} />
      </div>
    </AdminLayout>
  )
}

