'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { LayoutDashboard, FolderTree, Package } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  // Mock stats - in production, fetch from API
  const stats = [
    { label: 'Total Categories', value: '12', icon: FolderTree, href: '/admin/categories' },
    { label: 'Total Products', value: '156', icon: Package, href: '/admin/products' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome to the admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/categories/create"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Create New Category</h3>
              <p className="mt-1 text-sm text-gray-500">Add a new product category</p>
            </Link>
            <Link
              href="/admin/products/create"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Create New Product</h3>
              <p className="mt-1 text-sm text-gray-500">Add a new product to the store</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

