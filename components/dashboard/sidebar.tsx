'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  FileSpreadsheet,
  Sparkles,
  Users,
  Settings,
  LifeBuoy,
  ChevronsUpDown,
  Check,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

const workspaces = [
  { name: 'Acme Analytics', plan: 'Enterprise' },
  { name: 'Northwind Co.', plan: 'Pro' },
  { name: 'Personal', plan: 'Starter' },
]

export function Sidebar({
  onClose,
  activeItem = 'overview',
}: {
  onClose?: () => void
  activeItem?: string
}) {
  const [wsOpen, setWsOpen] = useState(false)
  const [active, setActive] = useState(activeItem)
  const { t } = useTranslation()

  const nav = [
    { id: 'overview', label: t.overview, href: '/dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: t.analytics, href: '/dashboard', icon: BarChart3 },
    { id: 'projects', label: t.projects, href: '/dashboard', icon: FolderKanban, badge: '8' },
    { id: 'dataFiles', label: t.dataFiles, href: '/upload', icon: FileSpreadsheet },
    { id: 'aiReports', label: t.aiReports, href: '/upload', icon: Sparkles, badge: 'AI' },
    { id: 'team', label: t.team, href: '/dashboard', icon: Users },
  ]

  return (
    <div className="flex h-full flex-col gap-1 bg-card/40 p-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">InsightFlow</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <button
          onClick={() => setWsOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 p-3 text-start transition-colors hover:border-primary/40"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
            A
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">Acme Analytics</span>
            <span className="block text-xs text-muted-foreground">{t.proWorkspace}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
        {wsOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/40">
            {workspaces.map((ws, i) => (
              <button
                key={ws.name}
                onClick={() => setWsOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-secondary"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                  {ws.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{ws.name}</span>
                  <span className="block text-xs text-muted-foreground">{ws.plan}</span>
                </span>
                {i === 0 && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t.menuLabel}
        </p>
        {nav.map((item) => {
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/15 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-start">{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${
                    item.badge === 'AI'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Settings className="h-4 w-4" />
          {t.settings}
        </button>
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <LifeBuoy className="h-4 w-4" />
          {t.helpSupport}
        </button>
      </div>
    </div>
  )
}