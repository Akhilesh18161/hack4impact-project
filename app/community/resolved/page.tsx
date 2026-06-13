'use client'

import React, { useEffect, useState } from 'react'
import { MOCK_PULSE_REPORTS, subscribeToReports, initializeReports } from '@/lib/pulse-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, MapPin, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ResolvedIssuesPage() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToReports(() => setTick(t => t + 1))
    initializeReports()
    setTick(t => t + 1)
    return unsubscribe
  }, [])

  const resolvedReports = MOCK_PULSE_REPORTS.filter(r => r.status === 'Resolved' || r.status === 'Closed')

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Resolved Issues</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Tangible improvements made through the City Pulse reporting system.
          </p>
        </div>
        <Link href="/community">
          <Button variant="outline">Back to Hub</Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {resolvedReports.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="size-12 mx-auto mb-3 opacity-20" />
              <p>No resolved reports to display yet.</p>
            </CardContent>
          </Card>
        ) : (
          resolvedReports.map((report) => (
            <Card key={report.id} className="overflow-hidden border-green-500/20 bg-card">
              <div className="bg-green-500/10 p-4 border-b border-green-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] bg-background">{report.category}</Badge>
                    <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{report.title}</h3>
                </div>
                {report.dateResolved && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-500/10 px-2 py-1 rounded-md">
                    <Calendar className="size-3.5" />
                    Resolved: {new Date(report.dateResolved).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  <div className="p-5">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="size-3" /> Original Report Location
                    </h4>
                    <p className="text-sm font-medium mb-3">{report.location}</p>
                    
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Original Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{report.description}"</p>

                    {report.images && report.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                          <ImageIcon className="size-3" /> Evidence Photos
                        </h4>
                        <div className="grid grid-cols-3 gap-1.5">
                          {report.images.map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                              <div className="aspect-video rounded-md overflow-hidden border border-border bg-muted group">
                                <img
                                  src={src}
                                  alt={`Evidence ${i + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 bg-muted/20">
                    <h4 className="text-xs font-bold uppercase text-green-600 mb-2 flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Official Resolution Summary
                    </h4>
                    <p className="text-sm font-medium leading-relaxed bg-background p-3 rounded-lg border border-border shadow-sm">
                      {report.resolutionSummary || "Issue was addressed and resolved by city administration."}
                    </p>

                    {report.adminUpdates && report.adminUpdates.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Timeline</h4>
                        <div className="space-y-2">
                          {report.adminUpdates.map((update, idx) => (
                            <div key={idx} className="flex gap-2 text-xs">
                              <div className="text-muted-foreground shrink-0">{new Date(update.date).toLocaleDateString()}</div>
                              <div className="text-foreground border-l border-border pl-2">{update.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  )
}
