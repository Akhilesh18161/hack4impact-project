'use client'

import { Activity, Bell, LogIn, Menu, X } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { AuthModal } from './auth-modal'
import { ProfileDropdown } from './profile-dropdown'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

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
    if (isAdmin) {
      navLinks.push({ name: 'Admin Portal', href: '/admin' })
    } else {
      navLinks.push({ name: 'Community Portal', href: '/community' })
    }
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                </Button>
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
