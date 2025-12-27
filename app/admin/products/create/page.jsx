'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductFormNew from '@/components/admin/ProductFormNew'
import { fetchCategories, createProduct } from '@/services/api'

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [productName, setProductName] = useState('Sản Phẩm Mới')
  const formRef = useRef(null)

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

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm()
    }
  }

  const headerActions = (
    <>
      <button
        onClick={handleCancel}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        <X className="w-4 h-4" />
        <span>Hủy</span>
      </button>
      <button
        onClick={handleSave}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Save className="w-4 h-4" />
        <span>Lưu Sản Phẩm</span>
      </button>
    </>
  )

  if (loading) {
    return (
      <AdminLayout headerTitle="Tạo Sản Phẩm Mới">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      headerTitle={productName}
      headerActions={headerActions}
    >
      <ProductFormNew 
        ref={formRef}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onNameChange={setProductName}
      />
    </AdminLayout>
  )
}

