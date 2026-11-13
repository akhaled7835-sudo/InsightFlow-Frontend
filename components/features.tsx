"use client"

import { UploadCloud, Wand2, LayoutDashboard, Gauge, Brain, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Features() {
  const { t } = useTranslation()
  const features = [
    { icon: UploadCloud, title: t.feat1Title, description: t.feat1Desc },
    { icon: Wand2, title: t.feat2Title, description: t.feat2Desc },
    { icon: LayoutDashboard, title: t.feat3Title, description: t.feat3Desc },
    { icon: Gauge, title: t.feat4Title, description: t.feat4Desc },
    { icon: Brain, title: t.feat5Title, description: t.feat5Desc },
    { icon: ShieldCheck, title: t.feat6Title, description: t.feat6Desc },
  ]

  return (
    <section id="features" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{t.features}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.featuresTitle}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}