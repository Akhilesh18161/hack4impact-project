'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { NEWS_ITEMS } from '@/lib/city-data'

export function NewsStrip() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === NEWS_ITEMS.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (dir === 'left') {
      setCurrentIndex((prev) => (prev === 0 ? NEWS_ITEMS.length - 1 : prev - 1))
    } else {
      setCurrentIndex((prev) => (prev === NEWS_ITEMS.length - 1 ? 0 : prev + 1))
    }
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
              Featured sustainability news across Nepal
            </p>
          </div>
          <Badge className="bg-primary/15 text-primary text-[10px] px-2 h-5 animate-pulse">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Hero Carousel - fits one at a time */}
      <div className="group/row relative w-full overflow-hidden rounded-2xl border border-border/10 shadow-2xl" style={{ height: '400px' }}>
        
        {/* Slides Container */}
        <div 
          className="flex h-full w-full transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1)"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {NEWS_ITEMS.map((item, idx) => (
            <Link 
              key={item.id} 
              href={`/insights/${item.id}`}
              className="relative h-full w-full flex-shrink-0 cursor-pointer overflow-hidden group/slide block"
              aria-label={`Read more: ${item.title}`}
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-[10000ms] ease-out group-hover/slide:scale-110"
                priority={idx === 0}
                sizes="(max-width: 1600px) 100vw"
              />
              
              {/* Dark Fade Overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                  opacity: 0.9,
                }}
              />

              {/* Optional slight dark overlay on hover to indicate clickability without a play button */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover/slide:bg-black/20 z-10" />

              {/* Content overlaid at the bottom */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 md:p-8 z-10 transition-transform duration-500 group-hover/slide:-translate-y-2">
                {/* Category Badge */}
                <span className="mb-4 w-fit rounded bg-primary px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-lg">
                  {item.category}
                </span>

                {/* Title */}
                <h3 className="mb-3 text-2xl md:text-3xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                  {item.title}
                </h3>

                {/* Description / Summary */}
                <p className="mb-5 line-clamp-2 md:line-clamp-3 max-w-3xl text-sm md:text-base font-medium leading-relaxed text-white/80 drop-shadow-md">
                  {item.summary}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs font-bold tracking-wide text-white/60">
                  <Clock className="size-4 text-primary" />
                  <span>{item.readTime}m read</span>
                  <span className="opacity-50">•</span>
                  <span className="text-white/90">{item.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Left Arrow */}
        <button
          className="absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/60 group-hover/row:opacity-100"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('left'); }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-7 pr-0.5" />
        </button>

        {/* Right Arrow */}
        <button
          className="absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/60 group-hover/row:opacity-100"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('right'); }}
          aria-label="Next slide"
        >
          <ChevronRight className="size-7 pl-0.5" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          {NEWS_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
