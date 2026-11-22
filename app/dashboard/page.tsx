'use client'

import { useEffect, useState, useMemo } from 'react'
import { extractArabicTokens, formatLocalizedInsights } from '@/lib/insightTranslator'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
import {
  FolderKanban,
  FileSpreadsheet,
  Users,
  Sparkles,
  Upload,
  BarChart3,
  ArrowUpRight,
  Building2,
  Shield,
  Clock,
  Database,
  Layers,
  UserPlus,
  Activity,
} from 'lucide-react'

type WorkspaceProject = {
  id: string
  name: string
  description?: string
  createdAt?: string
}

type WorkspaceDataset = {
  projectId: string
  projectName: string
  datasetId: string
  fileName: string
  rowCount: number
  columnCount: number
  uploadedAt: string
  insights: Array<{ title: string; description: string }>
}

type WorkspaceMemberItem = {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    role,
    canAnalyzeAndUpload,
    canManageTeam,
    loading: roleLoading,
  } = useWorkspaceRole()
  const { t, lang } = useTranslation()

  const roleLabels: Record<string, string> = {
    Owner: t.roleOwner,
    Admin: t.roleAdmin,
    Analyst: t.roleAnalyst,
    Viewer: t.roleViewer,
  }

  const [projects, setProjects] = useState<WorkspaceProject[]>([])
  const [datasets, setDatasets] = useState<WorkspaceDataset[]>([])
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([])
  const [loading, setLoading] = useState(true)

  const session = getSession()
  const displayName = session?.fullName || (session as any)?.name || 'User'

  useEffect(() => {
    if (roleLoading) return

    async function loadWorkspaceOverview() {
      setLoading(true)
      try {
        let wsId = activeWorkspaceId || session?.workspaceId
        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId
        }

        if (!wsId || wsId === 'default') {
          setProjects([])
          setDatasets([])
          setMembers([])
          setLoading(false)
          return
        }

        const [rawProjects, rawMembers] = await Promise.all([
          apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => []),
          apiRequest<any[]>(`/api/workspaces/${wsId}/members`).catch(() => []),
        ])

        const mappedProjects: WorkspaceProject[] = Array.isArray(rawProjects)
          ? rawProjects.map((p: any) => ({
              id: p.id || p.projectId,
              name: p.name || 'Untitled Project',
              description: p.description,
              createdAt: p.createdAt,
            }))
          : []
        setProjects(mappedProjects)

        const mappedMembers: WorkspaceMemberItem[] = Array.isArray(rawMembers)
          ? rawMembers.map((m: any) => ({
              id: m.userId || m.id || m.email,
              name: m.fullName || m.userName || m.email?.split('@')[0] || 'Member',
              email: m.email || '',
              role: m.role || 'Viewer',
            }))
          : []
        setMembers(mappedMembers)

        const collectedDatasets: WorkspaceDataset[] = []
        for (const proj of mappedProjects) {
          const storageKey = `insightflow_project_files_${proj.id}`
          const cached = JSON.parse(localStorage.getItem(storageKey) || '[]')
          if (Array.isArray(cached) && cached.length > 0) {
            cached.forEach((ds: any) => {
              let rows = ds.rowCount ?? 0
              if (rows === 0 && Array.isArray(ds.insights)) {
                for (const ins of ds.insights) {
                  const m = ins.description?.match(/\((\d+)\s*(?:صف|rows|Zeilen)\)/)
                  if (m?.[1]) {
                    rows = Number(m[1])
                    break
                  }
                }
              }
              collectedDatasets.push({
                projectId: proj.id,
                projectName: proj.name,
                datasetId: ds.id,
                fileName: ds.name,
                rowCount: rows,
                columnCount: ds.columnCount ?? 0,
                uploadedAt: ds.uploadedAt || new Date().toISOString(),
                insights: ds.insights || [],
              })
            })
          } else {
            const remoteFiles = await apiRequest<any[]>(`/api/projects/${proj.id}/files`).catch(
              () => []
            )
            if (Array.isArray(remoteFiles)) {
              remoteFiles.forEach((rf: any) => {
                collectedDatasets.push({
                  projectId: proj.id,
                  projectName: proj.name,
                  datasetId: rf.datasetId || rf.id,
                  fileName: rf.fileName || rf.originalFileName || rf.name || 'Dataset',
                  rowCount: rf.rowCount ?? 0,
                  columnCount: rf.columnCount ?? 0,
                  uploadedAt: rf.uploadedAt || rf.createdAt || new Date().toISOString(),
                  insights: [],
                })
              })
            }
          }
        }

        collectedDatasets.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        setDatasets(collectedDatasets)
      } catch (error) {
        console.error('Failed to load workspace overview:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkspaceOverview()
  }, [activeWorkspaceId, roleLoading])

  const totalRecords = useMemo(
    () => datasets.reduce((acc, d) => acc + d.rowCount, 0),
    [datasets]
  )

  const [tokenDict, setTokenDict] = useState<Record<string, string>>({})
  const latestInsights = useMemo(() => {
    const all: Array<{ title: string; description: string; fileName: string; projectId: string }> = []
    datasets.forEach((ds) => {
      ds.insights.forEach((ins) => {
        if (!ins.title?.includes('اكتمال البيانات')) {
          all.push({
            title: ins.title,
            description: ins.description,
            fileName: ds.fileName,
            projectId: ds.projectId,
          })
        }
      })
    })
    return all.slice(0, 4)
  }, [datasets])

  useEffect(() => {
    if (lang === 'ar' || latestInsights.length === 0) {
      setTokenDict({})
      return
    }
    const tokens = extractArabicTokens(latestInsights)
    if (tokens.length === 0) return

    const cacheKey = `insightflow_all_tokens_${lang}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (cached && typeof cached === 'object') {
        setTokenDict(cached)
        return
      }
    } catch {
      // ignore
    }

    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate each short Arabic word/phrase in this array into language "${lang}". Return ONLY a valid JSON object {"original": "translation"}:\n${JSON.stringify(tokens)}`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const raw = (data?.reply || '').replace(/```json|```/g, '').trim()
        const s = raw.indexOf('{')
        const e = raw.lastIndexOf('}')
        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(raw.slice(s, e + 1))
          if (parsed && typeof parsed === 'object') {
            setTokenDict(parsed)
            localStorage.setItem(cacheKey, JSON.stringify(parsed))
          }
        }
      })
      .catch(() => null)
  }, [latestInsights, lang])

  const localizedLatestInsights = useMemo(() => {
    const translated = formatLocalizedInsights(latestInsights, lang, tokenDict)
    return latestInsights.map((item, idx) => ({
      ...item,
      title: translated[idx]?.title ?? item.title,
      description: translated[idx]?.description ?? item.description,
    }))
  }, [latestInsights, lang, tokenDict])

  return (
    <DashboardShell activeItem="overview">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Welcome & Active Department Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-l from-primary/10 via-card/70 to-card/40 p-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Building2 className="h-3.5 w-3.5" />
                {activeWorkspace?.name || t.proWorkspace}
              </span>
              {role && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  {t.yourRole}: {roleLabels[role] || role}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.welcomeUserPrefix} {displayName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t.dashOverviewDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                {t.uploadDataFile}
              </Link>
            )}
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs font-semibold hover:bg-secondary/80"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              {t.analyticsCenter}
            </Link>
          </div>
        </div>

        {/* Workspace KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.deptProjects}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FolderKanban className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : projects.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.isolatedInDept}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.dataSources}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : datasets.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.excelCsvUploaded}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.analyzedRecords}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Layers className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {loading ? '...' : totalRecords.toLocaleString(lang)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t.totalProcessedRows}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.teamMembersCard}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : members.length || 1}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.customDeptPermissions}</p>
          </div>
        </div>

        {/* Recent Projects & Team Members */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">{t.recentDeptProjects}</h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                {t.viewAll}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                {t.loadingDeptProjects}
              </p>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
                <p className="text-sm font-medium">{t.noProjectsInDept}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {canAnalyzeAndUpload ? t.startCreateProjectDesc : t.noProjectsViewerDesc}
                </p>
                {canAnalyzeAndUpload && (
                  <Link
                    href="/upload"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {t.createProjectUploadBtn}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 p-3.5 transition-colors hover:border-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{proj.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {proj.createdAt
                          ? new Date(proj.createdAt).toLocaleDateString(lang)
                          : t.activeNow}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
                    >
                      {t.openDashboard}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold">{t.deptTeamTitle}</h2>
                </div>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t.manageTeamBtn}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {members.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{m.email}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      {roleLabels[m.role] || m.role}
                    </span>
                  </div>
                ))}
                {!loading && members.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {t.activeMemberOnly}
                  </p>
                )}
              </div>
            </div>

            {canManageTeam && (
              <Link
                href="/team"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <UserPlus className="h-4 w-4" />
                {t.inviteMembersBtn}
              </Link>
            )}
          </div>
        </div>

        {/* Latest AI Insights across the Workspace */}
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold">{t.latestDeptAiInsights}</h2>
            </div>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {t.advancedAnalyticsBtn}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {localizedLatestInsights.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {localizedLatestInsights.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/projects/${item.projectId}`}
                  className="rounded-xl border border-border/70 bg-background/40 p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">{item.title}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {item.fileName}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 shrink-0 text-primary" />
              <span>{t.emptyInsightsBanner}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}