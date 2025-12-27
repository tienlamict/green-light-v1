'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Star, Loader2, Plus } from 'lucide-react'

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

    console.log('🔵 ImageUploader.handleMinIOUpload called')
    console.log('  productId:', productId)
    console.log('  variantId:', variantId)
    console.log('  variantId type:', typeof variantId)
    console.log('  files count:', files.length)

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })

    const { uploadVariantImages } = await import('@/services/imageUpload')
    
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      previewImages.length < maxImages
    ).slice(0, maxImages - previewImages.length)

    console.log('🔵 Calling uploadVariantImages with:')
    console.log('  productId:', productId)
    console.log('  variantId:', variantId)
    console.log('  validFiles:', validFiles.length)

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
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Grid Layout - Images + Add Button */}
      <div className="grid grid-cols-4 gap-3">
        {/* Existing Images */}
        {previewImages.map((image, index) => (
          <div
            key={image.id || index}
            className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            <img
              src={image.preview || image.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Main Image Badge */}
            {mainImageIndex === index && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Cover
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              {mainImageIndex !== index && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetMain(index)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                  title="Set as cover"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className="opacity-0 group-hover:opacity-100 p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-lg"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Image Button */}
        {previewImages.length < maxImages && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`aspect-square rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-2 ${
              uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-600 font-medium">
                  {uploadProgress.current}/{uploadProgress.total}
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-blue-600 font-medium">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {previewImages.length > 0 && (
            <>
              <ImageIcon className="w-3 h-3 inline mr-1" />
              {previewImages.length} of {maxImages} images
            </>
          )}
        </span>
        {uploadMode === 'minio' && (
          <span className="text-blue-500">
            ☁️ Cloud storage
          </span>
        )}
      </div>
    </div>
  )
}

