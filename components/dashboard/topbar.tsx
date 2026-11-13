'use client'

import { Search, Menu, LogOut, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSession, getSession, API_BASE_URL, type AuthSession } from '@/lib/api'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslation } from '@/lib/i18n'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    setSession(getSession())
    // Pre-warm Render backend so file upload is instant
    fetch(`${API_BASE_URL}/swagger/index.html`, { mode: 'no-cors' }).catch(() => {})
  }, [])

  function handleLogout() {
    clearSession()
    router.push('/login')
  }

  const displayName = session?.fullName || session?.email || 'Workspace User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="h-10 w-full rounded-xl border border-border bg-card/60 ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ms-auto flex items-center gap-2.5">
        {session?.isDemo && (
          <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 sm:inline-flex">
            <Clock className="h-3.5 w-3.5" />
            {t.demoBadge}
          </span>
        )}

        <LanguageSwitcher />

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 py-1.5 ps-1.5 pe-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            {initials || 'IF'}
          </span>
          <span className="hidden text-start sm:block">
            <span className="block text-sm font-medium leading-tight">{displayName}</span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {session?.isDemo ? t.demoSession : t.proWorkspace}
            </span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          title={t.logout}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={t.logout}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}