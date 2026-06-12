'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserCheck, Settings, Users, BarChart3, BellRing, ClipboardList, PenTool, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function PortalSection() {
  const { user, isAdmin, isCommunityUser } = useAuth();
  
  // States for interactive demo actions
  const [adminNotice, setAdminNotice] = useState('');
  const [activeNotices, setActiveNotices] = useState<string[]>([
    'Upcoming Kathmandu Tree Planting event on Saturday.',
  ]);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNotice.trim()) {
      setActiveNotices([adminNotice.trim(), ...activeNotices]);
      setAdminNotice('');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
      }, 3000);
    }
  };

  // 1. GUEST BANNER
  if (!user) {
    return (
      <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 font-bold mb-2">URBANPULSE PORTAL ACCESS</Badge>
            <h3 className="text-lg font-bold text-foreground">Unlock Personalized Dashboard Portals</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Register or sign in with our demo credentials to access the <strong>Administrator Console</strong> (management tools & broadcast controls) or the <strong>Community Hub</strong> (citizen reports & feedback).
            </p>
          </div>
          <div className="flex gap-2.5">
            <div className="text-xs font-mono bg-card border border-border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Full Demo Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. ADMIN PORTAL PANEL
  if (isAdmin) {
    return (
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
    );
  }

  // 3. COMMUNITY USER PANEL
  if (isCommunityUser) {
    return (
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
    );
  }

  return null;
}
