'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
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

const ROLE_LABELS: Record<string, string> = {
  Owner: 'مالك المساحة',
  Admin: 'مدير النظام',
  Analyst: 'محلل بيانات',
  Viewer: 'مشاهد فقط',
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

  const [projects, setProjects] = useState<WorkspaceProject[]>([])
  const [datasets, setDatasets] = useState<WorkspaceDataset[]>([])
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([])
  const [loading, setLoading] = useState(true)

  const session = getSession()
  const displayName = session?.fullName || (session as any)?.name || 'مرحباً بك'

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

        // 1. جلب مشاريع المساحة وأعضائها بالتوازي
        const [rawProjects, rawMembers] = await Promise.all([
          apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => []),
          apiRequest<any[]>(`/api/workspaces/${wsId}/members`).catch(() => []),
        ])

        const mappedProjects: WorkspaceProject[] = Array.isArray(rawProjects)
          ? rawProjects.map((p: any) => ({
              id: p.id || p.projectId,
              name: p.name || 'مشروع بدون عنوان',
              description: p.description,
              createdAt: p.createdAt,
            }))
          : []
        setProjects(mappedProjects)

        const mappedMembers: WorkspaceMemberItem[] = Array.isArray(rawMembers)
          ? rawMembers.map((m: any) => ({
              id: m.userId || m.id || m.email,
              name: m.fullName || m.userName || m.email?.split('@')[0] || 'عضو',
              email: m.email || '',
              role: m.role || 'Viewer',
            }))
          : []
        setMembers(mappedMembers)

        // 2. تجميع ملفات البيانات والرؤى المرتبطة بمشاريع هذا القسم
        const collectedDatasets: WorkspaceDataset[] = []
        for (const proj of mappedProjects) {
          const storageKey = `insightflow_project_files_${proj.id}`
          const cached = JSON.parse(localStorage.getItem(storageKey) || '[]')
          if (Array.isArray(cached) && cached.length > 0) {
            cached.forEach((ds: any) => {
              let rows = ds.rowCount ?? 0
              if (rows === 0 && Array.isArray(ds.insights)) {
                for (const ins of ds.insights) {
                  const m = ins.description?.match(/\((\d+)\s*صف\)/)
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
                  fileName: rf.fileName || rf.originalFileName || rf.name || 'ملف بيانات',
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

  return (
    <DashboardShell activeItem="Overview">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Welcome & Active Department Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-l from-primary/10 via-card/70 to-card/40 p-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Building2 className="h-3.5 w-3.5" />
                {activeWorkspace?.name || 'مساحة العمل الرئيسية'}
              </span>
              {role && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  صلاحيتك: {ROLE_LABELS[role] || role}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">أهلاً بك، {displayName}</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              نظرة عامة شاملة على مشاريع وبيانات وفريق عمل القسم المختار حالياً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                رفع ملف بيانات
              </Link>
            )}
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs font-semibold hover:bg-secondary/80"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              مركز التحليلات
            </Link>
          </div>
        </div>

        {/* Workspace KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">مشاريع القسم</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FolderKanban className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : projects.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">معزولة داخل هذا القسم</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">مصادر البيانات</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : datasets.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">ملفات Excel و CSV مرفوعة</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">السجلات المحللة</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Layers className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {loading ? '...' : totalRecords.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">إجمالي الصفوف المعالجة</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">أعضاء الفريق</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{loading ? '...' : members.length || 1}</p>
            <p className="mt-1 text-xs text-muted-foreground">صلاحيات مخصصة للقسم</p>
          </div>
        </div>

        {/* Recent Projects & Team Members */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Projects (7 cols) */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">أحدث المشاريع في القسم</h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                عرض الكل
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                جاري تحميل مشاريع القسم...
              </p>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
                <p className="text-sm font-medium">لا توجد مشاريع في هذا القسم بعد</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {canAnalyzeAndUpload
                    ? 'ابدأ بإنشاء مشروع ورفع ملف بيانات لتحليله فوراً.'
                    : 'لم يقم الفريق بإضافة مشاريع في هذا القسم حتى الآن.'}
                </p>
                {canAnalyzeAndUpload && (
                  <Link
                    href="/upload"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    إنشاء مشروع ورفع ملف
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
                          ? new Date(proj.createdAt).toLocaleDateString('ar-EG')
                          : 'نشط الآن'}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
                    >
                      الداشبورد
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Team Summary (5 cols) */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold">فريق عمل القسم</h2>
                </div>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  إدارة الفريق
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
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </div>
                ))}
                {!loading && members.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    أنت العضو النشط حالياً في هذه المساحة.
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
                دعوة أعضاء جدد للقسم
              </Link>
            )}
          </div>
        </div>

        {/* Latest AI Insights across the Workspace */}
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold">أحدث رؤى الذكاء الاصطناعي في هذا القسم</h2>
            </div>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              التحليلات المتقدمة
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestInsights.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {latestInsights.map((item, idx) => (
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
              <span>
                ستظهر هنا أهم المؤشرات والأنماط التي يكتشفها محرك الذكاء الاصطناعي تلقائياً عند رفع وتحليل الملفات في هذا القسم.
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}