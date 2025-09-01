import { getAuthHeaders, isAuthenticated, logout } from "../auth"

interface ApiOptions extends RequestInit {
  query?: Record<string, string | number>
  token?: string
}

interface ApiResponse<T = unknown> {
  data: T
  count?: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "/api"
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<T> {
    try {
      const { query, token, ...fetchOptions } = options

      let url = `${this.baseUrl}${endpoint}`

      if (query) {
        const params = new URLSearchParams(
          Object.entries(query).map(([key, value]) => [key, String(value)]),
        )
        url += `?${params}`
      }

      const headers = new Headers({
        "Content-Type": "application/json",
      })

      if (fetchOptions.headers) {
        if (fetchOptions.headers instanceof Headers) {
          fetchOptions.headers.forEach((value, key) => {
            headers.set(key, value)
          })
        } else if (Array.isArray(fetchOptions.headers)) {
          fetchOptions.headers.forEach(([key, value]) => {
            headers.set(key, value)
          })
        } else {
          Object.entries(fetchOptions.headers).forEach(([key, value]) => {
            headers.set(key, value)
          })
        }
      }

      if (!token && isAuthenticated()) {
        const authHeaders = getAuthHeaders()
        Object.entries(authHeaders).forEach(([key, value]) => {
          headers.set(key, value)
        })
      } else if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("Content-Type")
      if (
        contentType?.includes("application/json") ||
        contentType?.includes("application/ld+json")
      ) {
        const data = await response.json()

        if (data.member) {
          return {
            data: data.member,
            count: data.totalItems,
          } as T
        }

        return data
      }

      return response.text() as T
    } catch (error: unknown) {
      if (
        (error as Error).message?.includes("401") ||
        (error as Error).message?.includes("Unauthorized")
      ) {
        logout()
        throw new Error("Session expired. Please login again.")
      }

      throw error
    }
  }

  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const api = new ApiClient()
export type { ApiOptions, ApiResponse }
