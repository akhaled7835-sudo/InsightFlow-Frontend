'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Upload, FileBarChart, Globe, Plus } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function InsightsPanel() {
  const { t } = useTranslation()
  const insights = [
    { icon: TrendingUp, tone: 'text-emerald-400', bg: 'bg-emerald-500/15', title: t.cap1Title, body: t.cap1Body },
    { icon: Lightbulb, tone: 'text-primary', bg: 'bg-primary/15', title: t.cap2Title, body: t.cap2Body },
    { icon: AlertTriangle, tone: 'text-amber-400', bg: 'bg-amber-500/15', title: t.cap3Title, body: t.cap3Body },
  ]

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-tight">{t.aiEngineCap}</h3>
          <p className="text-xs text-muted-foreground">{t.connectedDotnet}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${insight.bg} ${insight.tone}`}>
              <insight.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickActions() {
  const { t } = useTranslation()
  const actions = [
    { label: t.uploadData, href: '/upload', icon: Upload },
    { label: t.generateReport, href: '/upload', icon: FileBarChart },
    { label: t.newProjectBtn, href: '/upload', icon: Plus },
    { label: t.switchLanguage, href: '/dashboard', icon: Globe },
  ]

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold tracking-tight">{t.quickActions}</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <Link
            key={i}
            href={a.href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background/40 py-5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <a.icon className="h-5 w-5" />
            </span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}