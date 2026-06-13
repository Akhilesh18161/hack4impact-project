'use client'

import { useState, use, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  Wind,
  Trees,
  Zap,
  Recycle,
  TrendingUp as GdpIcon,
  Car,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'
import { CITIES, getAqiColor, getAqiLabel } from '@/lib/city-data'
import type { City, CityMetric } from '@/lib/city-data'

type MetricKey = keyof City['metrics']

interface MetricRouteConfig {
  key: MetricKey
  label: string
  icon: React.ReactNode
  color: string
  bgClass: string
  monthlyKey?: string
  description: string
  actions: string[]
  policies: string[]
}

const METRIC_ROUTING: Record<string, MetricRouteConfig> = {
  'air-quality': {
    key: 'aqi',
    label: 'Air Quality Index',
    icon: <Wind className="size-6" />,
    color: '#f97316',
    bgClass: 'bg-orange-500/10 text-orange-500',
    monthlyKey: 'aqi',
    description: 'Measures fine particulate matter (PM2.5), nitrogen dioxide, and other pollutant levels. Lower values are healthier.',
    actions: [
      'Use electric public transportation or carpool.',
      'Walk or cycle for short neighborhood trips.',
      'Maintain home gardens and avoid burning leaves or waste.'
    ],
    policies: [
      'Strict vehicular emission testing standards.',
      'Transition of commercial industries to zero-emission zones.',
      'Subsidies for transitioning traditional brick kilns to clean technologies.'
    ]
  },
  'green-cover': {
    key: 'greenCover',
    label: 'Green Cover',
    icon: <Trees className="size-6" />,
    color: '#22c55e',
    bgClass: 'bg-green-500/10 text-green-500',
    monthlyKey: 'greenCover',
    description: 'Percentage of the urban area covered by tree canopies, parks, and protected forests.',
    actions: [
      'Participate in community afforestation campaigns.',
      'Implement green roofs or vertical gardens on private properties.',
      'Support local parks maintenance organizations.'
    ],
    policies: [
      'Mandatory green roof integration policies for new builds.',
      'Protection of municipal river buffer zones.',
      'Development of urban forest corridors to support local biodiversity.'
    ]
  },
  'renewable-energy': {
    key: 'renewableEnergy',
    label: 'Renewable Energy',
    icon: <Zap className="size-6" />,
    color: '#eab308',
    bgClass: 'bg-yellow-500/10 text-yellow-500',
    monthlyKey: 'renewableEnergy',
    description: 'Percentage of the city power grid supplied by hydropower, solar farms, wind, and biomass.',
    actions: [
      'Install residential solar panels and participate in net metering.',
      'Transition household heating and cooking appliances to electricity.',
      'Adopt smart energy meters to monitor daily consumption.'
    ],
    policies: [
      'Incentives for feed-in solar tariffs on commercial properties.',
      'Grid modernization investments for micro-hydro power import.',
      'Tax holidays for domestic renewable energy developers.'
    ]
  },
  'waste-recycling': {
    key: 'wasteRecycling',
    label: 'Waste Recycling',
    icon: <Recycle className="size-6" />,
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10 text-cyan-500',
    monthlyKey: 'wasteRecycled',
    description: 'Percentage of municipal solid waste successfully segregated, composted, or recycled instead of landfilled.',
    actions: [
      'Segregate organic and inorganic waste at the source.',
      'Minimize single-use plastics and packaging items.',
      'Engage in municipal home composting programs.'
    ],
    policies: [
      'Zero single-use plastic mandates in major commercial/tourism districts.',
      'AI-powered material sorting facility upgrades.',
      'Implementation of circular-economy organic composting incentives.'
    ]
  },
  'gdp-growth': {
    key: 'gdpGrowth',
    label: 'GDP Growth',
    icon: <GdpIcon className="size-6" />,
    color: '#8b5cf6',
    bgClass: 'bg-violet-500/10 text-violet-500',
    description: 'Annualized rate of municipal gross domestic product growth, including green-economy expansion markers.',
    actions: [
      'Support local green enterprises and sustainable shops.',
      'Pursue careers and skill development in the IT, green engineering, and service sectors.',
      'Promote municipal tourism by supporting local guides and artisans.'
    ],
    policies: [
      'Funding grants for ecological and smart city startups.',
      'Infrastructure updates to support economic SEZs (Special Economic Zones).',
      'Promoting export-oriented handicraft, green craft, and IT service hubs.'
    ]
  },
  'electric-vehicles': {
    key: 'electricVehicles',
    label: 'Electric Vehicles',
    icon: <Car className="size-6" />,
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10 text-blue-500',
    description: 'Total registered battery electric vehicles (EVs) operating within the metropolitan registry.',
    actions: [
      'Transition personal transit to electric cars, scooters, or bicycles.',
      'Install EV home charging infrastructure where feasible.',
      'Advocate for charging stations in public parking buildings.'
    ],
    policies: [
      'Subsidies on registration fees and import duties for electric fleets.',
      'Creation of EV-exclusive freight corridors and pedestrian zones.',
      'Expansion of municipal fast-charging networks across major highways.'
    ]
  }
}

// Custom tooltip styling
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
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

interface MetricDetailClientProps {
  params: Promise<{ metric: string }>
}

function MetricDetailInner({ params }: MetricDetailClientProps) {
  const { metric } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const cityId = searchParams.get('city') ?? 'kathmandu'
  const activeCity = CITIES.find((c) => c.id === cityId) ?? CITIES[0]

  const config = METRIC_ROUTING[metric]
  if (!config) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Metric Not Found</h2>
        <p className="mt-2 text-muted-foreground">The specified metric page could not be located.</p>
        <Link href="/" passHref>
          <Button className="mt-6">Back to Home</Button>
        </Link>
      </div>
    )
  }

  const activeMetric = activeCity.metrics[config.key]
  const isAqi = config.key === 'aqi'
  const trendPositive = activeMetric.trend > 0
  const trendGood = isAqi ? !trendPositive : trendPositive

  // Data for the multi-city comparison chart
  const comparisonData = CITIES.map((c) => ({
    cityName: c.name,
    value: c.metrics[config.key].value,
    isCurrent: c.id === activeCity.id,
  }))

  return (
    <main className="min-h-screen bg-background pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Breadcrumbs & Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              className="group -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back()
                } else {
                  router.push(`/?city=${activeCity.id}#dashboard-content`)
                }
              }}
            >
              <ChevronLeft className="mr-1 size-5 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href={`/?city=${activeCity.id}#dashboard-content`} className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground">{config.label}</span>
            </div>
          </div>

          {/* Header Grid */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-xl">
            <div className="flex flex-col md:flex-row items-start justify-between p-6 sm:p-10 gap-6" style={{ backgroundColor: config.color + '0a' }}>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl border shadow-md" style={{ backgroundColor: config.color, borderColor: config.color }}>
                  <div className="text-white">{config.icon}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-border/50 text-[10px] text-muted-foreground">
                      {activeCity.name}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                      Key Metric
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                    {config.label} Overview
                  </h1>
                </div>
              </div>

              <div className="flex md:flex-col items-baseline justify-between w-full md:w-auto md:text-right gap-2 border-t md:border-none pt-4 md:pt-0">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Current Status</p>
                  <p className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight whitespace-nowrap mt-1 flex items-baseline" style={{ color: config.color }}>
                    {activeMetric.value.toLocaleString()}
                    <span className="text-2xl sm:text-3xl font-bold text-muted-foreground ml-2 opacity-90">{activeMetric.unit}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 p-6 sm:p-10 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Trend Summary */}
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Year-Over-Year Change</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold"
                      style={{
                        backgroundColor: trendGood ? '#22c55e15' : '#ef444415',
                        color: trendGood ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {trendGood ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      {activeMetric.trend > 0 ? '+' : ''}{activeMetric.trend}%
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {trendGood ? 'Improving Trend' : 'Requires Attention'}
                    </span>
                  </div>
                </div>

                {/* About Metric */}
                <div className="md:col-span-2 flex items-start gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <Info className="size-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">About this Indicator</p>
                    {config.description}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Charts & Analytics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Charts Panel (2/3 Column) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Monthly Trend Chart */}
              {config.monthlyKey && (
                <Card className="border-border/50 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="size-4 text-primary" />
                      12-Month Trend Line
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Monthly progression of {config.label} values for {activeCity.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={activeCity.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey={config.monthlyKey}
                          name={config.label}
                          stroke={config.color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: config.color }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Benchmark Cities Comparison Chart */}
              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    City Comparison Benchmark
                  </CardTitle>
                  <CardDescription className="text-xs">
                    How {activeCity.name} compares with other regional centers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                      <XAxis dataKey="cityName" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name={config.label} radius={[4, 4, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.isCurrent ? config.color : 'var(--muted-foreground)'}
                            opacity={entry.isCurrent ? 0.95 : 0.4}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>

            {/* Recommendations & Context Panel (1/3 Column) */}
            <div className="flex flex-col gap-8">
              
              {/* Detailed Breakdown Card */}
              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">Analysis Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/20 p-4 border border-border/30">
                    <p className="text-xs font-semibold text-foreground mb-1">Key Finding</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeMetric.detail}
                    </p>
                  </div>
                  
                  {/* Indicator bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Performance Index</span>
                      <span style={{ color: config.color }}>{activeMetric.value} {activeMetric.unit}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, (activeMetric.value / (activeMetric.unit === '%' ? 100 : activeMetric.unit === 'AQI' ? 300 : activeMetric.value * 1.5)) * 100)}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Citizen Actions */}
              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">How Citizens Can Help</CardTitle>
                  <CardDescription className="text-xs">Individual steps you can take to make a difference.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {config.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Municipal Policies */}
              <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">Municipal Policies</CardTitle>
                  <CardDescription className="text-xs">Ongoing city projects and targets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {config.policies.map((pol, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                        <div className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{pol}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>
      </div>
    </main>
  )
}

export default function MetricDetailClient({ params }: MetricDetailClientProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading metric detailed analytics...
      </div>
    }>
      <MetricDetailInner params={params} />
    </Suspense>
  )
}
