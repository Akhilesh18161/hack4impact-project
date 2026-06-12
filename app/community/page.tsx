'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, PenTool, CheckCircle, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

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

  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedbackText.trim()) {
      setFeedbackSubmitted(true)
      setTimeout(() => {
        setFeedbackSubmitted(false)
        setFeedbackText('')
      }, 3000)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 mt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Community Portal</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your space to collaborate, discuss, and improve your city.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Feedback Section */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                <CardTitle className="text-base font-bold">Community Portal Hub</CardTitle>
              </div>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 font-bold">CITIZEN PROFILE</Badge>
            </div>
            <CardDescription className="text-xs">
              Welcome back, <strong>{user.fullName}</strong>. Submit citizen reports and interact with municipal planning tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {feedbackSubmitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-5 text-center flex flex-col items-center gap-2">
                <CheckCircle className="size-8 text-green-500" />
                <h4 className="text-sm font-bold text-green-500">Report Filed Successfully</h4>
                <p className="text-xs text-muted-foreground">Thank you! Your environment report has been registered under ticket #UP-{Math.floor(1000 + Math.random() * 9000)}.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <PenTool className="size-3.5 text-primary" />
                  Submit Citizen Environment Report / Suggestion
                </label>
                <textarea
                  placeholder="Report air quality, green cover requests, or trash issues in your district..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="rounded-lg border border-border bg-card p-3 text-xs outline-none focus:border-primary/40 min-h-[70px] resize-none"
                />
                <button
                  type="submit"
                  className="self-end bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
                >
                  Submit Report
                </button>
              </form>
            )}
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
    </div>
  )
}
