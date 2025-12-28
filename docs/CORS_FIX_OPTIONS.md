// Alternative: Upload via Backend Proxy (no CORS issue)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Upload image via backend proxy (no direct MinIO upload)
 * @param {string} productId - Product UUID
 * @param {File} file - Image file
 * @param {string} variantId - Variant UUID (optional)
 * @returns {Promise<Object>}
 */
export async function uploadImageViaProxy(productId, file, variantId = null) {
  try {
    console.log('📤 Uploading via backend proxy...')
    console.log('Product ID:', productId)
    console.log('File:', file.name, file.size, file.type)
    console.log('Variant ID:', variantId)

    const token = localStorage.getItem('auth_token')
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    
    if (variantId) {
      formData.append('variant_id', variantId)
    }

    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/products/${productId}/images/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      console.log('✅ Upload successful:', result.data)
      return {
        success: true,
        public_url: result.data.public_url,
        image_id: result.data.image_id
      }
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('❌ Upload failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Upload multiple images via proxy
 * @param {string} productId - Product UUID
 * @param {string} variantId - Variant UUID
 * @param {File[]} files - Array of files
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export async function uploadMultipleImagesViaProxy(productId, variantId, files, onProgress = null) {
  const results = {
    success: true,
    images: [],
    errors: []
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress(i + 1, files.length)
    }

    const result = await uploadImageViaProxy(productId, file, variantId)
    
    if (result.success) {
      results.images.push({
        image_id: result.image_id,
        public_url: result.public_url
      })
    } else {
      results.success = false
      results.errors.push({
        fileName: file.name,
        error: result.error
      })
    }
  }

  return results
}

/**
 * Delete image
 * @param {string} productId - Product UUID
 * @param {string} imageId - Image UUID
 * @returns {Promise<boolean>}
 */
export async function deleteImage(productId, imageId) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.success || false
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

