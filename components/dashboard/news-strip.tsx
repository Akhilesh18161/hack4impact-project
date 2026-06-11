'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { NewsPopup } from './news-popup'
import { NEWS_ITEMS, type NewsItem } from '@/lib/city-data'

export function NewsStrip() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    // Scroll by the width of one poster + gap
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
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
      </div>

      {/* Netflix-style Row */}
      <div className="group/row relative -mx-2 px-2">
        {/* Left Arrow */}
        <button
          className="absolute -left-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-background group-hover/row:-left-2 group-hover/row:opacity-100 sm:-left-6 sm:group-hover/row:-left-4"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* Scrollable news row */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-4 overflow-x-auto pb-6 pt-2"
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

        {/* Right Arrow */}
        <button
          className="absolute -right-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-background group-hover/row:-right-2 group-hover/row:opacity-100 sm:-right-6 sm:group-hover/row:-right-4"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight className="size-6" />
        </button>
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
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border/10 shadow-lg"
      style={{
        width: '320px',
        height: '460px',
        scrollSnapAlign: 'start',
        transition: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0)',
        zIndex: isHovered ? 20 : 1,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      aria-label={`Read more: ${item.title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Background Image */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="320px"
      />
      
      {/* Dark Fade Background (always visible but darker on hover) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)',
          opacity: isHovered ? 1 : 0.85,
        }}
      />

      {/* Play icon overlay on hover */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{ 
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0.8)'
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-white/20 shadow-2xl backdrop-blur-md border border-white/30">
          <Play className="size-6 ml-1 fill-white text-white" />
        </div>
      </div>

      {/* Content at the bottom */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 transition-transform duration-500"
           style={{ transform: isHovered ? 'translateY(-8px)' : 'translateY(0)' }}>
        
        {/* Category Badge */}
        <span className="mb-3 w-fit rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground backdrop-blur-sm shadow-sm">
          {item.category}
        </span>

        {/* Title */}
        <h3 className="mb-2 text-xl font-black leading-tight tracking-tight text-white drop-shadow-md">
          {item.title}
        </h3>

        {/* Description / Summary */}
        <p className="mb-4 line-clamp-3 text-xs font-medium leading-relaxed text-white/80 drop-shadow transition-all duration-500">
          {item.summary}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-white/60">
          <Clock className="size-3" />
          <span>{item.readTime}m read</span>
          <span className="opacity-50">•</span>
          <span className="text-primary">{item.city}</span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl border-2 transition-all duration-500"
        style={{
          borderColor: isHovered ? 'rgba(255,255,255,0.2)' : 'transparent',
          boxShadow: isHovered ? 'inset 0 0 20px rgba(255,255,255,0.1)' : 'none',
        }}
      />
    </article>
  )
}
