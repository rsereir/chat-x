"use client"

interface DecodedToken {
  sub: string
  username: string
  exp: number
  iat: number
  roles?: string[]
  [key: string]: unknown
}

interface User {
  id: number
  username: string
  roles: string[]
}

interface LoginCredentials {
  username: string
  plainPassword: string
}

interface RegisterCredentials {
  username: string
  plainPassword: string
}

interface AuthResponse {
  token: string
  user?: User
}

const TOKEN_KEY = "token"

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  )
  return atob(padded)
}

function parseJwt(token: string): DecodedToken {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format")
    }

    const payload = parts[1]
    const decoded = base64UrlDecode(payload)
    return JSON.parse(decoded)
  } catch (_error) {
    throw new Error("Failed to decode JWT token")
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null

  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setStoredToken(token: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error("Failed to store token:", error)
  }
}

function removeStoredToken(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error("Failed to remove token:", error)
  }
}

export function getToken(): string | null {
  return getStoredToken()
}

export function setToken(token: string): void {
  setStoredToken(token)
}

export function removeToken(): void {
  removeStoredToken()
}

export function decodeToken(token?: string): DecodedToken | null {
  const authToken = token || getToken()
  if (!authToken) return null

  try {
    return parseJwt(authToken)
  } catch {
    return null
  }
}

export function isTokenExpired(token?: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true

  return Date.now() >= decoded.exp * 1000
}

export function isTokenValid(token?: string): boolean {
  const decoded = decodeToken(token)
  return decoded !== null && !isTokenExpired(token)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  return isTokenValid() || !!localStorage.getItem("jwt")
}

export function getUser(): User | null {
  const decoded = decodeToken()
  if (!decoded) return null

  return {
    id: parseInt(decoded.id, 10),
    username: decoded.username,
    roles: decoded.roles || ["ROLE_USER"],
  }
}

export function hasRole(role: string): boolean {
  const user = getUser()
  return user?.roles.includes(role) ?? false
}

export function logout(): void {
  removeToken()

  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt")
    localStorage.removeItem("profile")
    window.location.href = "/auth"
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (!token || isTokenExpired()) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Login failed: ${response.status}`)
  }

  const data: AuthResponse = await response.json()

  if (data.token) {
    setToken(data.token)

    try {
      const payload = JSON.parse(atob(data.token.split(".")[1]))
      const user: User = {
        id: payload.sub || payload.user_id,
        username: payload.username,
        roles: payload.roles || ["ROLE_USER"],
      }
      data.user = user
    } catch (e) {
      console.warn("Could not decode JWT token", e)
    }
  }

  return data
}

export const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    if (error.violations) {
      const messages = error.violations
        .map((v: { message: string }) => v.message)
        .join(", ")
      throw new Error(messages)
    }
    throw new Error(error.message || `Registration failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    token?: string
    JWTToken?: string
    message?: string
  }

  if (data.token || data.JWTToken) {
    const token = data.token || data.JWTToken
    setToken(token)

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      data.user = {
        id: payload.sub || payload.user_id,
        username: payload.username,
        roles: payload.roles || ["ROLE_USER"],
      }
    } catch (e) {
      console.warn("Could not decode JWT token", e)
    }
  }

  return data
}

export type {
  DecodedToken,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
}
