'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { InsightsPanel } from '@/components/dashboard/insights-actions'
import { apiRequest } from '@/lib/api'
import { Database, ArrowLeft, FileSpreadsheet, Sparkles } from 'lucide-react'
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
        // 1. جلب تفاصيل المشروع
        const projRes = await apiRequest<any>(`/api/projects/${projectId}`)
        setProject(projRes)

        // 2. جلب الملفات والبيانات المرتبطة بهذا المشروع حصرياً
        const filesRes = await apiRequest<any[]>(`/api/projects/${projectId}/files`)
        if (Array.isArray(filesRes)) {
          setDatasets(filesRes)
        }
      } catch (error) {
        console.error('Failed to load project analytics:', error)
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
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل الداشبورد الخاصة بالمشروع...</p>
        </div>
      </DashboardShell>
    )
  }

  // أخذ أحدث ملف تم تحليله لهذا المشروع لعرض رؤى الذكاء الاصطناعي الخاصة به
  const activeDataset = datasets[datasets.length - 1]

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

        {/* Project Files Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/30 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <span>الملفات المرتبطة بهذا المشروع: <strong>{datasets.length} ملفات</strong></span>
          </div>
          {activeDataset && (
            <span className="text-emerald-400 font-medium">
              الصفوف المحللة: {activeDataset.rowCount || 'مفعل'} | الأعمدة: {activeDataset.columnCount || 'مفعل'}
            </span>
          )}
        </div>

        {/* KPI Cards */}
        <KpiCards />

        {/* Charts Section */}
        <ChartsSection />

        {/* AI Insights Specific Panel for this Project */}
        <div className="grid grid-cols-1 gap-6">
          {activeDataset?.insights && activeDataset.insights.length > 0 ? (
            <InsightsPanel insights={activeDataset.insights} />
          ) : (
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">رؤى الذكاء الاصطناعي للمشروع</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                لا توجد رؤى مسجلة لهذا الملف بعد، قم برفع ملف بيانات جديد لهذا المشروع لتوليد التحليلات الفورية.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}