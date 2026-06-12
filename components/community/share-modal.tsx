'use client'

import { useState } from 'react'
import { communityClient } from '@/lib/community-data'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, Copy, ExternalLink, Link2, Share2 } from 'lucide-react'

interface ShareModalProps {
  postId: string
  postTitle: string
  isOpen: boolean
  onClose: () => void
  onShared?: () => void
}

// Simple X (Twitter) SVG icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.722-8.836L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function ShareModal({ postId, postTitle, isOpen, onClose, onShared }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const postUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/community-hub#post-${postId}`
      : `/community-hub#post-${postId}`

  const trackAndCallback = async () => {
    await communityClient.incrementShareCount(postId)
    onShared?.()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = postUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    await trackAndCallback()
    setTimeout(() => setCopied(false), 2500)
  }

  const handleTwitter = async () => {
    const text = encodeURIComponent(`"${postTitle}" — via UrbanPulse`)
    const url = encodeURIComponent(postUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    await trackAndCallback()
  }

  const handleFacebook = async () => {
    const url = encodeURIComponent(postUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    await trackAndCallback()
  }

  const SHARE_OPTIONS = [
    {
      label: 'Copy Link',
      description: 'Copy to clipboard',
      icon: copied ? Check : Link2,
      iconCls: copied ? 'text-green-500' : 'text-foreground',
      bgCls: copied ? 'bg-green-500/10' : 'bg-muted',
      hoverCls: 'hover:border-primary/30 hover:bg-primary/5',
      onClick: handleCopy,
    },
    {
      label: 'Twitter / X',
      description: 'Share on X',
      icon: XIcon,
      iconCls: 'text-foreground',
      bgCls: 'bg-foreground/8',
      hoverCls: 'hover:border-foreground/20 hover:bg-foreground/5',
      onClick: handleTwitter,
    },
    {
      label: 'Facebook',
      description: 'Share on Facebook',
      icon: FacebookIcon,
      iconCls: 'text-blue-600',
      bgCls: 'bg-blue-500/10',
      hoverCls: 'hover:border-blue-400/30 hover:bg-blue-500/5',
      onClick: handleFacebook,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="size-3.5 text-primary" />
            </div>
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-1">
          {/* URL bar */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1 truncate text-xs text-muted-foreground font-mono leading-tight">
              {postUrl}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              {copied ? (
                <><Check className="size-3" /> Copied!</>
              ) : (
                <><Copy className="size-3" /> Copy</>
              )}
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {SHARE_OPTIONS.map(({ label, description, icon: Icon, iconCls, bgCls, hoverCls, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-center transition-all duration-150 ${hoverCls}`}
              >
                <div className={`flex size-9 items-center justify-center rounded-full ${bgCls}`}>
                  <Icon className={`size-4 ${iconCls}`} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground">{label}</p>
                  <p className="text-[9px] text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
