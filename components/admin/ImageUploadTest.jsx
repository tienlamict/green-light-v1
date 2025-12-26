'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/services/imageUpload'

export default function ImageUploadTest({ productId, variantId }) {
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setStatus('Uploading...')
    setError(null)
    setResult(null)

    console.log('=== TEST UPLOAD START ===')
    console.log('Product ID:', productId)
    console.log('Variant ID:', variantId)
    console.log('File:', {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split('.').pop()
    })

    try {
      const uploadResult = await uploadProductImage(productId, file, variantId)
      
      console.log('Upload result:', uploadResult)
      
      if (uploadResult.success) {
        setStatus('Success!')
        setResult(uploadResult)
      } else {
        setStatus('Failed')
        setError(uploadResult.error)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setStatus('Error')
      setError(err.message)
    }
  }

  return (
    <div className="p-4 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50">
      <h3 className="text-lg font-bold mb-4">🧪 MinIO Upload Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm"><strong>Product ID:</strong> {productId || 'Not set'}</p>
          <p className="text-sm"><strong>Variant ID:</strong> {variantId || 'Not set'}</p>
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {status && (
          <div className={`p-3 rounded ${
            status === 'Success!' ? 'bg-green-100 text-green-800' :
            status === 'Failed' || status === 'Error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <strong>Status:</strong> {status}
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm font-bold text-green-800 mb-2">✅ Upload Successful!</p>
            <p className="text-xs break-all"><strong>Image ID:</strong> {result.image_id}</p>
            <p className="text-xs break-all"><strong>Public URL:</strong> {result.public_url}</p>
            {result.public_url && (
              <img src={result.public_url} alt="Uploaded" className="mt-2 max-w-xs rounded" />
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded">
            <p className="text-sm font-bold text-red-800 mb-2">❌ Upload Failed</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open Browser Console (F12)</li>
            <li>Open Network Tab</li>
            <li>Select an image file</li>
            <li>Watch console logs and network requests</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

