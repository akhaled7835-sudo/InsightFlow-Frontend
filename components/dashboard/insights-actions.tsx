'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Upload, FileBarChart, Globe, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export interface AIInsightItem {
  type?: string
  title: string
  description: string
  severity?: string
}

interface InsightsPanelProps {
  insights?: AIInsightItem[]
}

export function InsightsPanel({ insights = [] }: InsightsPanelProps) {
  const { t } = useTranslation()

  // Fallback default insights if none provided from backend
  const displayInsights = insights.length > 0 ? insights.slice(0, 4) : [
    { 
      type: 'positive', 
      title: t.cap1Title || 'Dataset successfully profiled', 
      description: t.cap1Body || 'AI engine ready to analyze columns, KPIs, and generate executive reports.', 
      severity: 'positive' 
    },
    { 
      type: 'info', 
      title: t.cap2Title || 'Executive Dashboards Available', 
      description: t.cap2Body || 'Export professional PDF and Excel reports with automated charts and summaries.', 
      severity: 'info' 
    },
    { 
      type: 'warning', 
      title: t.cap3Title || 'Data Quality Check', 
      description: t.cap3Body || 'Ensure all numerical columns are formatted properly before final exporting.', 
      severity: 'warning' 
    },
  ]

  // Helper to pick icon and tone based on severity or type
  const getInsightStyle = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'positive':
        return { icon: TrendingUp, tone: 'text-emerald-400', bg: 'bg-emerald-500/15' }
      case 'warning':
      case 'critical':
        return { icon: AlertTriangle, tone: 'text-amber-400', bg: 'bg-amber-500/15' }
      case 'error':
        return { icon: AlertCircle, tone: 'text-rose-400', bg: 'bg-rose-500/15' }
      default:
        return { icon: Lightbulb, tone: 'text-primary', bg: 'bg-primary/15' }
    }
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">{t.aiEngineCap || 'AI Analytical Insights'}</h3>
            <p className="text-xs text-muted-foreground">{t.connectedDotnet || 'Powered by .NET & AI Intelligence'}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {displayInsights.length} Active
        </span>
      </div>
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {displayInsights.map((insight, i) => {
          const style = getInsightStyle(insight.severity)
          const IconComponent = style.icon

          return (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3.5 transition-all hover:border-primary/30">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.tone}`}>
                <IconComponent className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{insight.title}</p>
                  {insight.severity && (
                    <span className="shrink-0 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {insight.severity}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{insight.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function QuickActions() {
  const { t } = useTranslation()
  const actions = [
    { label: t.uploadData || 'Upload Dataset', href: '/upload', icon: Upload },
    { label: t.generateReport || 'Export Report', href: '/dashboard', icon: FileBarChart },
    { label: t.newProjectBtn || 'New Project', href: '/upload', icon: Plus },
    { label: t.switchLanguage || 'Change Language', href: '/dashboard', icon: Globe },
  ]

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold tracking-tight">{t.quickActions || 'Quick Actions'}</h3>
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