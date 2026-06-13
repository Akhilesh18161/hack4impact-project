'use client'

import { useState } from 'react'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NewsStrip } from '@/components/dashboard/news-strip'
import { CitySelector } from '@/components/dashboard/city-selector'
import { CityOverview } from '@/components/dashboard/city-overview'
import { CityMetrics } from '@/components/dashboard/city-metrics'
import { CityCharts } from '@/components/dashboard/city-charts'
import { CitiesComparison } from '@/components/dashboard/cities-comparison'
import { CITIES } from '@/lib/city-data'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const cityParam = searchParams.get('city')
  
  const [selectedCityId, setSelectedCityId] = useState(cityParam ?? 'kathmandu')
  const selectedCity = CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0]

  useEffect(() => {
    if (cityParam && cityParam !== selectedCityId) {
      setSelectedCityId(cityParam)
    }
  }, [cityParam, selectedCityId])

  const handleCitySelect = (id: string) => {
    setSelectedCityId(id)
    router.replace(`/?city=${id}`, { scroll: false })
  }

  const handleScrollDown = () => {
    document.getElementById('dashboard-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background px-4 py-20 text-center border-b border-border/20">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md"
          >
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Sustainable Urban Development Monitor</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-gradient-to-r from-primary via-emerald-500 to-teal-600 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-8xl"
          >
            UrbanPulse
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <blockquote className="text-xl font-medium italic text-foreground/90 sm:text-3xl leading-relaxed">
              "The pulse of the city is the collective heartbeat of its citizens, shaping a sustainable tomorrow."
            </blockquote>
            
            <p className="mx-auto max-w-2xl text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-relaxed">
              <sub>Real-time environmental, transport, energy, and waste indicators for modern municipal centers.</sub>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={handleScrollDown}
              className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:text-primary focus:outline-none"
            >
              <span className="text-sm font-semibold tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
                Explore Dashboard
              </span>
              <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:shadow-lg group-hover:shadow-primary/10">
                <ChevronDown className="size-5 animate-bounce text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      <main id="dashboard-content" className="mx-auto max-w-[1600px] px-4 pb-16 pt-16 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="flex flex-col gap-8">
          {/* ── 1. Netflix-style news strip ── */}
          <NewsStrip />

          <Separator className="opacity-50" />

          {/* ── 2. City selector grid ── */}
          <CitySelector
            selectedCityId={selectedCityId}
            onSelect={handleCitySelect}
          />

          {/* ── 3. City overview hero banner ── */}
          <CityOverview city={selectedCity} />

          {/* ── 4. Key metric tiles ── */}
          <CityMetrics city={selectedCity} />

          {/* ── 5. Charts full width ── */}
          <div className="w-full">
            <CityCharts city={selectedCity} />
          </div>

          {/* ── 6. Bottom row: Comparison and Highlights side-by-side ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col h-full w-full">
              <CitiesComparison />
            </div>
            <div className="flex flex-col h-full w-full">
              <HighlightsCard city={selectedCity} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading Sustainable Urban Development Monitor...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

// ── Highlights quick card ──────────────────────────────────────────────────────
import { CheckCircle2, Leaf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { City } from '@/lib/city-data'

function HighlightsCard({ city }: { city: City }) {
  return (
    <Card className="border-border/50 flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Leaf className="size-4 text-primary" />
          {city.name} Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="flex flex-col gap-3">
          {city.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {h}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
