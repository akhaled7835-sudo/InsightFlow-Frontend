'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation, SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { extractArabicTokens, formatLocalizedInsights } from '@/lib/insightTranslator'
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
  Download,
  Loader2,
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
  const { activeWorkspaceId, loading: roleLoading } = useWorkspaceRole()
  const { t, lang } = useTranslation()

  const [reports, setReports] = useState<ProjectReportItem[]>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(initialProjectId)
  const [loading, setLoading] = useState(true)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [tokenDict, setTokenDict] = useState<Record<string, string>>({})

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    if (roleLoading) return

    async function loadAllProjectReports() {
      setLoading(true)
      try {
        const session = getSession()
        const wsIds = new Set<string>()
        if (activeWorkspaceId && activeWorkspaceId !== 'default') wsIds.add(activeWorkspaceId)
        if (session?.workspaceId && session.workspaceId !== 'default') wsIds.add(session.workspaceId)

        const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
        if (Array.isArray(wsList)) {
          wsList.forEach((w) => {
            const id = w?.id || w?.workspaceId
            if (id) wsIds.add(id)
          })
        }

        const projectMap = new Map<string, { id: string; name: string }>()
        for (const wsId of wsIds) {
          const rawProjects = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(
            () => []
          )
          if (Array.isArray(rawProjects)) {
            rawProjects.forEach((p) => {
              const pid = p.id || p.projectId
              if (pid) {
                projectMap.set(pid, { id: pid, name: p.name || 'Project' })
              }
            })
          }
        }

        // أيضاً التقاط أي مشاريع مخزنة محلياً في المتصفح
        if (typeof window !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (k && k.startsWith('insightflow_project_files_')) {
              const pid = k.replace('insightflow_project_files_', '')
              if (pid && !projectMap.has(pid)) {
                projectMap.set(pid, { id: pid, name: 'Project' })
              }
            }
          }
        }

        const projList = Array.from(projectMap.values())
        setProjects(projList)

        const uniqueReportsMap = new Map<string, ProjectReportItem>()

        for (const proj of projList) {
          const key = `insightflow_project_files_${proj.id}`
          const cached = JSON.parse(localStorage.getItem(key) || '[]')
          const remoteFiles = await apiRequest<any[]>(`/api/projects/${proj.id}/files`).catch(
            () => []
          )

          const cachedMap = new Map<string, any>(
            Array.isArray(cached)
              ? cached.flatMap((c: any) => [
                  [c.id, c],
                  [c.name, c],
                ])
              : []
          )

          const filesSource =
            Array.isArray(remoteFiles) && remoteFiles.length > 0 ? remoteFiles : cached

          if (Array.isArray(filesSource)) {
            for (const ds of filesSource) {
              const dsId = ds.datasetId || ds.id
              const fname = ds.fileName || ds.originalFileName || ds.name || 'Dataset'
              const localMatch = cachedMap.get(dsId) || cachedMap.get(fname)
              const rows = ds.rowCount ?? localMatch?.rowCount ?? 0
              const cols = ds.columnCount ?? localMatch?.columnCount ?? 0

              let insList: Array<{ title: string; description: string }> =
                Array.isArray(localMatch?.insights) && localMatch.insights.length > 0
                  ? localMatch.insights
                  : []

              if (insList.length === 0 && dsId) {
                const insRes = await apiRequest<any>(
                  `/api/analytics/datasets/${dsId}/insights`,
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      metrics: [],
                      groupBy: [],
                      filters: [],
                      comparisons: [],
                    }),
                  }
                ).catch(() => null)

                const rawIns = insRes?.insights || insRes?.Insights || []
                if (Array.isArray(rawIns) && rawIns.length > 0) {
                  insList = rawIns.map((item: any) => ({
                    title: item.title || item.Title || 'Metric',
                    description: item.description || item.Description || item.message || '',
                  }))
                }
              }

              if (insList.length === 0 && (rows > 0 || cols > 0)) {
                insList = [
                  {
                    title: `${t.reportDatasetLabel}: ${fname}`,
                    description: `${rows.toLocaleString(lang)} ${t.recordsLabel} & ${cols} ${t.dimensionsAnalyzed}.`,
                  },
                ]
              }

              const dedupKey = `${proj.id}::${fname}`
              uniqueReportsMap.set(dedupKey, {
                projectId: proj.id,
                projectName: proj.name,
                datasetId: dsId,
                fileName: fname,
                rowCount: rows,
                columnCount: cols,
                uploadedAt: ds.uploadedAt || localMatch?.uploadedAt || new Date().toISOString(),
                insights: insList,
              })
            }
          }
        }

        const collected = Array.from(uniqueReportsMap.values())
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
  }, [activeWorkspaceId, roleLoading, lang, t.dimensionsAnalyzed, t.recordsLabel, t.reportDatasetLabel])

  useEffect(() => {
    if (lang === 'ar' || reports.length === 0) {
      setTokenDict({})
      return
    }

    const allTokens = new Set<string>()
    reports.forEach((r) => extractArabicTokens(r.insights).forEach((tk) => allTokens.add(tk)))
    const tokensArr = Array.from(allTokens)
    if (tokensArr.length === 0) return

    const cacheKey = `insightflow_all_tokens_${lang}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (cached && typeof cached === 'object') {
        setTokenDict(cached)
      }
    } catch {
      // ignore
    }

    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate each short Arabic word/phrase in this array into language "${lang}". Return ONLY a valid JSON object {"original": "translation"}:\n${JSON.stringify(tokensArr)}`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const raw = (data?.reply || '').replace(/```json|```/g, '').trim()
        const s = raw.indexOf('{')
        const e = raw.lastIndexOf('}')
        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(raw.slice(s, e + 1))
          if (parsed && typeof parsed === 'object') {
            setTokenDict((prev) => {
              const merged = { ...prev, ...parsed }
              localStorage.setItem(cacheKey, JSON.stringify(merged))
              return merged
            })
          }
        }
      })
      .catch(() => null)
  }, [reports, lang])

  async function handleDownloadLocalizedReport(rep: ProjectReportItem) {
    const key = `${rep.projectId}-${rep.fileName}`
    setDownloadingKey(key)
    try {
      const targetLanguageName = `${currentLangObj.englishName} (${currentLangObj.nativeName})`
      const activeInsights = formatLocalizedInsights(rep.insights, lang, tokenDict)
      const rawFindings = activeInsights
        .map((i, idx) => `${idx + 1}. ${i.title}: ${i.description}`)
        .join('\n')

      let localizedSummary = ''

      try {
        const aiRes = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Generate a formal, well-structured executive data analysis report strictly in ${targetLanguageName}.
Do NOT use any other language. Translate all titles, findings, metrics, and actionable recommendations into ${targetLanguageName}.
Project: ${rep.projectName}
Dataset: ${rep.fileName}
Records: ${rep.rowCount}, Columns: ${rep.columnCount}
Extracted Findings:
${rawFindings}`,
            workspaceName: rep.projectName,
            projectId: rep.projectId,
          }),
        })
        if (aiRes.ok) {
          const data = await aiRes.json()
          localizedSummary = data?.reply || data?.message || ''
        }
      } catch {
        // fallback if offline
      }

      if (!localizedSummary) {
        localizedSummary = rawFindings
      }

      const dir = currentLangObj.direction
      const formattedDate = new Date().toLocaleDateString(lang)

      const printWindow = window.open('', '_blank', 'width=900,height=750')
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${t.reportExecutiveTitle} - ${rep.fileName}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.7; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { color: #2563eb; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    h1 { margin: 6px 0 10px; font-size: 24px; color: #0f172a; }
    .meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #475569; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .content { margin-top: 24px; white-space: pre-wrap; font-size: 14px; color: #1e293b; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">InsightFlow AI Analytics</div>
    <h1>${t.reportExecutiveTitle}</h1>
    <div class="meta">
      <span><strong>${t.reportProjectLabel}:</strong> ${rep.projectName}</span>
      <span><strong>${t.reportDatasetLabel}:</strong> ${rep.fileName}</span>
      <span><strong>${t.recordsLabel}:</strong> ${rep.rowCount.toLocaleString(lang)}</span>
      <span><strong>${t.reportLanguageLabel}:</strong> ${currentLangObj.nativeName}</span>
      <span><strong>${t.reportGeneratedOn}:</strong> ${formattedDate}</span>
    </div>
  </div>
  <div class="content">${localizedSummary.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer">InsightFlow · ${currentLangObj.nativeName} (${lang.toUpperCase()})</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`)
        printWindow.document.close()
      }
    } finally {
      setDownloadingKey(null)
    }
  }

  const filteredReports =
    selectedProjectFilter === 'all'
      ? reports
      : reports.filter((r) => r.projectId === selectedProjectFilter)

  if (loading || roleLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">{t.loadingAiReports}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.aiReportsTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.aiReportsSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-secondary/70 px-3.5 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="all" className="bg-slate-900">
                {t.allProjectsFilter} ({reports.length})
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
            {t.analyzeNewFileBtn}
          </Link>
        </div>
      </div>

      {/* Reports & Recommendations List */}
      {filteredReports.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredReports.map((rep) => {
            const itemKey = `${rep.projectId}-${rep.fileName}`
            const isDownloading = downloadingKey === itemKey
            const displayedInsights = formatLocalizedInsights(rep.insights, lang, tokenDict)

            return (
              <div
                key={itemKey}
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
                          {t.analysisReportPrefix} {rep.fileName}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                          <FolderKanban className="h-3 w-3" />
                          {rep.projectName}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t.analysisCompleted}
                        </span>
                        <span>
                          - {rep.rowCount.toLocaleString(lang)} {t.recordsLabel}
                        </span>
                        <span>
                          - {rep.columnCount} {t.dimensionsAnalyzed}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          {new Date(rep.uploadedAt).toLocaleDateString(lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownloadLocalizedReport(rep)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      {isDownloading ? t.generatingReportBtn : t.downloadReportBtn}
                    </button>

                    <Link
                      href={`/projects/${rep.projectId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-medium hover:bg-secondary/80"
                    >
                      {t.openInteractiveDash}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Insights & Actionable Recommendations Grid */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                      {t.detailedFindingsTitle} ({displayedInsights.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {displayedInsights.map((ins, iIdx) => {
                      const parts = ins.description.split(
                        /التوصية:|Recommendation:|Empfehlung:|Recomendación:|Raccomandazione:|Recommandation:|Рекомендация:|Öneri:/i
                      )
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
                                <span className="font-bold text-amber-300">
                                  {t.recommendationLabel}:{' '}
                                </span>
                                <span>{recommendationText}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card/40 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">{t.noStoredReportsTitle}</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            {t.noStoredReportsDesc}
          </p>
          <Link
            href="/upload"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-medium hover:bg-secondary/80"
          >
            {t.uploadAndAnalyzeNow}
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
            Loading...
          </div>
        }
      >
        <ReportsContent />
      </Suspense>
    </DashboardShell>
  )
}