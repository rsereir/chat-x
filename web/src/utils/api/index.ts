import { getAuthHeaders, isAuthenticated, logout } from '../auth'

interface ApiOptions extends RequestInit {
  query?: Record<string, string | number>
  token?: string
}

interface ApiResponse<T = any> {
  data: T
  count?: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    try {
      const { query, token, ...fetchOptions } = options

      let url = `${this.baseUrl}${endpoint}`

      if (query) {
        const params = new URLSearchParams(
          Object.entries(query).map(([key, value]) => [key, String(value)])
        )
        url += `?${params}`
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      }

      if (!token && isAuthenticated()) {
        const authHeaders = getAuthHeaders()
        Object.assign(headers, authHeaders)
      } else if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('Content-Type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()

        if (data['hydra:member']) {
          return {
            data: data['hydra:member'],
            count: data['hydra:totalItems'],
          } as T
        }

        return data
      }

      return response.text() as T
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        logout()
        throw new Error('Session expired. Please login again.')
      }

      throw error
    }
  }

  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()
export type { ApiOptions, ApiResponse }
