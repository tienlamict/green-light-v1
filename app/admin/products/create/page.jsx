'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { fetchCategories } from '@/services/api'

export default function CreateProductPage() {
  const [categories, setCategories] = useState([])

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
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new product to your store</p>
        </div>
        <ProductForm categories={categories} />
      </div>
    </AdminLayout>
  )
}

