'use client'

import { Lightbulb, Lamp, Sparkles, Sun, Zap, Star } from 'lucide-react'

const Hero = () => {
  const categories = [
    { name: 'Ánh Sáng Đô Thị', icon: Lightbulb, color: 'bg-red-100' },
    { name: 'Lấy Cảm Hứng Thiên Nhiên', icon: Lamp, color: 'bg-gray-100' },
    { name: 'Ánh Sáng Ấm Áp', icon: Sparkles, color: 'bg-gray-100' },
    { name: 'Tỏa Sáng Thanh Tao', icon: Sun, color: 'bg-gray-100' },
    { name: 'Tỏa Sáng Thanh Lịch', icon: Zap, color: 'bg-gray-100' },
    { name: 'Chiếu Sáng Thông Minh', icon: Star, color: 'bg-teal-100' },
  ]

  return (
    <div className="bg-gradient-to-b from-gray-400 to-gray-300 py-12 md:py-16">
      <div className="container-custom">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Lấy Cảm Hứng Từ Thiên Nhiên
          </h1>
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-2 text-sm text-white">
            <span className="hover:underline cursor-pointer">Trang chủ</span>
            <span>›</span>
            <span className="font-medium">Lấy Cảm Hứng Từ Thiên Nhiên</span>
          </div>
        </div>

        {/* Category Icons */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 ${category.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
              >
                <category.icon className="w-8 h-8 md:w-10 md:h-10 text-gray-700" />
              </div>
              <p className="text-xs md:text-sm text-white text-center font-medium">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero

