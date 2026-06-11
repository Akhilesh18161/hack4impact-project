'use client'

import Image from 'next/image'
import {
  MapPin,
  Users,
  Mountain,
  Square,
  Leaf,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { City } from '@/lib/city-data'
import { getAqiColor, getAqiLabel, getSustainabilityColor, formatNumber } from '@/lib/city-data'
import { cn } from '@/lib/utils'

interface CityOverviewProps {
  city: City
}

export function CityOverview({ city }: CityOverviewProps) {
  const aqiColor = getAqiColor(city.metrics.aqi.value)
  const aqiLabel = getAqiLabel(city.metrics.aqi.value)
  const scoreColor = getSustainabilityColor(city.sustainabilityScore)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
      {/* Hero banner */}
      <div className="relative h-52 w-full overflow-hidden sm:h-64">
        <Image
          src={city.image}
          alt={`${city.name} cityscape`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1600px) 100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* City info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            {/* Left: name + tagline */}
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  className="border-0 text-[10px] font-semibold px-2.5 h-5"
                  style={{ backgroundColor: scoreColor + 'dd', color: '#fff' }}
                >
                  Score: {city.sustainabilityScore}
                </Badge>
                <Badge
                  className="border-0 text-[10px] font-semibold px-2.5 h-5"
                  style={{ backgroundColor: aqiColor + 'dd', color: '#fff' }}
                >
                  AQI {city.metrics.aqi.value} · {aqiLabel}
                </Badge>
              </div>
              <h2 className="text-balance text-2xl font-black leading-none tracking-tight text-white drop-shadow-md sm:text-3xl">
                {city.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/75 drop-shadow">{city.tagline}</p>
            </div>

            {/* Right: quick stats */}
            <div className="hidden shrink-0 rounded-2xl border border-white/20 bg-black/40 p-3 backdrop-blur-md sm:block">
              <div className="flex flex-col gap-2 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3 text-primary" />
                  <span>{city.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-3 text-primary" />
                  <span>{formatNumber(city.population)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mountain className="size-3 text-primary" />
                  <span>{city.elevation}m elev.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="size-3 text-primary" />
                  <span>{city.area} km²</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaf icon */}
        <div className="absolute right-4 top-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm">
            <Leaf className="size-4" />
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="border-t border-border/50 bg-card px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Mobile quick stats */}
          <div className="flex items-center gap-4 sm:hidden text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-3 text-primary" />
              {formatNumber(city.population)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3 text-primary" />
              {city.region}
            </span>
          </div>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Highlights */}
          <div className="flex flex-1 flex-wrap gap-x-5 gap-y-1.5">
            {city.highlights.map((h, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <CheckCircle2 className="size-3 shrink-0 text-primary" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
