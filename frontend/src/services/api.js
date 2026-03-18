import axios from 'axios'

// axios.create() creates a reusable axios instance with your base URL, so no need to thype the whole URL, just type /api/trucks
const api = axios.create({
    baseURL: 'http://localhost:8000'
})

// This runs before every request
// It automatically attaches the JWT token if one exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem('streeteats_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ── Trucks ────────────────────────────────────────
export const trucksAPI = {
    getAll: (params = {}) => api.get('/api/trucks', { params }),
    getOne: (id)          => api.get(`/api/trucks/${id}`),
    create: (data)        => api.post('/api/trucks', data),
    update: (id, data)    => api.put(`/api/trucks/${id}`, data),
    delete: (id)          => api.delete(`/api/trucks/${id}`),
}

// ── Auth ──────────────────────────────────────────
export const authAPI = {
    register: (email, username, password) => api.post('/api/auth/register', { email, username, password }),
    login:    (email, password)           => api.post('/api/auth/login', { email, password }),
    me:       ()                          => api.get('/api/auth/me'),
}

// ── Favorites ─────────────────────────────────────
export const favoritesAPI = {
    getAll:  ()   => api.get('/api/favorites'),
    add:     (id) => api.post(`/api/favorites/${id}`),
    remove:  (id) => api.delete(`/api/favorites/${id}`),
}

export default api