'use client'

import { Activity, Globe, Bell } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function DashboardHeader() {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kathmandu',
        })
      )
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Kathmandu',
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105">
              <Activity className="size-4 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none tracking-tight text-foreground">
                UrbanPulse
              </h1>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                Sustainable Cities Dashboard
              </p>
            </div>
          </div>

          {/* Center badge */}
          <div className="hidden items-center gap-2 md:flex">
            <Globe className="size-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Urban Monitor</span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary text-[10px] px-2 py-0 h-5"
            >
              LIVE
            </Badge>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Kathmandu time */}
            {time && (
              <div className="hidden items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 sm:flex">
                <div className="size-1.5 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-mono text-foreground">{time}</span>
                <span className="text-[10px] text-muted-foreground">KTM</span>
                <span className="ml-1 text-[10px] text-muted-foreground">{date}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-90"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
