'use client'

import { useRouter } from 'next/navigation'
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
import type { City } from '@/lib/city-data'
import { getAqiColor, getAqiLabel } from '@/lib/city-data'

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

export function CityCharts({ city }: CityChartsProps) {
  const router = useRouter()
  const currentAqi = city.metrics.aqi.value
  const aqiColor = getAqiColor(currentAqi)

  return (
    <section aria-label={`Interactive charts for ${city.name}`}>
      <div className="mb-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">City Analytics</h2>
        <p className="text-[11px] text-muted-foreground">
          Click any chart for full-page analytics — hover bars for details
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* AQI Monthly Trend */}
        <Card
          className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
          onClick={() => router.push(`/analytics/aqi?city=${city.id}`)}
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
          onClick={() => router.push(`/analytics/environment?city=${city.id}`)}
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
          onClick={() => router.push(`/analytics/economy?city=${city.id}`)}
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
          onClick={() => router.push(`/analytics/waste?city=${city.id}`)}
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
          onClick={() => router.push(`/analytics/sustainability?city=${city.id}`)}
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
          onClick={() => router.push(`/analytics/allmetrics?city=${city.id}`)}
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
    </section>
  )
}
