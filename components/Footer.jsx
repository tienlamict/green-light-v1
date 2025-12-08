// Footer component - simple footer with copyright
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Green Light</h3>
            <p className="text-sm text-gray-600">
              Giải pháp chiếu sáng cao cấp cho ngôi nhà và văn phòng của bạn.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Cửa Hàng</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">Tất Cả Sản Phẩm</a></li>
              <li><a href="#" className="hover:text-black">Hàng Mới Về</a></li>
              <li><a href="#" className="hover:text-black">Bán Chạy Nhất</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">Liên Hệ</a></li>
              <li><a href="#" className="hover:text-black">Thông Tin Vận Chuyển</a></li>
              <li><a href="#" className="hover:text-black">Đổi Trả</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Công Ty</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">Về Chúng Tôi</a></li>
              <li><a href="#" className="hover:text-black">Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="hover:text-black">Điều Khoản Dịch Vụ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Green Light. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  )
}

