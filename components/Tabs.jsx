// Tabs component - tabbed interface for product details, shipping, reviews
'use client'
import { useState } from 'react'

export default function Tabs({ product }) {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Mô Tả' },
    { id: 'shipping', label: 'Vận Chuyển & Đổi Trả' },
    { id: 'reviews', label: 'Đánh Giá Khách Hàng' },
  ]

  return (
    <div className="mt-16">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Product information tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              {product.fullDescription || product.description}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Temporibus unde ut exercitationem sit nostrum consectetur est. Voluptatem fugit nisi et minima vel. 
              Adipisci iure ut corrupti hic consectetur. Atque mollitia modi suscipit at necessitatibus. 
              Et ab dictate et voluptatibus encaptur atque sint veniam. Perspiciatis dolorum consectetur amet. 
              Nam sed et voluptates asperiores illum ipsum delenit. Voluptatem minima et dolor dicta reprehenderit.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3">Tính năng:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Chất liệu cao cấp</li>
              <li>Công nghệ LED tiết kiệm năng lượng</li>
              <li>Thiết kế hiện đại và thanh lịch</li>
              <li>Lắp đặt dễ dàng</li>
              <li>Độ bền lâu dài</li>
            </ul>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông Tin Vận Chuyển</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chúng tôi cung cấp dịch vụ giao hàng toàn cầu với thời gian giao hàng ước tính:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Việt Nam: {product.deliveryTime.domestic}</li>
                <li>Quốc tế: {product.deliveryTime.international}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Tất cả đơn hàng được xử lý trong vòng 1-2 ngày làm việc. Bạn sẽ nhận được mã theo dõi 
                sau khi đơn hàng của bạn đã được gửi đi.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Chính Sách Đổi Trả</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Đổi trả trong vòng <strong>{product.returnPolicy}</strong> kể từ ngày mua. 
                Sản phẩm phải chưa sử dụng và còn nguyên bao bì gốc.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Lưu ý: Thuế và phí không được hoàn lại. Chi phí vận chuyển đổi trả là trách nhiệm 
                của khách hàng trừ khi sản phẩm bị lỗi hoặc hư hỏng.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Đánh Giá Khách Hàng</h3>
              <button className="btn-outline text-sm py-2">
                Viết Đánh Giá
              </button>
            </div>

            {product.reviewCount === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">Chưa có đánh giá nào</p>
                <p className="text-sm text-gray-400">Hãy là người đầu tiên đánh giá sản phẩm này</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sample Review */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-medium">Nguyễn Văn A</span>
                    <span className="text-sm text-gray-400">• 2 tuần trước</span>
                  </div>
                  <p className="text-gray-700">
                    Sản phẩm tuyệt vời! Chất lượng xuất sắc và trông rất đẹp trong phòng khách của tôi. 
                    Rất đáng để giới thiệu!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

