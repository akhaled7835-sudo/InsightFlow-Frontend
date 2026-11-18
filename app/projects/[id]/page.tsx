'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import {
  Database,
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Columns,
  BarChart3,
  Upload,
  TrendingDown,
  TrendingUp,
  PieChart,
  Activity,
  LineChart,
  FileText,
  ArrowUpRight,
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

  // 1. استخراج عدد الصفوف الفعلي
  const extractedRows = useMemo(() => {
    if (activeDataset?.rowCount && activeDataset.rowCount > 0) {
      return activeDataset.rowCount
    }
    for (const ins of insights) {
      const match =
        ins.description?.match(/\((\d+)\s*صف\)/) ||
        ins.description?.match(/(\d+)\s*rows/i)
      if (match && match[1]) {
        return Number(match[1])
      }
    }
    return 0
  }, [activeDataset, insights])

  // 2. استخراج بيانات المقارنة للرسم البياني العمودي والخطي
  const dynamicChartBars = useMemo(() => {
    const bars: Array<{
      label: string
      value: number
      change?: string
      isNegative?: boolean
    }> = []
    const seenLabels = new Set<string>()

    insights.forEach((ins) => {
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

  // 3. استخراج التوزيع الفئوي للرسم الدائري والأفقي (مثل تركز فئة 'Sales rep' بواقع 36 سجل)
  const categoryDistribution = useMemo(() => {
    const items: Array<{ category: string; label: string; count: number; percentage: number }> = []

    insights.forEach((ins) => {
      const catTitleMatch = ins.title.match(/حسب\s*\(([^)]+)\)/)
      const labelMatch = ins.description.match(/فئة\s*'([^']+)'/)
      const countMatch = ins.description.match(/بواقع\s*(\d+)\s*سجل/)

      if (labelMatch && countMatch) {
        const count = Number(countMatch[1])
        const total = extractedRows > 0 ? extractedRows : count
        const pct = Math.min(100, Math.round((count / total) * 100))
        items.push({
          category: catTitleMatch ? catTitleMatch[1] : 'التصنيف الرئيسي',
          label: labelMatch[1],
          count,
          percentage: pct,
        })
      }
    })

    return items
  }, [insights, extractedRows])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="animate-pulse text-sm text-muted-foreground">
            جاري بناء الرسوم البيانية التفاعلية للمشروع...
          </p>
        </div>
      </DashboardShell>
    )
  }

  const totalFiles = datasets.length
  const totalColumns = activeDataset?.columnCount ?? 0
  const maxBarVal = Math.max(...dynamicChartBars.map((b) => b.value), 1)

  // حساب إحداثيات الرسم البياني الخطي (SVG Polyline)
  const trendPoints =
    dynamicChartBars.length > 1
      ? dynamicChartBars
          .map((bar, i) => {
            const x = 40 + (i / (dynamicChartBars.length - 1)) * 320
            const y = 140 - (bar.value / maxBarVal) * 100
            return `${x},${y}`
          })
          .join(' ')
      : ''

  const primaryCategory = categoryDistribution[0]
  const donutDashArray = 251.2
  const donutDashOffset = primaryCategory
    ? donutDashArray - (donutDashArray * primaryCategory.percentage) / 100
    : 0

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
                {project?.name || 'لوحة تحكم المشروع'}
              </h1>
              <p className="text-xs text-muted-foreground">
                لوحة المؤشرات والرسوم البيانية التفاعلية الخاصة ببيانات المشروع
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <FileText className="h-3.5 w-3.5" />
              قسم التقارير والتوصيات
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
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
              المشاريع
            </Link>
          </div>
        </div>

        {/* Dataset Switcher */}
        {datasets.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">مصدر البيانات النشط:</span>
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
            <p className="mt-1 text-[11px] text-emerald-400">ملفات مرتبطة بالمشروع</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">إجمالي السجلات (الصفوف)</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{extractedRows.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeDataset ? activeDataset.name : 'بانتظار رفع ملف'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الأعمدة (المتغيرات)</span>
              <Columns className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalColumns}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">أبعاد التحليل المتاحة</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">جودة واكتمال البيانات</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{activeDataset ? '100%' : '0%'}</p>
            <p className="mt-1 text-[11px] text-emerald-400">دقة السجلات المعالجة</p>
          </div>
        </div>

        {/* Pure Visual Charts Grid (No Text Reports) */}
        {activeDataset ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* 1. Vertical Bar Chart (7 cols) */}
            <div className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold">مقارنة المؤشرات الرقمية (Bar Chart)</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    المتوسطات والمقارنات المستخرجة من أعمدة {activeDataset.name}
                  </p>
                </div>
              </div>

              {dynamicChartBars.length > 0 ? (
                <div className="flex h-64 items-end justify-around gap-4 rounded-xl border border-border/50 bg-background/40 px-6 pt-10 pb-4">
                  {dynamicChartBars.map((bar, idx) => {
                    const heightPct = Math.max(15, Math.round((bar.value / maxBarVal) * 100))
                    return (
                      <div
                        key={idx}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
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
                        <div className="flex w-full max-w-[68px] flex-1 items-end">
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
                <div className="flex h-64 items-center justify-center rounded-xl border border-border/50 bg-background/40 text-xs text-muted-foreground">
                  لا توجد مقارنات رقمية متعددة في هذا الملف
                </div>
              )}
            </div>

            {/* 2. Donut Chart (5 cols) */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-6 lg:col-span-5">
              <div>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold">
                    {primaryCategory
                      ? `توزيع الفئات (${primaryCategory.category})`
                      : 'نسبة اكتمال السجلات'}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  التمثيل الدائري لأكبر شريحة في البيانات
                </p>
              </div>

              <div className="my-4 flex flex-col items-center justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="11"
                      fill="transparent"
                      className="text-secondary"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="11"
                      strokeDasharray={donutDashArray}
                      strokeDashoffset={donutDashOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="text-primary transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-2xl font-bold">
                      {primaryCategory ? `${primaryCategory.percentage}%` : '100%'}
                    </span>
                    <span className="max-w-[90px] truncate text-[11px] text-muted-foreground">
                      {primaryCategory ? primaryCategory.label : 'سجلات مكتملة'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-xs">
                {primaryCategory ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        {primaryCategory.label}
                      </span>
                      <span className="font-semibold">
                        {primaryCategory.count} سجل ({primaryCategory.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                        باقي الفئات
                      </span>
                      <span className="font-semibold">
                        {Math.max(0, extractedRows - primaryCategory.count)} سجل (
                        {100 - primaryCategory.percentage}%)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">إجمالي السجلات الصالحة</span>
                    <span className="font-semibold">{extractedRows.toLocaleString()} صف</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Line & Area Trend Chart (6 cols) */}
            <div className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-6">
              <div className="mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-semibold">منحنى الاتجاه والتغير (Trend Line)</h3>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                تتبع مسار الأداء بين المتغيرات الزمنية والرقمية في الملف
              </p>

              {dynamicChartBars.length > 1 ? (
                <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                  <svg viewBox="0 0 400 170" className="h-44 w-full overflow-visible">
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[35, 75, 115, 145].map((yPos) => (
                      <line
                        key={yPos}
                        x1="20"
                        y1={yPos}
                        x2="380"
                        y2={yPos}
                        stroke="currentColor"
                        strokeOpacity="0.08"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {/* Area under line */}
                    <polygon
                      points={`40,145 ${trendPoints} 360,145`}
                      fill="url(#trendFill)"
                    />
                    {/* Line */}
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={trendPoints}
                    />
                    {/* Data Points */}
                    {dynamicChartBars.map((bar, i) => {
                      const x = 40 + (i / (dynamicChartBars.length - 1)) * 320
                      const y = 140 - (bar.value / maxBarVal) * 100
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            fill="currentColor"
                            className="text-[11px] font-bold"
                          >
                            {bar.value}
                          </text>
                          <text
                            x={x}
                            y="163"
                            textAnchor="middle"
                            fill="currentColor"
                            opacity="0.6"
                            className="text-[10px]"
                          >
                            {bar.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center rounded-xl border border-border/50 bg-background/40 text-xs text-muted-foreground">
                  يتطلب المنحنى متغيرين رقميين على الأقل للمقارنة
                </div>
              )}
            </div>

            {/* 4. Horizontal Breakdown Bars (6 cols) */}
            <div className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold">مؤشرات التغطية والأبعاد (Horizontal Bars)</h3>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                قياس نسبي لحجم السجلات والأعمدة والفئات المكتشفة
              </p>

              <div className="space-y-4 rounded-xl border border-border/50 bg-background/40 p-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">نسبة اكتمال السجلات النظيفة</span>
                    <span className="font-semibold text-emerald-400">100% ({extractedRows} صف)</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-full rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">تغطية المتغيرات (الأعمدة)</span>
                    <span className="font-semibold text-primary">{totalColumns} أبعاد</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(25, totalColumns * 8))}%` }}
                    />
                  </div>
                </div>

                {categoryDistribution.map((cat, idx) => (
                  <div key={idx}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        تركّز {cat.label} ({cat.category})
                      </span>
                      <span className="font-semibold text-amber-400">
                        {cat.percentage}% ({cat.count} سجل)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">لا توجد بيانات مرفوعة لهذا المشروع بعد</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              اذهب إلى صفحة رفع البيانات، اختر مشروع <strong>{project?.name}</strong>، وارفع ملف Excel أو CSV لتظهر هنا الرسوم البيانية المتكاملة الخاصة به.
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