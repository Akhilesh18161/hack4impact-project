'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, MapPin, CheckCircle2, Calendar, Activity, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_PULSE_REPORTS } from '@/lib/pulse-data'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CommunityPortalPage() {
  const { user, isCommunityUser } = useAuth()
  
  // Protect route
  if (!user || !isCommunityUser) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You must be a registered community member to view this page.</p>
      </div>
    )
  }

  const resolvedReports = MOCK_PULSE_REPORTS.filter(r => r.status === 'Resolved' || r.status === 'Closed')

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 mt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Community Portal</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your space to collaborate, discuss, and track improvements in your city.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Main Action Hub */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                <CardTitle className="text-base font-bold">Welcome, {user.fullName}</CardTitle>
              </div>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 font-bold">CITIZEN PROFILE</Badge>
            </div>
            <CardDescription className="text-xs">
              As a registered citizen, you can track city progress and report issues directly to municipal planning.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card m-6 mt-0 rounded-lg p-6 border border-border/50 shadow-sm">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Activity className="size-5 text-primary" /> City Pulse
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Have an issue or suggestion? Submit a Pulse Report to alert the community and administrators.</p>
            </div>
            <Link href="/pulse">
              <Button className="shrink-0 group">
                Go to City Pulse <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Community Info Card */}
        <Card className="border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Your Citizen Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5 text-xs text-muted-foreground">
            <div>
              <span className="font-bold text-foreground block">Registered Name</span>
              {user.fullName}
            </div>
            <div>
              <span className="font-bold text-foreground block">Email Address</span>
              {user.email}
            </div>
            <div>
              <span className="font-bold text-foreground block">Assigned Role</span>
              Community Member (Citizen)
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resolved Issues Feed */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4 px-1">
          <CheckCircle2 className="size-6 text-green-500" />
          <h2 className="text-2xl font-bold">Resolved Community Issues</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6 px-1">
          Tangible improvements made through the City Pulse reporting system.
        </p>

        <div className="space-y-4">
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

                      {/* Evidence Images */}
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
        </div>
      </motion.div>
    </div>
  )
}
