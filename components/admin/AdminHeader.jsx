'use client'

export default function AdminHeader({ title = 'Admin Dashboard', actions = null }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3 ml-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

