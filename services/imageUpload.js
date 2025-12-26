// Image upload service using MinIO presigned URLs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Get content type from file extension
 * Backend accepts: image/jpeg, image/jpg, image/png, image/webp
 * @param {string} extension - File extension (e.g., 'jpg', 'png')
 * @returns {string} Content type
 */
function getContentType(extension) {
  const ext = extension.toLowerCase()
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
  }
  return types[ext] || 'image/jpeg'
}

/**
 * Upload image using MinIO presigned URL flow
 * @param {string} productId - Product UUID
 * @param {File} file - Image file to upload
 * @param {string} variantId - Variant UUID (optional)
 * @returns {Promise<Object>} { success, public_url, image_id }
 */
export async function uploadProductImage(productId, file, variantId = null) {
  try {
    // Step 1: Get presigned URL from backend
    const presignResponse = await getPresignedUrl(productId, file.name, variantId)
    
    if (!presignResponse.success) {
      throw new Error(presignResponse.error || 'Failed to get presigned URL')
    }

    const { upload_url, public_url, image_id } = presignResponse.data

    // Step 2: Upload file directly to MinIO using presigned URL
    const uploadSuccess = await uploadToMinIO(upload_url, file)
    
    if (!uploadSuccess) {
      throw new Error('Failed to upload to MinIO')
    }

    // Step 3: Confirm upload with backend (save metadata to MySQL)
    const confirmResponse = await confirmImageUpload(productId, image_id, variantId)
    
    if (!confirmResponse.success) {
      throw new Error('Failed to confirm image upload')
    }

    return {
      success: true,
      public_url,
      image_id
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Step 1: Get presigned URL from backend
 * @param {string} productId - Product UUID
 * @param {string} fileName - Original file name
 * @param {string} variantId - Variant UUID (optional)
 * @returns {Promise<Object>}
 */
async function getPresignedUrl(productId, fileName, variantId = null) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Backend expects content_type and extension (snake_case)
    const fileExtension = fileName.split('.').pop().toLowerCase()
    const contentType = getContentType(fileExtension)
    
    const body = {
      content_type: contentType,
      extension: fileExtension,
    }
    
    // Note: variant_id is NOT in PresignUploadRequest
    // It will be sent in the confirm step

    const url = `${API_BASE_URL}/products/${productId}/images/presign`
    
    console.log('🔵 Presign Request:')
    console.log('URL:', url)
    console.log('Headers:', headers)
    console.log('Body:', body)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('🔵 Presign Response Status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('🔴 Presign Error Response:', errorData)
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          upload_url: result.data.upload_url,
          public_url: result.data.public_url,
          image_id: result.data.image_id
        }
      }
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Step 2: Upload file directly to MinIO using presigned URL
 * @param {string} uploadUrl - Presigned upload URL
 * @param {File} file - File to upload
 * @returns {Promise<boolean>}
 */
async function uploadToMinIO(uploadUrl, file) {
  try {
    console.log('🟡 MinIO Upload:')
    console.log('URL:', uploadUrl)
    console.log('File:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    console.log('🟡 MinIO Response Status:', response.status, response.statusText)
    console.log('🟡 MinIO Response OK:', response.ok)

    if (!response.ok) {
      const responseText = await response.text().catch(() => '')
      console.error('🔴 MinIO Error Response:', responseText)
    }

    return response.ok
  } catch (error) {
    console.error('🔴 MinIO Upload Error:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    return false
  }
}

/**
 * Step 3: Confirm image upload with backend
 * @param {string} productId - Product UUID
 * @param {string} imageId - Image UUID from presign response
 * @param {string} variantId - Variant UUID (optional)
 * @returns {Promise<Object>}
 */
async function confirmImageUpload(productId, imageId, variantId = null) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const body = {
      image_id: imageId,
    }
    
    if (variantId) {
      body.variant_id = variantId
    }

    const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: result.success || false
    }
  } catch (error) {
    console.error('Error confirming image upload:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Upload multiple images for a variant
 * @param {string} productId - Product UUID
 * @param {string} variantId - Variant UUID
 * @param {File[]} files - Array of image files
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Object>} { success, images: [{ image_id, public_url }], errors }
 */
export async function uploadVariantImages(productId, variantId, files, onProgress = null) {
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

    const result = await uploadProductImage(productId, file, variantId)
    
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
 * Delete product image
 * @param {string} productId - Product UUID
 * @param {string} imageId - Image UUID
 * @returns {Promise<boolean>}
 */
export async function deleteProductImage(productId, imageId) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
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

