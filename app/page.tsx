'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { NewsStrip } from '@/components/dashboard/news-strip'
import { CitySelector } from '@/components/dashboard/city-selector'
import { CityOverview } from '@/components/dashboard/city-overview'
import { CityMetrics } from '@/components/dashboard/city-metrics'
import { CityCharts } from '@/components/dashboard/city-charts'
import { CitiesComparison } from '@/components/dashboard/cities-comparison'
import { CITIES } from '@/lib/city-data'
import { Separator } from '@/components/ui/separator'

export default function Page() {
  const [selectedCityId, setSelectedCityId] = useState('kathmandu')
  const selectedCity = CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <DashboardHeader />

      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">

          {/* ── 1. Netflix-style news strip ── */}
          <NewsStrip />

          <Separator className="opacity-50" />

          {/* ── 2. City selector grid ── */}
          <CitySelector
            selectedCityId={selectedCityId}
            onSelect={setSelectedCityId}
          />

          {/* ── 3. City overview hero banner ── */}
          <CityOverview city={selectedCity} />

          {/* ── 4. Key metric tiles ── */}
          <CityMetrics city={selectedCity} />

          {/* ── 5. Charts grid + all-cities comparison ── */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {/* Charts take 3/4 on large screens */}
            <div className="xl:col-span-3">
              <CityCharts city={selectedCity} />
            </div>
            {/* Comparison takes 1/4 */}
            <div className="flex flex-col gap-4 xl:col-span-1">
              <CitiesComparison />
              {/* City highlights quick card */}
              <HighlightsCard city={selectedCity} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// ── Highlights quick card ──────────────────────────────────────────────────────
import { CheckCircle2, Leaf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { City } from '@/lib/city-data'

function HighlightsCard({ city }: { city: City }) {
  return (
    <Card className="border-border/50">
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
