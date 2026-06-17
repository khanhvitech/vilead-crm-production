'use client'

import { Eye, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  MktPeriod,
  MktFacebookStatus,
  MktFanpageStatus,
  MktSoftwareFilter,
  MktUidSource,
} from './types'

export const PERIOD_OPTIONS: Array<{ value: MktPeriod; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
]

export function MainTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors',
        active
          ? 'border-[#3e79f7] text-[#3e79f7]'
          : 'border-transparent text-[#72849a] hover:border-[#e6ebf1] hover:text-[#455560]'
      )}
    >
      <span className={cn(active ? 'text-[#3e79f7]' : 'text-[#98a5b3] group-hover:text-[#72849a]')}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export function SubTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button variant={active ? 'default' : 'outline'} size="sm" onClick={onClick} className="h-8 px-3">
      {label}
    </Button>
  )
}

export function MetricCard({
  title,
  value,
  hint,
  tone = 'default',
  hintTone = 'muted',
}: {
  title: string
  value: string | number
  hint?: string
  tone?: 'default' | 'success' | 'danger' | 'warning'
  hintTone?: 'muted' | 'success' | 'danger'
}) {
  const toneClass =
    tone === 'success'
      ? 'text-[#2dc56a]'
      : tone === 'danger'
        ? 'text-[#ff6b72]'
        : tone === 'warning'
          ? 'text-[#ffc542]'
          : 'text-[#1a3353]'

  const hintClass =
    hintTone === 'success'
      ? 'text-[#2dc56a]'
      : hintTone === 'danger'
        ? 'text-[#ff6b72]'
        : 'text-[#72849a]'

  return (
    <Card className="border-[#eef2f6] shadow-none">
      <CardContent className="space-y-2 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#98a5b3]">{title}</div>
        <div className={cn('text-[34px] font-bold leading-none', toneClass)}>{value}</div>
        {hint ? <div className={cn('text-sm', hintClass)}>{hint}</div> : null}
      </CardContent>
    </Card>
  )
}

export function InfoCard({
  title,
  value,
  icon,
  accent = 'default',
}: {
  title: string
  value: ReactNode
  icon?: ReactNode
  accent?: 'default' | 'success' | 'danger'
}) {
  const valueClass =
    accent === 'success'
      ? 'text-[#2dc56a]'
      : accent === 'danger'
        ? 'text-[#ff6b72]'
        : 'text-[#1a3353]'

  return (
    <div className="rounded-[10px] border border-[#eef2f6] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-[#72849a]">{title}</div>
        {icon ? <div className="text-[#98a5b3]">{icon}</div> : null}
      </div>
      <div className={cn('mt-3 text-[20px] font-semibold leading-tight', valueClass)}>{value}</div>
    </div>
  )
}

export function CompactStatCard({
  title,
  lines,
}: {
  title: string
  lines: string[]
}) {
  return (
    <div className="rounded-[10px] border border-white bg-white/90 p-3 shadow-sm">
      <div className="mb-2 text-sm font-medium text-[#1a3353]">{title}</div>
      <div className="space-y-1 text-sm text-[#455560]">
        {lines.map(line => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  )
}

export function FilterChip({
  label,
}: {
  label: string
}) {
  return (
    <div className="rounded-full border border-[#e6ebf1] bg-white px-3 py-1 text-xs font-medium text-[#455560]">
      {label}
    </div>
  )
}

export function StatusBadge({
  kind,
  value,
  count,
}: {
  kind: 'facebook' | 'fanpage' | 'machine' | 'uid-source' | 'software'
  value: string
  count?: number
}) {
  if (kind === 'facebook') {
    const variant =
      value === 'live'
        ? 'success'
        : value === 'die'
          ? 'destructive'
          : value === 'inactive'
            ? 'outline'
            : 'warning'
    const label =
      value === 'live' ? 'Live' : value === 'die' ? 'Die' : value === 'inactive' ? 'Không hoạt động' : 'Checkpoint'

    return <Badge variant={variant}>{count === undefined ? label : `${label} (${count})`}</Badge>
  }

  if (kind === 'fanpage') {
    const fanpageValue = value as MktFanpageStatus
    const variant = fanpageValue === 'active' ? 'success' : fanpageValue === 'restricted' ? 'warning' : 'destructive'
    const label = fanpageValue === 'active' ? 'Hoạt động' : fanpageValue === 'restricted' ? 'Bị hạn chế' : 'Xóa'
    return <Badge variant={variant}>{label}</Badge>
  }

  if (kind === 'machine') {
    return <Badge variant={value === 'online' ? 'success' : 'outline'}>{value === 'online' ? 'Online' : 'Offline'}</Badge>
  }

  if (kind === 'uid-source') {
    const source = value as MktUidSource
    const variant = source === 'group' ? 'secondary' : source === 'page' ? 'warning' : source === 'friends' ? 'info' : 'outline'
    const label = source === 'group' ? 'Group' : source === 'page' ? 'Page' : source === 'friends' ? 'Bạn bè' : 'Khác'
    return <Badge variant={variant}>{label}</Badge>
  }

  const software = value as MktSoftwareFilter
  const variant =
    software === 'mkt-care'
      ? 'info'
      : software === 'mkt-post'
        ? 'secondary'
        : software === 'mkt-page'
          ? 'warning'
          : 'success'
  const label =
    software === 'mkt-care'
      ? 'MKT Care'
      : software === 'mkt-post'
        ? 'MKT Post'
        : software === 'mkt-page'
          ? 'MKT Page'
          : 'MKT UID'

  return <Badge variant={variant}>{label}</Badge>
}

export function TableActionButton({
  label = 'Xem',
  icon: Icon = Eye,
  onClick,
}: {
  label?: string
  icon?: LucideIcon
  onClick: () => void
}) {
  return (
    <Button variant="default" size="sm" onClick={onClick} className="h-8 px-3 shadow-none">
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}

export function PeriodSelect({
  value,
  onChange,
  className,
}: {
  value: MktPeriod
  onChange: (value: MktPeriod) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={nextValue => onChange(nextValue as MktPeriod)}>
      <SelectTrigger className={cn('w-[160px]', className)}>
        <SelectValue placeholder="Ngày" />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-[10px] border border-dashed border-[#d9e2ec] bg-[#fafbfc] px-4 py-10 text-center text-sm text-[#72849a]">
      {label}
    </div>
  )
}

export const overviewChartColors = {
  live: '#2dc56a',
  die: '#ff6b72',
  messages: '#3e79f7',
  posts: '#a461d8',
}

export const sourceChartColors = ['#3e79f7', '#a461d8', '#f59e0b', '#22c55e']
