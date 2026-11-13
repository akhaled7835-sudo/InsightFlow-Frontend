"use client"

import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function AiInsights() {
  const { t } = useTranslation()
  const insights = [
    { icon: TrendingUp, tone: 'text-success', bg: 'bg-success/15', title: t.aiCard1Title, body: t.aiCard1Body },
    { icon: AlertTriangle, tone: 'text-warning', bg: 'bg-warning/15', title: t.aiCard2Title, body: t.aiCard2Body },
    { icon: Lightbulb, tone: 'text-primary', bg: 'bg-primary/15', title: t.aiCard3Title, body: t.aiCard3Body },
  ]

  return (
    <section id="insights" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t.aiBadge}
              </span>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.aiTitle}
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                {t.aiSubtitle}
              </p>
              <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">{t.youAsked}</p>
                <p className="mt-1 text-sm font-medium">{t.sampleQuestion}</p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${insight.bg} ${insight.tone}`}>
                    <insight.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}