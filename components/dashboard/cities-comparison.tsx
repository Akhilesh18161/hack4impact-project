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
        className="cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30"
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

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl gap-0 p-0 overflow-hidden">
          <DialogTitle className="sr-only">All Cities Comparison</DialogTitle>
          <div className="border-b border-border p-5">
            <h3 className="font-bold text-foreground">All Nepal Cities — Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compare key sustainability metrics across all six cities
            </p>
          </div>
          <div className="p-5">
            <Tabs defaultValue="aqi">
              <TabsList className="mb-5 flex-wrap h-auto gap-1">
                <TabsTrigger value="aqi" className="text-xs">AQI</TabsTrigger>
                <TabsTrigger value="score" className="text-xs">Sustainability Score</TabsTrigger>
                <TabsTrigger value="renewable" className="text-xs">Renewable Energy</TabsTrigger>
                <TabsTrigger value="ev" className="text-xs">EV Growth</TabsTrigger>
                <TabsTrigger value="gdp" className="text-xs">GDP Growth</TabsTrigger>
              </TabsList>

              {[
                { key: 'aqi', data: aqiData, dataKey: 'AQI', desc: 'Lower AQI = better air quality.' },
                { key: 'score', data: scoreData, dataKey: 'Score', desc: 'Composite sustainability score out of 100.' },
                { key: 'renewable', data: renewableData, dataKey: 'Renewable %', desc: 'Percentage of electricity from renewable sources.' },
                { key: 'ev', data: evData, dataKey: 'EV Growth %', desc: 'Year-over-year growth in electric vehicle registrations.' },
                { key: 'gdp', data: gdpData, dataKey: 'GDP Growth %', desc: 'Annual economic growth rate.' },
              ].map(({ key, data, dataKey, desc }) => (
                <TabsContent key={key} value={key}>
                  <p className="mb-4 text-xs text-muted-foreground">{desc}</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data as any[]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis
                        dataKey="city"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey={dataKey} radius={[5, 5, 0, 0]}>
                        {data.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} opacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* City legend */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {CITIES.map((city, i) => (
                      <div key={city.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: cityColors[i] }} />
                        {city.name}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
