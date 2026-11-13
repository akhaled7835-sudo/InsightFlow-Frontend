'use client'

import { Upload, Sparkles, UserPlus, FileCheck, GitBranch } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

const activity = [
  { icon: Sparkles, tone: 'text-primary bg-primary/15', who: 'AI Engine', what: 'generated the Q3 Revenue Analysis report', when: '2 min ago' },
  { icon: Upload, tone: 'text-success bg-success/15', who: 'Sarah Chen', what: 'uploaded q3_sales_report.xlsx', when: '18 min ago' },
  { icon: FileCheck, tone: 'text-primary bg-primary/15', who: 'System', what: 'cleaned and validated 12,480 rows', when: '1 hour ago' },
  { icon: UserPlus, tone: 'text-warning bg-warning/15', who: 'Marcus Lee', what: 'joined the Growth workspace', when: '3 hours ago' },
  { icon: GitBranch, tone: 'text-muted-foreground bg-secondary', who: 'Priya Patel', what: 'updated the Churn Model pipeline', when: 'Yesterday' },
]

export function ActivityTimeline() {
  const { t } = useTranslation()
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">{t.activityTimeline}</h3>
        <button className="text-sm font-medium text-primary hover:underline">{t.viewAll}</button>
      </div>
      <div className="relative">
        <span aria-hidden="true" className="absolute bottom-2 start-[18px] top-2 w-px bg-border" />
        <ul className="space-y-4">
          {activity.map((a) => (
            <li key={a.who + a.what} className="relative flex gap-4">
              <span className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${a.tone}`}>
                <a.icon className="h-4 w-4" />
              </span>
              <div className="pt-1">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{a.who}</span>{' '}
                  <span className="text-muted-foreground">{a.what}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}