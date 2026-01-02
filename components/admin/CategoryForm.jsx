'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, updateCategory } from '@/services/api'
import { uploadCategoryIcon, deleteCategoryIcon } from '@/services/imageUpload'
import Image from 'next/image'

export default function CategoryForm({ category = null, onSubmit, onCancel }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
    icon_url: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [iconPreview, setIconPreview] = useState(null)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        is_active: category.is_active !== undefined ? category.is_active : true,
        icon_url: category.icon_url || '',
      })
      setIconPreview(category.icon_url || null)
    }
  }, [category])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || !prev.slug ? generateSlug(name) : prev.slug,
    }))
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, icon: 'Please select a valid image file (JPEG, PNG, or WebP)' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, icon: 'Image size must be less than 5MB' }))
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // If editing existing category, upload immediately
    if (category?.category_id) {
      setUploadingIcon(true)
      try {
        const result = await uploadCategoryIcon(category.category_id, file)
        if (result.success) {
          setFormData(prev => ({ ...prev, icon_url: result.icon_url }))
          setIconPreview(result.icon_url)
          setErrors(prev => ({ ...prev, icon: '' }))
        } else {
          throw new Error(result.error || 'Failed to upload icon')
        }
      } catch (error) {
        console.error('Error uploading icon:', error)
        setErrors(prev => ({ ...prev, icon: error.message || 'Failed to upload icon' }))
        setIconPreview(category.icon_url || null)
      } finally {
        setUploadingIcon(false)
      }
    } else {
      // For new category, just store the file for later upload
      setFormData(prev => ({ ...prev, iconFile: file }))
      setErrors(prev => ({ ...prev, icon: '' }))
    }
  }

  const handleRemoveIcon = async () => {
    if (category?.category_id && formData.icon_url) {
      // If editing and has existing icon, delete from server
      try {
        await deleteCategoryIcon(category.category_id)
      } catch (error) {
        console.error('Error deleting icon:', error)
      }
    }
    setIconPreview(null)
    setFormData(prev => ({ ...prev, icon_url: '', iconFile: null }))
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    try {
      if (onSubmit) {
        // Use custom onSubmit if provided
        await onSubmit(formData)
      } else {
        // Default behavior - call API
        let savedCategory
        if (category) {
          // Update existing category
          savedCategory = await updateCategory(category.category_id, {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            is_active: formData.is_active,
          })
        } else {
          // Create new category
          savedCategory = await createCategory({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            is_active: formData.is_active,
          })
          
          // If new category and has icon file, upload it
          if (savedCategory?.category_id && formData.iconFile) {
            try {
              const uploadResult = await uploadCategoryIcon(savedCategory.category_id, formData.iconFile)
              if (!uploadResult.success) {
                console.error('Failed to upload icon:', uploadResult.error)
              }
            } catch (uploadError) {
              console.error('Error uploading icon:', uploadError)
              // Don't fail the whole operation if icon upload fails
            }
          }
        }
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setErrors({ submit: error.message || 'Failed to save category' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Category name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.slug ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="category-slug"
        />
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        <p className="mt-1 text-xs text-gray-500">URL-friendly version of the name</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Category description"
        />
      </div>

      {/* Icon Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Icon
        </label>
        
        {/* Preview */}
        {iconPreview && (
          <div className="mb-4 relative inline-block">
            <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={iconPreview}
                alt="Category icon preview"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveIcon}
              disabled={uploadingIcon}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center space-x-4">
          <label
            htmlFor="icon-upload"
            className={`px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              uploadingIcon ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingIcon ? 'Uploading...' : iconPreview ? 'Change Icon' : 'Upload Icon'}
          </label>
          <input
            id="icon-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleIconUpload}
            disabled={uploadingIcon}
            className="hidden"
          />
          <span className="text-xs text-gray-500">
            JPEG, PNG, or WebP (max 5MB)
          </span>
        </div>

        {errors.icon && <p className="mt-2 text-sm text-red-600">{errors.icon}</p>}
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel || (() => router.push('/admin/categories'))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}

