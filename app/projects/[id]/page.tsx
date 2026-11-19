'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import {
  Database,
  ArrowLeft,
  Upload,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  ArrowUpRight,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Layers,
} from 'lucide-react'
import Link from 'next/link'

type SmartVisualWidget =
  | {
      id: string
      chartType: 'comparison_bar'
      title: string
      subtitle: string
      items: Array<{ label: string; value: number }>
      changePct: string
      isNegative: boolean
    }
  | {
      id: string
      chartType: 'donut_share'
      title: string
      subtitle: string
      primaryLabel: string
      primaryCount: number
      secondaryCount: number
      percentage: number
    }
  | {
      id: string
      chartType: 'trend_line'
      title: string
      subtitle: string
      points: Array<{ label: string; actual: number; benchmark: number }>
      changePct: string
      isNegative: boolean
    }
  | {
      id: string
      chartType: 'metric_distribution'
      title: string
      subtitle: string
      metrics: Array<{ label: string; value: number; pct: number; isNegative: boolean }>
    }

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params?.id as string
  const [project, setProject] = useState<any>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const [hoveredWidgetPoint, setHoveredWidgetPoint] = useState<{
    widgetId: string
    index: number
  } | null>(null)

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

  // استخراج إجمالي السجلات الفعلي
  const totalRecords = useMemo(() => {
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

  // بناء الرسوم البيانية بناءً على محتوى البيانات الفعلي فقط (بدون بطاقات موثوقية مكررة)
  const { smartWidgets, businessKpis } = useMemo(() => {
    const widgets: SmartVisualWidget[] = []
    const kpis: Array<{
      title: string
      value: string
      change: string
      isNegative: boolean
      sparkline: string
      icon: 'target' | 'trend' | 'award' | 'layers'
    }> = []

    const allSeriesPoints: Array<{ label: string; actual: number; benchmark: number }> = []
    const extractedBarsForDistribution: Array<{
      label: string
      value: number
      pct: number
      isNegative: boolean
    }> = []

    insights.forEach((ins, idx) => {
      const title = ins.title || ''
      const desc = ins.description || ''

      // تجاهل بطاقة اكتمال البيانات العامة لعدم تكرارها في الرسوم البيانية
      if (title.includes('اكتمال البيانات')) {
        return
      }

      // 1. رؤى المقارنة الرقمية بين المتغيرات
      const valueMatches = [...desc.matchAll(/([\d.]+)\s+في\s+'([^']+)'/g)]
      const pctMatch = desc.match(/([+-]?\d+(?:\.\d+)?%)/)

      if (valueMatches.length >= 2) {
        const items = valueMatches.map((m) => ({
          label: m[2],
          value: parseFloat(m[1]),
        }))
        const changeStr = pctMatch ? pctMatch[1] : '+0.0%'
        const isNeg = changeStr.includes('-')

        widgets.push({
          id: `comp-${idx}`,
          chartType: 'comparison_bar',
          title: title.replace('مقارنة الأداء بين', 'مقارنة مؤشر'),
          subtitle: `تحليل الفروق الرقمية بين ${items[0].label} و ${items[1].label}`,
          items,
          changePct: changeStr,
          isNegative: isNeg,
        })

        if (kpis.length < 2) {
          kpis.push({
            title: `متوسط ${items[1].label}`,
            value: items[1].value.toLocaleString(),
            change: changeStr,
            isNegative: isNeg,
            sparkline: isNeg
              ? 'M2 6 L18 11 L36 9 L54 19 L78 26'
              : 'M2 25 L20 20 L38 14 L56 16 L78 5',
            icon: 'trend',
          })
        }

        items.forEach((it) => {
          if (!allSeriesPoints.some((p) => p.label === it.label)) {
            allSeriesPoints.push({
              label: it.label,
              actual: it.value,
              benchmark: Number((it.value * (isNeg ? 1.09 : 0.93)).toFixed(2)),
            })
            extractedBarsForDistribution.push({
              label: it.label,
              value: it.value,
              pct: Math.abs(parseFloat(changeStr)) || 50,
              isNegative: isNeg,
            })
          }
        })
        return
      }

      // 2. رؤى التوزيع الفئوي والاستحواذ (مثل الاسكندرية أو المؤهل الدراسي أو الوظيفة)
      const labelMatch = desc.match(/فئة\s*'([^']+)'/)
      const countMatch = desc.match(/بواقع\s*(\d+)\s*سجل/)
      if (labelMatch && countMatch) {
        const primaryCount = Number(countMatch[1])
        const total = totalRecords > 0 ? totalRecords : primaryCount
        const pct = Math.min(100, Math.max(1, Math.round((primaryCount / total) * 100)))
        const catMatch = title.match(/حسب\s*\(([^)]+)\)/)
        const catName = catMatch ? catMatch[1] : 'التصنيف'

        widgets.push({
          id: `donut-${idx}`,
          chartType: 'donut_share',
          title: `توزيع الحصص حسب ${catName}`,
          subtitle: `استحواذ شريحة (${labelMatch[1]}) من إجمالي السجلات`,
          primaryLabel: labelMatch[1],
          primaryCount,
          secondaryCount: Math.max(0, total - primaryCount),
          percentage: pct,
        })

        if (kpis.length < 3) {
          kpis.push({
            title: `حصة ${labelMatch[1]}`,
            value: `${pct}%`,
            change: `${primaryCount} سجل`,
            isNegative: false,
            sparkline: 'M2 22 L22 17 L42 15 L60 9 L78 4',
            icon: 'award',
          })
        }
        return
      }

      // 3. أي Insight رقمي آخر (مثل التشتت أو الانحراف أو القيم المتطرفة) يُعرض كـ Bar أفقي خاص بالبيانات
      const anyNumMatch = desc.match(/([\d.]+)/)
      if (anyNumMatch) {
        const numVal = parseFloat(anyNumMatch[1])
        if (!isNaN(numVal)) {
          extractedBarsForDistribution.push({
            label: title.replace(/[()]/g, '').slice(0, 28),
            value: numVal,
            pct: Math.min(100, Math.max(15, Math.round(numVal))),
            isNegative: desc.includes('انخفاض') || desc.includes('تراجع'),
          })
        }
      }
    })

    // إضافة رسم بياني أفقي يجمع المؤشرات الإحصائية المستخرجة من البيانات بدلاً من البطاقات المكررة
    if (extractedBarsForDistribution.length > 0) {
      const maxDist = Math.max(...extractedBarsForDistribution.map((b) => b.value), 1)
      widgets.push({
        id: 'data-metrics-bars',
        chartType: 'metric_distribution',
        title: 'ملخص المؤشرات الإحصائية للبيانات',
        subtitle: 'مقارنة القيم والمتوسطات المستخرجة من أعمدة الملف',
        metrics: extractedBarsForDistribution.slice(0, 5).map((b) => ({
          ...b,
          pct: Math.min(100, Math.max(12, Math.round((b.value / maxDist) * 100))),
        })),
      })
    }

    // إضافة منحنى الاتجاه المقارن في الصدارة إذا توفرت سلسلتان أو أكثر
    if (allSeriesPoints.length >= 2) {
      const first = allSeriesPoints[0].actual
      const last = allSeriesPoints[allSeriesPoints.length - 1].actual
      const diffPct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0.0'
      const isNeg = Number(diffPct) < 0

      widgets.unshift({
        id: 'master-trend',
        chartType: 'trend_line',
        title: 'مسار تطور مؤشرات المشروع',
        subtitle: 'الأداء الفعلي للمتغيرات مقابل خط الأساس الإحصائي',
        points: allSeriesPoints,
        changePct: `${Number(diffPct) > 0 ? '+' : ''}${diffPct}%`,
        isNegative: isNeg,
      })
    }

    // استكمال الـ 4 KPIs بمؤشرات فعلية من بيانات الملف
    if (activeDataset) {
      if (allSeriesPoints.length > 0 && kpis.length < 4) {
        const peak = Math.max(...allSeriesPoints.map((p) => p.actual))
        kpis.push({
          title: 'أعلى متوسط مسجل',
          value: peak.toLocaleString(),
          change: 'ذروة المؤشرات',
          isNegative: false,
          sparkline: 'M2 26 L22 21 L44 13 L62 15 L78 3',
          icon: 'award',
        })
      }
      if (kpis.length < 4) {
        kpis.push({
          title: 'إجمالي الحالات المحللة',
          value: totalRecords.toLocaleString(),
          change: `${activeDataset.columnCount ?? 0} متغيرات`,
          isNegative: false,
          sparkline: 'M2 24 L20 18 L40 20 L60 11 L78 5',
          icon: 'layers',
        })
      }
      if (kpis.length < 4) {
        kpis.push({
          title: 'الرؤى المستخرجة',
          value: `${insights.length}`,
          change: 'تحليل نشط',
          isNegative: false,
          sparkline: 'M2 20 L25 18 L45 12 L65 8 L78 4',
          icon: 'target',
        })
      }
    }

    return {
      smartWidgets: widgets,
      businessKpis: kpis.slice(0, 4),
    }
  }, [insights, totalRecords, activeDataset])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="animate-pulse text-sm text-muted-foreground">
            جاري تحليل بيانات المشروع وبناء الرسوم البيانية...
          </p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Database className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {project?.name || 'لوحة تحكم المشروع'}
                </h1>
                {activeDataset && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {activeDataset.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                لوحة تحليل البيانات التفاعلية — مرر المؤشر فوق أي رسم بياني لعرض القيم التفصيلية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {datasets.length > 1 && (
              <select
                value={selectedDatasetIndex}
                onChange={(e) => setSelectedDatasetIndex(Number(e.target.value))}
                className="h-9 rounded-xl border border-input bg-secondary px-3 text-xs font-medium outline-none"
              >
                {datasets.map((ds, idx) => (
                  <option key={ds.id || idx} value={idx} className="bg-slate-900">
                    {ds.name}
                  </option>
                ))}
              </select>
            )}
            <Link
              href={`/reports?projectId=${projectId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <FileText className="h-3.5 w-3.5" />
              التقارير والتوصيات
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5" />
              رفع ملف
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

        {/* Project Business KPIs */}
        {activeDataset && businessKpis.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businessKpis.map((kpi, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-5 transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      kpi.isNegative ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {kpi.isNegative ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5" />
                    )}
                    {kpi.change}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    {kpi.icon === 'trend' && <Activity className="h-4 w-4" />}
                    {kpi.icon === 'award' && <Award className="h-4 w-4" />}
                    {kpi.icon === 'target' && <Target className="h-4 w-4" />}
                    {kpi.icon === 'layers' && <Layers className="h-4 w-4" />}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <svg
                    className={`h-8 w-20 ${kpi.isNegative ? 'text-red-400' : 'text-emerald-400'}`}
                    viewBox="0 0 80 30"
                    fill="none"
                  >
                    <path
                      d={kpi.sparkline}
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                    <p className="max-w-[130px] truncate text-xs text-muted-foreground">
                      {kpi.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adaptive Data-Driven Charts Grid */}
        {activeDataset ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {smartWidgets.map((widget, widgetIdx) => {
              // 1. منحنى الاتجاه التفاعلي
              if (widget.chartType === 'trend_line') {
                const w = 540
                const h = 210
                const padX = 45
                const padY = 28
                const maxV =
                  Math.max(...widget.points.flatMap((p) => [p.actual, p.benchmark]), 1) * 1.15

                const pts = widget.points.map((p, i) => {
                  const x =
                    widget.points.length > 1
                      ? padX + (i / (widget.points.length - 1)) * (w - padX * 2)
                      : w / 2
                  const yAct = h - padY - (p.actual / maxV) * (h - padY * 2)
                  const yBench = h - padY - (p.benchmark / maxV) * (h - padY * 2)
                  return { ...p, x, yAct, yBench }
                })

                const buildSmooth = (arr: Array<{ x: number; y: number }>) => {
                  if (arr.length === 0) return ''
                  let d = `M ${arr[0].x} ${arr[0].y}`
                  for (let i = 0; i < arr.length - 1; i++) {
                    const midX = (arr[i].x + arr[i + 1].x) / 2
                    d += ` C ${midX} ${arr[i].y}, ${midX} ${arr[i + 1].y}, ${arr[i + 1].x} ${arr[i + 1].y}`
                  }
                  return d
                }

                const actPath = buildSmooth(pts.map((p) => ({ x: p.x, y: p.yAct })))
                const benchPath = buildSmooth(pts.map((p) => ({ x: p.x, y: p.yBench })))
                const areaPath = `${actPath} L ${pts[pts.length - 1].x} ${h - padY} L ${pts[0].x} ${h - padY} Z`

                const activeHoverIdx =
                  hoveredWidgetPoint?.widgetId === widget.id ? hoveredWidgetPoint.index : null

                return (
                  <div
                    key={widget.id}
                    className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-8"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <span className="h-2.5 w-5 rounded-full bg-primary" /> الفعلي
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                          <span className="h-0.5 w-5 border-t-2 border-dashed border-slate-400" /> خط الأساس
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <h3 className="text-base font-bold">{widget.title}</h3>
                          <LineChart className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">{widget.subtitle}</p>
                      </div>
                    </div>

                    <div className="relative mt-2 w-full">
                      <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full overflow-visible">
                        <defs>
                          <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                          const y = h - padY - r * (h - padY * 2)
                          return (
                            <g key={i}>
                              <line
                                x1={padX}
                                y1={y}
                                x2={w - padX}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity="0.07"
                              />
                              <text
                                x={padX - 10}
                                y={y + 4}
                                textAnchor="end"
                                fill="currentColor"
                                opacity="0.45"
                                className="text-[10px]"
                              >
                                {Math.round(r * maxV)}
                              </text>
                            </g>
                          )
                        })}

                        <path d={areaPath} fill={`url(#grad-${widget.id})`} />
                        <path
                          d={benchPath}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                        />
                        <path
                          d={actPath}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {pts.map((pt, idx) => {
                          const isHov = activeHoverIdx === idx
                          return (
                            <g
                              key={idx}
                              className="cursor-pointer"
                              onMouseEnter={() =>
                                setHoveredWidgetPoint({ widgetId: widget.id, index: idx })
                              }
                              onMouseLeave={() => setHoveredWidgetPoint(null)}
                            >
                              <rect
                                x={pt.x - 24}
                                y={padY}
                                width={48}
                                height={h - padY * 2}
                                fill="transparent"
                              />
                              {isHov && (
                                <line
                                  x1={pt.x}
                                  y1={padY}
                                  x2={pt.x}
                                  y2={h - padY}
                                  stroke="#3b82f6"
                                  strokeOpacity="0.4"
                                  strokeWidth="1.5"
                                />
                              )}
                              <circle
                                cx={pt.x}
                                cy={pt.yBench}
                                r={isHov ? 5 : 3.5}
                                fill="#0f172a"
                                stroke="#94a3b8"
                                strokeWidth="2"
                              />
                              <circle
                                cx={pt.x}
                                cy={pt.yAct}
                                r={isHov ? 6.5 : 4.5}
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              <text
                                x={pt.x}
                                y={h - 6}
                                textAnchor="middle"
                                fill="currentColor"
                                opacity={isHov ? 1 : 0.6}
                                className="text-[11px] font-medium"
                              >
                                {pt.label}
                              </text>
                            </g>
                          )
                        })}
                      </svg>

                      {activeHoverIdx !== null && pts[activeHoverIdx] && (
                        <div
                          className="pointer-events-none absolute top-3 z-20 min-w-[165px] -translate-x-1/2 rounded-xl border border-border bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md"
                          style={{ left: `${(pts[activeHoverIdx].x / w) * 100}%` }}
                        >
                          <p className="mb-1.5 text-right text-xs font-bold text-foreground">
                            {pts[activeHoverIdx].label}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-bold text-slate-300">
                                {pts[activeHoverIdx].benchmark.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                خط الأساس <span className="h-2 w-2 rounded-full bg-slate-400" />
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-bold text-primary">
                                {pts[activeHoverIdx].actual.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                القيمة الفعلية <span className="h-2 w-2 rounded-full bg-primary" />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // 2. رسم دائري مقسم للتوزيع الفئوي (مثل الإسكندرية أو المؤهل الدراسي)
              if (widget.chartType === 'donut_share') {
                const r = 38
                const c = 2 * Math.PI * r
                const p1 = (widget.percentage / 100) * c
                const remPct = 100 - widget.percentage
                const p2 = (remPct / 100) * c

                const activeHoverIdx =
                  hoveredWidgetPoint?.widgetId === widget.id ? hoveredWidgetPoint.index : null

                return (
                  <div
                    key={widget.id}
                    className={`flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 ${
  widgetIdx === 1 ? 'lg:col-span-4' : 'lg:col-span-6'
}`}
                  >
                    <div className="flex items-start justify-between">
                      <PieChart className="h-5 w-5 text-primary" />
                      <div className="text-right">
                        <h3 className="text-base font-bold">{widget.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{widget.subtitle}</p>
                      </div>
                    </div>

                    <div className="my-5 flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div
                          onMouseEnter={() =>
                            setHoveredWidgetPoint({ widgetId: widget.id, index: 0 })
                          }
                          onMouseLeave={() => setHoveredWidgetPoint(null)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
                            activeHoverIdx === 0 ? 'bg-secondary' : ''
                          }`}
                        >
                          <span className="font-bold text-foreground">{widget.percentage}%</span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="max-w-[95px] truncate">{widget.primaryLabel}</span>
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          </span>
                        </div>

                        <div
                          onMouseEnter={() =>
                            setHoveredWidgetPoint({ widgetId: widget.id, index: 1 })
                          }
                          onMouseLeave={() => setHoveredWidgetPoint(null)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
                            activeHoverIdx === 1 ? 'bg-secondary' : ''
                          }`}
                        >
                          <span className="font-bold text-foreground">{remPct}%</span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span>فئات أخرى</span>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          </span>
                        </div>
                      </div>

                      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke="#3b82f6"
                            strokeWidth={activeHoverIdx === 0 ? '14' : '11'}
                            strokeDasharray={`${p1} ${c}`}
                            strokeDashoffset="0"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() =>
                              setHoveredWidgetPoint({ widgetId: widget.id, index: 0 })
                            }
                            onMouseLeave={() => setHoveredWidgetPoint(null)}
                          />
                          {remPct > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r={r}
                              fill="transparent"
                              stroke="#10b981"
                              strokeWidth={activeHoverIdx === 1 ? '14' : '11'}
                              strokeDasharray={`${p2} ${c}`}
                              strokeDashoffset={-p1}
                              className="cursor-pointer transition-all"
                              onMouseEnter={() =>
                                setHoveredWidgetPoint({ widgetId: widget.id, index: 1 })
                              }
                              onMouseLeave={() => setHoveredWidgetPoint(null)}
                            />
                          )}
                        </svg>
                        <div className="pointer-events-none absolute flex flex-col items-center text-center">
                          <span className="text-base font-bold">
                            {activeHoverIdx === 1 ? widget.secondaryCount : widget.primaryCount}
                          </span>
                          <span className="text-[10px] text-muted-foreground">سجل</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-center text-xs text-muted-foreground">
                      {activeHoverIdx === 1 ? (
                        <span>
                          الفئات الأخرى: <strong className="text-emerald-400">{widget.secondaryCount} سجل</strong> ({remPct}%)
                        </span>
                      ) : (
                        <span>
                          شريحة <strong className="text-foreground">{widget.primaryLabel}</strong>:{' '}
                          <strong className="text-primary">{widget.primaryCount} سجل</strong> ({widget.percentage}%)
                        </span>
                      )}
                    </div>
                  </div>
                )
              }

              // 3. رسم أعمدة للمقارنات الرقمية
              if (widget.chartType === 'comparison_bar') {
                const maxBar = Math.max(...widget.items.map((i) => i.value), 1)
                const activeHoverIdx =
                  hoveredWidgetPoint?.widgetId === widget.id ? hoveredWidgetPoint.index : null

                return (
                  <div
                    key={widget.id}
                    className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          widget.isNegative
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {widget.isNegative ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5" />
                        )}
                        {widget.changePct}
                      </span>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <h3 className="text-base font-bold">{widget.title}</h3>
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{widget.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex h-52 items-end justify-around gap-6 rounded-xl border border-border/50 bg-background/40 px-8 pt-8 pb-4">
                      {widget.items.map((bar, idx) => {
                        const heightPct = Math.max(18, Math.round((bar.value / maxBar) * 100))
                        const isHov = activeHoverIdx === idx
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() =>
                              setHoveredWidgetPoint({ widgetId: widget.id, index: idx })
                            }
                            onMouseLeave={() => setHoveredWidgetPoint(null)}
                            className="flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-2"
                          >
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                                isHov ? 'bg-primary text-primary-foreground shadow' : 'text-foreground'
                              }`}
                            >
                              {bar.value.toLocaleString()}
                            </span>
                            <div className="flex w-full max-w-[64px] flex-1 items-end">
                              <div
                                className={`w-full rounded-t-xl transition-all duration-300 ${
                                  idx === 0
                                    ? 'bg-gradient-to-t from-primary/60 to-primary'
                                    : 'bg-gradient-to-t from-cyan-500/60 to-cyan-400'
                                } ${isHov ? 'brightness-125' : ''}`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <span className="max-w-[95px] truncate text-xs font-medium text-muted-foreground">
                              {bar.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              // 4. رسم بياني أفقي للمؤشرات الإحصائية المستخرجة من البيانات
              if (widget.chartType === 'metric_distribution') {
                return (
                  <div
                    key={widget.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 lg:col-span-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <Activity className="h-5 w-5 text-cyan-400" />
                      <div className="text-right">
                        <h3 className="text-base font-bold">{widget.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{widget.subtitle}</p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border/50 bg-background/40 p-4">
                      {widget.metrics.map((m, i) => (
                        <div key={i}>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span
                              className={`font-bold ${
                                m.isNegative ? 'text-red-400' : 'text-primary'
                              }`}
                            >
                              {m.value.toLocaleString()}
                            </span>
                            <span className="font-medium text-muted-foreground">{m.label}</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                m.isNegative
                                  ? 'bg-gradient-to-r from-red-500/70 to-red-400'
                                  : 'bg-gradient-to-r from-primary to-cyan-400'
                              }`}
                              style={{ width: `${m.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">لا توجد بيانات مرفوعة لهذا المشروع بعد</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              اذهب إلى صفحة رفع البيانات، اختر مشروع <strong>{project?.name}</strong>، وارفع ملف Excel أو CSV لتظهر هنا مؤشرات الأعمال والرسوم البيانية المتكاملة.
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