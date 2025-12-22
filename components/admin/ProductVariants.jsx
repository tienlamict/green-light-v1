'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'

export default function ProductVariants({ variants = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [variantForm, setVariantForm] = useState({
    name: '',
    values: [],
    price_adjustment: 0,
    stock: '',
    sku: '',
  })

  const commonVariantNames = ['Color', 'Size', 'Material', 'Style']
  const commonVariantValues = {
    Color: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'],
    Size: ['S', 'M', 'L', 'XL', 'XXL'],
    Material: ['Cotton', 'Polyester', 'Wool', 'Leather'],
    Style: ['Classic', 'Modern', 'Vintage'],
  }

  const handleAddVariant = () => {
    if (!variantForm.name.trim() || variantForm.values.length === 0) return

    const newVariant = {
      id: Date.now().toString(),
      name: variantForm.name,
      values: variantForm.values.map(v => typeof v === 'string' ? v : v.value || v),
      price_adjustment: parseFloat(variantForm.price_adjustment) || 0,
      stock: variantForm.stock ? parseInt(variantForm.stock) : null,
      sku: variantForm.sku || '',
    }

    if (editingIndex !== null) {
      const updated = [...variants]
      updated[editingIndex] = newVariant
      onChange(updated)
      setEditingIndex(null)
    } else {
      onChange([...variants, newVariant])
    }

    // Reset form
    setVariantForm({
      name: '',
      values: [],
      price_adjustment: 0,
      stock: '',
      sku: '',
    })
  }

  const handleEditVariant = (index) => {
    const variant = variants[index]
    setVariantForm({
      name: variant.name,
      values: variant.values,
      price_adjustment: variant.price_adjustment || 0,
      stock: variant.stock || '',
      sku: variant.sku || '',
    })
    setEditingIndex(index)
  }

  const handleDeleteVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index)
    onChange(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
      setVariantForm({
        name: '',
        values: [],
        price_adjustment: 0,
        stock: '',
        sku: '',
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setVariantForm({
      name: '',
      values: [],
      price_adjustment: 0,
      stock: '',
      sku: '',
    })
  }

  const handleVariantNameChange = (name) => {
    setVariantForm(prev => ({
      ...prev,
      name,
      values: [], // Reset values when name changes
    }))
  }

  const handleAddValue = () => {
    const newValue = prompt('Enter variant value:')
    if (newValue && newValue.trim()) {
      setVariantForm(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()],
      }))
    }
  }

  const handleRemoveValue = (index) => {
    setVariantForm(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }))
  }

  const handleQuickAddValues = () => {
    if (commonVariantValues[variantForm.name]) {
      setVariantForm(prev => ({
        ...prev,
        values: [...new Set([...prev.values, ...commonVariantValues[variantForm.name]])],
      }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Product Variants</h3>
      </div>

      {/* Variant Form */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Variant Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Variant Name
            </label>
            <div className="flex space-x-2">
              <select
                value={variantForm.name}
                onChange={(e) => handleVariantNameChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select or type...</option>
                {commonVariantNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <input
                type="text"
                value={variantForm.name}
                onChange={(e) => handleVariantNameChange(e.target.value)}
                placeholder="Custom name"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Price Adjustment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Price Adjustment
            </label>
            <input
              type="number"
              value={variantForm.price_adjustment}
              onChange={(e) => setVariantForm(prev => ({ ...prev, price_adjustment: e.target.value }))}
              step="0.01"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={variantForm.stock}
              onChange={(e) => setVariantForm(prev => ({ ...prev, stock: e.target.value }))}
              min="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={variantForm.sku}
              onChange={(e) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Variant SKU"
            />
          </div>
        </div>

        {/* Variant Values */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Variant Values
            </label>
            {variantForm.name && commonVariantValues[variantForm.name] && (
              <button
                type="button"
                onClick={handleQuickAddValues}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Quick add common values
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {variantForm.values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {value}
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddValue}
            className="text-xs text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add value</span>
          </button>
        </div>

        {/* Form Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <button
            type="button"
            onClick={handleAddVariant}
            disabled={!variantForm.name.trim() || variantForm.values.length === 0}
            className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{editingIndex !== null ? 'Update Variant' : 'Add Variant'}</span>
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div
              key={variant.id || index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-sm text-gray-900">{variant.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {variant.values.map((value, vIndex) => (
                      <span
                        key={vIndex}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  {variant.price_adjustment !== 0 && (
                    <span>Price: {variant.price_adjustment > 0 ? '+' : ''}{variant.price_adjustment}</span>
                  )}
                  {variant.stock !== null && <span>Stock: {variant.stock}</span>}
                  {variant.sku && <span>SKU: {variant.sku}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditVariant(index)}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVariant(index)}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

