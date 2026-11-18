'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { InsightsPanel } from '@/components/dashboard/insights-actions'
import { apiRequest } from '@/lib/api'
import { Database, ArrowLeft, FileSpreadsheet } from 'lucide-react'
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
        // 1. Fetch project details
        const projRes = await apiRequest<any>(`/api/projects/${projectId}`)
        setProject(projRes)

        // 2. Fetch datasets associated with this project to display its specific metrics
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
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل بيانات المشروع المخصصة...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
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

        {/* Project Files List Indicator */}
        {datasets.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/30 px-4 py-3 text-xs text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <span>الملفات المرتبطة بهذا المشروع: <strong>{datasets.length} ملفات محللة</strong></span>
          </div>
        )}

        {/* KPI Cards */}
        <KpiCards />

        {/* Charts Section */}
        <ChartsSection />

        {/* AI Insights Specific Panel */}
        <div className="grid grid-cols-1 gap-6">
          <InsightsPanel insights={project?.insights || []} />
        </div>
      </div>
    </DashboardShell>
  )
}