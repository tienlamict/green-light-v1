// Toast notification component for user feedback
'use client'

export default function Toast({ message, isVisible, onClose }) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  )
}
