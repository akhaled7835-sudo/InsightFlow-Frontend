'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { InsightsPanel } from '@/components/dashboard/insights-actions'
import { apiRequest } from '@/lib/api'
import { Database, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params?.id as string
  const [projectData, setProjectData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjectDetails() {
      if (!projectId) return
      try {
        // Fetch project details and datasets/reports from .NET backend
        const res = await apiRequest<any>(`/api/projects/${projectId}`)
        setProjectData(res)
      } catch (error) {
        console.error('Failed to load project details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [projectId])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل الداشبورد للمشروع...</p>
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
                {projectData?.name || `مشروع تحليل البيانات (#${projectId.slice(0, 8)})`}
              </h1>
              <p className="text-xs text-muted-foreground">
                {projectData?.description || 'داشبورد تحليل الملفات ورؤى الذكاء الاصطناعي التنفيذية.'}
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

        {/* Live KPI Cards */}
        <KpiCards />

        {/* Charts Section */}
        <ChartsSection />

        {/* AI Insights Specific to Project */}
        <div className="grid grid-cols-1 gap-6">
          <InsightsPanel insights={projectData?.insights || []} />
        </div>
      </div>
    </DashboardShell>
  )
}