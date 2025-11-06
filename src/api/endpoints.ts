import { http } from './http'
import type { CursorPage, PostSummary, Subdeck, CommentNode, UserPublic } from './types'

// Auth
export const auth = {
  getSession: () => http.get<{ user: UserPublic | null } | null>('/auth/session'),
  register: (input: { email: string; username: string; password: string; name?: string }) =>
    http.post<{ user: UserPublic }>('/auth/register', input),
  login: (input: { emailOrUsername: string; password: string }) =>
    http.post<{ user: UserPublic }>('/auth/login', input),
  logout: () => http.post<never>('/auth/logout'),
}

// Subdecks
export const subdecks = {
  list: (params?: { q?: string; cursor?: string; limit?: number }) =>
    http.get<CursorPage<Subdeck>>(`/d${toQuery(params)}`),
  bySlug: (slug: string) => http.get<Subdeck>(`/d/${encodeURIComponent(slug)}`),
  create: (input: { name: string; slug: string; description?: string }) =>
    http.post<Subdeck>('/d', input),
  subscribe: (slug: string) => http.post<never>(`/d/${encodeURIComponent(slug)}/subscribe`),
  unsubscribe: (slug: string) => http.del<never>(`/d/${encodeURIComponent(slug)}/subscribe`),
}

// Posts
export const posts = {
  listBySubdeck: (slug: string, params?: { cursor?: string; limit?: number; sort?: 'hot' | 'new' | 'top' }) =>
    http.get<CursorPage<PostSummary>>(`/d/${encodeURIComponent(slug)}/posts${toQuery(params)}`),
  createInSubdeck: (slug: string, input: { title: string; body: string }) =>
    http.post<{ id: string; slug: string }>(`/d/${encodeURIComponent(slug)}/posts`, input),
  byId: (id: string) => http.get<PostSummary>(`/posts/${encodeURIComponent(id)}`),
  update: (id: string, input: { title?: string; body?: string }) => http.patch<PostSummary>(`/posts/${encodeURIComponent(id)}`, input),
  remove: (id: string) => http.del<never>(`/posts/${encodeURIComponent(id)}`),
  vote: (id: string, value: 'UP' | 'DOWN') => http.post<{ totals: { up: number; down: number; score: number } }>(`/posts/${encodeURIComponent(id)}/vote`, { value }),
  clearVote: (id: string) => http.del<never>(`/posts/${encodeURIComponent(id)}/vote`),
}

// Comments
export const comments = {
  listForPost: (postId: string, params?: { cursor?: string; limit?: number }) =>
    http.get<CursorPage<CommentNode>>(`/posts/${encodeURIComponent(postId)}/comments${toQuery(params)}`),
  createOnPost: (postId: string, input: { body: string; parentId?: string }) =>
    http.post<{ id: string }>(`/posts/${encodeURIComponent(postId)}/comments`, input),
  update: (id: string, input: { body: string }) => http.patch<unknown>(`/comments/${encodeURIComponent(id)}`, input),
  remove: (id: string) => http.del<never>(`/comments/${encodeURIComponent(id)}`),
  vote: (id: string, value: 'UP' | 'DOWN') => http.post<{ totals: { up: number; down: number; score: number } }>(`/comments/${encodeURIComponent(id)}/vote`, { value }),
  clearVote: (id: string) => http.del<never>(`/comments/${encodeURIComponent(id)}/vote`),
}

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return ''
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    usp.append(k, String(v))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}
