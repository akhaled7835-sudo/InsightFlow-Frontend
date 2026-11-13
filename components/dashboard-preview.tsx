"use client"

import { DashboardMock } from '@/components/dashboard-mock'
import { Check } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function DashboardPreview() {
  const { t } = useTranslation()
  const points = [t.dashPrevPt1, t.dashPrevPt2, t.dashPrevPt3]

  return (
    <section id="dashboard" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <DashboardMock />
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-medium text-primary">{t.dashboard}</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.dashPrevTitle}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {t.dashPrevSubtitle}
            </p>

            <ul className="mt-8 space-y-4">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}