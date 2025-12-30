'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductFormNew from '@/components/admin/ProductFormNew'
import { fetchCategories, createProduct } from '@/services/api'

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [productName, setProductName] = useState('Sản Phẩm Mới')
  const formRef = useRef(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories)
      } else {
        const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
        setCategories(stored)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(stored)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (productData, variantsWithImages) => {
    try {
      console.log('🚀 STEP 1: Creating product + variants (no images)...')
      
      // STEP 1: Tạo product + variants
      const createdProduct = await createProduct(productData)
      console.log('✅ Product created:', createdProduct)
      
      if (!createdProduct || !createdProduct.product_id) {
        throw new Error('Product creation failed - no product_id returned')
      }
      
      // STEP 2: Upload images cho từng variant (nếu có)
      if (variantsWithImages && variantsWithImages.length > 0) {
        console.log('🚀 STEP 2: Uploading images for variants...')
        
        // Get variant IDs from response
        const createdVariants = createdProduct.variants || []
        
        for (let i = 0; i < variantsWithImages.length; i++) {
          const variantData = variantsWithImages[i]
          const createdVariant = createdVariants[i]
          
          if (!createdVariant || !createdVariant.variant_id) {
            console.warn(`⚠️ Variant ${i} has no variant_id, skipping image upload`)
            continue
          }
          
          // Filter and convert images to File objects for upload
          const imagesToUpload = []
          
          for (const img of (variantData.images || [])) {
            // Case 1: Already has a File object
            if (img.file instanceof File) {
              imagesToUpload.push(img.file)
              continue
            }
            
            // Case 2: Base64 data URL - convert to File
            const url = typeof img === 'string' ? img : img.url
            if (url && url.startsWith('data:image')) {
              try {
                // Convert base64 to File
                const response = await fetch(url)
                const blob = await response.blob()
                const fileName = `image-${Date.now()}-${imagesToUpload.length}.${blob.type.split('/')[1] || 'jpg'}`
                const file = new File([blob], fileName, { type: blob.type })
                imagesToUpload.push(file)
              } catch (err) {
                console.error('Failed to convert base64 to File:', err)
              }
            }
            
            // Case 3: Already uploaded (has URL) - skip
          }
          
          if (imagesToUpload.length === 0) {
            console.log(`ℹ️ Variant ${i} (${createdVariant.variant_id}) has no images to upload`)
            continue
          }
          
          console.log(`📤 Uploading ${imagesToUpload.length} images for variant ${i} (${createdVariant.variant_id})...`)
          
          // Upload each image
          const { uploadVariantImages } = await import('@/services/imageUpload')
          
          try {
            const result = await uploadVariantImages(
              createdProduct.product_id,
              createdVariant.variant_id,
              imagesToUpload
            )
            
            if (result.success) {
              console.log(`✅ Uploaded ${result.images.length} images for variant ${i}`)
            } else {
              console.error(`⚠️ Some images failed for variant ${i}:`, result.errors)
            }
          } catch (uploadError) {
            console.error(`❌ Error uploading images for variant ${i}:`, uploadError)
            // Continue with other variants even if one fails
          }
        }
        
        console.log('✅ STEP 2 Complete: All images uploaded')
      }
      
      alert('Tạo sản phẩm thành công!')
      router.push('/admin/products')
    } catch (error) {
      console.error('❌ Error creating product:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm()
    }
  }

  const headerActions = (
    <>
      <button
        onClick={handleCancel}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        <X className="w-4 h-4" />
        <span>Hủy</span>
      </button>
      <button
        onClick={handleSave}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Save className="w-4 h-4" />
        <span>Lưu Sản Phẩm</span>
      </button>
    </>
  )

  if (loading) {
    return (
      <AdminLayout headerTitle="Tạo Sản Phẩm Mới">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      headerTitle={productName}
      headerActions={headerActions}
    >
      <ProductFormNew 
        ref={formRef}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onNameChange={setProductName}
      />
    </AdminLayout>
  )
}

