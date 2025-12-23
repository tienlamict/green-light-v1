'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductFormNew from '@/components/admin/ProductFormNew'
import { fetchCategories, createProduct } from '@/services/api'

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories)
      } else {
        const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
        setCategories(stored)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(stored)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (productData) => {
    try {
      await createProduct(productData)
      alert('Tạo sản phẩm thành công!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Sản Phẩm Mới</h1>
          <p className="mt-1 text-sm text-gray-500">Thêm sản phẩm mới vào cửa hàng của bạn</p>
        </div>
        <ProductFormNew 
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  )
}

