'use client'

import { Bell, LogIn, Menu, X, CheckCircle2, MessageSquare, AlertTriangle, Activity, FileEdit, FileX, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { AuthModal } from './auth-modal'
import { ProfileDropdown } from './profile-dropdown'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { adminClient, Notification } from '@/lib/admin-data'

function getNotifIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('approved') || t.includes('resolved')) return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' }
  if (t.includes('rejected') || t.includes('removal') || t.includes('removed')) return { icon: FileX, color: 'text-destructive', bg: 'bg-destructive/10' }
  if (t.includes('modification') || t.includes('edit') || t.includes('change')) return { icon: FileEdit, color: 'text-amber-500', bg: 'bg-amber-500/10' }
  if (t.includes('verified') || t.includes('admin')) return { icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' }
  return { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationsPanel({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const data = await adminClient.getNotifications(userId)
    setNotifications(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadNotifications()
    // Poll every 30s for new notifications
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (id: string) => {
    await adminClient.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    await Promise.all(unread.map(n => adminClient.markNotificationRead(n.id)))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative size-9 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary animate-pulse" />
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2.5 w-80 overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-2xl shadow-black/25 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[340px] overflow-y-auto">
              {loading && notifications.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading…</div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                  <Bell className="size-8 opacity-20" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              )}
              {notifications.map((notif, i) => {
                const { icon: Icon, color, bg } = getNotifIcon(notif.title)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      i < notifications.length - 1 ? 'border-b border-border/30' : ''
                    } ${notif.isRead ? 'opacity-60 hover:bg-muted/30' : 'hover:bg-muted/50 bg-primary/5'}`}
                  >
                    <div className={`mt-0.5 shrink-0 rounded-full ${bg} p-1.5`}>
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold leading-snug">{notif.title}</p>
                        {!notif.isRead && <span className="shrink-0 size-1.5 rounded-full bg-primary mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border/50 bg-muted/10 p-2 flex items-center justify-between px-4">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Mark all as read
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">All caught up!</span>
              )}
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ClockWidget() {
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

  if (!time) return null

  return (
    <div className="hidden items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 lg:flex">
      <div className="size-1.5 animate-pulse rounded-full bg-primary" />
      <span className="text-xs font-mono text-foreground">{time}</span>
      <span className="text-[10px] text-muted-foreground">KTM</span>
      <span className="ml-1 text-[10px] text-muted-foreground">{date}</span>
    </div>
  )
}

function MobileClockWidget() {
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

  if (!time) return null

  return (
    <div className="px-4 flex items-center gap-2 text-sm text-muted-foreground">
      <div className="size-2 animate-pulse rounded-full bg-primary" />
      <span className="font-mono">{time}</span>
      <span>{date}</span>
      <span>KTM</span>
    </div>
  )
}

export function DashboardHeader() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { user, isAdmin } = useAuth()
  const pathname = usePathname()

  // For the active nav pill animation
  const navRef = useRef<HTMLElement>(null)
  const [activeTabStyle, setActiveTabStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useEffect(() => {
    // Small delay to ensure the DOM has updated
    setTimeout(() => {
      if (!navRef.current) return
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeLink) {
        setActiveTabStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1,
        })
      } else {
        setActiveTabStyle((prev) => ({ ...prev, opacity: 0 }))
      }
    }, 50)
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' },
    { name: 'Pulse', href: '/pulse' },
    { name: 'Community Hub', href: '/community-hub' },
    { name: 'About Us', href: '/about' },
  ]

  if (user) {
    // Only keeping main links in navbar. Profile dropdown handles portal navigation.
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left Section: Logo & Desktop Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-105">
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
              </Link>

              {/* Desktop Navigation Links */}
              <nav ref={navRef} className="relative hidden md:flex items-center gap-1">
                <motion.div
                  className="absolute bottom-0 top-0 -z-10 rounded-full bg-primary/10"
                  animate={activeTabStyle}
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      data-active={isActive}
                      className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Kathmandu time */}
              <ClockWidget />

              {/* Notification Icon (Auth Only) */}
              {user && (
                <NotificationsPanel userId={user.id} />
              )}

              <ThemeToggle />

              {/* Authentication Controls */}
              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="hidden sm:block ml-1">
                  <Button
                    onClick={() => setIsAuthOpen(true)}
                    variant="default"
                    size="sm"
                    className="h-9 gap-1.5 text-xs shadow-md shadow-primary/15 cursor-pointer"
                  >
                    <LogIn className="size-3.5" />
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-6 space-y-6">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                       <Link
                        key={link.name}
                        href={link.href}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                </nav>

                {!user && (
                 <div className="px-4">
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsAuthOpen(true)
                      }}
                      className="w-full justify-center gap-2"
                    >
                      <LogIn className="size-4" />
                      Sign In
                    </Button>
                  </div>
                )}

                <MobileClockWidget />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </header>
      <div className="h-16 shrink-0" />
    </>
  )
}
