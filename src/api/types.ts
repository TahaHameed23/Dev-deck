// Types aligned with api.md

export type ID = string

export type VoteValue = 'UP' | 'DOWN'

export type Profile = {
  displayName?: string
  bio?: string
  avatarUrl?: string
}

export type UserPublic = {
  id: ID
  username: string
  name?: string
  profile?: Profile
}

export type Subdeck = {
  id: ID
  name: string
  slug: string
  description?: string
  createdAt: string
  memberCount?: number
}

export type PostSummary = {
  id: ID
  slug: string
  title: string
  body: string
  author: UserPublic
  subdeck?: { id: ID; slug: string; name: string }
  voteTotals?: { up: number; down: number; score: number }
  commentCount?: number
  createdAt: string
  updatedAt?: string
}

export type CommentNode = {
  id: ID
  body: string
  author: UserPublic
  parentId?: ID
  score?: number
  createdAt: string
  replies?: CommentNode[]
}

export type CursorPage<T> = {
  data: T[]
  nextCursor?: string
}
