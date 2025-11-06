import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auth, posts, subdecks, comments } from './endpoints'
import type { CursorPage, PostSummary, Subdeck as SubdeckType, CommentNode, UserPublic } from './types'

export const qk = {
  session: ['session'] as const,
  subdecks: (params?: { q?: string }) => ['subdecks', params?.q ?? ''] as const,
  subdeck: (slug: string) => ['subdecks', 'bySlug', slug] as const,
  postsBySubdeck: (slug: string, sort?: 'hot' | 'new' | 'top') => ['posts', 'bySubdeck', slug, sort ?? 'hot'] as const,
  post: (id: string) => ['posts', 'byId', id] as const,
  commentsForPost: (postId: string) => ['comments', 'forPost', postId] as const,
}

// Session
export function useSessionQuery() {
  return useQuery({ queryKey: qk.session, queryFn: () => auth.getSession() })
}

// Subdecks
export function useSubdecksQuery(params?: { q?: string; cursor?: string; limit?: number }) {
  return useQuery({ queryKey: qk.subdecks({ q: params?.q }), queryFn: () => subdecks.list(params) })
}

export function useSubdeckQuery(slug: string) {
  return useQuery({ queryKey: qk.subdeck(slug), queryFn: () => subdecks.bySlug(slug), enabled: !!slug })
}

// Posts
export function usePostsBySubdeckQuery(slug: string, params?: { cursor?: string; limit?: number; sort?: 'hot' | 'new' | 'top' }) {
  return useQuery({ queryKey: qk.postsBySubdeck(slug, params?.sort), queryFn: () => posts.listBySubdeck(slug, params), enabled: !!slug })
}

export function usePostQuery(id: string) {
  return useQuery({ queryKey: qk.post(id), queryFn: () => posts.byId(id), enabled: !!id })
}

// Comments
export function useCommentsForPostQuery(postId: string, params?: { cursor?: string; limit?: number }) {
  return useQuery({ queryKey: qk.commentsForPost(postId), queryFn: () => comments.listForPost(postId, params), enabled: !!postId })
}

// Mutations examples
export function useCreatePostMutation(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { title: string; body: string }) => posts.createInSubdeck(slug, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.postsBySubdeck(slug) })
    },
  })
}

export function usePostVoteMutation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (value: 'UP' | 'DOWN') => posts.vote(id, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.post(id) })
    },
  })
}

export type { CursorPage, PostSummary, SubdeckType, CommentNode, UserPublic }
