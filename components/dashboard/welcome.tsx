'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Upload } from 'lucide-react'
import { getSession, type AuthSession } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export function Welcome() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const { t, lang } = useTranslation()

  useEffect(() => {
    setSession(getSession())
  }, [])

  const firstName = session?.fullName?.split(' ')[0] || ''
  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.welcomeBack}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          {session?.isDemo ? t.demoBanner : t.workspaceSubtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/upload"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          {t.uploadAnalyzeBtn}
        </Link>
        <Link
          href="/upload"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/60 px-4 text-sm font-medium transition-colors hover:border-primary/40"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          {t.insights}
        </Link>
      </div>
    </div>
  )
}