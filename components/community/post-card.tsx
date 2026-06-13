'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Post, communityClient, UserReputation } from '@/lib/community-data'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  AlertTriangle,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  FileEdit,
  FileX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReputationBadge } from './reputation-badge'
import { ShareModal } from './share-modal'
import { ReportModal } from './report-modal'
import { EditPostModal, RequestModificationModal, RequestRemovalModal, DeletePostModal } from './content-action-modals'

interface PostCardProps {
  post: Post
  currentUserId?: string
  onPostUpdated: (post: Post) => void
  onExpandComments: (postId: string) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PRIORITY_COLORS: Record<string, string> = {
  High: 'border-l-rose-500',
  Medium: 'border-l-amber-400',
  Low: 'border-l-slate-300',
}

export function PostCard({ post, currentUserId, onPostUpdated, onExpandComments }: PostCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  
  // Author action modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isModReqOpen, setIsModReqOpen] = useState(false)
  const [isRemReqOpen, setIsRemReqOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [reputation, setReputation] = useState<UserReputation | null>(null)
  const [localShareCount, setLocalShareCount] = useState(post.shareCount)

  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const userVote = currentUserId ? post.votedBy[currentUserId] : undefined
  const isSaved = currentUserId ? post.savedBy.includes(currentUserId) : false
  const alreadyReported = currentUserId ? post.reportedBy.includes(currentUserId) : false
  const isAuthor = currentUserId === post.authorId || isAdmin
  const canEditDirectly = isAdmin || post.verificationStatus === 'Pending Review' || post.verificationStatus === 'Rejected'

  useEffect(() => {
    communityClient.getUserReputation(post.authorId).then(setReputation)
  }, [post.authorId])

  // keep local share count in sync when post prop changes
  useEffect(() => {
    setLocalShareCount(post.shareCount)
  }, [post.shareCount])

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUserId || isVoting) return
    setIsVoting(true)
    const updated = await communityClient.votePost(post.id, currentUserId, type)
    if (updated) onPostUpdated(updated)
    setIsVoting(false)
  }

  const handleSave = async () => {
    if (!currentUserId || isSaving) return
    setIsSaving(true)
    const updated = await communityClient.toggleSavePost(post.id, currentUserId)
    if (updated) onPostUpdated(updated)
    setIsSaving(false)
  }

  const handleShared = () => {
    setLocalShareCount((c) => c + 1)
    // Reload post to reflect server share count
    communityClient.getPost(post.id).then((p) => {
      if (p) onPostUpdated(p)
    })
  }

  const handleDeleteClick = () => {
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = async () => {
    // Just re-fetch to let the parent handle the missing post or tell parent to refresh
    const p = await communityClient.getPost(post.id)
    if (p) onPostUpdated(p)
    else window.location.reload() // quick fallback
  }

  const isAuthorAdmin = post.authorRole === 'admin'
  const initials = getInitials(post.authorName)

  return (
    <>
      <Card
        id={`post-${post.id}`}
        className={cn(
          'border border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border border-l-4',
          PRIORITY_COLORS[post.priority],
          post.isSolved && 'opacity-80',
        )}
      >
        <div className="flex flex-col w-full">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <CardHeader className="p-4 pb-2 flex flex-row items-start gap-3 space-y-0">
              {/* Avatar */}
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm',
                  isAuthorAdmin
                    ? 'bg-gradient-to-br from-destructive to-rose-600'
                    : 'bg-gradient-to-br from-primary to-emerald-600',
                )}
              >
                {initials}
              </div>

              {/* Author info + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold truncate">{post.authorName}</span>

                  {isAdmin && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 text-[9px] bg-destructive/15 text-destructive border-none gap-0.5"
                    >
                      <ShieldCheck className="size-2.5" /> Admin
                    </Badge>
                  )}

                  {reputation && (
                    <ReputationBadge badge={reputation.badge} />
                  )}

                  {post.isSolved && (
                    <Badge className="h-4 px-1.5 text-[9px] bg-green-500/15 text-green-600 hover:bg-green-500/20 border-none gap-0.5 ml-auto">
                      <CheckCircle2 className="size-2.5" /> Solved
                    </Badge>
                  )}

                  {post.priority === 'High' && !post.isSolved && (
                    <Badge
                      variant="destructive"
                      className="h-4 px-1.5 text-[9px] ml-auto"
                    >
                      High Priority
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="size-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </CardHeader>

            {/* Body */}
            <CardContent className="px-4 pt-0 pb-3">
              <h3 className="text-base font-bold leading-snug mb-2">{post.title}</h3>

              {/* Category badges */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {post.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="text-[10px] h-5 px-2 font-medium bg-secondary/40 hover:bg-secondary/60 cursor-default"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {post.description}
              </p>

              {/* Media preview */}
              {post.mediaType !== 'none' && post.mediaUrls.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border bg-secondary/10 flex flex-col items-center">
                  {post.mediaType === 'image' ? (
                    <img 
                      src={post.mediaUrls[0]} 
                      alt={post.mediaFileNames?.[0] || 'Post attachment'} 
                      className="w-full max-h-[500px] object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                      <Video className="size-8 mb-2 opacity-50" />
                      <p className="text-xs font-semibold">Video Attachment</p>
                      {post.mediaFileNames && post.mediaFileNames.length > 0 && (
                        <p className="text-[10px] opacity-70 mt-1 max-w-[200px] truncate">
                          {post.mediaFileNames[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <Separator className="opacity-30" />

            {/* Footer actions */}
            <CardFooter className="px-3 py-2 flex items-center gap-1 flex-wrap bg-secondary/5 rounded-b-xl">
              {/* Vote Buttons */}
              <div className="flex items-center bg-secondary/30 rounded-full mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={cn(
                    'h-8 px-2.5 rounded-l-full rounded-r-none gap-1.5',
                    userVote === 'up' ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <ThumbsUp className={cn('size-3.5', userVote === 'up' && 'fill-primary')} />
                  <span className="text-xs font-semibold">{post.netScore !== 0 ? post.netScore : 'Vote'}</span>
                </Button>
                <div className="w-[1px] h-4 bg-border/50" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={cn(
                    'h-8 px-2.5 rounded-r-full rounded-l-none gap-1.5',
                    userVote === 'down' ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                  )}
                >
                  <ThumbsDown className={cn('size-3.5', userVote === 'down' && 'fill-rose-500')} />
                </Button>
              </div>

              {/* Comments */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground text-xs font-semibold px-2.5"
                onClick={() => onExpandComments(post.id)}
              >
                <MessageSquare className="size-3.5" />
                {post.commentCount} Comments
              </Button>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground text-xs font-semibold px-2.5"
                onClick={() => setIsShareOpen(true)}
              >
                <Share2 className="size-3.5" />
                {localShareCount > 0 ? localShareCount : ''} Share
              </Button>

              {/* Save */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={!currentUserId || isSaving}
                className={cn(
                  'h-8 gap-1.5 text-xs font-semibold px-2.5',
                  isSaved
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Bookmark className={cn('size-3.5', isSaved && 'fill-primary')} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>

              <div className="flex-1" />

              {/* Author Actions */}
              {isAuthor && currentUserId && (
                <div className="flex items-center gap-1 border-r border-border/50 pr-2 mr-2">
                  {canEditDirectly ? (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => setIsEditOpen(true)} title="Edit Post">
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={handleDeleteClick} title="Delete Post">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-500" onClick={() => setIsModReqOpen(true)} title="Request Modification">
                        <FileEdit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => setIsRemReqOpen(true)} title="Request Removal">
                        <FileX className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Report */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!currentUserId) return
                  setIsReportOpen(true)
                }}
                disabled={!currentUserId || alreadyReported}
                className={cn(
                  'h-8 gap-1.5 text-xs font-semibold px-2.5',
                  alreadyReported
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-rose-500',
                )}
                title={alreadyReported ? 'Already reported' : 'Report this post'}
              >
                <AlertTriangle className="size-3.5" />
                {alreadyReported ? 'Reported' : 'Report'}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      <ShareModal
        postId={post.id}
        postTitle={post.title}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShared={handleShared}
      />

      <ReportModal
        postId={post.id}
        postTitle={post.title}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {isAuthor && currentUserId && (
        <>
          <EditPostModal
            post={post}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSuccess={onPostUpdated}
            currentUserId={currentUserId}
          />
          <DeletePostModal
            post={post}
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onSuccess={handleDeleteSuccess}
            currentUserId={currentUserId}
          />
          <RequestModificationModal
            post={post}
            isOpen={isModReqOpen}
            onClose={() => setIsModReqOpen(false)}
            currentUserId={currentUserId}
          />
          <RequestRemovalModal
            post={post}
            isOpen={isRemReqOpen}
            onClose={() => setIsRemReqOpen(false)}
            currentUserId={currentUserId}
          />
        </>
      )}
    </>
  )
}
