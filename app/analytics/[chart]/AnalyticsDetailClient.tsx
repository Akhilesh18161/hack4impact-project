'use client'

import { use, Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  AlertCircle,
  Wind,
  Trees,
  PieChart as PieChartIcon,
  Recycle,
  Globe2,
  BarChart3
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CITIES, getAqiColor } from '@/lib/city-data'

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

interface AnalyticsDetailClientProps {
  params: Promise<{ chart: string }>
}

function AnalyticsDetailInner({ params }: AnalyticsDetailClientProps) {
  const { chart } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const cityId = searchParams.get('city') ?? 'kathmandu'
  const activeCity = CITIES.find((c) => c.id === cityId) ?? CITIES[0]

  const CHART_CONFIG: Record<string, { title: string, description: string, icon: React.ReactNode, render: () => React.ReactNode }> = {
    'aqi': {
      title: 'Air Quality Index',
      description: 'Monthly average AQI. Lower values indicate better air quality.',
      icon: <Wind className="size-6 text-orange-500" />,
      render: () => (
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>12-Month AQI Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activeCity.monthlyTrends} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]}>
                    {activeCity.monthlyTrends.map((entry, index) => (
                      <Cell key={index} fill={getAqiColor(entry.aqi)} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="rounded-xl bg-muted/20 p-6 border border-border/30">
            <h3 className="font-semibold mb-2">Key Insights</h3>
            <p className="text-muted-foreground">{activeCity.metrics.aqi.detail}</p>
          </div>
        </div>
      )
    },
    'environment': {
      title: 'Environmental Health Trends',
      description: 'Green cover and renewable energy percentage across the year.',
      icon: <Trees className="size-6 text-green-500" />,
      render: () => (
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Green Cover & Renewable Energy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activeCity.monthlyTrends} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Line type="monotone" dataKey="greenCover" name="Green Cover %" stroke="#22c55e" strokeWidth={3} dot={{ r: 5, fill: '#22c55e' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="renewableEnergy" name="Renewable Energy %" stroke="#eab308" strokeWidth={3} dot={{ r: 5, fill: '#eab308' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-green-500/10 p-6 border border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Green Cover Analysis</h3>
              <p className="text-foreground">{activeCity.metrics.greenCover.detail}</p>
            </div>
            <div className="rounded-xl bg-yellow-500/10 p-6 border border-yellow-500/20">
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Renewable Energy Status</h3>
              <p className="text-foreground">{activeCity.metrics.renewableEnergy.detail}</p>
            </div>
          </div>
        </div>
      )
    },
    'economy': {
      title: 'Economy Sector Breakdown',
      description: 'GDP contribution by sector with detailed growth metrics.',
      icon: <PieChartIcon className="size-6 text-blue-500" />,
      render: () => (
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={activeCity.economySectors}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={160}
                      dataKey="value"
                      nameKey="sector"
                      paddingAngle={3}
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={true}
                    >
                      {activeCity.economySectors.map((entry, index) => (
                        <Cell key={index} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-4 w-full lg:w-1/3">
                  <h3 className="font-bold text-lg mb-2">Sector Contributions</h3>
                  {activeCity.economySectors.map((s) => (
                    <div key={s.sector} className="flex items-center gap-3">
                      <div className="size-4 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-foreground font-medium flex-1">{s.sector}</span>
                      <div className="font-bold text-foreground w-12 text-right">{s.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="rounded-xl bg-muted/20 p-6 border border-border/30">
            <h3 className="font-semibold mb-2">Economic Overview</h3>
            <p className="text-muted-foreground">GDP Growth: {activeCity.metrics.gdpGrowth.detail}</p>
          </div>
        </div>
      )
    },
    'waste': {
      title: 'Waste Recycling Rate',
      description: 'Monthly waste recycling percentage progress towards sustainability goals.',
      icon: <Recycle className="size-6 text-cyan-500" />,
      render: () => (
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Monthly Recycling Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activeCity.monthlyTrends} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wasteRecycled" name="Recycled %" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="rounded-xl bg-cyan-500/10 p-6 border border-cyan-500/20">
            <h3 className="font-semibold text-cyan-600 dark:text-cyan-400 mb-2">Recycling Initiatives</h3>
            <p className="text-foreground">{activeCity.metrics.wasteRecycling.detail}</p>
          </div>
        </div>
      )
    },
    'sustainability': {
      title: 'Sustainability Score Overview',
      description: 'Composite index across AQI, green cover, renewable energy, waste management, and EV adoption.',
      icon: <Globe2 className="size-6 text-green-600" />,
      render: () => (
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-md">
            <CardContent className="pt-8">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="relative flex-shrink-0">
                  <ResponsiveContainer width={300} height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      data={[
                        { name: 'Score', value: activeCity.sustainabilityScore, fill: '#22c55e' },
                        { name: 'Remaining', value: 100 - activeCity.sustainabilityScore, fill: 'var(--muted)' },
                      ]}
                      startAngle={225}
                      endAngle={-45}
                    >
                      <RadialBar dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-6xl font-black text-foreground">{activeCity.sustainabilityScore}</p>
                    <p className="text-sm text-muted-foreground mt-2">Overall Score / 100</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-6 w-full">
                  <h3 className="font-bold text-xl">Component Breakdown</h3>
                  {[
                    { label: 'Air Quality Score', value: Math.max(0, Math.round(100 - activeCity.metrics.aqi.value / 3)), color: '#f97316' },
                    { label: 'Green Cover', value: Math.round(activeCity.metrics.greenCover.value * 2), color: '#22c55e' },
                    { label: 'Renewable Energy', value: activeCity.metrics.renewableEnergy.value, color: '#eab308' },
                    { label: 'Waste Recycling', value: activeCity.metrics.wasteRecycling.value, color: '#06b6d4' },
                    { label: 'EV Adoption Trend', value: Math.min(100, Math.max(0, Math.round(activeCity.metrics.electricVehicles.trend * 2))), color: '#3b82f6' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>{item.value} / 100</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    'allmetrics': {
      title: 'Full Year Multi-Metric Overview',
      description: 'Comprehensive view of all sustainability metrics tracked across the entire year.',
      icon: <BarChart3 className="size-6 text-purple-500" />,
      render: () => (
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Yearly Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lines">
              <TabsList className="mb-6 h-10">
                <TabsTrigger value="lines" className="px-6">Trend Lines</TabsTrigger>
                <TabsTrigger value="bars" className="px-6">Comparative Bars</TabsTrigger>
              </TabsList>
              <TabsContent value="lines">
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={activeCity.monthlyTrends} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="greenCover" name="Green Cover %" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="renewableEnergy" name="Renewable %" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="wasteRecycled" name="Recycled %" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="bars">
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={activeCity.monthlyTrends} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                    <Bar dataKey="greenCover" name="Green Cover %" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.9} />
                    <Bar dataKey="renewableEnergy" name="Renewable %" fill="#eab308" radius={[4, 4, 0, 0]} opacity={0.9} />
                    <Bar dataKey="wasteRecycled" name="Recycled %" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.9} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )
    }
  }

  const activeConfig = CHART_CONFIG[chart]

  if (!activeConfig) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Analytics Not Found</h2>
        <p className="mt-2 text-muted-foreground">The specified analytics page could not be located.</p>
        <Link href="/" passHref>
          <Button className="mt-6">Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Navigation */}
          <div className="mb-8 flex items-center justify-between">
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
              <span className="text-foreground">Analytics</span>
            </div>
          </div>

          {/* Header Section */}
          <div className="mb-10 flex items-center gap-5">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-card border border-border/50 shadow-sm">
              {activeConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-border/50 text-[10px] text-muted-foreground">
                  {activeCity.name}
                </Badge>
                <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                  City Analytics
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {activeConfig.title}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
                {activeConfig.description}
              </p>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="w-full">
            {activeConfig.render()}
          </div>

        </div>
      </div>
    </main>
  )
}

export default function AnalyticsDetailClient({ params }: AnalyticsDetailClientProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading analytics detailed view...
      </div>
    }>
      <AnalyticsDetailInner params={params} />
    </Suspense>
  )
}
