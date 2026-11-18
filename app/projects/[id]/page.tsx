'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import {
  Database,
  ArrowLeft,
  FileSpreadsheet,
  Sparkles,
  Layers,
  Columns,
  BarChart3,
  Upload,
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params?.id as string
  const [project, setProject] = useState<any>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0)
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
          const projRes = await apiRequest<any>(
            `/api/workspaces/${wsId}/projects/${projectId}`
          )
          setProject(projRes)
        }

        const storageKey = `insightflow_project_files_${projectId}`
        const cachedFiles = JSON.parse(localStorage.getItem(storageKey) || '[]')
        if (Array.isArray(cachedFiles) && cachedFiles.length > 0) {
          setDatasets(cachedFiles)
          setSelectedDatasetIndex(cachedFiles.length - 1)
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
          <p className="animate-pulse text-sm text-muted-foreground">
            جاري تحميل الداشبورد المخصصة للمشروع...
          </p>
        </div>
      </DashboardShell>
    )
  }

  const activeDataset = datasets[selectedDatasetIndex]
  const totalFiles = datasets.length
  const totalRows = activeDataset?.rowCount ?? 0
  const totalColumns = activeDataset?.columnCount ?? 0
  const insights = activeDataset?.insights ?? []

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Project Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Database className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {project?.name || 'مشروع تحليل البيانات'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {project?.description || 'الداشبورد التنفيذية المخصصة لهذا المشروع وتحليلاته.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5" />
              رفع ملف جديد
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-medium hover:bg-secondary/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              العودة للمشاريع
            </Link>
          </div>
        </div>

        {/* Dataset Switcher if multiple files exist */}
        {datasets.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">الملف المعروض حالياً:</span>
              <span className="font-semibold text-foreground">{activeDataset?.name}</span>
            </div>
            {datasets.length > 1 && (
              <select
                value={selectedDatasetIndex}
                onChange={(e) => setSelectedDatasetIndex(Number(e.target.value))}
                className="rounded-lg border border-input bg-secondary px-3 py-1.5 text-xs font-medium outline-none"
              >
                {datasets.map((ds, idx) => (
                  <option key={ds.id || idx} value={idx} className="bg-slate-900">
                    {ds.name} ({ds.rowCount} صف)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
            <p className="mt-3 text-2xl font-bold">{totalRows.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeDataset ? `من ملف: ${activeDataset.name}` : 'بانتظار رفع ملف'}
            </p>
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

        {/* Visual Summary & AI Insights */}
        {activeDataset ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Visual Breakdown Card */}
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">ملخص بنية البيانات ({activeDataset.name})</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">كثافة السجلات المعالجة</span>
                    <span className="font-semibold">{totalRows.toLocaleString()} سجل</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(15, (totalRows / 5000) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">أبعاد التحليل (الأعمدة)</span>
                    <span className="font-semibold">{totalColumns} متغيرات</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${Math.min(100, Math.max(20, totalColumns * 5))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">الرؤى المستخرجة بالذكاء الاصطناعي</span>
                    <span className="font-semibold">{insights.length} رؤى</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${Math.min(100, Math.max(15, insights.length * 20))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">رؤى الذكاء الاصطناعي للملف</h3>
              </div>
              {insights.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {insights.map((ins: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-background/60 p-3.5"
                    >
                      <p className="text-sm font-semibold text-foreground">{ins.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {ins.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  تمت معالجة الملف بنجاح ({totalRows} صف و {totalColumns} أعمدة).
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">لا توجد ملفات مرفوعة لهذا المشروع بعد</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              اذهب إلى صفحة رفع البيانات، اختر مشروع <strong>{project?.name}</strong>، وارفع ملف Excel أو CSV لتظهر هنا أرقامه الحقيقية ورؤى الذكاء الاصطناعي الخاصة به.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              رفع ملف لهذا المشروع الآن
            </Link>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}