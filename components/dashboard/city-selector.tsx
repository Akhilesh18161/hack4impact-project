'use client'

import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CITIES, getSustainabilityColor, getAqiColor, type City } from '@/lib/city-data'
import { cn } from '@/lib/utils'

interface CitySelectorProps {
  selectedCityId: string
  onSelect: (id: string) => void
}

export function CitySelector({ selectedCityId, onSelect }: CitySelectorProps) {
  return (
    <section aria-label="Select a city">
      <div className="mb-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">Nepal Cities</h2>
        <p className="text-[11px] text-muted-foreground">Select a city to explore insights</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CITIES.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            isSelected={city.id === selectedCityId}
            onSelect={() => onSelect(city.id)}
          />
        ))}
      </div>
    </section>
  )
}

interface CityCardProps {
  city: City
  isSelected: boolean
  onSelect: () => void
}

function CityCard({ city, isSelected, onSelect }: CityCardProps) {
  const scoreColor = getSustainabilityColor(city.sustainabilityScore)
  const aqiColor = getAqiColor(city.metrics.aqi.value)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group relative overflow-hidden rounded-2xl border text-left transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1 active:scale-95',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'border-border/50 hover:border-primary/40'
      )}
      aria-pressed={isSelected}
      aria-label={`Select ${city.name}`}
    >
      {/* City image */}
      <div className="relative h-24 w-full overflow-hidden">
        <Image
          src={city.image}
          alt={city.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Score badge */}
        <div className="absolute right-2 top-2">
          <div
            className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg"
            style={{ backgroundColor: scoreColor }}
            title={`Sustainability Score: ${city.sustainabilityScore}`}
          >
            {city.sustainabilityScore}
          </div>
        </div>

        {/* Selected star */}
        {isSelected && (
          <div className="absolute left-2 top-2">
            <Star className="size-3.5 fill-primary text-primary drop-shadow-lg" />
          </div>
        )}

        {/* City name overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs font-bold text-white leading-tight drop-shadow">{city.name}</p>
        </div>
      </div>

      {/* Card footer */}
      <div className="bg-card px-2.5 py-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="size-2.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[9px] text-muted-foreground">{city.region.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div
              className="size-1.5 rounded-full"
              style={{ backgroundColor: aqiColor }}
              title={`AQI: ${city.metrics.aqi.value}`}
            />
            <span className="text-[9px] font-medium" style={{ color: aqiColor }}>
              {city.metrics.aqi.value}
            </span>
          </div>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </button>
  )
}
