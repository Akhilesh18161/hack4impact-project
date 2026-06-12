'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Settings, Users, BarChart3, BellRing, ClipboardList, Activity, MapPin, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MOCK_PULSE_REPORTS, updatePulseReportStatus, PulseStatus } from '@/lib/pulse-data'
import { StatusBadge } from '@/components/pulse/status-badge'

export default function AdminPortalPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  
  // Protect route
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You must be an administrator to view this page.</p>
      </div>
    )
  }

  const [adminNotice, setAdminNotice] = useState('')
  const [activeNotices, setActiveNotices] = useState<string[]>([
    'Upcoming Kathmandu Tree Planting event on Saturday.',
  ])

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminNotice.trim()) {
      setActiveNotices([adminNotice.trim(), ...activeNotices])
      setAdminNotice('')
    }
  }

  const [reports, setReports] = useState(MOCK_PULSE_REPORTS)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const handleUpdateStatus = (id: string, newStatus: PulseStatus) => {
    updatePulseReportStatus(id, newStatus)
    setReports([...MOCK_PULSE_REPORTS])
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 mt-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Administrator Portal</h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage, moderate, and monitor UrbanPulse.
          </p>
        </div>
        <Badge variant="destructive" className="font-bold px-3 py-1 text-xs">SYSTEM ADMIN</Badge>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">System Dashboard</TabsTrigger>
          <TabsTrigger value="pulse">Pulse Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main Controls */}
            <Card className="md:col-span-2 border-destructive/20 bg-destructive/5 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-destructive" />
                    <CardTitle className="text-base font-bold">Administrator Control Console</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Manage website metrics, post global notice broadcasts, and view system health statistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <Users className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-[10px] text-muted-foreground block font-medium">Active Citizens</span>
                    <span className="text-base font-bold text-foreground">14.8K</span>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <BarChart3 className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-[10px] text-muted-foreground block font-medium">DB Operations</span>
                    <span className="text-base font-bold text-foreground">99.9%</span>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <Settings className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-[10px] text-muted-foreground block font-medium">Auth Policies</span>
                    <span className="text-base font-bold text-foreground">8 Active</span>
                  </div>
                </div>

                {/* Broadcast Form */}
                <form onSubmit={handlePostNotice} className="flex flex-col gap-2 border-t border-border/50 pt-4">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <BellRing className="size-3.5 text-destructive" />
                    Broadcast Global Bulletin Notice
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a notice to broadcast to the page..."
                      value={adminNotice}
                      onChange={(e) => setAdminNotice(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-destructive/40"
                    />
                    <button
                      type="submit"
                      className="bg-destructive text-destructive-foreground px-4 py-1.5 rounded-lg text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
                    >
                      Broadcast
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Notices Board */}
            <Card className="border-border/50 bg-card shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                  <ClipboardList className="size-4 text-primary" />
                  Active Notices Broadcasted
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[220px]">
                <ul className="flex flex-col gap-2">
                  {activeNotices.map((n, i) => (
                    <li key={i} className="text-xs bg-muted/50 border border-border/50 p-2.5 rounded-lg text-foreground leading-relaxed flex items-start gap-2">
                      <span className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="pulse" className="space-y-6">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Pulse Management
              </CardTitle>
              <CardDescription>Review and manage citizen-submitted Pulse Reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Reports List */}
                <div className="lg:col-span-1 border border-border/50 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
                  <div className="bg-muted p-3 border-b border-border/50 font-bold text-xs uppercase text-muted-foreground flex justify-between items-center">
                    <span>Recent Reports</span>
                    <Badge variant="secondary">{reports.length}</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {reports.map((report) => (
                      <div 
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors text-sm ${selectedReportId === report.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'}`}
                      >
                        <div className="font-bold line-clamp-1 mb-1">{report.title}</div>
                        <div className="flex justify-between items-center mt-2">
                          <StatusBadge status={report.status} className="text-[10px] h-5" />
                          <span className="text-[10px] text-muted-foreground">{new Date(report.dateSubmitted).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Details */}
                <div className="lg:col-span-2 border border-border/50 rounded-lg bg-card/50 min-h-[400px] flex flex-col">
                  {!selectedReportId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <Activity className="size-12 mb-4 opacity-20" />
                      <p>Select a Pulse Report from the list to view details and manage its status.</p>
                    </div>
                  ) : (
                    (() => {
                      const report = reports.find(r => r.id === selectedReportId)!;
                      return (
                        <div className="flex-1 flex flex-col">
                          <div className="p-5 border-b border-border/50">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold">{report.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                  <MapPin className="size-3" /> {report.location}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md">{report.id}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">{report.category}</Badge>
                              <Badge variant="outline">{report.priority} Priority</Badge>
                              <StatusBadge status={report.status} />
                            </div>

                            <div className="text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Description</h4>
                              <p className="leading-relaxed">{report.description}</p>
                            </div>
                          </div>

                          <div className="p-5 bg-muted/10 flex-1">
                            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Settings className="size-3.5" /> Manage Workflow Status
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {([
                                'Submitted', 'Under Review', 'Assessment in Progress', 'Action Approved', 
                                'Implementation in Progress', 'Near Completion', 'Resolved', 'Closed'
                              ] as PulseStatus[]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleUpdateStatus(report.id, status)}
                                  className={`text-xs p-2 rounded-md border text-center transition-all ${
                                    report.status === status 
                                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md' 
                                      : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>

                            {report.status === 'Resolved' && (
                              <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                                <h4 className="font-bold text-xs uppercase text-green-500 mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="size-3.5" /> Resolution Summary
                                </h4>
                                <textarea 
                                  className="w-full text-sm p-3 rounded-lg border border-green-500/30 bg-green-500/5 focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[80px]"
                                  placeholder="Enter resolution details to publish to the community portal..."
                                  defaultValue={report.resolutionSummary || ''}
                                  onBlur={(e) => {
                                    updatePulseReportStatus(report.id, 'Resolved', e.target.value);
                                    setReports([...MOCK_PULSE_REPORTS]);
                                  }}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">This summary will be visible to the public on the Community Portal.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
