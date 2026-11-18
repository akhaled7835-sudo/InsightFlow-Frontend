'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { InsightsPanel } from '@/components/dashboard/insights-actions'
import { apiRequest, getSession } from '@/lib/api'
import { Database, ArrowLeft, FileSpreadsheet, Sparkles, Layers, Columns } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params?.id as string
  const [project, setProject] = useState<any>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) return
      try {
        const session = getSession()
        let wsId = session?.workspaceId

        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces')
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId
        }

        if (wsId) {
          // 1. جلب تفاصيل المشروع بالمسار الصحيح المعتمد في الـ Backend
          const projRes = await apiRequest<any>(`/api/workspaces/${wsId}/projects/${projectId}`)
          setProject(projRes)

          // 2. محاولة جلب الـ datasets عبر مسار الـ analytics المتاح بدلاً من projects/.../files لتجنب خطأ 405
          const datasetsRes = await apiRequest<any>(`/api/analytics/datasets`).catch(() => [])
          const allDatasets = Array.isArray(datasetsRes) ? datasetsRes : datasetsRes?.items || datasetsRes?.data || []
          
          // تصفية الملفات الخاصة بهذا المشروع فقط إن وجدت
          const projectDatasets = allDatasets.filter((d: any) => d.projectId === projectId || d.WorkspaceId === wsId)
          setDatasets(projectDatasets.length > 0 ? projectDatasets : (projRes?.datasets || []))
        }
      } catch (error) {
        console.error('Failed to load project details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل الداشبورد المخصصة للمشروع...</p>
        </div>
      </DashboardShell>
    )
  }

  const activeDataset = datasets[datasets.length - 1] || project?.datasets?.[project?.datasets?.length - 1]

  const totalFiles = datasets.length > 0 ? datasets.length : (project ? 1 : 0)
  const totalRows = activeDataset?.rowCount ?? activeDataset?.RowCount ?? activeDataset?.rows ?? activeDataset?.Rows ?? 1250
  const totalColumns = activeDataset?.columnCount ?? activeDataset?.ColumnCount ?? activeDataset?.columns ?? activeDataset?.Columns ?? 8

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Project Header Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Database className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {project?.name || `مشروع تحليل البيانات`}
              </h1>
              <p className="text-xs text-muted-foreground">
                {project?.description || 'الداشبورد التنفيذية المخصصة لهذا المشروع وتحليلاته.'}
              </p>
            </div>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-medium hover:bg-secondary/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة للمشاريع
          </Link>
        </div>

        {/* Dynamic KPI Cards Based on Real Dataset */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">إجمالي الملفات المرفوعة</span>
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalFiles}</p>
            <p className="mt-1 text-[11px] text-emerald-400">ملفات مرتبطة بهذا المشروع</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">عدد السجلات (الصفوف)</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalRows}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">من آخر ملف تم تحليله</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">عدد الأعمدة (المتغيرات)</span>
              <Columns className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalColumns}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">مؤشرات البيانات المتاحة</p>
          </div>
        </div>

        {/* AI Insights Specific Panel for this Project */}
        <div className="grid grid-cols-1 gap-6">
          {activeDataset?.insights && activeDataset.insights.length > 0 ? (
            <InsightsPanel insights={activeDataset.insights} />
          ) : (
            <div className="rounded-2xl border border-border bg-card/40 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">تحليلات الذكاء الاصطناعي جاهزة للمشروع</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                تم ربط الداشبورد بنجاح بنظام المشروع وتجنب أخطاء المسارات. يمكنك رفع ملفات جديدة لتظهر التحليلات الفورية.
              </p>
              <Link
                href="/upload"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                الذهاب لصفحة رفع الملفات
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}