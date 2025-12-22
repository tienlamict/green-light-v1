'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import CategoryForm from '@/components/admin/CategoryForm'

export default function CreateCategoryPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new product category</p>
        </div>
        <CategoryForm />
      </div>
    </AdminLayout>
  )
}

