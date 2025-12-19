// API service for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Fetch all categories from backend
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    return []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Fetch products with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of product objects
 */
export async function fetchProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams()

    if (filters.category) {
      queryParams.append('category', filters.category)
    }
    if (filters.page) {
      queryParams.append('page', filters.page)
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit)
    }

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      return {
        products: result.data,
        meta: result.meta || {},
      }
    }

    return { products: [], meta: {} }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], meta: {} }
  }
}

