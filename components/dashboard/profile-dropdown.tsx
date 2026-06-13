'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import {
  User,
  Settings,
  LayoutDashboard,
  Bell,
  HelpCircle,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function ProfileDropdown() {
  const { user, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!user) return null

  // Generate initials from full name
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const menuItems = [
    {
      icon: User,
      label: 'Account',
      action: () => {
        router.push('/account')
        setOpen(false)
      },
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        router.push('/settings')
        setOpen(false)
      },
    },
    {
      icon: LayoutDashboard,
      label: isAdmin ? 'Admin Dashboard' : 'Community Dashboard',
      action: () => {
        router.push(isAdmin ? '/admin' : '/community')
        setOpen(false)
      },
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        router.push('/support')
        setOpen(false)
      },
    },
  ]

  return (
    <div className="relative ml-1 pl-1 border-l border-border/50" ref={containerRef}>
      {/* ── Avatar Button ── */}
      <button
        id="profile-avatar-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Circular avatar */}
        <div className="relative">
          <div
            className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white shadow-lg ring-2 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl ${
              isAdmin
                ? 'from-destructive to-rose-700 ring-destructive/30 group-hover:ring-destructive/60 shadow-destructive/25 group-hover:shadow-destructive/40'
                : 'from-primary to-emerald-600 ring-primary/30 group-hover:ring-primary/60 shadow-primary/25 group-hover:shadow-primary/40'
            }`}
          >
            {initials}
          </div>

          {/* Role badge dot */}
          <div
            className={`absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-background shadow-sm ${
              isAdmin ? 'bg-destructive' : 'bg-primary'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="size-2.5 text-white" />
            ) : (
              <UserCheck className="size-2.5 text-white" />
            )}
          </div>
        </div>
      </button>

      {/* ── Dropdown Menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-[9999] mt-2.5 w-64"
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-2xl shadow-black/25 backdrop-blur-2xl">

              {/* ── User Info Header ── */}
              <div
                className={`relative overflow-hidden border-b border-border/50 px-4 py-3.5 ${
                  isAdmin
                    ? 'bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent'
                    : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'
                }`}
              >
                {/* Subtle glow orb */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-30 ${
                    isAdmin ? 'bg-destructive' : 'bg-primary'
                  }`}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white shadow-md ${
                      isAdmin ? 'from-destructive to-rose-700' : 'from-primary to-emerald-600'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight text-foreground">
                      {user.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-1.5">
                      <Badge
                        className={`h-4 border-none px-1.5 text-[9px] font-bold ${
                          isAdmin
                            ? 'bg-destructive/15 text-destructive hover:bg-destructive/20'
                            : 'bg-primary/15 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="mr-0.5 size-2.5" />
                        ) : (
                          <UserCheck className="mr-0.5 size-2.5" />
                        )}
                        {isAdmin ? 'Administrator' : 'Community Member'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Menu Items ── */}
              <div className="p-1.5">
                {menuItems.map((item, idx) => (
                  <button
                    key={item.label}
                    role="menuitem"
                    onClick={item.action}
                    className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-all duration-150 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
                  >
                    <item.icon className="size-4 text-muted-foreground transition-colors group-hover/item:text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Divider + Logout ── */}
              <div className="border-t border-border/50 p-1.5">
                <button
                  role="menuitem"
                  onClick={async () => {
                    setOpen(false)
                    await signOut()
                    router.push('/')
                  }}
                  className="group/logout flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-destructive transition-all duration-150 hover:bg-destructive/10 active:scale-[0.98]"
                >
                  <LogOut className="size-4 transition-transform duration-200 group-hover/logout:-translate-x-0.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
