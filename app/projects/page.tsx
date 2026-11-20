'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Plus, ArrowRight, Clock, Database, Building2 } from 'lucide-react'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

interface ProjectItem {
  id: string
  name: string
  description?: string
  createdAt?: string
}

export default function ProjectsPage() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    canAnalyzeAndUpload,
    loading: roleLoading,
  } = useWorkspaceRole()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (roleLoading) return

    async function fetchProjects() {
      setLoading(true)
      try {
        const session = getSession()
        let wsId = activeWorkspaceId || session?.workspaceId

        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces')
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId
        }

        if (wsId) {
          const projList = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`)
          if (Array.isArray(projList)) {
            const mapped = projList.map((p) => ({
              id: p.id || p.projectId,
              name: p.name || 'مشروع بدون عنوان',
              description: p.description,
              createdAt: p.createdAt,
            }))
            setProjects(mapped)
          } else {
            setProjects([])
          }
        } else {
          const res = await apiRequest<any>('/api/projects')
          setProjects(Array.isArray(res) ? res : res?.items || [])
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [activeWorkspaceId, roleLoading])

  return (
    <DashboardShell activeItem="projects">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">المشاريع وتحليلات البيانات</h1>
              {activeWorkspace?.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {activeWorkspace.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة مشاريعك وملفاتك وتحليلات الذكاء الاصطناعي المرتبطة بمساحة العمل الحالية.
            </p>
          </div>
          {canAnalyzeAndUpload && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              مشروع أو ملف جديد
            </Link>
          )}
        </div>

        {/* Loading & Projects Grid */}
        {loading || roleLoading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card/40">
            <p className="animate-pulse text-sm text-muted-foreground">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/40 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FolderKanban className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold">لا توجد مشاريع مضافة في هذا القسم حالياً</h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              {canAnalyzeAndUpload
                ? 'قم برفع أول ملف بيانات أو إنشاء مشروع داخل مساحة العمل الحالية لكي يبدأ محرك الذكاء الاصطناعي بتحليله.'
                : 'لم يقم فريق العمل بإضافة أي مشاريع في هذه المساحة بعد.'}
            </p>
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                رفع ملف بيانات الآن
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Database className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      نشط
                    </span>
                  </div>
                  <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {project.description || 'مساحة عمل مخصصة لتحليل الملفات والتقارير التنفيذية.'}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    عرض الداشبورد
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}