'use client'

import { DollarSign, Users, FileSpreadsheet, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 80
  const h = 32
  const step = w / (points.length - 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = h - ((p - min) / range) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={path} fill="none" stroke={up ? '#10b981' : '#ef4444'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function KpiCards() {
  const { t } = useTranslation()
  const kpis = [
    { label: t.revenue, value: '$284.5K', delta: '+18.2%', up: true, icon: DollarSign, spark: [30, 45, 38, 55, 48, 70, 82] },
    { label: t.activeUsers, value: '12,480', delta: '+9.4%', up: true, icon: Users, spark: [40, 42, 50, 48, 60, 65, 72] },
    { label: t.uploadedFiles, value: '1,842', delta: '+24.1%', up: true, icon: FileSpreadsheet, spark: [20, 35, 30, 50, 65, 60, 88] },
    { label: t.aiReports, value: '536', delta: '-3.2%', up: false, icon: Sparkles, spark: [70, 62, 68, 55, 60, 50, 48] },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="glass animate-float-up rounded-2xl p-5" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <kpi.icon className="h-5 w-5" />
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-success' : 'text-destructive'}`}>
              {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {kpi.delta}
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{kpi.label}</p>
            </div>
            <Sparkline points={kpi.spark} up={kpi.up} />
          </div>
        </div>
      ))}
    </div>
  )
}