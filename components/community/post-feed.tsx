'use client'

import { useState, useEffect, useCallback } from 'react'
import { Post, Category, communityClient } from '@/lib/community-data'
import { useAuth } from '@/components/auth-provider'
import { PostCard } from './post-card'
import { CreatePostModal } from './create-post-modal'
import { CommentSection } from './comment-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PlusCircle,
  Search,
  LayoutList,
  SlidersHorizontal,
  ChevronDown,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostFeedProps {
  currentFilter: string
  selectedCategory: Category | null
  onPostsLoaded?: (posts: Post[]) => void
}

type SortKey = 'top' | 'newest' | 'oldest' | 'trending' | 'high-priority' | 'low-priority'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'trending', label: 'Most Discussed' },
  { key: 'high-priority', label: 'High Priority' },
  { key: 'low-priority', label: 'Low Priority' },
]

const PAGE_SIZE = 8

export function PostFeed({ currentFilter, selectedCategory, onPostsLoaded }: PostFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('top')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const data = await communityClient.getPosts()
    setPosts(data)
    onPostsLoaded?.(data)
    setLoading(false)
  }, [onPostsLoaded])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Reset visible count when filter/sort/search/category changes
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [currentFilter, selectedCategory, searchQuery, sortKey])

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  const getFilteredPosts = (): Post[] => {
    let result = [...posts]

    // Sidebar nav filter
    if (currentFilter === 'high-priority') {
      result = result.filter((p) => p.priority === 'High')
    } else if (currentFilter === 'solved') {
      result = result.filter((p) => p.isSolved)
    } else if (currentFilter === 'my-posts' && user) {
      result = result.filter((p) => p.authorId === user.id)
    } else if (currentFilter === 'saved' && user) {
      result = result.filter((p) => p.savedBy.includes(user.id))
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categories.includes(selectedCategory))
    }

    // Full-text search on title + description
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.categories.some((c) => c.toLowerCase().includes(q)),
      )
    }

    // Sorting
    switch (sortKey) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'trending':
        result.sort((a, b) => b.commentCount - a.commentCount)
        break
      case 'high-priority':
        result.sort((a, b) => {
          const order = { High: 0, Medium: 1, Low: 2 }
          return order[a.priority] - order[b.priority]
        })
        break
      case 'low-priority':
        result.sort((a, b) => {
          const order = { High: 2, Medium: 1, Low: 0 }
          return order[a.priority] - order[b.priority]
        })
        break
      default: // top
        result.sort((a, b) => {
          if (b.netScore !== a.netScore) return b.netScore - a.netScore
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }

    return result
  }

  const filtered = getFilteredPosts()
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // ── Heading ────────────────────────────────────────────────────────────────

  const filterLabel =
    currentFilter === 'all'
      ? 'All Posts'
      : currentFilter.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === sortKey)?.label ?? 'Sort'

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-2xl w-full">

      {/* ── Create Post Banner ── */}
      <div className="bg-card border border-border shadow-sm rounded-2xl p-3.5 flex items-center gap-3 mb-5">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm',
            user?.role === 'admin'
              ? 'bg-gradient-to-br from-destructive to-rose-600'
              : 'bg-gradient-to-br from-primary/80 to-emerald-600/80',
          )}
        >
          {user ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : <User className="size-4" />}
        </div>
        <button
          className="flex-1 rounded-full border border-border bg-secondary/30 hover:bg-secondary/50 px-4 py-2 text-sm text-muted-foreground text-left cursor-text transition-colors"
          onClick={() => {
            if (user) setIsCreateModalOpen(true)
            else setIsCreateModalOpen(true) // modal will handle no-auth gracefully
          }}
        >
          {user ? `What's on your mind, ${user.fullName.split(' ')[0]}?` : 'Sign in to create a post…'}
        </button>
        {user && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="gap-1.5 text-xs shrink-0 hidden sm:flex"
          >
            <PlusCircle className="size-3.5" />
            New Post
          </Button>
        )}
      </div>

      {/* ── Feed Toolbar ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h2 className="text-base font-bold flex items-center gap-2 mr-auto">
          <LayoutList className="size-4 text-primary" />
          {filterLabel}
          {selectedCategory && (
            <span className="text-xs font-normal text-muted-foreground">
              · {selectedCategory}
            </span>
          )}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {filtered.length}
          </span>
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 w-44 text-xs bg-card border-border focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => setShowSortMenu((v) => !v)}
          >
            <SlidersHorizontal className="size-3.5" />
            {currentSortLabel}
            <ChevronDown className={cn('size-3.5 transition-transform', showSortMenu && 'rotate-180')} />
          </Button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setShowSortMenu(false) }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary',
                      sortKey === opt.key && 'bg-primary/8 text-primary font-semibold',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Post List ── */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-secondary/30 animate-pulse" />
          ))
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-3">
            <LayoutList className="size-12 text-muted-foreground/25" />
            <div>
              <h3 className="text-base font-bold text-foreground">No posts found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Try a different filter, or be the first to post!'}
              </p>
            </div>
            {user && (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-2 mt-2">
                <PlusCircle className="size-3.5" />
                Create Post
              </Button>
            )}
          </div>
        ) : (
          <>
            {visible.map((post) => (
              <div key={post.id} className="flex flex-col">
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onPostUpdated={handlePostUpdated}
                  onExpandComments={toggleComments}
                />
                {expandedComments[post.id] && (
                  <CommentSection postId={post.id} />
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full rounded-xl border border-border bg-card py-3 text-xs font-semibold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                Load more posts ({filtered.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
