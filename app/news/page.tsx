import { Newspaper, AlertCircle } from 'lucide-react'
import { NewsGrid, type GNewsArticle } from '@/components/dashboard/news-grid'

// Revalidate every 1 hour (3600 seconds) to avoid exhausting free API limits
export const revalidate = 3600

// Fallback mock data in case the API key is not set or the request fails
const MOCK_ARTICLES: GNewsArticle[] = [
  {
    title: 'Sustainable Urban Development Initiative Launched in Kathmandu',
    description: 'A new comprehensive plan to improve public transport and reduce emissions in the capital valley has been officially inaugurated today.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date().toISOString(),
    source: { name: 'Kathmandu Post', url: '#' }
  },
  {
    title: 'Global Tech Summit 2026: AI Innovations Take Center Stage',
    description: 'Tech leaders worldwide gather to discuss the ethical implications and future capabilities of artificial intelligence in everyday life.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    source: { name: 'Tech World', url: '#' }
  },
  {
    title: 'Himalayan Glaciers Show Signs of Stabilization Following Climate Pledges',
    description: 'Recent studies indicate a slowing in the retreat of several key glaciers, attributing the change to localized environmental efforts.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1522362372221-c1674ea41162?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    source: { name: 'Himalayan Times', url: '#' }
  },
  {
    title: 'International Markets Rally on Renewable Energy Growth',
    description: 'Stock markets see a significant bump as green energy companies report record-breaking Q2 profits globally.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    source: { name: 'Global Finance', url: '#' }
  },
  {
    title: 'New Heritage Site Preservation Rules Enforced in Bhaktapur',
    description: 'Local authorities have rolled out strict regulations to maintain the architectural integrity of historical monuments.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1598425237654-4ca75a898baf?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    source: { name: 'Nepal News', url: '#' }
  },
  {
    title: 'Electric Vehicle Adoption Reaches All-Time High Internationally',
    description: 'More consumers are switching to EVs than ever before, driven by government incentives and better charging infrastructure.',
    content: 'Full content here...',
    url: '#',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?q=80&w=1200&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    source: { name: 'Eco Drive', url: '#' }
  }
]

async function getNews(): Promise<{ articles: GNewsArticle[], usingMock: boolean }> {
  const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY
  
  if (!apiKey) {
    console.warn("GNews API key is not set. Using mock data.")
    return { articles: MOCK_ARTICLES, usingMock: true }
  }

  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=Nepal%20OR%20World&lang=en&max=10&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.statusText}`)
    }

    const data = await res.json()
    return { articles: data.articles || [], usingMock: false }
  } catch (error) {
    console.error("Error fetching news:", error)
    return { articles: MOCK_ARTICLES, usingMock: true }
  }
}

export default async function NewsPage() {
  const { articles, usingMock } = await getNews()

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Newspaper className="size-5" />
              </div>
              <h1 className="text-3xl font-black tracking-tight lg:text-4xl">
                Global & Local News
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Stay updated with real-time headlines from Nepal and around the world.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {usingMock && (
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-orange-600 dark:text-orange-400">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-medium">
              You are currently viewing mock news data. To see real-time news, please add your <span className="font-bold">GNews API Key</span> to the <code className="rounded bg-orange-500/20 px-1 py-0.5">.env.local</code> file as <code className="rounded bg-orange-500/20 px-1 py-0.5">NEXT_PUBLIC_GNEWS_API_KEY</code>.
            </p>
          </div>
        )}

        <NewsGrid articles={articles} />
        
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Newspaper className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No news found</h3>
            <p className="text-muted-foreground">Check your API configuration or try again later.</p>
          </div>
        )}
      </div>
    </main>
  )
}
