'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest } from '@/lib/api'
import {
  FileText,
  Sparkles,
  Plus,
  FileSpreadsheet,
  Lightbulb,
  FolderKanban,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

type ProjectReportItem = {
  projectId: string
  projectName: string
  datasetId: string
  fileName: string
  rowCount: number
  columnCount: number
  uploadedAt: string
  insights: Array<{ title: string; description: string; severity?: string }>
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const initialProjectId = searchParams?.get('projectId') || 'all'

  const [reports, setReports] = useState<ProjectReportItem[]>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(initialProjectId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllProjectReports() {
      try {
        const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
        const firstWs = wsList?.[0]
        const wsId = firstWs?.id || firstWs?.workspaceId

        let projList: Array<{ id: string; name: string }> = []
        if (wsId) {
          const rawProjects = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(
            () => []
          )
          if (Array.isArray(rawProjects)) {
            projList = rawProjects.map((p) => ({
              id: p.id || p.projectId,
              name: p.name || 'مشروع بدون عنوان',
            }))
            setProjects(projList)
          }
        }

        // جمع التقارير والرؤى المخزنة لكل مشروع من ذاكرة المتصفح
        const collected: ProjectReportItem[] = []
        const seenProjectIds = new Set<string>()

        // 1. المرور على المشاريع القادمة من الـ API
        projList.forEach((proj) => {
          seenProjectIds.add(proj.id)
          const key = `insightflow_project_files_${proj.id}`
          const cached = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(cached)) {
            cached.forEach((ds: any) => {
              collected.push({
                projectId: proj.id,
                projectName: proj.name,
                datasetId: ds.id,
                fileName: ds.name,
                rowCount: ds.rowCount ?? 0,
                columnCount: ds.columnCount ?? 0,
                uploadedAt: ds.uploadedAt || new Date().toISOString(),
                insights: ds.insights || [],
              })
            })
          }
        })

        // 2. فحص أي مفاتيح مشاريع أخرى مخزنة محلياً
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('insightflow_project_files_')) {
            const pId = k.replace('insightflow_project_files_', '')
            if (!seenProjectIds.has(pId)) {
              const cached = JSON.parse(localStorage.getItem(k) || '[]')
              if (Array.isArray(cached)) {
                cached.forEach((ds: any) => {
                  collected.push({
                    projectId: pId,
                    projectName: 'مشروع تحليل البيانات',
                    datasetId: ds.id,
                    fileName: ds.name,
                    rowCount: ds.rowCount ?? 0,
                    columnCount: ds.columnCount ?? 0,
                    uploadedAt: ds.uploadedAt || new Date().toISOString(),
                    insights: ds.insights || [],
                  })
                })
              }
            }
          }
        }

        // ترتيب التقارير من الأحدث للأقدم
        collected.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        setReports(collected)
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllProjectReports()
  }, [])

  const filteredReports =
    selectedProjectFilter === 'all'
      ? reports
      : reports.filter((r) => r.projectId === selectedProjectFilter)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">
          جاري تحميل تقارير الذكاء الاصطناعي والتوصيات...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            تقارير الذكاء الاصطناعي والتوصيات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            استعرض التقارير التنفيذية التلقائية والتوصيات المستخرجة من بيانات مشاريعك.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-secondary/70 px-3.5 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="all" className="bg-slate-900">
                جميع المشاريع ({reports.length})
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            تحليل ملف جديد وإنشاء تقرير
          </Link>
        </div>
      </div>

      {/* Reports & Recommendations List */}
      {filteredReports.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredReports.map((rep, rIdx) => (
            <div
              key={`${rep.projectId}-${rep.datasetId}-${rIdx}`}
              className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm"
            >
              {/* Report Top Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        تقرير تحليل: {rep.fileName}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        <FolderKanban className="h-3 w-3" />
                        {rep.projectName}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> مكتمل التحليل
                      </span>
                      <span>• {rep.columnCount} أبعاد محللة</span>
                      <span className="flex items-center gap-1">
                        • <Calendar className="h-3 w-3" />{' '}
                        {new Date(rep.uploadedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/projects/${rep.projectId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-medium hover:bg-secondary/80"
                >
                  فتح الداشبورد التفاعلية
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Insights & Actionable Recommendations Grid */}
              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>النتائج التفصيلية والتوصيات التنفيذية ({rep.insights.length})</span>
                </div>

                {rep.insights.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {rep.insights.map((ins, iIdx) => {
                      const parts = ins.description.split('التوصية:')
                      const findingText = parts[0]?.trim()
                      const recommendationText = parts[1]?.trim()

                      return (
                        <div
                          key={iIdx}
                          className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-4 transition-colors hover:border-primary/40"
                        >
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{ins.title}</h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                              {findingText}
                            </p>
                          </div>

                          {recommendationText && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                              <div>
                                <span className="font-bold text-amber-300">التوصية: </span>
                                <span>{recommendationText}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    تم تحليل الملف بنجاح دون تسجيل ملاحظات نصية إضافية.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card/40 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">لا توجد تقارير مخزنة حالياً</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            بمجرد قيامك برفع وتحليل أي ملف بيانات، سيقوم النظام بتوليد تقرير تنفيذي شامل ورؤى ذكية هنا تلقائياً.
          </p>
          <Link
            href="/upload"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-medium hover:bg-secondary/80"
          >
            رفع ملف وتحليل الآن
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <DashboardShell activeItem="aiReports">
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
            جاري التحميل...
          </div>
        }
      >
        <ReportsContent />
      </Suspense>
    </DashboardShell>
  )
}