'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trophy, ShieldAlert, TrendingUp } from 'lucide-react'
import { authClient, UserProfile } from '@/lib/auth-client'
import Link from 'next/link'

export function RightSidebar() {
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    authClient.getAllUsers().then(setUsers)
  }, [])

  return (
    <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4">
      {/* Community Stats */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Community Pulse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <Link href="/community/members" className="flex flex-col group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <span className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{users.length}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Citizens</span>
            </Link>
            <Link href="/community/resolved" className="flex flex-col group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <span className="text-2xl font-black text-primary">0</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Issues Solved</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Online Administrators */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="size-4 text-rose-500" />
            Online Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {users.filter(u => u.role === 'admin').length > 0 ? (
              users.filter(u => u.role === 'admin').map((admin, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-gradient-to-br from-destructive to-rose-600 flex items-center justify-center text-xs font-bold text-white shadow-sm relative">
                      {admin.fullName.charAt(0).toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 border-2 border-card rounded-full" title="Online"></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{admin.fullName}</span>
                      <span className="text-[10px] text-green-500 font-medium tracking-wider">🟢 Online</span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No administrators are currently online.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Top Contributors (Accounts Created) */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="size-4 text-yellow-500" />
            Registered Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {users.map((user, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{user.fullName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {user.role === 'admin' ? 'Admin' : 'Citizen'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <ShieldAlert className="size-4" />
            Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
            <li>Be respectful and constructive.</li>
            <li>No hate speech or harassment.</li>
            <li>Post relevant civic and local issues.</li>
            <li>Search before posting duplicates.</li>
          </ul>
        </CardContent>
      </Card>
    </aside>
  )
}
