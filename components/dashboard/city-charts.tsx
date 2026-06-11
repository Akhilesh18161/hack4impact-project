'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { City } from '@/lib/city-data'
import { getAqiColor, getAqiLabel } from '@/lib/city-data'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface CityChartsProps {
  city: City
}

// Custom tooltip wrapper
const ChartTooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--popover-foreground)',
  fontSize: '11px',
  padding: '8px 12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={ChartTooltipStyle}>
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div style={ChartTooltipStyle}>
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-semibold text-foreground">{item.name}</span>
      </div>
      <p className="mt-1 text-muted-foreground">
        Share:{' '}
        <span className="font-bold" style={{ color: item.payload.color }}>
          {item.value}%
        </span>
      </p>
    </div>
  )
}

interface ChartDetailPopupProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  children: React.ReactNode
}

function ChartDetailPopup({ open, title, description, onClose, children }: ChartDetailPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="border-b border-border p-5">
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className="p-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function CityCharts({ city }: CityChartsProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null)
  const currentAqi = city.metrics.aqi.value
  const aqiColor = getAqiColor(currentAqi)

  return (
    <section aria-label={`Interactive charts for ${city.name}`}>
      <div className="mb-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">City Analytics</h2>
        <p className="text-[11px] text-muted-foreground">
          Click any chart to expand — hover bars for details
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* AQI Monthly Trend */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('aqi')}
          role="button"
          aria-label="Expand AQI chart"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Air Quality Index</CardTitle>
                <CardDescription className="text-[11px]">Monthly AQI trend (lower is better)</CardDescription>
              </div>
              <Badge
                className="text-[10px] px-2 h-5 font-semibold"
                style={{ backgroundColor: aqiColor + '22', color: aqiColor }}
              >
                {getAqiLabel(currentAqi)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={city.monthlyTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="aqi" name="AQI" radius={[3, 3, 0, 0]}>
                  {city.monthlyTrends.map((entry, index) => (
                    <Cell key={index} fill={getAqiColor(entry.aqi)} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Green Cover + Renewable Trend */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('environment')}
          role="button"
          aria-label="Expand environment chart"
        >
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold">Environmental Health</CardTitle>
              <CardDescription className="text-[11px]">Green cover & renewable energy %</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={city.monthlyTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="greenCover"
                  name="Green Cover %"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#22c55e' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="renewableEnergy"
                  name="Renewable %"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#eab308' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Economy Pie */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('economy')}
          role="button"
          aria-label="Expand economy chart"
        >
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold">Economy Sectors</CardTitle>
              <CardDescription className="text-[11px]">GDP contribution breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-3">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie
                  data={city.economySectors}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  dataKey="value"
                  nameKey="sector"
                  paddingAngle={2}
                >
                  {city.economySectors.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              {city.economySectors.map((s) => (
                <div key={s.sector} className="flex items-center gap-1.5 text-[10px]">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate text-muted-foreground">{s.sector}</span>
                  <span className="ml-auto font-semibold text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Recycling Bar */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('waste')}
          role="button"
          aria-label="Expand waste recycling chart"
        >
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold">Waste Recycling Rate</CardTitle>
              <CardDescription className="text-[11px]">Monthly recycling percentage</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={city.monthlyTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="wasteRecycled"
                  name="Recycled %"
                  fill="#06b6d4"
                  radius={[3, 3, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sustainability Radial */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('sustainability')}
          role="button"
          aria-label="Expand sustainability score"
        >
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold">Sustainability Score</CardTitle>
              <CardDescription className="text-[11px]">Composite urban sustainability index</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={150} height={130}>
                <RadialBarChart
                  cx="50%"
                  cy="60%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={[
                    { name: 'Score', value: city.sustainabilityScore, fill: '#22c55e' },
                    { name: 'Remaining', value: 100 - city.sustainabilityScore, fill: 'var(--muted)' },
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                <p className="text-2xl font-black text-foreground">{city.sustainabilityScore}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div
                className="h-1.5 w-24 rounded-full bg-muted overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${city.sustainabilityScore}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {city.sustainabilityScore >= 75 ? 'Excellent' : city.sustainabilityScore >= 60 ? 'Good' : 'Fair'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* All metrics combined */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => setExpandedChart('allmetrics')}
          role="button"
          aria-label="Expand all metrics comparison"
        >
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold">Full Year Overview</CardTitle>
              <CardDescription className="text-[11px]">All metrics across 12 months</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={city.monthlyTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="greenCover" name="Green %" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="renewableEnergy" name="Renewable %" stroke="#eab308" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="wasteRecycled" name="Recycled %" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expanded chart popups */}
      <ChartDetailPopup
        open={expandedChart === 'aqi'}
        title={`${city.name} — Air Quality Index (12 months)`}
        description="Monthly average AQI. Lower values indicate better air quality."
        onClose={() => setExpandedChart(null)}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={city.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]}>
              {city.monthlyTrends.map((entry, index) => (
                <Cell key={index} fill={getAqiColor(entry.aqi)} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-3 text-xs text-muted-foreground">
          {city.metrics.aqi.detail}
        </p>
      </ChartDetailPopup>

      <ChartDetailPopup
        open={expandedChart === 'environment'}
        title={`${city.name} — Environmental Health Trends`}
        description="Green cover and renewable energy percentage across the year."
        onClose={() => setExpandedChart(null)}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={city.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="greenCover" name="Green Cover %" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="renewableEnergy" name="Renewable Energy %" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4, fill: '#eab308' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-green-500/10 p-3">
            <p className="text-muted-foreground">Green Cover</p>
            <p className="font-bold text-foreground">{city.metrics.greenCover.detail}</p>
          </div>
          <div className="rounded-lg bg-yellow-500/10 p-3">
            <p className="text-muted-foreground">Renewable Energy</p>
            <p className="font-bold text-foreground">{city.metrics.renewableEnergy.detail}</p>
          </div>
        </div>
      </ChartDetailPopup>

      <ChartDetailPopup
        open={expandedChart === 'economy'}
        title={`${city.name} — Economy Sector Breakdown`}
        description="GDP contribution by sector. Click a slice for details."
        onClose={() => setExpandedChart(null)}
      >
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={city.economySectors}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="sector"
                paddingAngle={3}
                label={({ name, value }) => `${value}%`}
                labelLine={false}
              >
                {city.economySectors.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 flex-1">
            {city.economySectors.map((s) => (
              <div key={s.sector} className="flex items-center gap-2 text-sm">
                <div className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-foreground font-medium">{s.sector}</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.value}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <span className="font-bold text-foreground w-8 text-right">{s.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          GDP Growth: {city.metrics.gdpGrowth.detail}
        </p>
      </ChartDetailPopup>

      <ChartDetailPopup
        open={expandedChart === 'waste'}
        title={`${city.name} — Waste Recycling Rate`}
        description="Monthly waste recycling percentage. Target: 50% by 2026."
        onClose={() => setExpandedChart(null)}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={city.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="wasteRecycled" name="Recycled %" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-3 text-xs text-muted-foreground">{city.metrics.wasteRecycling.detail}</p>
      </ChartDetailPopup>

      <ChartDetailPopup
        open={expandedChart === 'sustainability'}
        title={`${city.name} — Sustainability Score`}
        description="Composite index across AQI, green cover, renewable energy, waste, EV adoption."
        onClose={() => setExpandedChart(null)}
      >
        <div className="flex items-center gap-8">
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={200} height={180}>
              <RadialBarChart
                cx="50%"
                cy="70%"
                innerRadius="55%"
                outerRadius="90%"
                data={[
                  { name: 'Score', value: city.sustainabilityScore, fill: '#22c55e' },
                  { name: 'Remaining', value: 100 - city.sustainabilityScore, fill: 'var(--muted)' },
                ]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
              <p className="text-4xl font-black text-foreground">{city.sustainabilityScore}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {[
              { label: 'Air Quality', value: Math.round(100 - city.metrics.aqi.value / 3), color: '#f97316' },
              { label: 'Green Cover', value: Math.round(city.metrics.greenCover.value * 2), color: '#22c55e' },
              { label: 'Renewable Energy', value: city.metrics.renewableEnergy.value, color: '#eab308' },
              { label: 'Waste Recycling', value: city.metrics.wasteRecycling.value, color: '#06b6d4' },
              { label: 'EV Adoption', value: Math.min(100, Math.round(city.metrics.electricVehicles.trend)), color: '#3b82f6' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartDetailPopup>

      <ChartDetailPopup
        open={expandedChart === 'allmetrics'}
        title={`${city.name} — Full Year Overview`}
        description="All sustainability metrics across 12 months."
        onClose={() => setExpandedChart(null)}
      >
        <Tabs defaultValue="lines">
          <TabsList className="mb-4">
            <TabsTrigger value="lines">Line Chart</TabsTrigger>
            <TabsTrigger value="bars">Bar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="lines">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={city.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="greenCover" name="Green Cover %" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="renewableEnergy" name="Renewable %" stroke="#eab308" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="wasteRecycled" name="Recycled %" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="bars">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={city.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="greenCover" name="Green Cover %" fill="#22c55e" radius={[2, 2, 0, 0]} opacity={0.85} />
                <Bar dataKey="renewableEnergy" name="Renewable %" fill="#eab308" radius={[2, 2, 0, 0]} opacity={0.85} />
                <Bar dataKey="wasteRecycled" name="Recycled %" fill="#06b6d4" radius={[2, 2, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </ChartDetailPopup>
    </section>
  )
}
