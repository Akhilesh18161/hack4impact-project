'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NewsPopup } from './news-popup'
import { NEWS_ITEMS, type NewsItem } from '@/lib/city-data'

export function NewsStrip() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <section aria-label="Latest sustainable city news">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <Play className="size-3 fill-primary-foreground text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              City Spotlight
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Latest sustainability news across Nepal
            </p>
          </div>
          <Badge className="bg-primary/15 text-primary text-[10px] px-2 h-5 animate-pulse">
            LIVE
          </Badge>
        </div>

        {/* Scroll controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-90"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-90"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable news row */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {NEWS_ITEMS.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            isHovered={hoveredId === item.id}
            onHover={() => setHoveredId(item.id)}
            onLeave={() => setHoveredId(null)}
            onClick={() => setSelectedNews(item)}
          />
        ))}
      </div>

      {/* News detail popup */}
      <NewsPopup news={selectedNews} onClose={() => setSelectedNews(null)} />
    </section>
  )
}

interface NewsCardProps {
  item: NewsItem
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}

function NewsCard({ item, isHovered, onHover, onLeave, onClick }: NewsCardProps) {
  return (
    <article
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl"
      style={{
        width: '280px',
        scrollSnapAlign: 'start',
        transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'scale(1.035) translateY(-4px)' : 'scale(1) translateY(0)',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      aria-label={`Read more: ${item.title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="280px"
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)',
            opacity: isHovered ? 1 : 0.85,
          }}
        />

        {/* Category pill */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        {/* Play icon on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Play className="size-4 fill-white text-white" />
          </div>
        </div>

        {/* Bottom text on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-white drop-shadow-sm">
            {item.title}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="bg-card p-3 transition-colors duration-200 group-hover:bg-accent/30">
        <p className="mb-2.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="size-3 text-primary" />
            <span>{item.readTime}m read</span>
            <span className="text-border">·</span>
            <span>{item.city}</span>
          </div>
          <button
            className="text-[10px] font-semibold text-primary transition-all duration-200 hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            Read more →
          </button>
        </div>
      </div>

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border-2 transition-all duration-300"
        style={{
          borderColor: isHovered ? 'oklch(0.52 0.17 150 / 60%)' : 'transparent',
          boxShadow: isHovered ? '0 8px 30px oklch(0.52 0.17 150 / 20%)' : 'none',
        }}
      />
    </article>
  )
}
