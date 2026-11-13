"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardMock } from '@/components/dashboard-mock'
import { ArrowRight, Sparkles, Play } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="animate-float-up inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t.heroBadge}
          </span>

          <h1 className="animate-float-up mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {t.heroTitle}
          </h1>

          <p className="animate-float-up mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.heroSubtitle}
          </p>

          <div className="animate-float-up mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t.startForFree}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-border bg-card/40 text-foreground hover:bg-card">
                <Play className="h-4 w-4" />
                {t.watchDemo}
              </Button>
            </Link>
          </div>

          <p className="animate-float-up mt-4 text-xs text-muted-foreground">
            {t.heroFootnote}
          </p>
        </div>

        <div className="animate-float-up mx-auto mt-14 max-w-4xl">
          <DashboardMock />
        </div>
      </div>
    </section>
  )
}