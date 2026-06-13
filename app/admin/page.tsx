'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Settings, Users, BarChart3, BellRing, ClipboardList, Activity, MapPin, CheckCircle2, Image as ImageIcon, ExternalLink, Flag, PlusCircle, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { pulseClient, PulseStatus, PriorityLevel, PulseReport } from '@/lib/pulse-data'
import { StatusBadge } from '@/components/pulse/status-badge'
import { MapViewer } from '@/components/pulse/map-viewer'
import { adminClient } from '@/lib/admin-data'
import { ContentRequest, communityClient } from '@/lib/community-data'

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

  const [reports, setReports] = useState<PulseReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [newUpdateText, setNewUpdateText] = useState('')

  const [contentRequests, setContentRequests] = useState<ContentRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const loadReports = async () => {
    const data = await pulseClient.getReports()
    setReports(data)
  }

  const loadRequests = async () => {
    const data = await adminClient.getContentRequests()
    setContentRequests(data)
  }

  React.useEffect(() => {
    loadReports()
    loadRequests()
    const unsubscribe = pulseClient.subscribeToReports(() => {
      loadReports()
    })
    return unsubscribe
  }, [])

  const handleApproveModification = async (req: ContentRequest) => {
    if (!user) return
    await adminClient.approveModification(req, user.id)
    loadRequests()
    loadReports()
  }

  const handleApproveRemoval = async (req: ContentRequest) => {
    if (!user) return
    await adminClient.approveRemoval(req, user.id)
    loadRequests()
    loadReports()
  }

  const handleRejectRequest = async (req: ContentRequest) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return
    await adminClient.rejectRequest(req, reason)
    loadRequests()
  }

  const handleVerifyReport = async (reportId: string) => {
    if (!user) return
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    await pulseClient.verifyContent(reportId, user.id, 'Verified')
    if (report.reporterId) {
      await adminClient.createNotification(
        report.reporterId,
        'Report Verified',
        `Your report "${report.title}" has been verified by an administrator.`
      )
    }
    loadReports()
  }

  const handleUpdateStatus = async (id: string, newStatus: PulseStatus, resolutionSummary?: string) => {
    await pulseClient.updateStatus(id, newStatus, resolutionSummary)
    loadReports()
  }

  const handleUpdatePriority = async (id: string, priority: PriorityLevel) => {
    await pulseClient.updatePriority(id, priority)
    loadReports()
  }

  const handlePublishUpdate = async (id: string) => {
    if (!newUpdateText.trim()) return
    await pulseClient.addAdminUpdate(id, newUpdateText.trim())
    setNewUpdateText('')
    loadReports()
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
        <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="dashboard">System Dashboard</TabsTrigger>
          <TabsTrigger value="pulse">Pulse Management</TabsTrigger>
          <TabsTrigger value="requests">Content Requests</TabsTrigger>
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

                            {/* Evidence Images */}
                            {report.images && report.images.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <ImageIcon className="size-3.5" /> Evidence Photos ({report.images.length})
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {report.images.map((src, i) => (
                                    <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted group">
                                        <img src={src} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Map Location */}
                            {report.mapLat && report.mapLng && (
                              <div className="mt-4">
                                <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <MapPin className="size-3.5" /> Location on Map
                                </h4>
                                <div className="rounded-lg overflow-hidden border border-border/60">
                                  <MapViewer lat={report.mapLat} lng={report.mapLng} height={160} />
                                  <a
                                    href={`https://www.openstreetmap.org/?mlat=${report.mapLat}&mlon=${report.mapLng}&zoom=16`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 text-[10px] text-primary py-1 bg-muted/40 hover:bg-muted/60 transition-colors"
                                  >
                                    <ExternalLink className="size-3" /> Open in OpenStreetMap
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-5 bg-muted/10 flex-1 flex flex-col gap-6">
                            {/* Status */}
                            <div>
                              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                                <Settings className="size-3.5" /> Manage Workflow Status
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {(['Submitted', 'Under Review', 'Assessment in Progress', 'Action Approved', 'Implementation in Progress', 'Near Completion', 'Resolved', 'Closed'] as PulseStatus[]).map((status) => (
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

                              {/* Verification */}
                              <div className="mt-4 pt-4 border-t border-border/40">
                                <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <BadgeCheck className="size-3.5" /> Content Verification
                                </h4>
                                <div className="flex items-center gap-3">
                                  {report.verificationStatus === 'Verified' ? (
                                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
                                      <BadgeCheck className="size-3.5" /> Verified
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleVerifyReport(report.id)}
                                      className="text-xs bg-green-600 text-white px-4 py-1.5 rounded-md font-bold hover:bg-green-700 transition-colors flex items-center gap-1.5"
                                    >
                                      <BadgeCheck className="size-3.5" /> Mark as Verified
                                    </button>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">
                                    Status: <span className="font-semibold">{report.verificationStatus || 'Pending Review'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Priority */}
                            <div>
                              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                                <Flag className="size-3.5" /> Change Priority
                              </h4>
                              <div className="grid grid-cols-4 gap-2">
                                {(['Low', 'Medium', 'High', 'Critical'] as PriorityLevel[]).map((p) => {
                                  const colors: Record<string, string> = {
                                    Low: 'border-green-500 bg-green-500/10 text-green-600',
                                    Medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-600',
                                    High: 'border-orange-500 bg-orange-500/10 text-orange-600',
                                    Critical: 'border-red-500 bg-red-500/10 text-red-600',
                                  }
                                  return (
                                    <button
                                      key={p}
                                      onClick={() => handleUpdatePriority(report.id, p)}
                                      className={`text-xs p-2 rounded-md border text-center font-semibold transition-all ${
                                        report.priority === p
                                          ? colors[p] + ' shadow-sm'
                                          : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Publish Update */}
                            <div>
                              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                                <PlusCircle className="size-3.5" /> Publish Public Update
                              </h4>
                              <div className="flex flex-col gap-2">
                                <textarea
                                  className="w-full text-sm p-3 rounded-lg border border-border/60 bg-card focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px] resize-none"
                                  placeholder="Write a public update for citizens following this report..."
                                  value={newUpdateText}
                                  onChange={(e) => setNewUpdateText(e.target.value)}
                                />
                                <button
                                  onClick={() => handlePublishUpdate(report.id)}
                                  disabled={!newUpdateText.trim()}
                                  className="self-end text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-bold shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  Publish Update
                                </button>
                              </div>
                              {report.adminUpdates && report.adminUpdates.length > 0 && (
                                <div className="mt-3 flex flex-col gap-2">
                                  {report.adminUpdates.slice().reverse().map((u, i) => (
                                    <div key={i} className="text-xs bg-muted/40 border border-border/50 rounded-lg p-2.5">
                                      <span className="text-[10px] font-mono text-muted-foreground block mb-1">{new Date(u.date).toLocaleString()}</span>
                                      {u.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Resolution Summary */}
                            {report.status === 'Resolved' && (
                              <div className="animate-in fade-in slide-in-from-bottom-4">
                                <h4 className="font-bold text-xs uppercase text-green-500 mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="size-3.5" /> Resolution Summary
                                </h4>
                                <textarea 
                                  className="w-full text-sm p-3 rounded-lg border border-green-500/30 bg-green-500/5 focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[80px] resize-none"
                                  placeholder="Enter resolution details to publish to the community portal..."
                                  defaultValue={report.resolutionSummary || ''}
                                  onBlur={(e) => {
                                    handleUpdateStatus(report.id, 'Resolved', e.target.value);
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

        <TabsContent value="requests" className="space-y-6">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                Content Modification & Removal Requests
              </CardTitle>
              <CardDescription>Review requests from citizens to modify or remove their verified content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Requests List */}
                <div className="lg:col-span-1 border border-border/50 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
                  <div className="bg-muted p-3 border-b border-border/50 font-bold text-xs uppercase text-muted-foreground flex justify-between items-center">
                    <span>Pending Requests</span>
                    <Badge variant="secondary">{contentRequests.filter(r => r.status === 'Pending').length}</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {contentRequests.map((req) => (
                      <div 
                        key={req.id}
                        onClick={() => setSelectedRequestId(req.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors text-sm ${selectedRequestId === req.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={req.requestType === 'removal' ? 'destructive' : 'default'} className="text-[10px] uppercase">
                            {req.requestType}
                          </Badge>
                          <span className="font-bold text-xs truncate capitalize">{req.contentType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <StatusBadge status={req.status as any} className="text-[10px] h-5" />
                          <span className="text-[10px] text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {contentRequests.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">No requests found.</div>
                    )}
                  </div>
                </div>

                {/* Request Details */}
                <div className="lg:col-span-2 border border-border/50 rounded-lg bg-card/50 min-h-[400px] flex flex-col p-6">
                  {!selectedRequestId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center">
                      <ClipboardList className="size-12 mb-4 opacity-20" />
                      <p>Select a request from the list to view details and manage it.</p>
                    </div>
                  ) : (
                    (() => {
                      const req = contentRequests.find(r => r.id === selectedRequestId)!;
                      return (
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={req.requestType === 'removal' ? 'destructive' : 'default'} className="uppercase">
                                  {req.requestType} Request
                                </Badge>
                                <span className="text-sm font-bold capitalize text-muted-foreground">{req.contentType.replace('_', ' ')}</span>
                              </div>
                              <h3 className="text-xl font-bold">Content ID: {req.contentId}</h3>
                            </div>
                            <StatusBadge status={req.status as any} />
                          </div>
                          
                          <div className="space-y-6 flex-1">
                            <div>
                              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Reason for Request</h4>
                              <p className="text-sm bg-muted/40 p-4 rounded-lg border border-border/50">{req.reason}</p>
                            </div>

                            {req.requestType === 'modification' && req.requestedChanges && (
                              <div>
                                <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Requested Changes (JSON)</h4>
                                <pre className="text-xs bg-muted p-4 rounded-lg border border-border/50 overflow-x-auto">
                                  {JSON.stringify(req.requestedChanges, null, 2)}
                                </pre>
                              </div>
                            )}

                            {req.adminNotes && (
                              <div>
                                <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Admin Notes</h4>
                                <p className="text-sm bg-muted/40 p-4 rounded-lg border border-border/50">{req.adminNotes}</p>
                              </div>
                            )}
                          </div>

                          {req.status === 'Pending' && (
                            <div className="mt-8 pt-6 border-t border-border/50 flex gap-3">
                              <button
                                onClick={() => req.requestType === 'modification' ? handleApproveModification(req) : handleApproveRemoval(req)}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors"
                              >
                                Approve Request
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req)}
                                className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:brightness-110 transition-colors"
                              >
                                Reject Request
                              </button>
                            </div>
                          )}
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
