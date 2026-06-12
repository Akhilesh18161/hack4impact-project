'use client'

import { useState, useEffect } from 'react'
import { Clock, ExternalLink, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface GNewsArticle {
  title: string
  description: string
  content: string
  url: string
  image: string
  publishedAt: string
  source: {
    name: string
    url: string
  }
}

export function NewsGrid({ articles }: { articles: GNewsArticle[] }) {
  const [selectedArticle, setSelectedArticle] = useState<GNewsArticle | null>(null)

  // Scroll to top when an article is selected
  useEffect(() => {
    if (selectedArticle) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [selectedArticle])

  function formatDate(isoString: string) {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop'

  if (selectedArticle) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setSelectedArticle(null)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground group"
        >
          <ChevronLeft className="mr-1 size-5 transition-transform group-hover:-translate-x-1" />
          Back to News
        </Button>

        <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/40 bg-card shadow-2xl">
          {/* Header Section (Title & Meta) */}
          <div className="p-6 sm:p-10 md:p-12 pb-8">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-sm">
              {selectedArticle.source.name}
            </Badge>
            <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl md:text-5xl text-balance mb-6">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4 text-primary" />
              <time dateTime={selectedArticle.publishedAt}>
                {formatDate(selectedArticle.publishedAt)}
              </time>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted sm:aspect-[2.5/1]">
            <img
              src={selectedArticle.image || defaultImage}
              alt={selectedArticle.title}
              onError={(e) => { e.currentTarget.src = defaultImage }}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="p-6 sm:p-10 md:p-12 pt-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {/* Description (lead paragraph) */}
              <p className="text-xl leading-relaxed font-semibold text-foreground/90 md:text-2xl text-balance mb-8">
                {selectedArticle.description}
              </p>

              {/* Content */}
              <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/80">
                {selectedArticle.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Footer / Call to action */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-muted/50 p-6 sm:flex-row border border-border/50">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                This is an excerpt from {selectedArticle.source.name}. To read the full, unabridged article, please visit the source.
              </p>
              <a 
                href={selectedArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full gap-2 transition-all hover:shadow-lg hover:shadow-primary/25">
                  <ExternalLink className="size-4" />
                  Read Full Article on Source
                </Button>
              </a>
            </div>
          </div>
        </article>
      </div>
    )
  }

  // Render Grid
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
      {articles.map((article, idx) => (
        <div
          key={idx}
          onClick={() => setSelectedArticle(article)}
          className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedArticle(article)}
        >
          {/* Image Container */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <img
              src={article.image || defaultImage}
              alt={article.title}
              onError={(e) => { e.currentTarget.src = defaultImage }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            
            {/* Source Badge */}
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                {article.source.name}
              </span>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="mb-2 line-clamp-3 text-lg font-bold leading-tight text-card-foreground transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {article.description}
            </p>
            
            {/* Footer Metadata */}
            <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" />
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
                Read article
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
