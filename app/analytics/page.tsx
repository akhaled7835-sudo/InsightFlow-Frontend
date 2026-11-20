'use client'

import { useEffect, useState, useMemo } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import {
  BarChart3,
  Layers,
  FileSpreadsheet,
  Sparkles,
  FolderKanban,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  TrendingUp,
  Activity,
  Upload,
} from 'lucide-react'
import Link from 'next/link'

type AnalyticsDatasetItem = {
  projectId: string
  projectName: string
  datasetId: string
  fileName: string
  rowCount: number
  columnCount: number
  uploadedAt: string
  insights: Array<{ title: string; description: string }>
}

export default function AnalyticsPage() {
  const { canAnalyzeAndUpload, loading: roleLoading, activeWorkspaceId } = useWorkspaceRole()
  const [datasets, setDatasets] = useState<AnalyticsDatasetItem[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)

  useEffect(() => {
    if (roleLoading) return

    async function loadAnalyticsWorkspace() {
      setLoading(true)
      try {
        let wsId = activeWorkspaceId
        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId
        }

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
          }
        }

        const collected: AnalyticsDatasetItem[] = []

        projList.forEach((proj) => {
          const key = `insightflow_project_files_${proj.id}`
          const cached = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(cached)) {
            cached.forEach((ds: any) => {
              let rows = ds.rowCount ?? 0
              if (rows === 0 && Array.isArray(ds.insights)) {
                for (const ins of ds.insights) {
                  const m = ins.description?.match(/\((\d+)\s*صف\)/)
                  if (m?.[1]) {
                    rows = Number(m[1])
                    break
                  }
                }
              }
              collected.push({
                projectId: proj.id,
                projectName: proj.name,
                datasetId: ds.id,
                fileName: ds.name,
                rowCount: rows,
                columnCount: ds.columnCount ?? 0,
                uploadedAt: ds.uploadedAt || new Date().toISOString(),
                insights: ds.insights || [],
              })
            })
          }
        })

        collected.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        setDatasets(collected)
        if (collected.length > 0) {
          setSelectedDatasetId(collected[0].datasetId)
        } else {
          setSelectedDatasetId('')
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsWorkspace()
  }, [activeWorkspaceId, roleLoading])

  const activeItem = useMemo(
    () => datasets.find((d) => d.datasetId === selectedDatasetId) || datasets[0],
    [datasets, selectedDatasetId]
  )

  const totalRecordsAll = useMemo(
    () => datasets.reduce((acc, item) => acc + item.rowCount, 0),
    [datasets]
  )

  const totalInsightsAll = useMemo(
    () => datasets.reduce((acc, item) => acc + item.insights.length, 0),
    [datasets]
  )

  async function handleRefreshInsights() {
    if (!canAnalyzeAndUpload || !activeItem?.datasetId) return
    setReanalyzing(true)
    try {
      const insightsRes = await apiRequest<any>(
        `/api/analytics/datasets/${activeItem.datasetId}/insights`,
        {
          method: 'POST',
          body: JSON.stringify({
            metrics: [],
            groupBy: [],
            filters: [],
            comparisons: [],
          }),
        }
      )
      const freshInsights = insightsRes?.insights || insightsRes?.Insights || []
      if (freshInsights.length > 0) {
        setDatasets((prev) =>
          prev.map((d) =>
            d.datasetId === activeItem.datasetId ? { ...d, insights: freshInsights } : d
          )
        )
        const storageKey = `insightflow_project_files_${activeItem.projectId}`
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
        const updated = existing.map((item: any) =>
          item.id === activeItem.datasetId ? { ...item, insights: freshInsights } : item
        )
        localStorage.setItem(storageKey, JSON.stringify(updated))
      }
    } catch (err) {
      console.error('Failed to refresh insights:', err)
    } finally {
      setReanalyzing(false)
    }
  }

  return (
    <DashboardShell activeItem="analytics">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">مركز التحليلات المتقدمة</h1>
              <p className="text-xs text-muted-foreground">
                مقارنة الأداء عبر جميع ملفات ومشاريع مساحة العمل واستكشاف المؤشرات الإحصائية
              </p>
            </div>
          </div>

          {canAnalyzeAndUpload && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5" />
              إضافة مصدر بيانات جديد
            </Link>
          )}
        </div>

        {/* Workspace-Wide KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">نشط</span>
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{datasets.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">إجمالي مصادر البيانات</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> 100%
              </span>
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalRecordsAll.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">إجمالي السجلات المعالجة</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">AI Engine</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalInsightsAll}</p>
            <p className="mt-1 text-xs text-muted-foreground">إجمالي الأنماط والرؤى المكتشفة</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">عالية</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{datasets.length > 0 ? '100%' : '0%'}</p>
            <p className="mt-1 text-xs text-muted-foreground">معدل موثوقية البيانات</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="animate-pulse text-sm text-muted-foreground">
              جاري تجميع بيانات التحليل عبر المشاريع...
            </p>
          </div>
        ) : datasets.length > 0 && activeItem ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Cross-Project Volume Comparison (5 cols) */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div className="text-right">
                  <h2 className="text-base font-bold">مقارنة حجم البيانات بين المشاريع</h2>
                  <p className="text-xs text-muted-foreground">
                    اختر أي ملف لاستعراض تحليله التفصيلي
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {datasets.map((ds) => {
                  const maxRows = Math.max(...datasets.map((d) => d.rowCount), 1)
                  const widthPct = Math.max(12, Math.round((ds.rowCount / maxRows) * 100))
                  const isSelected = ds.datasetId === activeItem.datasetId

                  return (
                    <button
                      key={ds.datasetId}
                      type="button"
                      onClick={() => setSelectedDatasetId(ds.datasetId)}
                      className={`w-full rounded-xl border p-3.5 text-right transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border/70 bg-background/40 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-primary">
                          {ds.rowCount.toLocaleString()} سجل
                        </span>
                        <span className="font-bold text-foreground">{ds.fileName}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        المشروع: {ds.projectName} • {ds.columnCount} متغيرات
                      </p>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Deep-Dive Dataset Analyzer (7 cols) */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  {canAnalyzeAndUpload && (
                    <button
                      type="button"
                      disabled={reanalyzing}
                      onClick={handleRefreshInsights}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
                    >
                      {reanalyzing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      )}
                      تحديث التحليل
                    </button>
                  )}
                  <Link
                    href={`/projects/${activeItem.projectId}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25"
                  >
                    داشبورد المشروع
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="text-right">
                  <h2 className="text-base font-bold">{activeItem.fileName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeItem.rowCount.toLocaleString()} صف • {activeItem.columnCount} أعمدة
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activeItem.insights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/70 bg-background/50 p-4 text-right"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        مؤشر #{idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{ins.title}</h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {ins.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-primary/60" />
            <h3 className="text-base font-bold">لا توجد بيانات متاحة للتحليل بعد</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              {canAnalyzeAndUpload
                ? 'قم برفع ملف Excel أو CSV أولاً لتظهر هنا المقارنات الإحصائية الشاملة عبر جميع مشاريعك.'
                : 'لم يقم فريق العمل برفع أي ملفات بيانات للعرض في هذه المساحة بعد.'}
            </p>
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                رفع ملف الآن
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}