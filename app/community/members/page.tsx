'use client'

import React, { useEffect, useState } from 'react'
import { authClient, UserProfile } from '@/lib/auth-client'

export default function MembersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    authClient.getAllUsers().then(setUsers)
  }, [])

  return (
    <div className="flex min-h-[80vh] flex-col p-8">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Community Members</h1>
      <p className="text-muted-foreground mt-3 max-w-lg">
        Meet the citizens and administrators driving change in UrbanPulse.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map((user, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex items-center gap-4">
            <div className={`size-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${
              user.role === 'admin' ? 'bg-gradient-to-br from-destructive to-rose-600' : 'bg-gradient-to-br from-primary to-emerald-600'
            }`}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{user.role === 'admin' ? 'Admin' : 'Citizen'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
