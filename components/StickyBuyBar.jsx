// StickyBuyBar - Mobile sticky buy bar component
'use client'
import Link from 'next/link'

export default function StickyBuyBar({ price }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Giá</p>
          <p className="text-xl font-bold">{price.toLocaleString('vi-VN')}đ</p>
        </div>
        <Link href="/checkout" className="btn-primary">
          Mua Ngay
        </Link>
      </div>
    </div>
  )
}

