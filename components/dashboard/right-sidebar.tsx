'use client'

import { Sparkles, Send, Zap, CalendarClock, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const suggestions = [
  'Summarize this month\u2019s revenue',
  'Which segment is churning fastest?',
  'Forecast Q4 sales',
]

const recommendations = [
  { title: 'Enable weekly digests', body: 'Auto-email KPI summaries every Monday.', tone: 'text-primary bg-primary/15' },
  { title: 'Connect Stripe', body: 'Sync live payment data for real-time revenue.', tone: 'text-success bg-success/15' },
  { title: 'Clean 3 datasets', body: 'Detected duplicates in recent uploads.', tone: 'text-warning bg-warning/15' },
]

const reports = [
  { name: 'Weekly KPI Digest', when: 'Mon, 9:00 AM', tag: 'Recurring' },
  { name: 'Q4 Forecast', when: 'Oct 1', tag: 'Scheduled' },
  { name: 'Churn Deep-Dive', when: 'Oct 5', tag: 'Draft' },
]

export function RightSidebar() {
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* AI assistant */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border bg-primary/10 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
            </p>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-xl rounded-tl-sm bg-secondary p-3 text-sm leading-relaxed">
            Hi Sarah! Revenue is up{' '}
            <span className="font-medium text-success">18.2%</span> this month. Want me
            to break down what drove the growth?
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setValue(s)}
                className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask anything about your data..."
              className="h-11 w-full rounded-xl border border-border bg-background/60 pl-4 pr-11 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* recommendations */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Recommendations</h3>
        </div>
        <div className="space-y-2">
          {recommendations.map((r) => (
            <button
              key={r.title}
              className="flex w-full items-start gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/30"
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${r.tone}`}>
                <Zap className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
              <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* upcoming reports */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Upcoming Reports</h3>
        </div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.when}</p>
              </div>
              <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                {r.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
