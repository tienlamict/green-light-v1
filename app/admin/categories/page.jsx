'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Table from '@/components/admin/Table'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { fetchCategories } from '@/services/api'
import { Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

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
      // Try to fetch from API first
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories)
      } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
        setCategories(stored)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(stored)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (category) => {
    setDeleteModal({ isOpen: true, category })
  }

  const confirmDelete = () => {
    if (deleteModal.category) {
      const updated = categories.filter(
        c => c.category_id !== deleteModal.category.category_id
      )
      setCategories(updated)
      localStorage.setItem('admin_categories', JSON.stringify(updated))
      setDeleteModal({ isOpen: false, category: null })
    }
  }

  const columns = [
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

