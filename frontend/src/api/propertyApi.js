import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE,
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const propertyApi = {
  // Search properties with filters
  search: (params) => api.get('/properties', { params }),

  // Get single property
  getById: (id) => api.get(`/properties/${id}`),

  // Get all amenities
  getAmenities: () => api.get('/amenities'),
}

export default api