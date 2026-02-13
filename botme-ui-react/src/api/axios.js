// API Base URL from environment variable
// Local: VITE_API_BASE_URL is empty/unset → uses Vite proxy (relative URLs)
// Production: VITE_API_BASE_URL=https://botme-ai.onrender.com
const baseURL = import.meta.env.VITE_API_BASE_URL || ''
console.log('[API] Using base URL:', baseURL || '(dev proxy)')

const requestInterceptors = []

const isAbsoluteUrl = (url) => /^https?:/i.test(url)

const applyInterceptors = (config) => {
  return requestInterceptors.reduce((acc, interceptor) => {
    const next = interceptor({ ...acc })
    return next || acc
  }, config)
}

const resolveUrl = (url) => {
  if (!url) return baseURL
  if (isAbsoluteUrl(url)) return url
  // If no baseURL is set, use relative URL (will be proxied by Vite)
  if (!baseURL) {
    // Ensure URL starts with / for proper proxy routing
    return url.startsWith('/') ? url : `/${url}`
  }
  if (url.startsWith('/') && baseURL.endsWith('/')) {
    return `${baseURL.slice(0, -1)}${url}`
  }
  if (!url.startsWith('/') && !baseURL.endsWith('/')) {
    return `${baseURL}/${url}`
  }
  return `${baseURL}${url}`
}

const parseJson = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch (error) {
    return {}
  }
}

const execute = async (config) => {
  try {
    const intercepted = applyInterceptors(config)
    const { url, method, body, headers = {}, credentials = 'include' } = intercepted

    const init = {
      method,
      credentials,
      headers: { ...headers },
    }

    if (body instanceof FormData) {
      init.body = body
      // Don't set Content-Type for FormData - browser will set it with boundary
    } else if (body !== undefined && body !== null) {
      if (typeof body === 'string') {
        init.body = body
      } else {
        init.body = JSON.stringify(body)
        init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json'
      }
    }

    const fullUrl = resolveUrl(url)
    console.log(`[API] Making ${method} request to: ${fullUrl}`)

    const response = await fetch(fullUrl, init)
    const data = await parseJson(response)

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = data
      error.url = fullUrl
      throw error
    }

    return { data, status: response.status }
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error.status && error.data) {
      throw error
    }

    // Handle network errors and fetch failures
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        const apiUrl = baseURL || 'the backend server'
        const networkError = new Error(`Network error: Could not reach ${apiUrl}. This may be a CORS issue or the server is not responding.`)
        networkError.status = 0
        networkError.data = { originalError: error.message, type: 'network_error', apiUrl: baseURL }
        throw networkError
      }
      if (error.message.includes('cached') || error.message.includes('unavailable')) {
        const cacheError = new Error('Connection error: Server temporarily unavailable. Please try again.')
        cacheError.status = 0
        cacheError.data = { originalError: error.message, type: 'connection_error' }
        throw cacheError
      }
    }

    // Handle other fetch-related errors
    if (error.message && (error.message.includes('unavailable') || error.message.includes('cached'))) {
      const connError = new Error('Backend server is not accessible. Please ensure Flask server is running: python app.py')
      connError.status = 0
      connError.data = { originalError: error.message, type: 'server_unavailable' }
      throw connError
    }

    // Re-throw other errors
    throw error
  }
}

export const api = {
  interceptors: {
    request: {
      use: (handler) => {
        if (typeof handler === 'function') {
          requestInterceptors.push(handler)
        }
      },
    },
  },
  async get(url, options = {}) {
    return execute({ url, method: 'GET', ...options })
  },
  async post(url, body, options = {}) {
    return execute({ url, method: 'POST', body, ...options })
  },
  async put(url, body, options = {}) {
    return execute({ url, method: 'PUT', body, ...options })
  },
  async delete(url, options = {}) {
    return execute({ url, method: 'DELETE', ...options })
  },
}

// Attach token from localStorage when present
api.interceptors.request.use((config) => {
  const headers = { ...(config.headers || {}) }
  const token = localStorage.getItem('auth_token')
  if (token) headers.Authorization = `Bearer ${token}`
  return { ...config, headers }
})

export default api

