'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductFormNew from '@/components/admin/ProductFormNew'
import { fetchProductById, fetchCategories, updateProduct } from '@/services/api'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [productName, setProductName] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load categories
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories)
      } else {
        const stored = JSON.parse(localStorage.getItem('admin_categories') || '[]')
        setCategories(stored)
      }

      // Load product by ID or slug
      const productData = await fetchProductById(params.id)
      
      if (productData) {
        setProduct(productData)
        setProductName(productData.name || 'Chỉnh Sửa Sản Phẩm')
      } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('admin_products') || '[]')
        const foundStored = stored.find(p => 
          (p.product_id || p.id) === params.id || 
          p.slug === params.id
        )
        if (foundStored) {
          setProduct(foundStored)
        } else {
          alert('Product not found')
          router.push('/admin/products')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage
      const storedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]')
      const found = storedProducts.find(p => 
        (p.product_id || p.id) === params.id || 
        p.slug === params.id
      )
      if (found) {
        setProduct(found)
      } else {
        alert('Error loading product')
        router.push('/admin/products')
      }
      
      const storedCategories = JSON.parse(localStorage.getItem('admin_categories') || '[]')
      setCategories(storedCategories)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (productData, variantsWithImages) => {
    try {
      console.log('🚀 STEP 1: Updating product + variants...')
      
      // STEP 1: Update product + variants (no images in API call)
      await updateProduct(product.product_id, productData)
      console.log('✅ Product updated')
      
      // STEP 2: Upload new images for variants (if any)
      // For edit mode, variants already have variant_id
      if (variantsWithImages && variantsWithImages.length > 0) {
        console.log('🚀 STEP 2: Uploading new images for variants...')
        
        for (let i = 0; i < variantsWithImages.length; i++) {
          const variantData = variantsWithImages[i]
          const variantId = variantData.variant_id
          
          if (!variantId) {
            console.warn(`⚠️ Variant ${i} has no variant_id, skipping image upload`)
            continue
          }
          
          // Filter and convert images to File objects for upload
          const imagesToUpload = []
          
          for (const img of (variantData.images || [])) {
            // Case 1: Already has a File object (new upload)
            if (img.file instanceof File) {
              imagesToUpload.push(img.file)
              continue
            }
            
            // Case 2: Base64 data URL - convert to File
            const url = typeof img === 'string' ? img : img.url
            if (url && url.startsWith('data:image')) {
              try {
                const response = await fetch(url)
                const blob = await response.blob()
                const fileName = `image-${Date.now()}-${imagesToUpload.length}.${blob.type.split('/')[1] || 'jpg'}`
                const file = new File([blob], fileName, { type: blob.type })
                imagesToUpload.push(file)
              } catch (err) {
                console.error('Failed to convert base64 to File:', err)
              }
            }
            
            // Case 3: Already uploaded (has URL from server) - skip
          }
          
          if (imagesToUpload.length === 0) {
            console.log(`ℹ️ Variant ${i} (${variantId}) has no new images to upload`)
            continue
          }
          
          console.log(`📤 Uploading ${imagesToUpload.length} new images for variant ${i} (${variantId})...`)
          
          const { uploadVariantImages } = await import('@/services/imageUpload')
          
          try {
            const result = await uploadVariantImages(
              product.product_id,
              variantId,
              imagesToUpload
            )
            
            if (result.success) {
              console.log(`✅ Uploaded ${result.images.length} images for variant ${i}`)
            } else {
              console.error(`⚠️ Some images failed for variant ${i}:`, result.errors)
            }
          } catch (uploadError) {
            console.error(`❌ Error uploading images for variant ${i}:`, uploadError)
          }
        }
        
        console.log('✅ STEP 2 Complete: All new images uploaded')
      }
      
      alert('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('❌ Error updating product:', error)
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
        <span>Lưu Thay Đổi</span>
      </button>
    </>
  )

  if (loading) {
    return (
      <AdminLayout headerTitle="Đang tải...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return null
  }

  return (
    <AdminLayout 
      headerTitle={productName}
      headerActions={headerActions}
    >
      <ProductFormNew 
        ref={formRef}
        product={product} 
        categories={categories} 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onNameChange={setProductName}
      />
    </AdminLayout>
  )
}

