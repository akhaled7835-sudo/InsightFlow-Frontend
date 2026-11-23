'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest } from '@/lib/api'
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

function cleanMarkdownSymbols(text: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]+)\*\*/g, '‹$1›')
    .replace(/\*+/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function classifyInsightStatus(
  title: string,
  description: string,
  lang: string
): {
  level: 'positive' | 'warning' | 'danger'
  label: string
  badgeBg: string
  badgeColor: string
  borderColor: string
  dotColor: string
} {
  const combined = `${title} ${description}`.toLowerCase()

  const isDanger =
    /خطر|مخاطر|اعتماد مرتفع|تركز مرتفع|تركّز|انخفاض حاد|تراجع|صفر|critical|high concentration|risk|severe|decline|missing|0\)/i.test(
      combined
    ) ||
    (/\b(8[0-9]|9[0-9]|100)%/.test(description) && !/اكتمال|completeness|100\s*%/i.test(title))

  const isPositive =
    /اكتمال البيانات|100\s*%|تتصدر|تفوق|نمو|ارتفاع|إيجابي|completeness|leading|outperform|growth|top|optimal|100%/i.test(
      combined
    )

  if (isDanger) {
    return {
      level: 'danger',
      label: lang === 'ar' ? 'خطر / تركز مرتفع' : 'High Risk',
      badgeBg: '#fef2f2',
      badgeColor: '#dc2626',
      borderColor: '#fecaca',
      dotColor: '#ef4444',
    }
  }

  if (isPositive && !/تحذير|تباين|متوازن نسبياً|variance|moderate|warning/i.test(combined)) {
    return {
      level: 'positive',
      label: lang === 'ar' ? 'إيجابي / فرصة نمو' : 'Positive',
      badgeBg: '#f0fdf4',
      badgeColor: '#16a34a',
      borderColor: '#bbf7d0',
      dotColor: '#22c55e',
    }
  }

  return {
    level: 'warning',
    label: lang === 'ar' ? 'تحذير / يحتاج متابعة' : 'Warning',
    badgeBg: '#fffbeb',
    badgeColor: '#d97706',
    borderColor: '#fde68a',
    dotColor: '#f59e0b',
  }
}

function resolveActualRowCount(rep: ProjectReportItem): number {
  if (rep.rowCount && rep.rowCount > 0) return rep.rowCount
  for (const ins of rep.insights) {
    const match = ins.description?.match(/(\d[\d,]*)\s*(?:صف|سجل|rows|records)/i)
    if (match?.[1]) {
      const parsed = Number(match[1].replace(/,/g, ''))
      if (parsed > 0) return parsed
    }
  }
  return rep.rowCount || 0
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
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]!

  useEffect(() => {
    if (roleLoading) return

    async function loadWorkspaceReports() {
      setLoading(true)
      try {
        let targetWsId =
          activeWorkspaceId && activeWorkspaceId !== 'default' ? activeWorkspaceId : ''

        if (!targetWsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
          if (Array.isArray(wsList) && wsList.length > 0) {
            targetWsId = wsList[0]?.id || wsList[0]?.workspaceId || ''
          }
        }

        if (!targetWsId) {
          setProjects([])
          setReports([])
          return
        }

        const rawProjects = await apiRequest<any[]>(
          `/api/workspaces/${targetWsId}/projects`
        ).catch(() => [])

        const projList: Array<{ id: string; name: string }> = Array.isArray(rawProjects)
          ? rawProjects
              .map((p: any) => {
                const pid = p.id || p.projectId
                if (!pid) return null
                const pname =
                  p.name || p.title || p.projectName || p.Name || p.Title || 'Untitled Project'
                return { id: pid, name: pname }
              })
              .filter(Boolean) as Array<{ id: string; name: string }>
          : []

        setProjects(projList)
        if (
          selectedProjectFilter !== 'all' &&
          !projList.some((p) => p.id === selectedProjectFilter)
        ) {
          setSelectedProjectFilter('all')
        }

        const uniqueReportsMap = new Map<string, ProjectReportItem>()

        await Promise.all(
          projList.map(async (proj) => {
            const key = `insightflow_project_files_${proj.id}`
            const cached = JSON.parse(localStorage.getItem(key) || '[]')
            const remoteFiles = await apiRequest<any[]>(`/api/projects/${proj.id}/files`).catch(
              () => []
            )

            const cachedMap = new Map<string, any>(
              Array.isArray(cached)
                ? cached.flatMap((c: any) => [
                    [c.id, c],
                    [c.fileId, c],
                    [c.name, c],
                  ])
                : []
            )

            const filesSource =
              Array.isArray(remoteFiles) && remoteFiles.length > 0 ? remoteFiles : cached

            if (!Array.isArray(filesSource) || filesSource.length === 0) return

            const updatedLocalItems: any[] = []

            await Promise.all(
              filesSource.map(async (ds: any) => {
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

                const uploadedAt =
                  ds.uploadedAt || localMatch?.uploadedAt || new Date().toISOString()

                updatedLocalItems.push({
                  ...(localMatch || {}),
                  id: dsId,
                  fileId: ds.fileId || ds.id,
                  name: fname,
                  rowCount: rows,
                  columnCount: cols,
                  insights: insList,
                  uploadedAt,
                })

                const dedupKey = `${proj.id}::${fname}`
                uniqueReportsMap.set(dedupKey, {
                  projectId: proj.id,
                  projectName: proj.name,
                  datasetId: dsId,
                  fileName: fname,
                  rowCount: rows,
                  columnCount: cols,
                  uploadedAt,
                  insights: insList,
                })
              })
            )

            if (updatedLocalItems.length > 0) {
              localStorage.setItem(key, JSON.stringify(updatedLocalItems))
            }
          })
        )

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

    loadWorkspaceReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId, roleLoading])

  useEffect(() => {
    if (lang === 'ar' || reports.length === 0) {
      setTokenDict({})
      return
    }

    const cacheKey = `insightflow_all_tokens_${lang}`
    let cachedDict: Record<string, string> = {}
    try {
      const parsed = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (parsed && typeof parsed === 'object') {
        cachedDict = parsed
        setTokenDict(parsed)
      }
    } catch {
      // ignore
    }

    const allTokens = new Set<string>()
    reports.forEach((r) => extractArabicTokens(r.insights).forEach((tk) => allTokens.add(tk)))
    const missingTokens = Array.from(allTokens).filter((tk) => !cachedDict[tk])
    if (missingTokens.length === 0) return

    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate each short Arabic word/phrase in this array into language "${lang}". Return ONLY a valid JSON object {"original": "translation"}:\n${JSON.stringify(missingTokens)}`,
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
      const activeInsights = formatLocalizedInsights(rep.insights, lang, tokenDict)
      const actualRows = resolveActualRowCount(rep)
      const dir = currentLangObj.direction
      const formattedDate = new Date().toLocaleDateString(lang)

      const logoHtml = `
        <div style="display:inline-flex;align-items:center;gap:10px;direction:ltr;">
          <span style="font-family:'Segoe UI',system-ui,sans-serif;font-weight:800;font-size:21px;letter-spacing:-0.4px;color:#0f172a;">
            InsightFlow
          </span>
          <span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#3b82f6;box-shadow:0 3px 10px rgba(59,130,246,0.28);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4v15a1 1 0 0 0 1 1h15" />
              <line x1="9" y1="16" x2="9" y2="13" />
              <line x1="13.5" y1="16" x2="13.5" y2="8" />
              <line x1="18" y1="16" x2="18" y2="11" />
            </svg>
          </span>
        </div>
      `

      const insightsBlocksHtml = activeInsights
        .map((ins, idx) => {
          const cleanTitle = cleanMarkdownSymbols(ins.title)
          const parts = ins.description.split(
            /التوصية:|Recommendation:|Empfehlung:|Recomendación:|Raccomandazione:|Recommandation:|Рекомендация:|Öneri:/i
          )
          const findingRaw = cleanMarkdownSymbols(parts[0] || '')
          const recRaw = cleanMarkdownSymbols(parts[1] || '')
          const status = classifyInsightStatus(cleanTitle, findingRaw, lang)

          const bulletLines = findingRaw
            .split(/\s+-\s+|\.\s+(?=[أ-يA-Z‹])/)
            .map((s) => s.trim())
            .filter(Boolean)

          const bulletsHtml =
            bulletLines.length > 1
              ? `<ul style="margin:8px 0 0;padding-${dir === 'rtl' ? 'right' : 'left'}:18px;color:#334155;font-size:13.5px;line-height:1.75;">
                  ${bulletLines.map((line) => `<li style="margin-bottom:4px;">${line}</li>`).join('')}
                </ul>`
              : `<p style="margin:8px 0 0;color:#334155;font-size:13.5px;line-height:1.75;">${findingRaw}</p>`

          const recHtml = recRaw
            ? `<div style="margin-top:10px;padding:10px 14px;border-radius:8px;background:#f8fafc;border-${dir === 'rtl' ? 'right' : 'left'}:3px solid #2563eb;font-size:13px;color:#1e293b;">
                <strong style="color:#1d4ed8;">➤ ${t.recommendationLabel}:</strong> ${recRaw}
              </div>`
            : ''

          const dividerHtml =
            idx < activeInsights.length - 1
              ? `<div style="height:1px;background:linear-gradient(to right,transparent,#cbd5e1,transparent);margin:18px 0;"></div>`
              : ''

          return `
            <div style="padding:14px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#ffffff;page-break-inside:avoid;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:12px;">
                    ${idx + 1}
                  </span>
                  <h3 style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">
                    ${cleanTitle}
                  </h3>
                </div>
                <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:700;background:${status.badgeBg};color:${status.badgeColor};border:1px solid ${status.borderColor};">
                  <span style="width:7px;height:7px;border-radius:50%;background:${status.dotColor};display:inline-block;"></span>
                  ${status.label}
                </span>
              </div>
              ${bulletsHtml}
              ${recHtml}
            </div>
            ${dividerHtml}
          `
        })
        .join('')

      const printWindow = window.open('', '_blank', 'width=940,height=800')
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${t.reportExecutiveTitle} - ${rep.fileName}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, system-ui, -apple-system, Roboto, sans-serif;
      padding: 36px 42px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.65;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .title-block h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .title-block p {
      margin: 3px 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      font-size: 12.5px;
      color: #334155;
      background: #f8fafc;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .meta-item strong {
      color: #0f172a;
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-block">
      <h1>${t.reportExecutiveTitle} — ${rep.fileName}</h1>
      <p>${rep.projectName} · ${formattedDate}</p>
    </div>
    ${logoHtml}
  </div>

  <div class="meta">
    <div class="meta-item">
      <strong>${t.reportProjectLabel}</strong>
      ${rep.projectName}
    </div>
    <div class="meta-item">
      <strong>${t.reportDatasetLabel}</strong>
      ${rep.fileName}
    </div>
    <div class="meta-item">
      <strong>${t.recordsLabel}</strong>
      ${actualRows.toLocaleString(lang)}
    </div>
    <div class="meta-item">
      <strong>${t.dimensionsAnalyzed}</strong>
      ${rep.columnCount}
    </div>
  </div>

  <div>
    ${insightsBlocksHtml}
  </div>

  <div class="footer">
    <span>InsightFlow AI Analytics · ${currentLangObj.nativeName}</span>
    <span>${formattedDate}</span>
  </div>

  <script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>
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

  if (loading && reports.length === 0) {
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
            const actualRows = resolveActualRowCount(rep)
            const displayedInsights =
              rep.insights.length > 0
                ? formatLocalizedInsights(rep.insights, lang, tokenDict)
                : [
                    {
                      title: `${t.reportDatasetLabel}: ${rep.fileName}`,
                      description: `${actualRows.toLocaleString(lang)} ${t.recordsLabel} & ${rep.columnCount} ${t.dimensionsAnalyzed}.`,
                    },
                  ]

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
                          - {actualRows.toLocaleString(lang)} {t.recordsLabel}
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
                      const cleanTitle = cleanMarkdownSymbols(ins.title)
                      const parts = ins.description.split(
                        /التوصية:|Recommendation:|Empfehlung:|Recomendación:|Raccomandazione:|Recommandation:|Рекомендация:|Öneri:/i
                      )
                      const findingText = cleanMarkdownSymbols(parts[0] || '')
                      const recommendationText = cleanMarkdownSymbols(parts[1] || '')
                      const status = classifyInsightStatus(cleanTitle, findingText, lang)

                      return (
                        <div
                          key={iIdx}
                          className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-4 transition-colors hover:border-primary/40"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-foreground">{cleanTitle}</h3>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{
                                  backgroundColor: status.badgeBg,
                                  color: status.badgeColor,
                                }}
                              >
                                {status.label}
                              </span>
                            </div>
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