'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileSpreadsheet, ArrowUpRight, FolderKanban } from 'lucide-react'
import { apiRequest, getSession } from '@/lib/api'

export function RecentProjects() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; description?: string; status?: string }>>([])
  const [loading, setLoading] = useState(true)

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
          <h3 className="text-base font-semibold tracking-tight">Workspace Projects</h3>
          <p className="text-sm text-muted-foreground">Live projects connected to your API</p>
        </div>
        <Link href="/upload" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          New upload <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {loading && <p className="text-xs text-muted-foreground">Loading projects...</p>}
        {!loading && projects.length === 0 && (
          <p className="text-xs text-muted-foreground">No projects yet. Go to Upload to create your first project.</p>
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
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Data Pipeline & Quotas</h3>
          <p className="text-sm text-muted-foreground">Supported formats & daily limits</p>
        </div>
        <Link href="/upload" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Upload file <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-foreground">Excel (.xlsx) & CSV (.csv)</span>
          </div>
          <span className="text-muted-foreground">Auto-cleaned</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <span className="text-muted-foreground">Demo Account Quota</span>
          <span className="font-medium text-amber-300">1 file / 30-min session</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
          <span className="text-muted-foreground">Standard Account Quota</span>
          <span className="font-medium text-primary">3 files / day</span>
        </div>
      </div>
    </div>
  )
}
