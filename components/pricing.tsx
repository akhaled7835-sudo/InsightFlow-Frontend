"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Pricing() {
  const { t } = useTranslation()
  const plans = [
    {
      name: t.planStarter,
      price: '$0',
      period: '/mo',
      description: t.planStarterDesc,
      features: ['3 file uploads / day', '8 languages & RTL support', 'Automatic data cleaning', 'AI summaries'],
      cta: t.planStarterCta,
      highlighted: false,
    },
    {
      name: t.planPro,
      price: '$29',
      period: '/mo',
      description: t.planProDesc,
      features: ['Unlimited daily uploads', 'Up to 5M rows / file', 'Advanced AI insights & forecasts', 'Export PDF & Excel (.xlsx)'],
      cta: t.planProCta,
      highlighted: true,
    },
    {
      name: t.planEnt,
      price: t.planEntPrice,
      period: '',
      description: t.planEntDesc,
      features: ['SSO & SCIM', 'Role-based access control', 'SOC 2 & custom residency', 'Dedicated manager'],
      cta: t.planEntCta,
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{t.pricing}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.pricingTitle}</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t.pricingSubtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div key={i} className={`relative flex flex-col rounded-2xl border p-8 ${plan.highlighted ? 'border-primary bg-card shadow-2xl shadow-primary/20' : 'border-border bg-card'}`}>
              {plan.highlighted && (
                <span className="absolute -top-3 start-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {t.mostPopular}
                </span>
              )}
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <Link href="/login" className="mt-6">
                <Button className={`w-full ${plan.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                  {plan.cta}
                </Button>
              </Link>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}