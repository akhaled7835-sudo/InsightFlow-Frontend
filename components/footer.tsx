"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))] py-20">
        <div className="glass relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.footerCtaTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">{t.footerCtaSubtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t.startForFree}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-border bg-card/40 text-foreground hover:bg-card">
                {t.bookDemo}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))] pb-12">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-base font-semibold tracking-tight">InsightFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InsightFlow, Inc. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  )
}