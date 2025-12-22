'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Star } from 'lucide-react'

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [previewImages, setPreviewImages] = useState(images)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const fileInputRef = useRef(null)

  // Sync with images prop when it changes externally
  useEffect(() => {
    if (images && images.length > 0) {
      setPreviewImages(images)
    }
  }, [images])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newImages = []

    files.forEach((file) => {
      if (file.type.startsWith('image/') && previewImages.length + newImages.length < maxImages) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            url: e.target.result, // For base64 or can be converted to URL
          }
          newImages.push(imageData)

          if (newImages.length === files.length || previewImages.length + newImages.length >= maxImages) {
            const updatedImages = [...previewImages, ...newImages]
            setPreviewImages(updatedImages)
            onChange(updatedImages.map(img => ({
              preview: img.preview,
              url: img.url,
              file: img.file,
            })))
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemove = (index) => {
    const updated = previewImages.filter((_, i) => i !== index)
    setPreviewImages(updated)
    if (mainImageIndex === index && updated.length > 0) {
      setMainImageIndex(0)
    } else if (mainImageIndex > index && updated.length > 0) {
      setMainImageIndex(mainImageIndex - 1)
    } else if (updated.length === 0) {
      setMainImageIndex(0)
    }
    onChange(updated.map(img => ({
      preview: img.preview,
      url: img.url,
      file: img.file,
    })))
  }

  const handleSetMain = (index) => {
    setMainImageIndex(index)
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB (Max {maxImages} images)
            </p>
          </div>
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

