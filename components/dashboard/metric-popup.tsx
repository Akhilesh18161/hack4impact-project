'use client'

import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CityMetric } from '@/lib/city-data'

interface MetricPopupProps {
  metric: (CityMetric & { icon: React.ReactNode; color: string }) | null
  cityName: string
  onClose: () => void
}

export function MetricPopup({ metric, cityName, onClose }: MetricPopupProps) {
  if (!metric) return null
  const isPositive = metric.trend > 0
  const trendGood = metric.label === 'Air Quality Index' ? !isPositive : isPositive

  return (
    <Dialog open={!!metric} onOpenChange={onClose}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{metric.label} — {cityName}</DialogTitle>

        {/* Header band */}
        <div
          className="flex items-center justify-between p-5"
          style={{ backgroundColor: metric.color + '18' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-xl text-white shadow-lg"
              style={{ backgroundColor: metric.color }}
            >
              {metric.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{cityName}</p>
              <h3 className="text-sm font-bold text-foreground">{metric.label}</h3>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black tabular-nums" style={{ color: metric.color }}>
              {metric.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{metric.unit}</p>
          </div>
        </div>

        <div className="p-5">
          {/* Trend */}
          <div className="mb-4 flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
              style={{
                backgroundColor: trendGood ? '#22c55e20' : '#ef444420',
                color: trendGood ? '#22c55e' : '#ef4444',
              }}
            >
              {trendGood ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {isPositive ? '+' : ''}{metric.trend}% vs last year
            </div>
            <Badge
              variant="secondary"
              className="text-[10px]"
              style={{
                backgroundColor: trendGood ? '#22c55e15' : '#ef444415',
                color: trendGood ? '#16a34a' : '#dc2626',
              }}
            >
              {trendGood ? 'Improving' : 'Needs attention'}
            </Badge>
          </div>

          <Separator className="mb-4" />

          {/* Detail text */}
          <div className="flex gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm leading-relaxed text-foreground/75">{metric.detail}</p>
          </div>

          {/* Visual bar */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Performance indicator</span>
              <span style={{ color: metric.color }}>{metric.value} {metric.unit}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (metric.value / (metric.unit === '%' ? 100 : metric.unit === 'AQI' ? 300 : metric.value * 1.5)) * 100)}%`,
                  backgroundColor: metric.color,
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
