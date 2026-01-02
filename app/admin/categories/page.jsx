'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Table from '@/components/admin/Table'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { fetchCategories, deleteCategory } from '@/services/api'
import { Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      // Fetch from API
      const apiCategories = await fetchCategories()
      setCategories(apiCategories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (category) => {
    setDeleteModal({ isOpen: true, category })
  }

  const confirmDelete = async () => {
    if (deleteModal.category) {
      try {
        // Call API to delete category
        await deleteCategory(deleteModal.category.category_id)
        
        // Reload categories from API
        await loadCategories()
        
        setDeleteModal({ isOpen: false, category: null })
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(`Failed to delete category: ${error.message}`)
      }
    }
  }

  const columns = [
    {
      key: 'icon_url',
      label: 'Icon',
      render: (value) => (
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {value ? (
            <Image
              src={value}
              alt="Category icon"
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (value) => (
        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <Link
        href={`/admin/categories/${row.category_id}/edit`}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={() => handleDelete(row)}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">Manage product categories</p>
          </div>
          <Link
            href="/admin/categories/create"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </Link>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={categories}
          actions={actions}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, category: null })}
          onConfirm={confirmDelete}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  )
}

