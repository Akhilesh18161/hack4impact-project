'use client'

import React from 'react'

export default function ProfilePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Profile</h1>
      <p className="text-muted-foreground mt-3 max-w-lg">
        Manage your public profile, activity history, and contributions to the UrbanPulse community.
      </p>
      <div className="mt-8 rounded-xl border border-border/50 bg-card p-6 shadow-sm max-w-md w-full">
        <p className="text-sm font-medium text-muted-foreground">Placeholder for Profile content.</p>
      </div>
    </div>
  )
}
