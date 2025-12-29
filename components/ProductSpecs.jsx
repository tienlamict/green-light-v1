// ProductSpecs - Display product technical specifications
'use client'

export default function ProductSpecs({ product, selectedVariant }) {
  if (!product || !product.variants || product.variants.length === 0) {
    return null
  }

  // Use selected variant or default to first variant
  const variant = selectedVariant || product.variants[0]
  const attributes = variant.attributes || {}

  // Define display labels for attributes
  const attributeLabels = {
    sku: 'SKU',
    power: 'Công Suất (W)',
    input_voltage: 'Nguồn Điện',
    color_temperature: 'Nhiệt Độ Màu',
    cutout_size: 'Kích Thước Lỗ Khoét',
    cri: 'Tiêu Chuẩn',
    luminance: 'Độ chói',
    beam_angle: 'Góc chiếu',
    dimensions: 'Kích thước (mm)',
    material: 'Chất liệu',
    housing_color: 'Màu sắc',
    led_chip: 'LED Chip',
    luminous_flux: 'Quang thông (lm)',
    power_factor: 'Hệ số công suất',
    ip_rating: 'Chỉ số IP',
    warranty: 'Bảo Hành',
    weight: 'Trọng lượng (kg)',
  }

  // Order of attributes to display
  const attributeOrder = [
    'sku',
    'power',
    'input_voltage',
    'color_temperature',
    'cutout_size',
    'cri',
    'luminance',
    'beam_angle',
    'dimensions',
    'material',
    'housing_color',
    'led_chip',
    'luminous_flux',
    'power_factor',
    'ip_rating',
    'warranty',
    'weight',
  ]

  // Filter and order attributes
  const displayAttributes = attributeOrder
    .filter(key => attributes[key])
    .map(key => ({
      key,
      label: attributeLabels[key] || key,
      value: attributes[key]
    }))

  if (displayAttributes.length === 0) {
    return null
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Thông số kỹ thuật</h2>
      
      {/* Variant Name */}
      {variant.name && (
        <div className="mb-3 pb-3 border-b border-gray-200">
          <p className="text-xs text-gray-600">Phiên bản</p>
          <p className="text-sm font-semibold text-gray-900">{variant.name}</p>
        </div>
      )}

      <div className="space-y-2 flex-1">
        {displayAttributes.map(({ key, label, value }) => (
          <div key={key} className="flex items-start">
            <div className="flex items-center mr-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">{label}:</span>{' '}
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

