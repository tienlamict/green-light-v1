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
 * @param {string} filters.category - Category UUID
 * @param {number} filters.min_price - Minimum price
 * @param {number} filters.max_price - Maximum price
 * @param {boolean} filters.is_active - Active status (default: true)
 * @param {string} filters.sort - Sort order (e.g., "price_min ASC")
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<Object>} Object with products array and meta information
 */
export async function fetchProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams()

    // Always include page and limit (default values if not provided)
    queryParams.append('page', filters.page || 1)
    queryParams.append('limit', filters.limit || 12)

    // Optional filters
    if (filters.category) {
      queryParams.append('category', filters.category)
    }
    if (filters.min_price !== undefined && filters.min_price !== null) {
      queryParams.append('min_price', filters.min_price)
    }
    if (filters.max_price !== undefined && filters.max_price !== null) {
      queryParams.append('max_price', filters.max_price)
    }
    if (filters.is_active !== undefined && filters.is_active !== null) {
      queryParams.append('is_active', filters.is_active)
    }
    if (filters.sort) {
      queryParams.append('sort', filters.sort)
    }

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`

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

