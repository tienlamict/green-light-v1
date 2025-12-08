// Header component - navigation bar with logo, menu, and action icons
'use client'
import Link from 'next/link'
import { Search, User } from 'lucide-react'

export default function Header() {
  
  const menuItems = [
    { label: 'TRANG CHỦ', href: '/' },
    { label: 'CỬA HÀNG', href: '/shops' },
    { label: 'SẢN PHẨM', href: '/' },
    { label: 'BLOG', href: '/blog' },
    { label: 'TRANG', href: '/pages' },
  ]

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">
            Green Light
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <button 
              aria-label="Tìm kiếm"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              aria-label="Tài khoản"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
