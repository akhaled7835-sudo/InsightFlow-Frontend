'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Send,
  Zap,
  FileText,
  ArrowUpRight,
  Loader2,
  RotateCcw,
  Globe,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'

type WorkspaceDatasetSummary = {
  projectId: string
  projectName: string
  datasetId: string
  fileName: string
  rowCount: number
  columnCount: number
  uploadedAt?: string
  columnNames: string[]
  sampleRows: Array<Record<string, any>>
  statisticalFacts: string[]
}

type WorkspaceProjectSummary = {
  id: string
  name: string
}

type SavedReportSummary = {
  id: string
  title: string
  projectName: string
  createdAt: string
  type: string
}

type ChatMessage = {
  id: string
  sender: 'ai' | 'user'
  text: string
  sources?: Array<{ title: string; url: string }>
}

function FormattedChatText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1" />

        const headingMatch = trimmed.match(/^#{1,4}\s+(.*)$/)
        if (headingMatch) {
          return (
            <p key={idx} className="pt-1 text-xs font-bold text-primary">
              {headingMatch[1].replace(/\*\*/g, '')}
            </p>
          )
        }

        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={idx} className="text-xs leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return <span key={pIdx}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

export function RightSidebar() {
  const router = useRouter()
  const { t } = useTranslation()
  const {
    activeWorkspaceId,
    activeWorkspace,
    canAnalyzeAndUpload,
    canManageTeam,
    loading: roleLoading,
  } = useWorkspaceRole()

  const [projects, setProjects] = useState<WorkspaceProjectSummary[]>([])
  const [emptyProjectsCount, setEmptyProjectsCount] = useState(0)
  const [membersCount, setMembersCount] = useState(1)
  const [datasets, setDatasets] = useState<WorkspaceDatasetSummary[]>([])
  const [recentReports, setRecentReports] = useState<SavedReportSummary[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (roleLoading) return

    async function loadSidebarContext() {
      setDataLoading(true)
      try {
        const session = getSession()
        let wsId = activeWorkspaceId || session?.workspaceId
        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId
        }

        if (!wsId || wsId === 'default') {
          setProjects([])
          setDatasets([])
          setRecentReports([])
          setDataLoading(false)
          return
        }

        const [rawProjects, rawMembers] = await Promise.all([
          apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => []),
          apiRequest<any[]>(`/api/workspaces/${wsId}/members`).catch(() => []),
        ])

        const projList = Array.isArray(rawProjects) ? rawProjects : []
        setProjects(
          projList.map((p: any) => ({
            id: p.id || p.projectId,
            name: p.name || 'مشروع',
          }))
        )
        setMembersCount(Array.isArray(rawMembers) && rawMembers.length > 0 ? rawMembers.length : 1)

        const uniqueDatasetsMap = new Map<string, WorkspaceDatasetSummary>()
        const collectedReports: SavedReportSummary[] = []
        let emptyProjs = 0

        for (const p of projList) {
          const pid = p.id || p.projectId
          const pname = p.name || 'مشروع'
          if (!pid) continue

          const storageKey = `insightflow_project_files_${pid}`
          const cached = JSON.parse(localStorage.getItem(storageKey) || '[]')
          const remoteFiles = await apiRequest<any[]>(`/api/projects/${pid}/files`).catch(() => [])

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

          if (Array.isArray(filesSource) && filesSource.length > 0) {
            for (const rf of filesSource) {
              const dsId = rf.datasetId || rf.fileId || rf.id
              const fname = rf.fileName || rf.originalFileName || rf.name || 'ملف بيانات'
              const localMatch = cachedMap.get(dsId) || cachedMap.get(fname)
              const dedupKey = `${pid}::${fname}`

              let insightsArr: any[] = Array.isArray(localMatch?.insights)
                ? localMatch.insights
                : []

              // إذا لم تكن الحقائق الإحصائية مخزنة محلياً، نجلبها من endpoint التحليل الفعلي في الباك إند
              if (insightsArr.length === 0 && dsId) {
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
                insightsArr = insRes?.insights || insRes?.Insights || []
              }

              const statisticalFacts = insightsArr.map(
                (i: any) =>
                  `${i.title || i.Title}: ${(i.description || i.Description || '').split('التوصية:')[0].trim()}`
              )

              uniqueDatasetsMap.set(dedupKey, {
                projectId: pid,
                projectName: pname,
                datasetId: dsId,
                fileName: fname,
                rowCount: rf.rowCount ?? localMatch?.rowCount ?? 0,
                columnCount: rf.columnCount ?? localMatch?.columnCount ?? 0,
                uploadedAt: rf.uploadedAt || localMatch?.uploadedAt,
                columnNames: localMatch?.columnNames || [],
                sampleRows: localMatch?.sampleRows || [],
                statisticalFacts,
              })
            }
          } else {
            emptyProjs++
          }

          const projReports = await apiRequest<any[]>(`/api/projects/${pid}/reports`).catch(
            () => []
          )
          if (Array.isArray(projReports)) {
            projReports.forEach((rep: any) => {
              collectedReports.push({
                id: rep.reportId || rep.id,
                title: rep.title || 'تقرير تحليلي',
                projectName: pname,
                createdAt: rep.createdAt || new Date().toISOString(),
                type: rep.reportType || 'Summary',
              })
            })
          }
        }

        const collectedDatasets = Array.from(uniqueDatasetsMap.values())
        setEmptyProjectsCount(emptyProjs)
        setDatasets(collectedDatasets)
        collectedReports.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecentReports(collectedReports.slice(0, 3))

        const totalRows = collectedDatasets.reduce((sum, d) => sum + d.rowCount, 0)
        const introText =
          collectedDatasets.length > 0
            ? `أهلاً بك! قرأت ملفات قسم "${activeWorkspace?.name || 'القسم النشط'}" (${collectedDatasets.length} ملفات، ${totalRows.toLocaleString()} سجل). اسألني عن أي تفاصيل أو أرقام داخل الجداول وسأحللها لك مباشرة.`
            : `أهلاً بك! قسم "${activeWorkspace?.name || 'الحالي'}" جاهز. اسألني أي سؤال تحليلي أو ارفع ملف بيانات وسأساعدك فوراً.`

        setMessages([{ id: 'welcome', sender: 'ai', text: introText }])
      } catch (err) {
        console.error('RightSidebar context error:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadSidebarContext()
  }, [activeWorkspaceId, activeWorkspace?.name, roleLoading])

  const smartSuggestions = useMemo(() => {
    if (datasets.length === 0) {
      return ['أهم مؤشرات الأداء KPIs للشركات', 'كيف أحلل بيانات المبيعات باحتراف؟']
    }
    const latestFile = datasets[datasets.length - 1]
    return [
      `ماذا نستنتج من ملف ${latestFile.fileName}؟`,
      'ما هي أبرز الأنماط والفروق في الأرقام؟',
      'اقترح قرارات عملية بناءً على هذه البيانات',
    ]
  }, [datasets])

  const dynamicRecommendations = useMemo(() => {
    const list: Array<{
      title: string
      body: string
      tone: string
      href: string
    }> = []

    if (emptyProjectsCount > 0 && canAnalyzeAndUpload) {
      list.push({
        title: `ارفع بيانات لـ ${emptyProjectsCount} مشاريع فارغة`,
        body: 'لديك مشاريع في هذا القسم لم تُرفع لها ملفات بيانات بعد.',
        tone: 'text-primary bg-primary/15',
        href: '/upload',
      })
    }

    if (datasets.length > 0 && recentReports.length === 0) {
      list.push({
        title: 'أنشئ أول تقرير تنفيذي',
        body: `لديك ${datasets.length} ملفات محللة جاهزة للتصدير كـ PDF أو Excel.`,
        tone: 'text-emerald-400 bg-emerald-500/15',
        href: '/reports',
      })
    } else if (datasets.length > 0) {
      list.push({
        title: 'استكشف التحليلات المتقدمة',
        body: 'قارن بين المؤشرات والأعمدة واستخرج رؤى أعمق.',
        tone: 'text-cyan-400 bg-cyan-500/15',
        href: '/analytics',
      })
    }

    if (membersCount <= 1 && canManageTeam) {
      list.push({
        title: 'ادعُ فريق العمل للقسم',
        body: 'شارك المشاريع والتقارير مع المحللين والمشاهدين.',
        tone: 'text-amber-400 bg-amber-500/15',
        href: '/team',
      })
    }

    if (list.length === 0) {
      list.push({
        title: 'مراجعة لوحة المشاريع',
        body: 'استعرض جميع الرسوم البيانية التفاعلية لمشاريع القسم.',
        tone: 'text-primary bg-primary/15',
        href: '/projects',
      })
    }

    return list.slice(0, 3)
  }, [emptyProjectsCount, datasets.length, recentReports.length, membersCount, canAnalyzeAndUpload, canManageTeam])

  async function handleSendQuestion(questionText?: string) {
    const q = (questionText ?? inputValue).trim()
    if (!q || isThinking) return

    setInputValue('')
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: q }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsThinking(true)

    try {
      const workspaceContext = {
        workspaceName: activeWorkspace?.name || 'القسم النشط',
        datasets: datasets.map((d) => ({
          fileName: d.fileName,
          projectName: d.projectName,
          totalRows: d.rowCount,
          totalColumns: d.columnCount,
          columnNames: d.columnNames,
          actualRowsSample: d.sampleRows,
          computedStatisticalFacts: d.statisticalFacts,
        })),
      }

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: updatedMessages,
          workspaceContext,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'فشل الاتصال بالمساعد الذكي')
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          sources: data.sources || [],
        },
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `عذراً، تعذر الحصول على إجابة حالياً: ${err?.message || 'تحقق من إعداد مفتاح API'}`,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* المساعد الذكي */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{t.aiAssistant || 'المساعد الذكي'}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{' '}
                {dataLoading ? 'جاري قراءة الملفات...' : 'متصل • يحلل بياناتك مباشرة'}
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={() => setMessages((prev) => prev.slice(0, 1))}
              title="مسح المحادثة"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-background/50 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="max-h-80 space-y-2.5 overflow-y-auto pe-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'rounded-ss-sm bg-secondary text-foreground'
                    : 'rounded-ee-sm border border-primary/30 bg-primary/20 text-foreground'
                }`}
              >
                <FormattedChatText text={msg.text} />

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 border-t border-border/60 pt-2">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Globe className="h-3 w-3 text-primary" /> المصادر:
                    </p>
                    <div className="flex flex-col gap-1">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-[10px] text-primary hover:underline"
                        >
                          • {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                جاري قراءة الجدول واستخراج الاستنتاجات...
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {smartSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSendQuestion(s)}
                disabled={isThinking}
                className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendQuestion()
            }}
            className="relative"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.askAnythingData || 'اسأل عن أي عمود أو رقم في ملفاتك...'}
              className="h-10 w-full rounded-xl border border-border bg-background/60 ps-3.5 pe-10 text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="absolute end-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* التوصيات الذكية */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.recommendations || 'التوصيات'}</h3>
        </div>
        <div className="space-y-2">
          {dynamicRecommendations.map((r) => (
            <button
              key={r.title}
              type="button"
              onClick={() => router.push(r.href)}
              className="flex w-full items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3 text-start transition-colors hover:border-primary/40 hover:bg-background/60"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${r.tone}`}
              >
                <Zap className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{r.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* أحدث التقارير المحفوظة */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">أحدث التقارير</h3>
          </div>
          <button
            type="button"
            onClick={() => router.push('/reports')}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            الكل
          </button>
        </div>

        {recentReports.length > 0 ? (
          <div className="space-y-2">
            {recentReports.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => router.push('/reports')}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2.5 text-start transition-colors hover:border-primary/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{r.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.projectName} • {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {r.type}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-background/30 p-3 text-center text-[11px] text-muted-foreground">
            لا توجد تقارير محفوظة في هذا القسم بعد.
          </p>
        )}
      </div>
    </div>
  )
}