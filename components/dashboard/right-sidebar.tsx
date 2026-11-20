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
  uploadedAt?: string
  insights: Array<{ title: string; description: string }>
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

        const collectedDatasets: WorkspaceDatasetSummary[] = []
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
            Array.isArray(cached) ? cached.map((c: any) => [c.id, c]) : []
          )

          if (Array.isArray(remoteFiles) && remoteFiles.length > 0) {
            remoteFiles.forEach((rf: any) => {
              const dsId = rf.datasetId || rf.fileId || rf.id
              const localMatch = cachedMap.get(dsId)
              collectedDatasets.push({
                projectId: pid,
                projectName: pname,
                datasetId: dsId,
                fileName: rf.fileName || rf.name || 'ملف بيانات',
                rowCount: rf.rowCount ?? localMatch?.rowCount ?? 0,
                columnCount: rf.columnCount ?? localMatch?.columnCount ?? 0,
                uploadedAt: rf.uploadedAt,
                insights: localMatch?.insights || [],
              })
            })
          } else if (Array.isArray(cached) && cached.length > 0) {
            cached.forEach((ds: any) => {
              collectedDatasets.push({
                projectId: pid,
                projectName: pname,
                datasetId: ds.id,
                fileName: ds.name,
                rowCount: ds.rowCount ?? 0,
                columnCount: ds.columnCount ?? 0,
                uploadedAt: ds.uploadedAt,
                insights: ds.insights || [],
              })
            })
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

        setEmptyProjectsCount(emptyProjs)
        setDatasets(collectedDatasets)
        collectedReports.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecentReports(collectedReports.slice(0, 3))

        const totalRows = collectedDatasets.reduce((sum, d) => sum + d.rowCount, 0)
        const introText =
          collectedDatasets.length > 0
            ? `مرحباً! أراقب حالياً "${activeWorkspace?.name || 'القسم النشط'}" (${projList.length} مشاريع، ${collectedDatasets.length} ملفات، ${totalRows.toLocaleString()} سجل). اسألني عن أي ملف أو مشروع أو اطلب تحليلاً فورياً.`
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

  // دالة مساعدة لجلب رؤى الذكاء الاصطناعي الحقيقية من الباك إند لملف معين
  async function fetchLiveInsightsForDataset(ds: WorkspaceDatasetSummary) {
    if (ds.insights && ds.insights.length > 0) {
      return ds.insights
    }

    const res = await apiRequest<any>(
      `/api/analytics/datasets/${ds.datasetId}/insights`,
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

    const rawList: any[] = res?.insights || res?.Insights || []
    const mapped = rawList.map((item: any) => ({
      title: item.title || item.Title || 'ملاحظة تحليلية',
      description: item.description || item.Description || item.message || '',
    }))

    if (mapped.length > 0) {
      setDatasets((prev) =>
        prev.map((item) =>
          item.datasetId === ds.datasetId ? { ...item, insights: mapped } : item
        )
      )
    }

    return mapped
  }

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
            'تدعم المنصة ملفات Excel (.xlsx, .xls) وملفات CSV. يمكنك رفعها من صفحة "رفع ملف بيانات" ليتم تحليلها تلقائياً.'
        } else {
          reply =
            'لا توجد ملفات مرفوعة في هذا القسم حتى الآن. ارفع ملف بيانات لأحد مشاريعك وسأقوم بتحليله وتلخيص نتائجه فوراً.'
        }
      } else if (q.includes('حدّث') || q.includes('تحديث') || q.includes('ذكاء')) {
        // إجبار إعادة استدعاء محرك الذكاء الاصطناعي من الباك إند
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

        const rawList: any[] = res?.insights || res?.Insights || []
        const fresh = rawList.map((item: any) => ({
          title: item.title || item.Title || 'ملاحظة تحليلية',
          description: item.description || item.Description || '',
        }))

        if (fresh.length > 0) {
          setDatasets((prev) =>
            prev.map((item) =>
              item.datasetId === latestDs.datasetId ? { ...item, insights: fresh } : item
            )
          )
          reply = `تم تحديث التحليل الذكي لملف "${latestDs.fileName}":\n• ${fresh
            .slice(0, 3)
            .map((i) => `${i.title}: ${i.description}`)
            .join('\n• ')}`
        } else {
          reply = `تم فحص ملف "${latestDs.fileName}" (${latestDs.rowCount.toLocaleString()} صف × ${latestDs.columnCount} عمود). افتح مركز التحليلات لتحديد الأعمدة والمقاييس المراد تحليلها.`
        }
      } else if (q.includes('لخّص') || q.includes('نتائج') || q.includes('ملخص')) {
        // البحث عن الملف المذكور في السؤال أو استخدام أحدث ملف
        const targetDs =
          datasets.find((d) => q.toLowerCase().includes(d.fileName.toLowerCase())) || latestDs
        const liveInsights = await fetchLiveInsightsForDataset(targetDs)

        if (liveInsights.length > 0) {
          reply = `ملخص نتائج ملف "${targetDs.fileName}" (${targetDs.rowCount.toLocaleString()} سجل و ${targetDs.columnCount} أعمدة):\n• ${liveInsights
            .slice(0, 3)
            .map((i) => `${i.title}: ${i.description}`)
            .join('\n• ')}`
        } else {
          reply = `ملف "${targetDs.fileName}" تابع لمشروع "${targetDs.projectName}"، ويحتوي على ${targetDs.rowCount.toLocaleString()} صف و ${targetDs.columnCount} أعمدة وهو جاهز لعرض الرسوم البيانية في لوحة المشروع.`
        }
      } else if (q.includes('اتجاهات') || q.includes('فروق') || q.includes('مقارن')) {
        const liveInsights = await fetchLiveInsightsForDataset(latestDs)
        const byProject = projects.map((p) => {
          const pFiles = datasets.filter((d) => d.projectId === p.id)
          const pRows = pFiles.reduce((s, f) => s + f.rowCount, 0)
          return `${p.name}: ${pFiles.length} ملف (${pRows.toLocaleString()} سجل)`
        })

        reply = `مقارنة وتوزيع البيانات عبر مشاريع القسم:\n• ${byProject.join('\n• ')}${
          liveInsights.length > 0
            ? `\n\nأبرز اتجاه مكتشف في "${latestDs.fileName}":\n• ${liveInsights[0].title}: ${liveInsights[0].description}`
            : ''
        }`
      } else if (q.includes('مشاريع') || q.includes('مشروع')) {
        reply = `يحتوي هذا القسم على ${projects.length} مشاريع:\n• ${projects
          .map((p) => {
            const count = datasets.filter((d) => d.projectId === p.id).length
            return `${p.name} (${count} ملفات)`
          })
          .join('\n• ')}`
      } else if (q.includes('ملف') || q.includes('ملفات')) {
        const topFiles = datasets.slice(-5).reverse()
        reply = `أحدث الملفات المرفوعة في القسم (${datasets.length} إجمالاً):\n• ${topFiles
          .map((f) => `${f.fileName} (${f.rowCount.toLocaleString()} صف) — مشروع ${f.projectName}`)
          .join('\n• ')}`
      } else {
        // لأي سؤال حر يكتبه المستخدم: نبحث في الرؤى الحية من السيرفر
        const liveInsights = await fetchLiveInsightsForDataset(latestDs)
        const keywords = q.split(/\s+/).filter((w) => w.length > 2)
        const matched = liveInsights.filter((ins) =>
          keywords.some(
            (kw) =>
              ins.title.toLowerCase().includes(kw.toLowerCase()) ||
              ins.description.toLowerCase().includes(kw.toLowerCase())
          )
        )

        if (matched.length > 0) {
          reply = `إليك ما وجدته بخصوص سؤالك في "${latestDs.fileName}":\n• ${matched
            .slice(0, 3)
            .map((m) => `${m.title}: ${m.description}`)
            .join('\n• ')}`
        } else if (liveInsights.length > 0) {
          reply = `بناءً على تحليل أحدث بيانات القسم ("${latestDs.fileName}"):\n• ${liveInsights
            .slice(0, 2)
            .map((m) => `${m.title}: ${m.description}`)
            .join('\n• ')}\n\nيمكنك أيضاً فتح "مركز التحليلات" لتصفية الأعمدة بدقة.`
        } else {
          reply = `تم التحقق من "${latestDs.fileName}" (${latestDs.rowCount.toLocaleString()} سجل). لطرح استعلامات تفصيلية على أعمدة محددة، انتقل إلى صفحة "التحليلات" واختر المقاييس المطلوبة.`
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