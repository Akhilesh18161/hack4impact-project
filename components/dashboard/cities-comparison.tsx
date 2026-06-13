'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CITIES, getAqiColor, getSustainabilityColor } from '@/lib/city-data'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const ChartTooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--popover-foreground)',
  fontSize: '11px',
  padding: '8px 12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
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
      <p className="mb-1.5 font-bold text-foreground">{label}</p>
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

const cityColors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export function CitiesComparison() {
  const [expanded, setExpanded] = useState(false)

  const aqiData = CITIES.map((c, i) => ({
    city: c.name,
    AQI: c.metrics.aqi.value,
    fill: getAqiColor(c.metrics.aqi.value),
  }))

  const scoreData = CITIES.map((c, i) => ({
    city: c.name,
    Score: c.sustainabilityScore,
    fill: getSustainabilityColor(c.sustainabilityScore),
  }))

  const renewableData = CITIES.map((c, i) => ({
    city: c.name,
    'Renewable %': c.metrics.renewableEnergy.value,
    fill: cityColors[i],
  }))

  const evData = CITIES.map((c, i) => ({
    city: c.name,
    'EV Growth %': c.metrics.electricVehicles.trend,
    fill: cityColors[i],
  }))

  const gdpData = CITIES.map((c, i) => ({
    city: c.name,
    'GDP Growth %': c.metrics.gdpGrowth.value,
    fill: cityColors[i],
  }))

  return (
    <>
      <Card
        className="cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-0"
        onClick={() => setExpanded(true)}
        role="button"
        aria-label="Expand all-cities comparison"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-bold">City Comparison</CardTitle>
              <CardDescription className="text-[11px]">
                Click to expand — AQI vs sustainability across all cities
              </CardDescription>
            </div>
            <span className="text-[10px] font-medium text-primary">Expand →</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={aqiData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="city"
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
              <Bar dataKey="AQI" name="AQI" radius={[3, 3, 0, 0]}>
                {aqiData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl sm:p-8"
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute right-4 top-4 rounded-full p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl mt-8 sm:mt-12 max-h-[85vh]">
              <div className="border-b border-border/50 p-6 sm:p-8 bg-muted/20">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">All Nepal Cities — Comparison</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Compare key sustainability metrics across all six cities
                </p>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto">
                <Tabs defaultValue="aqi">
                  <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="aqi" className="text-sm rounded-lg">AQI</TabsTrigger>
                    <TabsTrigger value="score" className="text-sm rounded-lg">Sustainability Score</TabsTrigger>
                    <TabsTrigger value="renewable" className="text-sm rounded-lg">Renewable Energy</TabsTrigger>
                    <TabsTrigger value="ev" className="text-sm rounded-lg">EV Growth</TabsTrigger>
                    <TabsTrigger value="gdp" className="text-sm rounded-lg">GDP Growth</TabsTrigger>
                  </TabsList>

                  {[
                    { key: 'aqi', data: aqiData, dataKey: 'AQI', desc: 'Lower AQI = better air quality.' },
                    { key: 'score', data: scoreData, dataKey: 'Score', desc: 'Composite sustainability score out of 100.' },
                    { key: 'renewable', data: renewableData, dataKey: 'Renewable %', desc: 'Percentage of electricity from renewable sources.' },
                    { key: 'ev', data: evData, dataKey: 'EV Growth %', desc: 'Year-over-year growth in electric vehicle registrations.' },
                    { key: 'gdp', data: gdpData, dataKey: 'GDP Growth %', desc: 'Annual economic growth rate.' },
                  ].map(({ key, data, dataKey, desc }) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <p className="mb-6 text-sm text-muted-foreground">{desc}</p>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data as any[]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis
                            dataKey="city"
                            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} opacity={0.9} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {/* City legend */}
                      <div className="mt-6 flex flex-wrap gap-4">
                        {CITIES.map((city, i) => (
                          <div key={city.id} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <div className="size-3 rounded-sm" style={{ backgroundColor: cityColors[i] }} />
                            {city.name}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
