'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Settings, Users, BarChart3, BellRing, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

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

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 mt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Administrator Portal</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage, moderate, and monitor UrbanPulse.
        </p>
      </div>

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
              <Badge variant="destructive" className="font-bold">SYSTEM ADMIN</Badge>
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
    </div>
  )
}
