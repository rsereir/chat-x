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
  token?: string
  JWTToken?: string
  message?: string
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
    id: parseInt(decoded.id as string, 10),
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


export type {
  DecodedToken,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
}
