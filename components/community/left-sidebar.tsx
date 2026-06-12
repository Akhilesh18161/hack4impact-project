'use client'

import { 
  MessageSquare, TrendingUp, AlertCircle, Clock, 
  CheckCircle2, Bookmark, UserCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeftSidebarProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

export function LeftSidebar({ currentFilter, onFilterChange }: LeftSidebarProps) {
  const navItems = [
    { id: 'all', label: 'All Posts', icon: MessageSquare },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'high-priority', label: 'High Priority', icon: AlertCircle },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'solved', label: 'Solved Issues', icon: CheckCircle2 },
    { id: 'my-posts', label: 'My Posts', icon: UserCircle },
    { id: 'saved', label: 'Saved Posts', icon: Bookmark },
  ]

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col gap-2">
      <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">
          Navigation
        </h3>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentFilter === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
