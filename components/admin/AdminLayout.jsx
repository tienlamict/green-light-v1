'use client'

import ProtectedRoute from './ProtectedRoute'
import Sidebar from './Sidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

