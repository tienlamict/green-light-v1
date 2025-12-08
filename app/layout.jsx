// Root layout - wraps all pages with Header, Footer and global styles
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Inter font hỗ trợ tiếng Việt tốt với subset 'latin' và 'vietnamese'
const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
})

export const metadata = {
  title: 'Green Light - Đèn Chiếu Sáng Lấy Cảm Hứng Từ Thiên Nhiên',
  description: 'Khám phá các giải pháp chiếu sáng cao cấp lấy cảm hứng từ thiên nhiên cho ngôi nhà và văn phòng của bạn',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
