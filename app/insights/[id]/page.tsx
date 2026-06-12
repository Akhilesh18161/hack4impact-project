import { NEWS_ITEMS } from '@/lib/city-data'
import { notFound } from 'next/navigation'
import { Clock, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function generateStaticParams() {
  return NEWS_ITEMS.map((item) => ({
    id: item.id,
  }))
}

export default async function InsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = NEWS_ITEMS.find((item) => item.id === id)

  if (!article) {
    notFound()
  }

  const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop'

  return (
    <main className="min-h-screen bg-background pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link href="/" passHref>
            <Button 
              variant="ghost" 
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground group"
            >
              <ChevronLeft className="mr-1 size-5 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Button>
          </Link>

          <article className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-2xl">
            {/* Header Section (Title & Meta) */}
            <div className="p-6 sm:p-10 md:p-12 pb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-sm">
                  {article.category}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground border-border/50 shadow-sm">
                  {article.city}
                </Badge>
              </div>
              <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl md:text-5xl text-balance mb-6">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </time>
                </div>
                <span>•</span>
                <span>{article.readTime} min read</span>
                <span>•</span>
                <span>Source: {article.source}</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted sm:aspect-[2.5/1]">
              <img
                src={article.image || defaultImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Article Body */}
            <div className="p-6 sm:p-10 md:p-12 pt-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {/* Description (lead paragraph) */}
                <p className="text-xl leading-relaxed font-semibold text-foreground/90 md:text-2xl text-balance mb-8">
                  {article.summary}
                </p>

                {/* Content */}
                <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/80">
                  {article.fullContent.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-12 flex flex-wrap gap-2 pt-6 border-t border-border/40">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
