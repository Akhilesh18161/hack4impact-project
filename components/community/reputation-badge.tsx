'use client'

import { ContributorBadge } from '@/lib/community-data'
import { cn } from '@/lib/utils'
import { Star, Zap, Trophy, Crown } from 'lucide-react'

interface ReputationBadgeProps {
  badge: ContributorBadge
  score?: number
  size?: 'xs' | 'sm'
  className?: string
}

const BADGE_CONFIG: Record<
  ContributorBadge,
  { label: string; Icon: React.ElementType; cls: string }
> = {
  'New Contributor': {
    label: 'New',
    Icon: Star,
    cls: 'bg-slate-500/10 text-slate-500 border-slate-400/20',
  },
  'Active Contributor': {
    label: 'Active',
    Icon: Zap,
    cls: 'bg-blue-500/10 text-blue-500 border-blue-400/20',
  },
  'Top Contributor': {
    label: 'Top',
    Icon: Trophy,
    cls: 'bg-amber-500/10 text-amber-600 border-amber-400/20',
  },
  'Community Leader': {
    label: 'Leader',
    Icon: Crown,
    cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
  },
}

export function ReputationBadge({ badge, score, size = 'xs', className }: ReputationBadgeProps) {
  const { label, Icon, cls } = BADGE_CONFIG[badge]
  const isXs = size === 'xs'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold leading-none',
        isXs ? 'px-1.5 py-[3px] text-[9px]' : 'px-2 py-1 text-[11px]',
        cls,
        className,
      )}
    >
      <Icon className={isXs ? 'size-2.5' : 'size-3'} />
      {label}
      {score !== undefined && (
        <span className="opacity-60 font-normal">· {score}</span>
      )}
    </span>
  )
}
