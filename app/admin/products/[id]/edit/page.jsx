'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductFormNew from '@/components/admin/ProductFormNew'
import ImageUploadTest from '@/components/admin/ImageUploadTest'
import QuickAPITest from '@/components/admin/QuickAPITest'
import { fetchProductById, fetchCategories, updateProduct } from '@/services/api'

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

      // Load product by ID or slug
      const productData = await fetchProductById(params.id)
      
      if (productData) {
        setProduct(productData)
      } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('admin_products') || '[]')
        const foundStored = stored.find(p => 
          (p.product_id || p.id) === params.id || 
          p.slug === params.id
        )
        if (foundStored) {
          setProduct(foundStored)
        } else {
          alert('Product not found')
          router.push('/admin/products')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage
      const storedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]')
      const found = storedProducts.find(p => 
        (p.product_id || p.id) === params.id || 
        p.slug === params.id
      )
      if (found) {
        setProduct(found)
      } else {
        alert('Error loading product')
        router.push('/admin/products')
      }
      
      const storedCategories = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(storedCategories)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (productData) => {
    try {
      await updateProduct(product.product_id, productData)
      alert('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
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
        
        {/* Test Components - Remove after testing */}
        <QuickAPITest 
          productId={product.product_id}
          variantId={product.variants?.[0]?.variant_id}
        />
        
        <ImageUploadTest 
          productId={product.product_id}
          variantId={product.variants?.[0]?.variant_id}
        />
        
        <ProductFormNew 
          product={product} 
          categories={categories} 
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  )
}

