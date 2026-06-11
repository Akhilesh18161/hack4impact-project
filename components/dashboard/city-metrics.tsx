'use client'

import { useState } from 'react'
import {
  Wind,
  Trees,
  Zap,
  Recycle,
  TrendingUp,
  Car,
  TrendingDown,
} from 'lucide-react'
import { MetricPopup } from './metric-popup'
import type { City, CityMetric } from '@/lib/city-data'
import { cn } from '@/lib/utils'

interface CityMetricsProps {
  city: City
}

type MetricKey = keyof City['metrics']

const METRIC_CONFIG: Array<{
  key: MetricKey
  icon: React.ReactNode
  color: string
  bgClass: string
}> = [
  {
    key: 'aqi',
    icon: <Wind className="size-4" />,
    color: '#f97316',
    bgClass: 'from-orange-500/10 to-transparent',
  },
  {
    key: 'greenCover',
    icon: <Trees className="size-4" />,
    color: '#22c55e',
    bgClass: 'from-green-500/10 to-transparent',
  },
  {
    key: 'renewableEnergy',
    icon: <Zap className="size-4" />,
    color: '#eab308',
    bgClass: 'from-yellow-500/10 to-transparent',
  },
  {
    key: 'wasteRecycling',
    icon: <Recycle className="size-4" />,
    color: '#06b6d4',
    bgClass: 'from-cyan-500/10 to-transparent',
  },
  {
    key: 'gdpGrowth',
    icon: <TrendingUp className="size-4" />,
    color: '#8b5cf6',
    bgClass: 'from-violet-500/10 to-transparent',
  },
  {
    key: 'electricVehicles',
    icon: <Car className="size-4" />,
    color: '#3b82f6',
    bgClass: 'from-blue-500/10 to-transparent',
  },
]

export function CityMetrics({ city }: CityMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    (CityMetric & { icon: React.ReactNode; color: string }) | null
  >(null)

  return (
    <section aria-label={`City metrics for ${city.name}`}>
      <div className="mb-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Key Metrics
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Click any metric to explore details
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {METRIC_CONFIG.map(({ key, icon, color, bgClass }) => {
          const metric = city.metrics[key]
          const isAqi = key === 'aqi'
          const trendPositive = metric.trend > 0
          const trendGood = isAqi ? !trendPositive : trendPositive

          return (
            <MetricCard
              key={key}
              metric={metric}
              icon={icon}
              color={color}
              bgClass={bgClass}
              trendGood={trendGood}
              trendPositive={trendPositive}
              onClick={() =>
                setSelectedMetric({ ...metric, icon, color })
              }
            />
          )
        })}
      </div>

      <MetricPopup
        metric={selectedMetric}
        cityName={city.name}
        onClose={() => setSelectedMetric(null)}
      />
    </section>
  )
}

interface MetricCardProps {
  metric: CityMetric
  icon: React.ReactNode
  color: string
  bgClass: string
  trendGood: boolean
  trendPositive: boolean
  onClick: () => void
}

function MetricCard({
  metric,
  icon,
  color,
  bgClass,
  trendGood,
  trendPositive,
  onClick,
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 text-left',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95',
        isHovered && 'border-transparent'
      )}
      style={{
        boxShadow: isHovered ? `0 8px 30px ${color}25` : undefined,
        borderColor: isHovered ? color + '50' : undefined,
      }}
      aria-label={`${metric.label}: ${metric.value} ${metric.unit}`}
    >
      {/* Background glow */}
      <div
        className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100', bgClass)}
      />

      <div className="relative">
        {/* Icon */}
        <div
          className="mb-3 flex size-8 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

        {/* Value */}
        <p className="mb-0.5 text-xl font-black tabular-nums leading-none text-foreground">
          {metric.value.toLocaleString()}
          <span className="ml-1 text-xs font-medium text-muted-foreground">{metric.unit}</span>
        </p>

        {/* Label */}
        <p className="mb-2 text-[10px] font-medium leading-tight text-muted-foreground">
          {metric.label}
        </p>

        {/* Trend */}
        <div className="flex items-center gap-1">
          <div
            className="flex size-4 items-center justify-center rounded-sm"
            style={{ backgroundColor: trendGood ? '#22c55e20' : '#ef444420' }}
          >
            {trendGood ? (
              <TrendingUp className="size-2.5" style={{ color: '#22c55e' }} />
            ) : (
              <TrendingDown className="size-2.5" style={{ color: '#ef4444' }} />
            )}
          </div>
          <span
            className="text-[10px] font-semibold"
            style={{ color: trendGood ? '#22c55e' : '#ef4444' }}
          >
            {trendPositive ? '+' : ''}{metric.trend}%
          </span>
        </div>
      </div>
    </button>
  )
}
