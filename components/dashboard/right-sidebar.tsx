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
  insights: Array<{ title: string; description: string }>
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

  const [projectsCount, setProjectsCount] = useState(0)
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
          setProjectsCount(0)
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
        setProjectsCount(projList.length)
        setMembersCount(Array.isArray(rawMembers) && rawMembers.length > 0 ? rawMembers.length : 1)

        const collectedDatasets: WorkspaceDatasetSummary[] = []
        const collectedReports: SavedReportSummary[] = []
        let emptyProjs = 0

        for (const p of projList) {
          const pid = p.id || p.projectId
          const pname = p.name || 'مشروع'
          if (!pid) continue

          // 1. جلب الملفات من التخزين المحلي أو الباك إند
          const storageKey = `insightflow_project_files_${pid}`
          const cached = JSON.parse(localStorage.getItem(storageKey) || '[]')
          let projHasFiles = false

          if (Array.isArray(cached) && cached.length > 0) {
            projHasFiles = true
            cached.forEach((ds: any) => {
              collectedDatasets.push({
                projectId: pid,
                projectName: pname,
                datasetId: ds.id,
                fileName: ds.name,
                rowCount: ds.rowCount ?? 0,
                columnCount: ds.columnCount ?? 0,
                insights: ds.insights || [],
              })
            })
          } else {
            const remoteFiles = await apiRequest<any[]>(`/api/projects/${pid}/files`).catch(
              () => []
            )
            if (Array.isArray(remoteFiles) && remoteFiles.length > 0) {
              projHasFiles = true
              remoteFiles.forEach((rf: any) => {
                collectedDatasets.push({
                  projectId: pid,
                  projectName: pname,
                  datasetId: rf.datasetId || rf.id,
                  fileName: rf.fileName || rf.originalFileName || rf.name || 'ملف بيانات',
                  rowCount: rf.rowCount ?? 0,
                  columnCount: rf.columnCount ?? 0,
                  insights: [],
                })
              })
            }
          }

          if (!projHasFiles) emptyProjs++

          // 2. جلب التقارير المحفوظة للمشروع
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

        setEmptyProjectsCount(emptyProjs)
        setDatasets(collectedDatasets)
        collectedReports.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecentReports(collectedReports.slice(0, 3))

        // تهيئة الرسالة الترحيبية للمساعد بناءً على بيانات القسم الفعلية
        const totalRows = collectedDatasets.reduce((sum, d) => sum + d.rowCount, 0)
        const latestInsight = collectedDatasets
          .flatMap((d) => d.insights)
          .find((i) => i.title && !i.title.includes('اكتمال البيانات'))

        const introText =
          collectedDatasets.length > 0
            ? `مرحباً! أراقب حالياً "${activeWorkspace?.name || 'القسم النشط'}" (${projList.length} مشاريع، ${collectedDatasets.length} ملفات، ${totalRows.toLocaleString()} سجل).${
                latestInsight
                  ? ` أبرز ملاحظة: ${latestInsight.title} — ${latestInsight.description}`
                  : ''
              }`
            : `مرحباً! القسم "${activeWorkspace?.name || 'الحالي'}" جاهز للتحليل. ارفع ملف Excel أو CSV لأي مشروع وسأستخرج لك أهم المؤشرات والتوصيات فوراً.`

        setMessages([{ id: 'welcome', sender: 'ai', text: introText }])
      } catch (err) {
        console.error('RightSidebar context error:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadSidebarContext()
  }, [activeWorkspaceId, activeWorkspace?.name, roleLoading])

  // اقتراحات أسئلة ذكية ديناميكية
  const smartSuggestions = useMemo(() => {
    if (datasets.length === 0) {
      return ['كيف أبدأ بتحليل بياناتي؟', 'ما هي صيغ الملفات المدعومة؟']
    }
    const latestFile = datasets[datasets.length - 1]
    return [
      `لخّص أهم نتائج ملف ${latestFile.fileName}`,
      'ما هي أبرز الاتجاهات والفروق في القسم؟',
      'حدّث التحليل بالذكاء الاصطناعي',
    ]
  }, [datasets])

  // توصيات ديناميكية قابلة للتنفيذ
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
    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    try {
      const latestDs = datasets[datasets.length - 1]
      let reply = ''

      if (!latestDs) {
        if (q.includes('صيغ')) {
          reply =
            'تدعم المنصة ملفات Excel (.xlsx, .xls) وملفات CSV. اذهب إلى صفحة "رفع ملف بيانات" واختر المشروع لبدء التحليل التلقائي.'
        } else {
          reply =
            'لا توجد ملفات مرفوعة في هذا القسم حتى الآن. ارفع ملف بيانات لأحد مشاريعك وسأقوم بتحليل الأعمدة والصفوف وتلخيص النتائج لك فوراً.'
        }
      } else if (q.includes('حدّث') || q.includes('تحديث') || q.includes('ذكاء')) {
        // استدعاء محرك الذكاء الاصطناعي الحقيقي من الباك إند
        const res = await apiRequest<any>(
          `/api/analytics/datasets/${latestDs.datasetId}/insights`,
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

        const freshInsights: any[] = res?.insights || res?.Insights || latestDs.insights || []
        if (freshInsights.length > 0) {
          const topTwo = freshInsights.slice(0, 2)
          reply = `تم تحديث تحليل ملف "${latestDs.fileName}":\n• ${topTwo
            .map((i: any) => `${i.title}: ${i.description}`)
            .join('\n• ')}`
        } else {
          reply = `ملف "${latestDs.fileName}" يحتوي على ${latestDs.rowCount.toLocaleString()} سجل و ${latestDs.columnCount} أعمدة، وهو جاهز للاستعلام في مركز التحليلات.`
        }
      } else {
        // تلخيص ذكي من الرؤى والبيانات المستخرجة لملفات القسم
        const allInsights = datasets.flatMap((d) =>
          d.insights.map((ins) => ({ ...ins, fileName: d.fileName }))
        )
        const matching = allInsights.filter(
          (ins) =>
            q.split(/\s+/).some((word) => word.length > 2 && (ins.title?.includes(word) || ins.description?.includes(word)))
        )

        const chosen = (matching.length > 0 ? matching : allInsights).slice(0, 3)

        if (chosen.length > 0) {
          reply = `بناءً على بيانات القسم (${datasets.length} ملفات):\n• ${chosen
            .map((c) => `[${c.fileName}] ${c.title}: ${c.description}`)
            .join('\n• ')}`
        } else {
          const totalRows = datasets.reduce((s, d) => s + d.rowCount, 0)
          reply = `القسم يضم ${projectsCount} مشاريع و ${datasets.length} ملفات بإجمالي ${totalRows.toLocaleString()} سجل. أحدث ملف هو "${latestDs.fileName}" (${latestDs.rowCount.toLocaleString()} صف). يمكنك فتح مركز التحليلات لإجراء مقارنات مخصصة.`
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: 'ai', text: reply },
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
                {dataLoading ? 'جاري المزامنة...' : t.online || 'متصل ببيانات القسم'}
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
          {/* سجل الرسائل */}
          <div className="max-h-56 space-y-2.5 overflow-y-auto pe-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`whitespace-pre-line rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'rounded-ss-sm bg-secondary text-foreground'
                    : 'rounded-ee-sm bg-primary/20 text-foreground border border-primary/30'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                جاري تحليل بيانات القسم...
              </div>
            )}
          </div>

          {/* اقتراحات سريعة */}
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

          {/* مربع الإدخال */}
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
              placeholder={t.askAnythingData || 'اسأل أي شيء عن بياناتك...'}
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