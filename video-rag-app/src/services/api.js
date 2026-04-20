// @ts-check

/** @type {string} */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const activeRequests = new Map()

const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function withRetry(fn, config = {}) {
    const { maxRetries, initialDelay, maxDelay, backoffMultiplier, retryableStatuses } = {
        ...DEFAULT_RETRY_CONFIG,
        ...config,
    }
    
    let lastError
    let delay = initialDelay
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            
            if (attempt === maxRetries) break
            if (error.name === 'AbortError') throw error
            if (!retryableStatuses.includes(error.status)) throw error
            
            await sleep(delay)
            delay = Math.min(delay * backoffMultiplier, maxDelay)
        }
    }
    
    throw lastError
}

export function createCancellableRequest(key) {
    if (activeRequests.has(key)) {
        activeRequests.get(key).abort()
    }
    const controller = new AbortController()
    activeRequests.set(key, controller)
    return controller
}

export function cancelRequest(key) {
    if (activeRequests.has(key)) {
        activeRequests.get(key).abort()
        activeRequests.delete(key)
    }
}

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const token = localStorage.getItem('token')
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    }

    if (options.body instanceof FormData) {
        delete config.headers['Content-Type']
    }

    const shouldRetry = options.retry !== false
    const retryConfig = options.retryConfig || {}

    const fetchFn = async () => {
        const response = await fetch(url, config)

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }))
            const err = new Error(error.message || `HTTP ${response.status}`)
            err.status = response.status
            throw err
        }

        return await response.json()
    }

    if (shouldRetry) {
        return withRetry(fetchFn, retryConfig)
    }
    return fetchFn()
}

// ============================================
// VIDEO API
// ============================================

export const videoAPI = {
    // Get all videos
    getAll: () => apiCall('/videos'),

    // Get single video by ID
    getById: (id) => apiCall(`/videos/${id}`),

    // Process video from URL (YouTube, etc.)
    processUrl: (url, title) => apiCall('/videos/process-url', {
        method: 'POST',
        body: JSON.stringify({ url, title }),
    }),

    // Toggle like
    toggleLike: (id) => apiCall(`/videos/${id}/like`, { method: 'POST' }),

    // Upload video file
    upload: (file, title, onProgress) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title || file.name)

        return apiCall('/videos/upload', {
            method: 'POST',
            body: formData,
        })
    },

    // Get video processing status
    getStatus: (id) => apiCall(`/videos/${id}/status`),

    // Delete video
    delete: (id) => apiCall(`/videos/${id}`, { method: 'DELETE' }),

    // Get video transcript
    getTranscript: (id) => apiCall(`/videos/${id}/transcript`),

    // Get video notes
    getNotes: (id) => apiCall(`/videos/${id}/notes`),

    // Create a note
    createNote: (videoId, content, timestamp) => apiCall(`/videos/${videoId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content, timestamp }),
    }),

    // Delete a note
    deleteNote: (videoId, noteId) => apiCall(`/videos/${videoId}/notes/${noteId}`, { method: 'DELETE' }),
}

// ============================================
// CHAT API (RAG)
// ============================================

export const chatAPI = {
    // Send message to AI about a video
    sendMessage: (videoId, message) => apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify({ videoId, message }),
    }),

    // Get chat history for a video
    getHistory: (videoId) => apiCall(`/chat/${videoId}/history`),

    // Clear chat history
    clearHistory: (videoId) => apiCall(`/chat/${videoId}/history`, { method: 'DELETE' }),
}

// ============================================
// QUIZ API
// ============================================

export const quizAPI = {
    // Generate quiz for a video
    generate: (videoId, questionCount = 10) => apiCall('/quiz/generate', {
        method: 'POST',
        body: JSON.stringify({ videoId, questionCount }),
    }),

    // Get quiz by ID
    getById: (quizId) => apiCall(`/quiz/${quizId}`),

    // Submit quiz answers
    submit: (quizId, answers) => apiCall(`/quiz/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
    }),

    // Get quiz results/analysis
    getResults: (quizId) => apiCall(`/quiz/${quizId}/results`),
}

// ============================================
// SEARCH API
// ============================================

export const searchAPI = {
    // Search across all videos
    search: (query, filters = {}) => apiCall('/search', {
        method: 'POST',
        body: JSON.stringify({ query, ...filters }),
    }),

    // Get search suggestions
    suggestions: (query) => apiCall(`/search/suggestions?q=${encodeURIComponent(query)}`),
}

// ============================================
// AUTH API
// ============================================

function getAuthToken() {
    return localStorage.getItem('token')
}

function setAuthToken(token) {
    localStorage.setItem('token', token)
}

function removeAuthToken() {
    localStorage.removeItem('token')
}

export const authAPI = {
    signup: (userData) => apiCall('/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    login: (credentials) => apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),

    logout: () => {
        removeAuthToken()
        return Promise.resolve({ message: 'Logged out' })
    },

    getCurrentUser: () => apiCall('/me'),

    getToken: getAuthToken,
    setToken: setAuthToken,
    removeToken: removeAuthToken,
}

export default {
    video: videoAPI,
    chat: chatAPI,
    quiz: quizAPI,
    search: searchAPI,
    auth: authAPI,
}
