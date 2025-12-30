// ProductAttributeFilters - Display attribute filters for product variants
'use client'
import { useState, useEffect } from 'react'

export default function ProductAttributeFilters({ product, onFilterChange }) {
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [availableOptions, setAvailableOptions] = useState({})

  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return

    // Collect all unique attribute values from all variants
    const attributeMap = {}
    
    product.variants.forEach(variant => {
      if (!variant.attributes) return
      
      Object.keys(variant.attributes).forEach(attrKey => {
        if (!attributeMap[attrKey]) {
          attributeMap[attrKey] = new Set()
        }
        const value = variant.attributes[attrKey]
        if (value) {
          // Handle multiple values separated by / or ,
          const values = String(value).split(/[\/,]/).map(v => v.trim())
          values.forEach(v => {
            if (v) attributeMap[attrKey].add(v)
          })
        }
      })
    })

    // Convert Sets to Arrays and sort
    const options = {}
    Object.keys(attributeMap).forEach(key => {
      options[key] = Array.from(attributeMap[key]).sort()
    })

    setAvailableOptions(options)
  }, [product])

  const handleAttributeSelect = (attributeKey, value) => {
    // Toggle: if already selected, remove the filter; otherwise, set it
    const currentValue = selectedAttributes[attributeKey]
    const isCurrentlySelected = currentValue === value
    
    const newSelected = { ...selectedAttributes }
    
    if (isCurrentlySelected) {
      // Remove this filter (toggle off)
      delete newSelected[attributeKey]
    } else {
      // Set this filter (toggle on)
      newSelected[attributeKey] = value
    }
    
    setSelectedAttributes(newSelected)
    
    if (onFilterChange) {
      onFilterChange(newSelected)
    }
  }

  // Define which attributes to show and their display labels
  const attributeConfig = {
    power: {
      label: 'Công Suất (W)',
      icon: '⚡',
      order: 1
    },
    color_temperature: {
      label: 'Nhiệt Độ Màu',
      icon: '🌡️',
      order: 2
    }
  }

  // Filter and sort attributes to display
  const displayAttributes = Object.keys(availableOptions)
    .filter(key => attributeConfig[key])
    .sort((a, b) => (attributeConfig[a]?.order || 999) - (attributeConfig[b]?.order || 999))

  if (displayAttributes.length === 0) return null

  return (
    <div className="space-y-4">
      {displayAttributes.map(attrKey => {
        const config = attributeConfig[attrKey]
        const options = availableOptions[attrKey] || []
        const selectedValue = selectedAttributes[attrKey]

        return (
          <div key={attrKey}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {config.label}:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {options.map(option => {
                const isSelected = selectedValue === option
                
                return (
                  <button
                    key={option}
                    onClick={() => handleAttributeSelect(attrKey, option)}
                    className={`
                      px-3 py-1.5 rounded-lg border-2 transition-all font-medium text-xs
                      ${isSelected 
                        ? 'border-gray-900 bg-gray-900 text-white' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

