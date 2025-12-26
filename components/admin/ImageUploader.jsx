'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Star, Loader2 } from 'lucide-react'

export default function ImageUploader({ 
  images = [], 
  onChange, 
  maxImages = 10,
  productId = null,  // Product ID for MinIO upload
  variantId = null,  // Variant ID for MinIO upload
  uploadMode = 'preview' // 'preview' or 'minio'
}) {
  const [previewImages, setPreviewImages] = useState(images)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef(null)

  // Sync with images prop when it changes externally
  useEffect(() => {
    if (images && images.length > 0) {
      setPreviewImages(images)
    }
  }, [images])

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    if (uploadMode === 'minio' && productId) {
      // MinIO upload mode - upload immediately
      await handleMinIOUpload(files)
    } else {
      // Preview mode - just show base64 preview
      handlePreviewMode(files)
    }
  }

  const handlePreviewMode = (files) => {
    const newImages = []

    files.forEach((file) => {
      if (file.type.startsWith('image/') && previewImages.length + newImages.length < maxImages) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            url: e.target.result, // Base64 for preview
          }
          newImages.push(imageData)

          if (newImages.length === files.length || previewImages.length + newImages.length >= maxImages) {
            const updatedImages = [...previewImages, ...newImages]
            setPreviewImages(updatedImages)
            onChange(updatedImages)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleMinIOUpload = async (files) => {
    if (!productId) {
      alert('Product ID is required for MinIO upload')
      return
    }

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })

    const { uploadVariantImages } = await import('@/services/imageUpload')
    
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      previewImages.length < maxImages
    ).slice(0, maxImages - previewImages.length)

    const result = await uploadVariantImages(
      productId, 
      variantId, 
      validFiles,
      (current, total) => {
        setUploadProgress({ current, total })
      }
    )

    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })

    if (result.success) {
      // Add uploaded images to preview
      const uploadedImages = result.images.map((img, idx) => ({
        id: img.image_id,
        image_id: img.image_id,
        url: img.public_url,
        preview: img.public_url,
        is_main: previewImages.length === 0 && idx === 0,
        sort_order: previewImages.length + idx,
        file: null
      }))

      const updatedImages = [...previewImages, ...uploadedImages]
      setPreviewImages(updatedImages)
      onChange(updatedImages)

      if (result.errors.length > 0) {
        alert(`Some images failed to upload:\n${result.errors.map(e => e.fileName).join('\n')}`)
      }
    } else {
      alert('Failed to upload images. Please try again.')
    }
  }

  const handleRemove = async (index) => {
    const imageToRemove = previewImages[index]
    
    // If in MinIO mode and image has image_id, delete from server
    if (uploadMode === 'minio' && imageToRemove.image_id && productId) {
      const confirmDelete = window.confirm('Bạn có chắc muốn xóa ảnh này? Ảnh sẽ bị xóa vĩnh viễn.')
      if (!confirmDelete) return
      
      try {
        const { deleteProductImage } = await import('@/services/imageUpload')
        const success = await deleteProductImage(productId, imageToRemove.image_id)
        
        if (!success) {
          alert('Không thể xóa ảnh từ server. Vui lòng thử lại.')
          return
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        alert('Lỗi khi xóa ảnh: ' + error.message)
        return
      }
    }
    
    // Remove from local state
    const updated = previewImages.filter((_, i) => i !== index)
    setPreviewImages(updated)
    
    // Update main image index
    if (mainImageIndex === index && updated.length > 0) {
      setMainImageIndex(0)
    } else if (mainImageIndex > index && updated.length > 0) {
      setMainImageIndex(mainImageIndex - 1)
    } else if (updated.length === 0) {
      setMainImageIndex(0)
    }
    
    // Notify parent component
    onChange(updated.map((img, idx) => ({
      ...img,
      preview: img.preview,
      url: img.url,
      file: img.file,
      is_main: idx === (mainImageIndex === index ? 0 : mainImageIndex > index ? mainImageIndex - 1 : mainImageIndex),
      sort_order: idx,
    })))
  }

  const handleSetMain = (index) => {
    setMainImageIndex(index)
    // Update parent with new main image
    const updatedImages = previewImages.map((img, idx) => ({
      ...img,
      is_main: idx === index,
      sort_order: idx,
    }))
    onChange(updatedImages)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      const dataTransfer = new DataTransfer()
      imageFiles.forEach(file => dataTransfer.items.add(file))
      fileInputRef.current.files = dataTransfer.files
      handleFileSelect({ target: { files: dataTransfer.files } })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {previewImages.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Uploading images...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress.current} of {uploadProgress.total} uploaded
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB (Max {maxImages} images)
                </p>
                {uploadMode === 'minio' && (
                  <p className="text-xs text-blue-500 mt-1">
                    Images will be uploaded to MinIO storage
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewImages.map((image, index) => (
            <div
              key={image.id || index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <img
                src={image.preview || image.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Main Image Badge */}
              {mainImageIndex === index && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2">
                {mainImageIndex !== index && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetMain(index)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-opacity"
                    title="Set as main image"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(index)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Image Indicator */}
      {previewImages.length > 0 && (
        <div className="text-sm text-gray-600">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Main image: Image {mainImageIndex + 1} of {previewImages.length}
        </div>
      )}
    </div>
  )
}

