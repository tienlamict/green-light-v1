// Image upload service using MinIO presigned URLs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Get content type from file extension
 * Backend validation accepts: image/jpeg, image/jpg, image/png, image/webp
 * MUST match exactly what backend expects for presigned URL signing
 * @param {string} extension - File extension (e.g., 'jpg', 'png')
 * @returns {string} Content type (must be one of: image/jpeg, image/jpg, image/png, image/webp)
 */
function getContentType(extension) {
  const ext = extension.toLowerCase()
  const types = {
    'jpg': 'image/jpeg',   // Backend accepts both image/jpeg and image/jpg
    'jpeg': 'image/jpeg',  // Use image/jpeg for both
    'png': 'image/png',    // Must be exactly image/png
    'webp': 'image/webp',  // Must be exactly image/webp
  }
  // Default to image/jpeg if extension not recognized
  // This matches backend validation which accepts image/jpeg
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
    // Get content type that will be used for signing
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const contentType = getContentType(fileExtension)
    
    // Step 1: Get presigned URL from backend
    const presignResponse = await getPresignedUrl(productId, file.name, variantId)
    
    if (!presignResponse.success) {
      throw new Error(presignResponse.error || 'Failed to get presigned URL')
    }

    const { upload_url, public_url, image_id, object_key } = presignResponse.data

    // Step 2: Upload file directly to MinIO using presigned URL
    // IMPORTANT: Use the same content_type that was used for signing
    const uploadSuccess = await uploadToMinIO(upload_url, file, contentType)
    
    if (!uploadSuccess) {
      throw new Error('Failed to upload to MinIO')
    }

    // Step 3: Confirm upload with backend (save metadata to MySQL)
    // Backend expects object_key (not image_id) to identify the uploaded file
    const confirmResponse = await confirmImageUpload(productId, object_key, variantId)
    
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
    // Backend validation: content_type must be one of: image/jpeg, image/jpg, image/png, image/webp
    const fileExtension = fileName.split('.').pop().toLowerCase()
    const contentType = getContentType(fileExtension)
    
    // Validate content_type matches backend validation
    const validContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validContentTypes.includes(contentType)) {
      console.error('❌ Invalid content_type:', contentType)
      console.error('Must be one of:', validContentTypes)
      throw new Error(`Invalid content type: ${contentType}. Must be one of: ${validContentTypes.join(', ')}`)
    }
    
    const body = {
      content_type: contentType,  // Must match backend validation: image/jpeg, image/jpg, image/png, image/webp
      extension: fileExtension,
    }
    
    // Note: variant_id is NOT in PresignUploadRequest
    // It will be sent in the confirm step

    const url = `${API_BASE_URL}/products/${productId}/images/presign`
    
    console.log('🔵 Presign Request:')
    console.log('URL:', url)
    console.log('Headers:', headers)
    console.log('Body:', body)
    console.log('✅ Content-Type being sent to backend:', contentType)
    console.log('✅ File extension:', fileExtension)
    console.log('✅ Content-Type validation: PASSED (matches backend validation)')

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
    
    console.log('🔵 Presign Response:', {
      success: result.success,
      upload_url: result.data?.upload_url ? '✅ received' : '❌ missing',
      public_url: result.data?.public_url ? '✅ received' : '❌ missing',
      object_key: result.data?.object_key || '❌ not provided',
      image_id: result.data?.image_id || 'not provided',
      expires_at: result.data?.expires_at || 'not provided'
    })

    if (result.success && result.data) {
      // Log MinIO URLs to check ports
      const uploadUrl = result.data.upload_url
      const publicUrl = result.data.public_url
      const objectKey = result.data.object_key
      
      if (uploadUrl) {
        try {
          const url = new URL(uploadUrl)
          const hostname = url.hostname
          const port = url.port || (url.protocol === 'https:' ? '443' : '80')
          
          console.log('🔵 Presigned URL Details:')
          console.log('Hostname:', hostname)
          console.log('Port:', port)
          
          // Check if hostname is 'minio' (internal Docker/service name)
          if (hostname === 'minio' || hostname.includes('minio')) {
            console.error('❌ ERROR: Presigned URL uses internal hostname "minio" which is not accessible from browser!')
            console.error('Backend should use "localhost:9000" or public URL for frontend access')
            console.error('Current URL:', uploadUrl)
            console.error('Expected format: http://localhost:9000/...')
          } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('✅ Hostname is correct (localhost)')
            if (port !== '9000') {
              console.warn('⚠️ Presigned URL port is not 9000! Expected: 9000, Got:', port)
            } else {
              console.log('✅ Presigned URL port is correct (9000)')
            }
          } else {
            console.log('ℹ️ Hostname:', hostname, '(assuming public/accessible URL)')
          }
        } catch (e) {
          console.error('Error parsing presigned URL:', e)
        }
      }

      // Extract image_id from object_key if not provided
      // Object key format: products/2024/12/prod-123/550e8400-e29b-41d4-a716-446655440000.webp
      // Extract UUID: 550e8400-e29b-41d4-a716-446655440000
      let imageId = result.data.image_id
      if (!imageId && objectKey) {
        const uuidMatch = objectKey.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
        if (uuidMatch) {
          imageId = uuidMatch[1]
          console.log('🔵 Extracted image_id from object_key:', imageId)
        }
      }

      if (!imageId) {
        console.warn('⚠️ No image_id found in response and cannot extract from object_key')
        // Fallback: use object_key as image_id if available
        imageId = objectKey
      }

      return {
        success: true,
        data: {
          upload_url: uploadUrl,
          public_url: publicUrl,
          image_id: imageId,
          object_key: objectKey,
          expires_at: result.data.expires_at
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
 * @param {string} contentType - Content type used when generating presigned URL (MUST match!)
 * @returns {Promise<boolean>}
 */
async function uploadToMinIO(uploadUrl, file, contentType) {
  try {
    // Parse URL to check port and host
    let urlPort = null
    let urlHost = null
    try {
      const url = new URL(uploadUrl)
      urlHost = url.hostname
      urlPort = url.port || (url.protocol === 'https:' ? '443' : '80')
    } catch (e) {
      // URL parsing failed, skip port check
    }

    console.log('🟡 MinIO Upload:')
    console.log('URL:', uploadUrl)
    if (urlHost && urlPort) {
      console.log('MinIO Host:', urlHost)
      console.log('MinIO Port:', urlPort)
      if (urlHost === 'minio' || urlHost.includes('minio')) {
        console.error('❌ ERROR: Using internal hostname "minio". Should be "localhost"!')
      }
    }
    console.log('File:', {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split('.').pop().toLowerCase()
    })
    console.log('📋 Content-Type Check:')
    console.log('  - Content-Type for upload (used in presign):', contentType)
    console.log('  - File.type (browser detected):', file.type)
    if (contentType !== file.type) {
      console.warn('  ⚠️ Content-Type mismatch!')
      console.warn('  ⚠️ Using presign content-type (this is correct):', contentType)
      console.warn('  ⚠️ NOT using file.type:', file.type)
    } else {
      console.log('  ✅ Content-Type matches file.type')
    }

    // CRITICAL: Content-Type MUST match EXACTLY what was sent to backend in presign request
    // Backend signs the presigned URL with the content_type we sent
    // If Content-Type header doesn't match, MinIO returns SignatureDoesNotMatch error
    // Must be one of: image/jpeg, image/jpg, image/png, image/webp (exactly as backend expects)
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType, // EXACT match to content_type sent in presign request
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
 * @param {string} objectKey - Object key from presign response (e.g., "products/2024/12/prod-123/uuid.webp")
 * @param {string} variantId - Variant UUID (optional)
 * @returns {Promise<Object>}
 */
async function confirmImageUpload(productId, objectKey, variantId = null) {
  try {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Backend expects object_key (the MinIO object path)
    // Format: "products/2024/12/prod-123/550e8400-e29b-41d4-a716-446655440000.webp"
    const body = {
      object_key: objectKey,
    }
    
    if (variantId) {
      body.variant_id = variantId
    }

    const url = `${API_BASE_URL}/products/${productId}/images`
    
    console.log('🔵 Confirm Upload Request:')
    console.log('URL:', url)
    console.log('Headers:', headers)
    console.log('Body:', body)
    console.log('Object Key:', objectKey)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('🔵 Confirm Response Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText || 'Unknown error' }
      }
      console.error('🔴 Confirm Error Response:', errorData)
      console.error('🔴 Error Response Status:', response.status)
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Confirm Response:', result)

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

