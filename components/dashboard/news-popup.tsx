'use client'

import { X, Clock, MapPin, ExternalLink, Tag } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { NewsItem } from '@/lib/city-data'

interface NewsPopupProps {
  news: NewsItem | null
  onClose: () => void
}

export function NewsPopup({ news, onClose }: NewsPopupProps) {
  if (!news) return null

  return (
    <Dialog open={!!news} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 [&>button]:text-foreground">
        <DialogTitle className="sr-only">{news.title}</DialogTitle>

        {/* Hero image */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Overlay close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-90"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <Badge className="bg-primary text-primary-foreground text-xs shadow-lg">
              {news.category}
            </Badge>
          </div>

          {/* Bottom overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-balance text-xl font-bold leading-tight text-white drop-shadow-lg">
              {news.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta row */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3 text-primary" />
              {news.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3 text-primary" />
              {news.readTime} min read
            </span>
            <span>{new Date(news.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {news.source}
            </Badge>
          </div>

          {/* Summary */}
          <p className="mb-4 text-sm font-medium leading-relaxed text-foreground/80">
            {news.summary}
          </p>

          <Separator className="my-4" />

          {/* Full content */}
          <div className="space-y-3">
            {news.fullContent.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/75">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag className="size-3.5 text-muted-foreground" />
            {news.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary text-[10px] hover:bg-primary/20 transition-colors cursor-default"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Source: {news.source}</span>
            <Button
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              <ExternalLink className="size-3.5" />
              Full Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
