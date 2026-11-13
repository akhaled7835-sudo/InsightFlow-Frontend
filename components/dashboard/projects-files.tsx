'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileSpreadsheet, ArrowUpRight, FolderKanban } from 'lucide-react'
import { apiRequest, getSession } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export function RecentProjects() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; description?: string; status?: string }>>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      const session = getSession()
      try {
        const wsList = await apiRequest<any[]>('/api/workspaces')
        const wsId = wsList?.[0]?.id || wsList?.[0]?.workspaceId || session?.workspaceId
        if (wsId) {
          const list = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`)
          if (Array.isArray(list)) {
            setProjects(
              list.map((p) => ({
                id: p.id || p.projectId,
                name: p.name || 'Workspace Project',
                description: p.description || 'Active analytics project',
                status: p.status || 'Active',
              }))
            )
          }
        }
      } catch {
        if (session?.defaultProjectId) {
          setProjects([
            {
              id: session.defaultProjectId,
              name: 'Demo Analytics Project',
              description: 'Pre-configured 30-minute sandbox project',
              status: 'Active',
            },
          ])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{t.workspaceProjects}</h3>
          <p className="text-sm text-muted-foreground">{t.liveProjectsApi}</p>
        </div>
        <Link href="/upload" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {t.newUpload} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {loading && <p className="text-xs text-muted-foreground">{t.loadingProjects}</p>}
        {!loading && projects.length === 0 && (
          <p className="text-xs text-muted-foreground">{t.noProjectsYet}</p>
        )}
        {projects.map((p) => (
          <Link
            key={p.id}
            href="/upload"
            className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/30"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FolderKanban className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <span className="shrink-0 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                  {p.status}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function RecentFiles() {
  const { t } = useTranslation()
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{t.dataPipelineQuotas}</h3>
          <p className="text-sm text-muted-foreground">{t.supportedFormatsLimits}</p>
        </div>
        <Link href="/upload" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {t.uploadFile} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-foreground">Excel (.xlsx) &amp; CSV (.csv)</span>
          </div>
          <span className="text-muted-foreground">{t.autoCleaned}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <span className="text-muted-foreground">{t.demoAccountQuota}</span>
          <span className="font-medium text-amber-300">{t.demoQuotaVal}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <span className="text-muted-foreground">{t.standardAccountQuota}</span>
          <span className="font-medium text-primary">{t.standardQuotaVal}</span>
        </div>
      </div>
    </div>
  )
}