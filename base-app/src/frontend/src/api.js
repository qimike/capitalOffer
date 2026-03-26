// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Response promise
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }
  
  // Add auth token if available
  const authToken = localStorage.getItem('authToken')
  if (authToken) {
    defaultHeaders['Authorization'] = `Token ${authToken}`
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }
  
  try {
    const response = await fetch(url, config)
    
    // Check if response is successful
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json()
        const error = new Error(errorData.error || `HTTP ${response.status}`)
        error.status = response.status
        error.details = errorData
        throw error
      } catch {
        // If JSON parsing fails, throw generic error
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// API Endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (data) => apiRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    signup: (data) => apiRequest('/api/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    logout: () => apiRequest('/api/auth/logout/', {
      method: 'POST'
    })
  },
  
  // Offers endpoints
  offers: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString()
      return apiRequest(`/api/offers/?${queryParams}`)
    },
    browse: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString()
      return apiRequest(`/api/offers/browse/?${queryParams}`)
    },
    getById: (id) => apiRequest(`/api/offers/${id}/`),
    create: (data) => apiRequest('/api/offers/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/api/offers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    accept: (id) => apiRequest(`/api/offers/${id}/actions/accept/`, {
      method: 'POST'
    }),
    decline: (id, data) => apiRequest(`/api/offers/${id}/actions/decline/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    shortlist: (id) => apiRequest(`/api/offers/${id}/actions/shortlist/`, {
      method: 'POST'
    })
  },
  
  // Lenders endpoints
  lenders: {
    getAll: () => apiRequest('/api/lenders/')
  },
  
  // Profile endpoints
  profile: {
    get: () => apiRequest('/api/profile/'),
    update: (data) => apiRequest('/api/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  
  // Notifications endpoints
  notifications: {
    getAll: () => apiRequest('/api/notifications/'),
    markAsRead: (id) => apiRequest(`/api/notifications/${id}/read/`, {
      method: 'POST'
    })
  }
}

export default api
