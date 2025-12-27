'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import CategoryForm from '@/components/admin/CategoryForm'
import { fetchCategoryById } from '@/services/api'

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategory()
  }, [params.id])

  const loadCategory = async () => {
    setLoading(true)
    try {
      // Fetch category by ID from API
      const categoryData = await fetchCategoryById(params.id)
      
      if (categoryData) {
        setCategory(categoryData)
      } else {
        // Category not found, redirect to list
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error loading category:', error)
      router.push('/admin/categories')
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

  if (!category) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <p className="mt-1 text-sm text-gray-500">Update category information</p>
        </div>
        <CategoryForm category={category} />
      </div>
    </AdminLayout>
  )
}

