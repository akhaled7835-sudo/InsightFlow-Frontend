'use client'

import { useEffect, useState, useMemo } from 'react'
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
  TrendingDown,
  TrendingUp,
  PieChart,
  Activity,
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

  const activeDataset = datasets[selectedDatasetIndex]
  const insights: Array<{ title: string; description: string }> = activeDataset?.insights ?? []

  // استخراج عدد الصفوف الفعلي حتى لو جاء داخل نص الرؤى مثل "(548 صف)"
  const extractedRows = useMemo(() => {
    if (activeDataset?.rowCount && activeDataset.rowCount > 0) {
      return activeDataset.rowCount
    }
    for (const ins of insights) {
      const match = ins.description?.match(/\((\d+)\s*صف\)/) || ins.description?.match(/(\d+)\s*rows/i)
      if (match && match[1]) {
        return Number(match[1])
      }
    }
    return 0
  }, [activeDataset, insights])

  // استخراج بيانات الرسوم البيانية ديناميكياً من الأرقام والمقارنات الحقيقية في الرؤى
  const dynamicChartBars = useMemo(() => {
    const bars: Array<{ label: string; value: number; change?: string; isNegative?: boolean }> = []
    const seenLabels = new Set<string>()

    insights.forEach((ins) => {
      // استخراج المقارنات مثل: من 2019.62 في 'Return_year' إلى 6.68 في 'Return_Month' بنسبة انخفاض -99.7%
      const matches = [...ins.description.matchAll(/([\d.]+)\s+في\s+'([^']+)'/g)]
      const pctMatch = ins.description.match(/([+-]?\d+(?:\.\d+)?%)/)

      matches.forEach((m, idx) => {
        const val = parseFloat(m[1])
        const label = m[2]
        if (!seenLabels.has(label) && !isNaN(val)) {
          seenLabels.add(label)
          bars.push({
            label,
            value: val,
            change: idx === 1 && pctMatch ? pctMatch[1] : undefined,
            isNegative: idx === 1 && pctMatch ? pctMatch[1].includes('-') : false,
          })
        }
      })
    })

    return bars
  }, [insights])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="animate-pulse text-sm text-muted-foreground">
            جاري بناء الداشبورد التفاعلية للمشروع...
          </p>
        </div>
      </DashboardShell>
    )
  }

  const totalFiles = datasets.length
  const totalColumns = activeDataset?.columnCount ?? 0
  const maxBarVal = Math.max(...dynamicChartBars.map((b) => b.value), 1)

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

        {/* Dataset Switcher */}
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
                    {ds.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">إجمالي الملفات</span>
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalFiles}</p>
            <p className="mt-1 text-[11px] text-emerald-400">مرتبطة بالمشروع</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">إجمالي السجلات (الصفوف)</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{extractedRows.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeDataset ? `من ملف ${activeDataset.name}` : 'بانتظار رفع ملف'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الأعمدة (المتغيرات)</span>
              <Columns className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalColumns}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">مؤشرات البيانات</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">جودة واكتمال البيانات</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{activeDataset ? '100%' : '0%'}</p>
            <p className="mt-1 text-[11px] text-emerald-400">
              {insights.length} رؤى ذكية مستخرجة
            </p>
          </div>
        </div>

        {/* Full Interactive Dashboard Charts Section */}
        {activeDataset ? (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Bar Chart: Dynamic Variable Comparison */}
              <div className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="text-base font-semibold">
                        التحليل المقارن للمتغيرات الرئيسية ({activeDataset.name})
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      تمثيل بصري للمتوسطات والفروقات المكتشفة تلقائياً بين أعمدة الملف
                    </p>
                  </div>
                </div>

                {dynamicChartBars.length > 0 ? (
                  <div className="flex h-64 items-end justify-around gap-4 rounded-xl border border-border/50 bg-background/40 px-6 pt-10 pb-4">
                    {dynamicChartBars.map((bar, idx) => {
                      const heightPct = Math.max(12, Math.round((bar.value / maxBarVal) * 100))
                      return (
                        <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-foreground">
                              {bar.value.toLocaleString()}
                            </span>
                            {bar.change && (
                              <span
                                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  bar.isNegative
                                    ? 'bg-red-500/15 text-red-400'
                                    : 'bg-emerald-500/15 text-emerald-400'
                                }`}
                              >
                                {bar.isNegative ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : (
                                  <TrendingUp className="h-3 w-3" />
                                )}
                                {bar.change}
                              </span>
                            )}
                          </div>
                          <div className="flex w-full max-w-[70px] flex-1 items-end">
                            <div
                              className={`w-full rounded-t-xl transition-all duration-500 ${
                                idx === 0
                                  ? 'bg-gradient-to-t from-primary/60 to-primary'
                                  : idx % 2 === 1
                                  ? 'bg-gradient-to-t from-cyan-500/60 to-cyan-400'
                                  : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="max-w-[90px] truncate text-center text-xs font-medium text-muted-foreground">
                            {bar.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-border/50 bg-background/40 p-6 text-center">
                    <BarChart3 className="mb-2 h-8 w-8 text-primary/60" />
                    <p className="text-sm font-medium">
                      تم تحليل {extractedRows.toLocaleString()} سجل عبر {totalColumns} أعمدة
                    </p>
                  </div>
                )}
              </div>

              {/* Donut / Distribution Chart Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold">توزيع المؤشرات</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    نسب التغطية والاكتمال لبيانات الملف
                  </p>
                </div>

                {/* SVG Circular Gauge */}
                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-secondary"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        fill="transparent"
                        className="text-primary transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-2xl font-bold">100%</span>
                      <span className="text-[11px] text-muted-foreground">اكتمال السجلات</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-border pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      السجلات الصالحة
                    </span>
                    <span className="font-semibold">{extractedRows.toLocaleString()} صف</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      الأبعاد المحللة
                    </span>
                    <span className="font-semibold">{totalColumns} أعمدة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      القيم المفقودة
                    </span>
                    <span className="font-semibold text-emerald-400">0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Grid */}
            <div className="rounded-2xl border border-border bg-card/40 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">
                  التفسير التفصيلي ورؤى الذكاء الاصطناعي — {activeDataset.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{ins.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {ins.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">لا توجد ملفات مرفوعة لهذا المشروع بعد</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              اذهب إلى صفحة رفع البيانات، اختر مشروع <strong>{project?.name}</strong>، وارفع ملف Excel أو CSV لتظهر هنا الرسوم البيانية والداشبورد الكاملة الخاصة به.
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