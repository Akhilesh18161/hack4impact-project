'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment, communityClient, UserReputation } from '@/lib/community-data'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowBigUp,
  ArrowBigDown,
  Reply,
  Pencil,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReputationBadge } from './reputation-badge'

interface CommentSectionProps {
  postId: string
  postAuthorId?: string
  onCommentChange?: (delta: number) => void
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

// ── CommentNode ────────────────────────────────────────────────────────────────

interface CommentNodeProps {
  comment: Comment
  allComments: Comment[]
  currentUserId?: string
  currentUserName?: string
  currentUserRole?: string
  postAuthorId?: string
  depth?: number
  onCommentAdded: (comment: Comment) => void
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (purgedIds: string[], mode: 'hard' | 'soft') => void
}

function CommentNode({
  comment,
  allComments,
  currentUserId,
  currentUserName,
  currentUserRole,
  postAuthorId,
  depth = 0,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
}: CommentNodeProps) {
  const replies = allComments.filter((c) => c.parentId === comment.id)
  const isOwn = currentUserId === comment.authorId
  const isCurrentUserAdmin = currentUserRole === 'admin'
  const isPostAuthor = !!currentUserId && currentUserId === postAuthorId
  const canDelete = isOwn || isCurrentUserAdmin || isPostAuthor
  const isAdmin = comment.authorRole === 'admin'
  const userVote = currentUserId ? (comment.votedBy?.[currentUserId] ?? undefined) : undefined

  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [reputation, setReputation] = useState<UserReputation | null>(null)

  useEffect(() => {
    if (!comment.isDeleted) {
      communityClient.getUserReputation(comment.authorId).then(setReputation)
    }
  }, [comment.authorId, comment.isDeleted])

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUserId) return
    const updated = await communityClient.voteComment(comment.id, currentUserId, type)
    if (updated) onCommentUpdated(updated)
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId || !currentUserName || !replyText.trim()) return
    setIsSubmittingReply(true)
    const newComment = await communityClient.addComment({
      postId: comment.postId,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: currentUserRole || 'community_user',
      content: replyText.trim(),
      parentId: comment.id,
    })
    onCommentAdded(newComment)
    setReplyText('')
    setIsReplying(false)
    setIsSubmittingReply(false)
  }

  const handleEditSave = async () => {
    if (!currentUserId || !editText.trim()) return
    setIsSavingEdit(true)
    const updated = await communityClient.editComment(comment.id, currentUserId, editText.trim())
    if (updated) onCommentUpdated(updated)
    setIsEditing(false)
    setIsSavingEdit(false)
  }

  const handleDelete = async () => {
    if (!currentUserId || isDeleting) return
    setIsDeleting(true)
    const isPrivileged = isCurrentUserAdmin || isPostAuthor
    const result = await communityClient.deleteComment(comment.id, currentUserId, isPrivileged)
    if (result) onCommentDeleted(result.purgedIds, result.mode)
    setIsDeleting(false)
  }

  const netScore = (comment.upvotes ?? 0) - (comment.downvotes ?? 0)
  const initials = getInitials(comment.authorName)

  return (
    <div className={cn('group/comment', depth > 0 && 'ml-5 border-l-2 border-border/40 pl-4')}>
      <div className="py-3">
        {/* Author row */}
        {!comment.isDeleted ? (
          <div className="flex items-start gap-2.5">
            {/* Avatar */}
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow-sm',
                isAdmin
                  ? 'bg-gradient-to-br from-destructive to-rose-600'
                  : 'bg-gradient-to-br from-primary/80 to-emerald-600/80',
              )}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {/* Author meta */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold">{comment.authorName}</span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-destructive/20 bg-destructive/10 px-1.5 py-[2px] text-[9px] font-bold text-destructive">
                    <ShieldCheck className="size-2.5" /> Admin
                  </span>
                )}
                {reputation && <ReputationBadge badge={reputation.badge} />}
                <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                {comment.isEdited && (
                  <span className="text-[10px] text-muted-foreground/60 italic">(edited)</span>
                )}
              </div>

              {/* Content / Edit mode */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full rounded-lg border border-primary/40 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={handleEditSave}
                      disabled={isSavingEdit || !editText.trim()}
                    >
                      {isSavingEdit ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => { setIsEditing(false); setEditText(comment.content) }}
                    >
                      <X className="size-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
              )}

              {/* Action row */}
              {!isEditing && (
                <div className="flex items-center gap-0.5 mt-2 flex-wrap">
                  {/* Vote */}
                  <button
                    onClick={() => handleVote('up')}
                    disabled={!currentUserId}
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-40',
                      userVote === 'up'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/8',
                    )}
                  >
                    <ArrowBigUp className={cn('size-4', userVote === 'up' && 'fill-primary')} />
                    {comment.upvotes ?? 0}
                  </button>

                  <button
                    onClick={() => handleVote('down')}
                    disabled={!currentUserId}
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-40',
                      userVote === 'down'
                        ? 'text-rose-500'
                        : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8',
                    )}
                  >
                    <ArrowBigDown className={cn('size-4', userVote === 'down' && 'fill-rose-500')} />
                    {comment.downvotes ?? 0}
                  </button>

                  {/* Reply */}
                  {depth < 4 && currentUserId && (
                    <button
                      onClick={() => setIsReplying((v) => !v)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
                    >
                      <Reply className="size-3.5" />
                      Reply
                    </button>
                  )}

                  {/* Comment controls */}
                  {!comment.isDeleted && (
                    <>
                      {/* Only the comment author can edit */}
                      {isOwn && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                      )}
                      {/* Comment author, post author, or admin can delete */}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8 transition-colors disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Inline reply box */}
              {isReplying && (
                <form onSubmit={handleReplySubmit} className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Replying to ${comment.authorName}...`}
                    rows={2}
                    autoFocus
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      disabled={isSubmittingReply || !replyText.trim()}
                    >
                      {isSubmittingReply && <Loader2 className="size-3 animate-spin" />}
                      Reply
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => { setIsReplying(false); setReplyText('') }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          // Deleted comment placeholder — keeps thread structure intact
          <div className="flex items-center gap-2 py-1.5">
            <div className="size-7 shrink-0 rounded-full bg-muted/50 border border-dashed border-border" />
            <p className="text-xs italic text-muted-foreground/40">This comment was deleted.</p>
          </div>
        )}

        {/* Recursive replies */}
        {replies.length > 0 && (
          <div className="mt-1">
            {replies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                allComments={allComments}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserRole={currentUserRole}
                postAuthorId={postAuthorId}
                depth={depth + 1}
                onCommentAdded={onCommentAdded}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── CommentSection ─────────────────────────────────────────────────────────────

export function CommentSection({ postId, postAuthorId, onCommentChange }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadComments = useCallback(async () => {
    setLoading(true)
    const data = await communityClient.getComments(postId)
    setComments(data)
    setLoading(false)
  }, [postId])

  useEffect(() => { loadComments() }, [loadComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return
    setIsSubmitting(true)
    const comment = await communityClient.addComment({
      postId,
      authorId: user.id,
      authorName: user.fullName,
      authorRole: user.role,
      content: newComment.trim(),
      parentId: null,
    })
    setComments((prev) => [...prev, comment])
    setNewComment('')
    setIsSubmitting(false)
    if (onCommentChange) onCommentChange(1)
  }

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [...prev, comment])
    if (onCommentChange) onCommentChange(1)
  }

  const handleCommentUpdated = (updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  const handleCommentDeleted = (purgedIds: string[], mode: 'hard' | 'soft') => {
    if (mode === 'hard') {
      // Completely remove from local state (no placeholder)
      setComments((prev) => prev.filter((c) => !purgedIds.includes(c.id)))
    } else {
      // Soft: replace content with placeholder, keep in tree
      setComments((prev) =>
        prev.map((c) =>
          purgedIds.includes(c.id) ? { ...c, isDeleted: true, content: '[deleted]' } : c,
        ),
      )
    }
    if (onCommentChange) onCommentChange(-1)
  }

  const rootComments = comments.filter((c) => !c.parentId)

  return (
    <div className="rounded-b-xl border border-t-0 border-border/50 bg-card px-4 pb-4 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          Comments
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {comments.filter(c => !c.isDeleted).length}
          </span>
        </h4>
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow-sm mt-0.5',
                user.role === 'admin'
                  ? 'bg-gradient-to-br from-destructive to-rose-600'
                  : 'bg-gradient-to-br from-primary/80 to-emerald-600/80',
              )}
            >
              {getInitials(user.fullName)}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {newComment.length}/500
                </span>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 px-4 gap-1.5 text-xs"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting && <Loader2 className="size-3 animate-spin" />}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-5 rounded-xl bg-secondary/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to join the discussion.
          </p>
        </div>
      )}

      <Separator className="opacity-30 mb-1" />

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">Loading comments…</span>
        </div>
      ) : rootComments.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No comments yet — be the first to share your thoughts!
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/30">
          {rootComments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              allComments={comments}
              currentUserId={user?.id}
              currentUserName={user?.fullName}
              currentUserRole={user?.role}
              postAuthorId={postAuthorId}
              onCommentAdded={handleCommentAdded}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
