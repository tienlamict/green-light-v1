'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Plus, Trash2, ChevronDown, ChevronUp, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react'
import ImageUploader from './ImageUploader'

// Thumbnail Uploader Component (Single Image)
function ThumbnailUploader({ thumbnail, onChange }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange({
          file: file,
          preview: e.target.result,
          url: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {thumbnail ? (
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 group">
          <img
            src={thumbnail.preview || thumbnail.url}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-lg"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Upload Thumbnail</span>
        </div>
      )}
    </div>
  )
}

import { forwardRef, useImperativeHandle } from 'react'

const ProductFormNew = forwardRef(function ProductFormNew(
  { product = null, categories = [], onSubmit, onCancel, onNameChange },
  ref
) {
  const router = useRouter()
  
  // Product General Information
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    slug: '',
    short_desc: '',
    description: '',
    category_id: '',
  })

  // Product Thumbnail
  const [thumbnail, setThumbnail] = useState(null)

  // Product Variants
  const [variants, setVariants] = useState([
    {
      id: Date.now(),
      variant_name: '',
      sku: '',
      power: '',
      hole_size: '',
      power_supply: '',
      color_temp: '',
      dimensions: '',
      led_chip: '',
      luminous_flux: '',
      cri: '',
      beam_angle: '',
      material: '',
      ip_rating: '',
      warranty: '',
      power_factor: '',
      body_color: '',
      weight: '',
      brightness: '',
      price: '',
      stock: '',
      images: [], // Mỗi variant có ảnh riêng
    }
  ])

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [expandedVariants, setExpandedVariants] = useState([0])

  useEffect(() => {
    if (product) {
      setGeneralInfo({
        name: product.name || '',
        slug: product.slug || '',
        short_desc: product.short_desc || '',
        description: product.description || '',
        category_id: product.category_id || '',
      })

      // Load thumbnail
      if (product.thumbnail_url) {
        setThumbnail({
          url: product.thumbnail_url,
          preview: product.thumbnail_url
        })
      }
      
      if (product.variants && product.variants.length > 0) {
        const mappedVariants = product.variants.map((v, index) => {
          const attrs = v.attributes || {}
          console.log(`🔍 Mapping variant ${index}:`, {
            variant_id: v.variant_id,
            name: v.name,
            sku: v.sku
          })
          return {
            id: v.variant_id || Date.now() + index,
            variant_id: v.variant_id, // Keep original ID for updates
            variant_name: v.name || '',
            sku: v.sku || '',
            power: attrs.power || '',
            hole_size: attrs.cutout_size || '',
            power_supply: attrs.input_voltage || '',
            color_temp: attrs.color_temperature || '',
            dimensions: attrs.dimensions || '',
            led_chip: attrs.led_chip || '',
            luminous_flux: attrs.luminous_flux || '',
            cri: attrs.cri || '',
            beam_angle: attrs.beam_angle || '',
            material: attrs.material || '',
            ip_rating: attrs.ip_rating || '',
            warranty: attrs.warranty || '',
            power_factor: attrs.power_factor || '',
            body_color: attrs.housing_color || '',
            weight: attrs.weight || '',
            brightness: attrs.luminance || '',
            price: v.price || '',
            stock: v.stock || '',
            images: Array.isArray(v.images) 
              ? v.images.map((img, idx) => {
                  // Handle both old format (string) and new format (object)
                  if (typeof img === 'string') {
                    return {
                      id: Date.now() + idx,
                      image_id: null,
                      url: img,
                      is_main: idx === 0,
                      sort_order: idx,
                      file: null
                    }
                  }
                  return {
                    id: img.image_id || Date.now() + idx,
                    image_id: img.image_id,
                    url: img.url,
                    is_main: img.is_main !== undefined ? img.is_main : idx === 0,
                    sort_order: img.sort_order !== undefined ? img.sort_order : idx,
                    file: null
                  }
                })
              : []
          }
        })
        setVariants(mappedVariants)
        // Expand first variant by default
        setExpandedVariants([0])
      }
    }
  }, [product])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target
    setGeneralInfo(prev => {
      const updated = { ...prev, [name]: value }
      
      // Auto-generate slug from name
      if (name === 'name') {
        updated.slug = generateSlug(value)
        // Notify parent about name change
        if (onNameChange) {
          onNameChange(value || 'Sản Phẩm Mới')
        }
      }
      
      return updated
    })
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Expose submitForm method to parent via ref
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const form = document.getElementById('product-form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
  }))

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    
    if (errors[`variant_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`variant_${index}_${field}`]: '' }))
    }
  }

  const handleVariantImagesChange = (index, images) => {
    setVariants(prev => {
      const updated = [...prev]
      // Ensure each image has is_main and sort_order
      const processedImages = images.map((img, idx) => ({
        ...img,
        is_main: idx === 0, // First image is always main
        sort_order: idx
      }))
      updated[index] = { ...updated[index], images: processedImages }
      return updated
    })
  }

  const addVariant = () => {
    const newVariant = {
      id: Date.now(),
      variant_name: '',
      sku: '',
      power: '',
      hole_size: '',
      power_supply: '',
      color_temp: '',
      dimensions: '',
      led_chip: '',
      luminous_flux: '',
      cri: '',
      beam_angle: '',
      material: '',
      ip_rating: '',
      warranty: '',
      power_factor: '',
      body_color: '',
      weight: '',
      brightness: '',
      price: '',
      stock: '',
      images: [], // Khởi tạo mảng ảnh rỗng
    }
    setVariants(prev => [...prev, newVariant])
    setExpandedVariants(prev => [...prev, variants.length])
  }

  const removeVariant = (index) => {
    if (variants.length === 1) {
      alert('Phải có ít nhất 1 variant')
      return
    }
    setVariants(prev => prev.filter((_, i) => i !== index))
    setExpandedVariants(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
  }

  const toggleVariantExpand = (index) => {
    setExpandedVariants(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const validate = () => {
    const newErrors = {}
    
    // Validate general info
    if (!generalInfo.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc'
    }
    
    if (!generalInfo.category_id) {
      newErrors.category_id = 'Danh mục là bắt buộc'
    }
    
    // Validate variants
    variants.forEach((variant, index) => {
      if (!variant.sku.trim()) {
        newErrors[`variant_${index}_sku`] = 'Mã là bắt buộc'
      }
      
      if (!variant.price || parseFloat(variant.price) <= 0) {
        newErrors[`variant_${index}_price`] = 'Giá phải lớn hơn 0'
      }
      
      if (variant.stock === '' || parseInt(variant.stock) < 0) {
        newErrors[`variant_${index}_stock`] = 'Số lượng không hợp lệ'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      alert('Vui lòng kiểm tra lại thông tin')
      return
    }

    setLoading(true)
    try {
      // Tính tổng stock từ các variants
      const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
      
      // Lấy thumbnail URL (chỉ lấy nếu đã upload, không lấy base64)
      let thumbnailUrl = ''
      if (thumbnail && thumbnail.url && !thumbnail.url.startsWith('data:image')) {
        thumbnailUrl = thumbnail.url
      }
      
      // STEP 1: Tạo product + variants (KHÔNG GỬI IMAGES)
      const submitData = {
        name: generalInfo.name,
        slug: generalInfo.slug,
        short_desc: generalInfo.short_desc || '',
        description: generalInfo.description || '',
        stock: totalStock,
        thumbnail_url: thumbnailUrl,
        category_id: generalInfo.category_id,
        is_active: true,
        variants: variants.map(v => ({
          variant_id: v.variant_id, // Include variant_id for updates
          sku: v.sku,
          name: v.variant_name || '',
          attributes: {
            power: v.power || '',
            cutout_size: v.hole_size || '',
            input_voltage: v.power_supply || '',
            color_temperature: v.color_temp || '',
            dimensions: v.dimensions || '',
            led_chip: v.led_chip || '',
            luminous_flux: v.luminous_flux || '',
            cri: v.cri || '',
            beam_angle: v.beam_angle || '',
            material: v.material || '',
            ip_rating: v.ip_rating || '',
            warranty: v.warranty || '',
            power_factor: v.power_factor || '',
            housing_color: v.body_color || '',
            weight: v.weight || '',
            luminance: v.brightness || '',
          },
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          is_active: true,
          // KHÔNG GỬI IMAGES Ở BƯỚC NÀY
        })),
      }

      if (onSubmit) {
        // Pass both data, variants with images, and thumbnail for upload
        await onSubmit(submitData, variants, thumbnail)
      } else {
        // Default behavior - save to localStorage
        const products = JSON.parse(localStorage.getItem('admin_products') || '[]')
        if (product) {
          const index = products.findIndex(p => p.product_id === product.product_id)
          if (index !== -1) {
            products[index] = {
              ...product,
              ...submitData,
              updated_at: new Date().toISOString(),
            }
          }
        } else {
          products.push({
            product_id: Date.now().toString(),
            ...submitData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        localStorage.setItem('admin_products', JSON.stringify(products))
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setErrors({ submit: error.message || 'Lỗi khi lưu sản phẩm' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 flex flex-col">
          {/* General Information */}
          <div className="bg-white p-6 rounded-lg shadow flex-1 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Thông Tin Chung
            </h2>
            
            <div className="space-y-4 flex-1">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Sản Phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={generalInfo.name}
                  onChange={handleGeneralInfoChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={generalInfo.slug}
                  onChange={handleGeneralInfoChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                  placeholder="tu-dong-tao-tu-ten"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">Tự động tạo từ tên sản phẩm</p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh Mục <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={generalInfo.category_id}
                  onChange={handleGeneralInfoChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="short_desc" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả Ngắn
                </label>
                <textarea
                  id="short_desc"
                  name="short_desc"
                  value={generalInfo.short_desc}
                  onChange={handleGeneralInfoChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Mô tả ngắn gọn về sản phẩm"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả Chi Tiết
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={generalInfo.description}
                  onChange={handleGeneralInfoChange}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="flex flex-col space-y-6">
          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow flex-1 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-purple-600 mr-3"></div>
              Tóm Tắt
            </h2>
            <div className="space-y-3 flex-1">
              {/* Thumbnail Upload */}
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Ảnh Đại Diện Sản Phẩm
                </label>
                <ThumbnailUploader
                  thumbnail={thumbnail}
                  onChange={setThumbnail}
                />
              </div>

              {/* Thông tin sản phẩm */}
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Tên Sản Phẩm</label>
                  <p className="text-xs font-medium text-gray-900 break-words line-clamp-2">
                    {generalInfo.name || <span className="text-gray-400 italic">Chưa có</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Slug</label>
                  <p className="text-xs text-gray-700 break-all font-mono line-clamp-1">
                    {generalInfo.slug || <span className="text-gray-400 italic">Chưa có</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Danh Mục</label>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {generalInfo.category_id 
                      ? categories.find(c => c.category_id === generalInfo.category_id)?.name || 'Không xác định'
                      : <span className="text-gray-400 italic">Chưa chọn</span>
                    }
                  </p>
                </div>
              </div>

              {/* Thống kê biến thể */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Số biến thể:</span>
                  <span className="text-xs font-medium text-gray-900">{variants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Tổng số lượng:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Tổng hình ảnh:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {variants.reduce((sum, v) => sum + ((v.images && v.images.length) || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Giá thấp nhất:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {variants.length > 0 && Math.min(...variants.map(v => parseFloat(v.price) || 0)) > 0
                      ? Math.min(...variants.map(v => parseFloat(v.price) || 0)).toLocaleString('vi-VN') + 'đ'
                      : <span className="text-gray-400">-</span>
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Giá cao nhất:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {variants.length > 0 && Math.max(...variants.map(v => parseFloat(v.price) || 0)) > 0
                      ? Math.max(...variants.map(v => parseFloat(v.price) || 0)).toLocaleString('vi-VN') + 'đ'
                      : <span className="text-gray-400">-</span>
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Variants - Full Width */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-1 h-6 bg-green-600 mr-3"></div>
            Biến Thể Sản Phẩm
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Biến Thể</span>
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Variant Header */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleVariantExpand(index)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      {expandedVariants.includes(index) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>Biến Thể #{index + 1}</span>
                      {variant.variant_name && <span className="text-gray-500">- {variant.variant_name}</span>}
                      {!variant.variant_name && variant.sku && <span className="text-gray-500">- {variant.sku}</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa biến thể"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Variant Content */}
                  {expandedVariants.includes(index) && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tên Biến Thể */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên Biến Thể Sản Phẩm
                          </label>
                          <input
                            type="text"
                            value={variant.variant_name}
                            onChange={(e) => handleVariantChange(index, 'variant_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Đèn LED Downlight 10W - Trắng"
                          />
                        </div>

                        {/* Mã SKU */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã SKU <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              errors[`variant_${index}_sku`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="VD: DL-10W-3000K"
                          />
                          {errors[`variant_${index}_sku`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`variant_${index}_sku`]}</p>
                          )}
                        </div>

                        {/* Công Suất */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Công Suất (W)
                          </label>
                          <input
                            type="text"
                            value={variant.power}
                            onChange={(e) => handleVariantChange(index, 'power', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 10W, 15W"
                          />
                        </div>

                        {/* Lỗ Khoét */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lỗ Khoét (mm)
                          </label>
                          <input
                            type="text"
                            value={variant.hole_size}
                            onChange={(e) => handleVariantChange(index, 'hole_size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Ø90mm"
                          />
                        </div>

                        {/* Nguồn Điện */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nguồn Điện
                          </label>
                          <input
                            type="text"
                            value={variant.power_supply}
                            onChange={(e) => handleVariantChange(index, 'power_supply', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 220V AC"
                          />
                        </div>

                        {/* Nhiệt Độ Màu */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhiệt Độ Màu
                          </label>
                          <input
                            type="text"
                            value={variant.color_temp}
                            onChange={(e) => handleVariantChange(index, 'color_temp', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 3000K, 4000K, 6500K"
                          />
                        </div>

                        {/* Kích Thước */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kích Thước (mm)
                          </label>
                          <input
                            type="text"
                            value={variant.dimensions}
                            onChange={(e) => handleVariantChange(index, 'dimensions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Ø100 x H50mm"
                          />
                        </div>

                        {/* Chip LED */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chip LED
                          </label>
                          <input
                            type="text"
                            value={variant.led_chip}
                            onChange={(e) => handleVariantChange(index, 'led_chip', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Samsung, Bridgelux"
                          />
                        </div>

                        {/* Quang Thông */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quang Thông (Lm)
                          </label>
                          <input
                            type="text"
                            value={variant.luminous_flux}
                            onChange={(e) => handleVariantChange(index, 'luminous_flux', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 900Lm"
                          />
                        </div>

                        {/* Độ Hoàn Màu */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Độ Hoàn Màu (CRI)
                          </label>
                          <input
                            type="text"
                            value={variant.cri}
                            onChange={(e) => handleVariantChange(index, 'cri', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: CRI>80, CRI>90"
                          />
                        </div>

                        {/* Góc Chiếu */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Góc Chiếu
                          </label>
                          <input
                            type="text"
                            value={variant.beam_angle}
                            onChange={(e) => handleVariantChange(index, 'beam_angle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 24°, 36°, 60°"
                          />
                        </div>

                        {/* Chất Liệu */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chất Liệu
                          </label>
                          <input
                            type="text"
                            value={variant.material}
                            onChange={(e) => handleVariantChange(index, 'material', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Nhôm đúc, Nhựa PC"
                          />
                        </div>

                        {/* IP Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chỉ Số IP
                          </label>
                          <input
                            type="text"
                            value={variant.ip_rating}
                            onChange={(e) => handleVariantChange(index, 'ip_rating', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: IP20, IP44, IP65"
                          />
                        </div>

                        {/* Bảo Hành */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bảo Hành
                          </label>
                          <input
                            type="text"
                            value={variant.warranty}
                            onChange={(e) => handleVariantChange(index, 'warranty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 2 năm, 3 năm"
                          />
                        </div>

                        {/* Hệ Số PF */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hệ Số PF
                          </label>
                          <input
                            type="text"
                            value={variant.power_factor}
                            onChange={(e) => handleVariantChange(index, 'power_factor', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: >0.9, >0.95"
                          />
                        </div>

                        {/* Màu Vỏ */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Màu Vỏ
                          </label>
                          <input
                            type="text"
                            value={variant.body_color}
                            onChange={(e) => handleVariantChange(index, 'body_color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Trắng, Đen, Bạc"
                          />
                        </div>

                        {/* Khối Lượng */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khối Lượng
                          </label>
                          <input
                            type="text"
                            value={variant.weight}
                            onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: 0.5kg, 1.2kg"
                          />
                        </div>

                        {/* Độ Chói */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Độ Chói
                          </label>
                          <input
                            type="text"
                            value={variant.brightness}
                            onChange={(e) => handleVariantChange(index, 'brightness', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="VD: Chống chói UGR<19"
                          />
                        </div>

                        {/* Giá */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá (VNĐ) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            min="0"
                            step="1000"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              errors[`variant_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                          {errors[`variant_${index}_price`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`variant_${index}_price`]}</p>
                          )}
                        </div>

                        {/* Stock */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số Lượng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              errors[`variant_${index}_stock`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                          {errors[`variant_${index}_stock`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`variant_${index}_stock`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Hình Ảnh Biến Thể */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Hình Ảnh Biến Thể
                          {(() => {
                            console.log(`🖼️ ImageUploader for variant ${index}:`, {
                              variantId: variant.variant_id,
                              sku: variant.sku,
                              uploadMode: product ? 'minio' : 'preview',
                              productId: product?.product_id
                            })
                            return null
                          })()}
                        </label>
                        <ImageUploader
                          images={variant.images || []}
                          onChange={(images) => handleVariantImagesChange(index, images)}
                          maxImages={5}
                          uploadMode={product ? 'minio' : 'preview'}
                          productId={product?.product_id}
                          variantId={variant.variant_id}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Tối đa 5 hình ảnh cho biến thể này. Ảnh đầu tiên sẽ là ảnh đại diện.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
    </form>
  )
})

export default ProductFormNew

