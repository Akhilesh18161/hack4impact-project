'use client'

import { useState } from 'react'
import { ReportReason, communityClient } from '@/lib/community-data'
import { useAuth } from '@/components/auth-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportModalProps {
  postId: string
  postTitle: string
  isOpen: boolean
  onClose: () => void
}

const REPORT_REASONS: { reason: ReportReason; description: string }[] = [
  { reason: 'Spam', description: 'Irrelevant or repetitive content' },
  { reason: 'False Information', description: 'Misleading or inaccurate claims' },
  { reason: 'Harassment', description: 'Targeting or bullying individuals' },
  { reason: 'Offensive Content', description: 'Hate speech or explicit material' },
  { reason: 'Duplicate Content', description: 'Same issue already posted' },
  { reason: 'Other', description: 'Any other policy violation' },
]

export function ReportModal({ postId, postTitle, isOpen, onClose }: ReportModalProps) {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!user || !selectedReason) return
    setIsSubmitting(true)
    await communityClient.reportPost(
      postId,
      postTitle,
      user.id,
      user.fullName,
      selectedReason,
      selectedReason === 'Other' && details.trim() ? details.trim() : undefined,
    )
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    setSelectedReason(null)
    setDetails('')
    setSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex size-7 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-3.5 text-destructive" />
            </div>
            Report Post
          </DialogTitle>
          <DialogDescription className="truncate text-xs">
            "{postTitle}"
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/10">
              <CheckCircle2 className="size-7 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-foreground">Report Submitted</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                Thank you. Our moderation team will review this report and take appropriate action.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select a reason
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_REASONS.map(({ reason, description }) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
                      selectedReason === reason
                        ? 'border-destructive bg-destructive/8 text-destructive'
                        : 'border-border bg-card text-foreground hover:border-border hover:bg-muted/40',
                    )}
                  >
                    <p className="text-xs font-semibold">{reason}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{description}</p>
                  </button>
                ))}
              </div>

              {selectedReason === 'Other' && (
                <div className="mt-1">
                  <textarea
                    placeholder="Please describe the issue in detail..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>
              )}

              {!user && (
                <p className="text-xs text-muted-foreground text-center bg-muted/40 rounded-lg p-3">
                  You must be signed in to report a post.
                </p>
              )}
            </div>

            <DialogFooter className="mt-4 border-t border-border/50 pt-4">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!selectedReason || !user || isSubmitting}
                onClick={handleSubmit}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                Submit Report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
