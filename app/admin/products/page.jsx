'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Table from '@/components/admin/Table'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { fetchProducts } from '@/services/api'
import { Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Try to fetch from API first
      const result = await fetchProducts({ page: 1, limit: 100 })
      if (result.products && result.products.length > 0) {
        setProducts(result.products)
      } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('admin_products') || '[]')
        setProducts(stored)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('admin_products') || '[]')
      setProducts(stored)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (product) => {
    setDeleteModal({ isOpen: true, product })
  }

  const confirmDelete = () => {
    if (deleteModal.product) {
      const updated = products.filter(
        p => (p.product_id || p.id) !== (deleteModal.product.product_id || deleteModal.product.id)
      )
      setProducts(updated)
      localStorage.setItem('admin_products', JSON.stringify(updated))
      setDeleteModal({ isOpen: false, product: null })
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (value, row) => {
        const image = row.image || row.images?.[0]?.preview || row.images?.[0]?.url || '/placeholder-image.jpg'
        return (
          <div className="flex items-center space-x-3">
            <img
              src={image}
              alt={value}
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              {row.sku && (
                <div className="text-sm text-gray-500">SKU: {row.sku}</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (value, row) => {
        const price = value || row.price_min || 0
        const originalPrice = row.original_price || row.price_max
        return (
          <div>
            <div className="font-medium text-gray-900">
              {parseFloat(price).toLocaleString('vi-VN')}đ
            </div>
            {originalPrice && parseFloat(originalPrice) > parseFloat(price) && (
              <div className="text-sm text-gray-500 line-through">
                {parseFloat(originalPrice).toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>
        )
      },
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
    {
      key: 'stock',
      label: 'Stock',
      render: (value) => (
        <span className="text-gray-900">{value !== null && value !== undefined ? value : '-'}</span>
      ),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <Link
        href={`/admin/products/${row.product_id || row.id}/edit`}
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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your products</p>
          </div>
          <Link
            href="/admin/products/create"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={products}
          actions={actions}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, product: null })}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  )
}

