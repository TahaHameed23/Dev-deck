// Lightweight fetch wrapper for the DevDeck API
// - Base URL: /api/v1
// - Credentials: include (cookie-based session)
// - CSRF: attaches X-CSRF-Token from `csrfToken` cookie for non-GET

export type ApiErrorShape = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export class ApiError extends Error {
  code: string
  status: number
  details?: Record<string, unknown>
  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const BASE_URL = '/api/v1'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`

  const headers = new Headers(init?.headers)
  if (init?.json !== undefined) headers.set('Content-Type', 'application/json')
  // Attach CSRF token for non-GET requests
  const method = (init?.method || 'GET').toUpperCase()
  if (method !== 'GET') {
    const csrf = getCookie('csrfToken')
    if (csrf) headers.set('X-CSRF-Token', csrf)
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  })

  const text = await res.text()
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson && text ? JSON.parse(text) : undefined

  if (!res.ok) {
    const shape = (data as ApiErrorShape | undefined)?.error
    throw new ApiError(
      res.status,
      shape?.code || 'HTTP_ERROR',
      shape?.message || res.statusText,
      shape?.details,
    )
  }

  return (data as { data: T } | undefined)?.data ?? (data as T)
}

export const http = {
  get: <T>(path: string, init?: RequestInit) => api<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, json?: unknown, init?: RequestInit) => api<T>(path, { ...init, method: 'POST', json }),
  patch: <T>(path: string, json?: unknown, init?: RequestInit) => api<T>(path, { ...init, method: 'PATCH', json }),
  del: <T>(path: string, init?: RequestInit) => api<T>(path, { ...init, method: 'DELETE' }),
}
