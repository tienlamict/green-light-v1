'use client'

import { useState } from 'react'

export default function QuickAPITest({ productId, variantId }) {
  const [results, setResults] = useState([])
  const [testing, setTesting] = useState(false)

  const testFormats = async () => {
    setTesting(true)
    setResults([])
    const token = localStorage.getItem('auth_token')
    const testResults = []

    const formats = [
      {
        name: 'snake_case (content_type + extension) ✅',
        body: {
          content_type: 'image/jpeg',
          extension: 'jpg'
        }
      },
      {
        name: 'snake_case with image/jpg',
        body: {
          content_type: 'image/jpg',
          extension: 'jpg'
        }
      },
      {
        name: 'PNG format',
        body: {
          content_type: 'image/png',
          extension: 'png'
        }
      },
      {
        name: 'WebP format',
        body: {
          content_type: 'image/webp',
          extension: 'webp'
        }
      }
    ]

    for (const format of formats) {
      try {
        console.log(`\n🧪 Testing: ${format.name}`)
        console.log('Body:', format.body)

        const response = await fetch(`http://localhost:8080/api/v1/products/${productId}/images/presign`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(format.body)
        })

        const data = await response.json().catch(() => ({}))

        const result = {
          format: format.name,
          status: response.status,
          success: response.ok,
          data: data
        }

        console.log(`Status: ${response.status}`, response.ok ? '✅' : '❌')
        console.log('Response:', data)

        testResults.push(result)
      } catch (error) {
        console.error(`Error testing ${format.name}:`, error)
        testResults.push({
          format: format.name,
          status: 'ERROR',
          success: false,
          data: { error: error.message }
        })
      }
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
      <h3 className="text-lg font-bold mb-4">🧪 Quick API Format Test</h3>
      
      <button
        onClick={testFormats}
        disabled={testing}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test All Formats'}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <strong className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.format}
                </strong>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {result.status} {result.success ? '✅' : '❌'}
                </span>
              </div>
              <pre className="text-xs overflow-auto max-h-32 bg-white p-2 rounded">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Tip:</strong> Click button to test all formats at once.</p>
        <p>Check console for detailed logs.</p>
      </div>
    </div>
  )
}

