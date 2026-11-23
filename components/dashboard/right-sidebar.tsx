'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
import { useTranslation, SUPPORTED_LANGUAGES } from '@/lib/i18n'
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

// ذاكرة مشتركة للشريط الجانبي لمنع إعادة تحميل عشرات الطلبات عند التنقل بين الصفحات
const sidebarMemoryCache: Record<
  string,
  {
    emptyProjectsCount: number
    membersCount: number
    datasets: WorkspaceDatasetSummary[]
    recentReports: SavedReportSummary[]
    timestamp: number
  }
> = {}

const SIDEBAR_LOCALES: Record<
  string,
  {
    readingFiles: string
    connectedLive: string
    clearChat: string
    thinking: string
    sources: string
    recentReports: string
    all: string
    noSavedReports: string
    welcomeWithFiles: (ws: string, filesCount: number, rows: string) => string
    welcomeEmpty: (ws: string) => string
    sugNoData1: string
    sugNoData2: string
    sugFile: (file: string) => string
    sugPatterns: string
    sugActions: string
    recEmptyTitle: (count: number) => string
    recEmptyBody: string
    recReportTitle: string
    recReportBody: (count: number) => string
    recAnalyticsTitle: string
    recAnalyticsBody: string
    recTeamTitle: string
    recTeamBody: string
    recProjectsTitle: string
    recProjectsBody: string
    chatError: string
  }
> = {
  en: {
    readingFiles: 'Reading workspace files...',
    connectedLive: 'Online • Analyzing your data live',
    clearChat: 'Clear chat',
    thinking: 'Reading dataset and extracting insights...',
    sources: 'Sources:',
    recentReports: 'Recent Reports',
    all: 'All',
    noSavedReports: 'No saved reports in this workspace yet.',
    welcomeWithFiles: (ws, c, r) =>
      `Welcome! I've loaded "${ws}" (${c} files, ${r} records). Ask me about any metric or row in your tables and I'll analyze it directly.`,
    welcomeEmpty: (ws) =>
      `Welcome! "${ws}" is ready. Ask any analytical question or upload a dataset to get instant insights.`,
    sugNoData1: 'Key KPIs for growing businesses',
    sugNoData2: 'How to analyze sales data effectively?',
    sugFile: (f) => `What can we conclude from ${f}?`,
    sugPatterns: 'What are the key patterns and anomalies?',
    sugActions: 'Suggest actionable decisions based on this data',
    recEmptyTitle: (c) => `Upload data for ${c} empty projects`,
    recEmptyBody: 'You have projects in this department without uploaded datasets yet.',
    recReportTitle: 'Generate your first executive report',
    recReportBody: (c) => `You have ${c} analyzed files ready to export as PDF or Excel.`,
    recAnalyticsTitle: 'Explore Advanced Analytics',
    recAnalyticsBody: 'Compare metrics and columns to uncover deeper insights.',
    recTeamTitle: 'Invite your team',
    recTeamBody: 'Share projects and reports with analysts and viewers.',
    recProjectsTitle: 'Review Department Projects',
    recProjectsBody: 'Explore all interactive charts across workspace projects.',
    chatError: 'Sorry, could not get a response right now',
  },
  ar: {
    readingFiles: 'جاري قراءة الملفات...',
    connectedLive: 'متصل • يحلل بياناتك مباشرة',
    clearChat: 'مسح المحادثة',
    thinking: 'جاري قراءة الجدول واستخراج الاستنتاجات...',
    sources: 'المصادر:',
    recentReports: 'أحدث التقارير',
    all: 'الكل',
    noSavedReports: 'لا توجد تقارير محفوظة في هذا القسم بعد.',
    welcomeWithFiles: (ws, c, r) =>
      `أهلاً بك! قرأت ملفات قسم "${ws}" (${c} ملفات، ${r} سجل). اسألني عن أي تفاصيل أو أرقام داخل الجداول وسأحللها لك مباشرة.`,
    welcomeEmpty: (ws) =>
      `أهلاً بك! قسم "${ws}" جاهز. اسألني أي سؤال تحليلي أو ارفع ملف بيانات وسأساعدك فوراً.`,
    sugNoData1: 'أهم مؤشرات الأداء KPIs للشركات',
    sugNoData2: 'كيف أحلل بيانات المبيعات باحتراف؟',
    sugFile: (f) => `ماذا نستنتج من ملف ${f}؟`,
    sugPatterns: 'ما هي أبرز الأنماط والفروق في الأرقام؟',
    sugActions: 'اقترح قرارات عملية بناءً على هذه البيانات',
    recEmptyTitle: (c) => `ارفع بيانات لـ ${c} مشاريع فارغة`,
    recEmptyBody: 'لديك مشاريع في هذا القسم لم تُرفع لها ملفات بيانات بعد.',
    recReportTitle: 'أنشئ أول تقرير تنفيذي',
    recReportBody: (c) => `لديك ${c} ملفات محللة جاهزة للتصدير كـ PDF أو Excel.`,
    recAnalyticsTitle: 'استكشف التحليلات المتقدمة',
    recAnalyticsBody: 'قارن بين المؤشرات والأعمدة واستخرج رؤى أعمق.',
    recTeamTitle: 'ادعُ فريق العمل للقسم',
    recTeamBody: 'شارك المشاريع والتقارير مع المحللين والمشاهدين.',
    recProjectsTitle: 'مراجعة لوحة المشاريع',
    recProjectsBody: 'استعرض جميع الرسوم البيانية التفاعلية لمشاريع القسم.',
    chatError: 'عذراً، تعذر الحصول على إجابة حالياً',
  },
  de: {
    readingFiles: 'Dateien werden gelesen...',
    connectedLive: 'Online • Analysiert Ihre Daten live',
    clearChat: 'Chat löschen',
    thinking: 'Tabelle wird gelesen und Erkenntnisse werden extrahiert...',
    sources: 'Quellen:',
    recentReports: 'Neueste Berichte',
    all: 'Alle',
    noSavedReports: 'Noch keine gespeicherten Berichte in dieser Abteilung.',
    welcomeWithFiles: (ws, c, r) =>
      `Willkommen! Ich habe "${ws}" geladen (${c} Dateien, ${r} Datensätze). Fragen Sie mich nach beliebigen Zahlen oder Details in Ihren Tabellen.`,
    welcomeEmpty: (ws) =>
      `Willkommen! "${ws}" ist bereit. Stellen Sie eine Analysefrage oder laden Sie eine Datendatei hoch.`,
    sugNoData1: 'Wichtigste KPIs für Unternehmen',
    sugNoData2: 'Wie analysiert man Verkaufsdaten professionell?',
    sugFile: (f) => `Was lässt sich aus ${f} schließen?`,
    sugPatterns: 'Was sind die wichtigsten Muster und Abweichungen?',
    sugActions: 'Schlagen Sie konkrete Entscheidungen auf Basis dieser Daten vor',
    recEmptyTitle: (c) => `Daten für ${c} leere Projekte hochladen`,
    recEmptyBody: 'In dieser Abteilung gibt es Projekte ohne hochgeladene Datendateien.',
    recReportTitle: 'Ersten Managementbericht erstellen',
    recReportBody: (c) => `Sie haben ${c} analysierte Dateien bereit für den PDF- oder Excel-Export.`,
    recAnalyticsTitle: 'Erweiterte Analysen entdecken',
    recAnalyticsBody: 'Vergleichen Sie Kennzahlen und Spalten für tiefere Einblicke.',
    recTeamTitle: 'Team in die Abteilung einladen',
    recTeamBody: 'Teilen Sie Projekte und Berichte mit Analysten und Betrachtern.',
    recProjectsTitle: 'Projektübersicht prüfen',
    recProjectsBody: 'Alle interaktiven Diagramme der Abteilungsprojekte ansehen.',
    chatError: 'Entschuldigung, derzeit konnte keine Antwort abgerufen werden',
  },
  es: {
    readingFiles: 'Leyendo archivos...',
    connectedLive: 'En línea • Analizando tus datos en vivo',
    clearChat: 'Limpiar chat',
    thinking: 'Leyendo tabla y extrayendo conclusiones...',
    sources: 'Fuentes:',
    recentReports: 'Informes recientes',
    all: 'Todos',
    noSavedReports: 'Aún no hay informes guardados en este departamento.',
    welcomeWithFiles: (ws, c, r) =>
      `¡Bienvenido! He cargado "${ws}" (${c} archivos, ${r} registros). Pregúntame sobre cualquier cifra o detalle de tus tablas.`,
    welcomeEmpty: (ws) =>
      `¡Bienvenido! "${ws}" está listo. Haz cualquier pregunta analítica o sube un archivo de datos.`,
    sugNoData1: 'KPIs clave para empresas',
    sugNoData2: '¿Cómo analizar datos de ventas eficazmente?',
    sugFile: (f) => `¿Qué podemos concluir de ${f}?`,
    sugPatterns: '¿Cuáles son los patrones y diferencias principales?',
    sugActions: 'Sugiere decisiones prácticas basadas en estos datos',
    recEmptyTitle: (c) => `Subir datos para ${c} proyectos vacíos`,
    recEmptyBody: 'Tienes proyectos en este departamento sin archivos subidos aún.',
    recReportTitle: 'Crea tu primer informe ejecutivo',
    recReportBody: (c) => `Tienes ${c} archivos analizados listos para exportar a PDF o Excel.`,
    recAnalyticsTitle: 'Explorar Analítica Avanzada',
    recAnalyticsBody: 'Compara métricas y columnas para obtener ideas más profundas.',
    recTeamTitle: 'Invita a tu equipo',
    recTeamBody: 'Comparte proyectos e informes con analistas y lectores.',
    recProjectsTitle: 'Revisar proyectos del departamento',
    recProjectsBody: 'Explora todos los gráficos interactivos de los proyectos.',
    chatError: 'Lo sentimos, no se pudo obtener una respuesta ahora',
  },
  it: {
    readingFiles: 'Lettura file in corso...',
    connectedLive: 'Online • Analisi dei dati in tempo reale',
    clearChat: 'Cancella chat',
    thinking: 'Lettura tabella ed estrazione conclusioni...',
    sources: 'Fonti:',
    recentReports: 'Report recenti',
    all: 'Tutti',
    noSavedReports: 'Nessun report salvato in questo reparto.',
    welcomeWithFiles: (ws, c, r) =>
      `Benvenuto! Ho caricato "${ws}" (${c} file, ${r} record). Chiedimi qualsiasi dettaglio o numero nelle tue tabelle.`,
    welcomeEmpty: (ws) =>
      `Benvenuto! "${ws}" è pronto. Fai una domanda analitica o carica un file di dati.`,
    sugNoData1: 'KPI principali per le aziende',
    sugNoData2: 'Come analizzare al meglio i dati di vendita?',
    sugFile: (f) => `Cosa possiamo dedurre da ${f}?`,
    sugPatterns: 'Quali sono i principali trend e anomalie?',
    sugActions: 'Suggerisci decisioni pratiche basate su questi dati',
    recEmptyTitle: (c) => `Carica dati per ${c} progetti vuoti`,
    recEmptyBody: 'Hai progetti in questo reparto senza file caricati.',
    recReportTitle: 'Crea il tuo primo report esecutivo',
    recReportBody: (c) => `Hai ${c} file analizzati pronti per l'esportazione PDF o Excel.`,
    recAnalyticsTitle: 'Esplora Analisi Avanzate',
    recAnalyticsBody: 'Confronta metriche e colonne per approfondire.',
    recTeamTitle: 'Invita il team',
    recTeamBody: 'Condividi progetti e report con analisti e visualizzatori.',
    recProjectsTitle: 'Esamina i progetti',
    recProjectsBody: 'Visualizza tutti i grafici interattivi del reparto.',
    chatError: 'Spiacenti, impossibile ottenere una risposta al momento',
  },
  fr: {
    readingFiles: 'Lecture des fichiers...',
    connectedLive: 'En ligne • Analyse vos données en direct',
    clearChat: 'Effacer la discussion',
    thinking: 'Lecture du tableau et extraction des conclusions...',
    sources: 'Sources :',
    recentReports: 'Rapports récents',
    all: 'Tout',
    noSavedReports: 'Aucun rapport enregistré dans ce département.',
    welcomeWithFiles: (ws, c, r) =>
      `Bienvenue ! J'ai chargé "${ws}" (${c} fichiers, ${r} lignes). Posez-moi vos questions sur les chiffres de vos tableaux.`,
    welcomeEmpty: (ws) =>
      `Bienvenue ! "${ws}" est prêt. Posez une question analytique ou importez un fichier de données.`,
    sugNoData1: 'Indicateurs clés KPI pour entreprises',
    sugNoData2: 'Comment analyser efficacement les ventes ?',
    sugFile: (f) => `Que peut-on conclure de ${f} ?`,
    sugPatterns: 'Quelles sont les tendances et anomalies majeures ?',
    sugActions: 'Proposez des décisions concrètes basées sur ces données',
    recEmptyTitle: (c) => `Importer des données pour ${c} projets vides`,
    recEmptyBody: 'Vous avez des projets sans fichiers importés dans ce département.',
    recReportTitle: 'Créer votre premier rapport exécutif',
    recReportBody: (c) => `Vous avez ${c} fichiers analysés prêts à exporter en PDF ou Excel.`,
    recAnalyticsTitle: 'Explorer les analyses avancées',
    recAnalyticsBody: 'Comparez les indicateurs et colonnes pour aller plus loin.',
    recTeamTitle: 'Inviter votre équipe',
    recTeamBody: 'Partagez projets et rapports avec les analystes et lecteurs.',
    recProjectsTitle: 'Voir les projets du département',
    recProjectsBody: 'Consultez tous les graphiques interactifs des projets.',
    chatError: 'Désolé, impossible d’obtenir une réponse pour le moment',
  },
  ru: {
    readingFiles: 'Чтение файлов...',
    connectedLive: 'Онлайн • Анализ данных в реальном времени',
    clearChat: 'Очистить чат',
    thinking: 'Чтение таблицы и формирование выводов...',
    sources: 'Источники:',
    recentReports: 'Последние отчёты',
    all: 'Все',
    noSavedReports: 'В этом отделе пока нет сохранённых отчётов.',
    welcomeWithFiles: (ws, c, r) =>
      `Добро пожаловать! Я загрузил данные отдела "${ws}" (${c} файлов, ${r} записей). Спрашивайте о любых показателях и цифрах.`,
    welcomeEmpty: (ws) =>
      `Добро пожаловать! Отдел "${ws}" готов к работе. Задайте вопрос или загрузите файл данных.`,
    sugNoData1: 'Ключевые KPI для бизнеса',
    sugNoData2: 'Как эффективно анализировать продажи?',
    sugFile: (f) => `Какие выводы можно сделать из файла ${f}?`,
    sugPatterns: 'Каковы основные закономерности и отклонения?',
    sugActions: 'Предложите практические решения на основе этих данных',
    recEmptyTitle: (c) => `Загрузите данные для ${c} пустых проектов`,
    recEmptyBody: 'В этом отделе есть проекты без загруженных файлов.',
    recReportTitle: 'Создайте первый аналитический отчёт',
    recReportBody: (c) => `У вас ${c} проанализированных файлов, готовых к экспорту.`,
    recAnalyticsTitle: 'Расширенная аналитика',
    recAnalyticsBody: 'Сравнивайте показатели и столбцы для глубокого анализа.',
    recTeamTitle: 'Пригласите команду',
    recTeamBody: 'Поделитесь проектами и отчётами с аналитиками.',
    recProjectsTitle: 'Обзор проектов отдела',
    recProjectsBody: 'Просмотрите все интерактивные графики проектов.',
    chatError: 'Извините, не удалось получить ответ сейчас',
  },
  tr: {
    readingFiles: 'Dosyalar okunuyor...',
    connectedLive: 'Çevrimiçi • Verilerinizi canlı analiz ediyor',
    clearChat: 'Sohbeti temizle',
    thinking: 'Tablo okunuyor ve sonuçlar çıkarılıyor...',
    sources: 'Kaynaklar:',
    recentReports: 'Son Raporlar',
    all: 'Tümü',
    noSavedReports: 'Bu departmanda henüz kayıtlı rapor yok.',
    welcomeWithFiles: (ws, c, r) =>
      `Hoş geldiniz! "${ws}" verilerini yükledim (${c} dosya, ${r} kayıt). Tablolarınızdaki herhangi bir rakam hakkında soru sorabilirsiniz.`,
    welcomeEmpty: (ws) =>
      `Hoş geldiniz! "${ws}" hazır. Analitik bir soru sorun veya bir veri dosyası yükleyin.`,
    sugNoData1: 'Şirketler için temel KPI göstergeleri',
    sugNoData2: 'Satış verileri profesyonelce nasıl analiz edilir?',
    sugFile: (f) => `${f} dosyasından ne sonuç çıkarabiliriz?`,
    sugPatterns: 'Rakamlar arasındaki temel eğilimler ve farklar nelerdir?',
    sugActions: 'Bu verilere dayanarak pratik kararlar önerin',
    recEmptyTitle: (c) => `${c} boş proje için veri yükleyin`,
    recEmptyBody: 'Bu departmanda henüz veri dosyası yüklenmemiş projeleriniz var.',
    recReportTitle: 'İlk yönetici raporunuzu oluşturun',
    recReportBody: (c) => `PDF veya Excel olarak dışa aktarılmaya hazır ${c} analiz edilmiş dosyanız var.`,
    recAnalyticsTitle: 'Gelişmiş Analitiği Keşfedin',
    recAnalyticsBody: 'Daha derin içgörüler için göstergeleri ve sütunları karşılaştırın.',
    recTeamTitle: 'Ekibinizi davet edin',
    recTeamBody: 'Projeleri ve raporları analistler ve izleyicilerle paylaşın.',
    recProjectsTitle: 'Departman Projelerini İnceleyin',
    recProjectsBody: 'Departman projelerinin tüm etkileşimli grafiklerini görüntüleyin.',
    chatError: 'Üzgünüz, şu anda yanıt alınamadı',
  },
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
  const { t, lang } = useTranslation()
  const L = SIDEBAR_LOCALES[lang] || SIDEBAR_LOCALES.en!
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]!

  const {
    activeWorkspaceId,
    activeWorkspace,
    canAnalyzeAndUpload,
    canManageTeam,
  } = useWorkspaceRole()

  const [emptyProjectsCount, setEmptyProjectsCount] = useState(0)
  const [membersCount, setMembersCount] = useState(1)
  const [datasets, setDatasets] = useState<WorkspaceDatasetSummary[]>([])
  const [recentReports, setRecentReports] = useState<SavedReportSummary[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const session = getSession()
    const wsId =
      (activeWorkspaceId && activeWorkspaceId !== 'default' ? activeWorkspaceId : '') ||
      session?.workspaceId ||
      ''
    const wsLabel = activeWorkspace?.name || 'Workspace'

    if (!wsId) {
      setMessages([{ id: 'welcome', sender: 'ai', text: L.welcomeEmpty(wsLabel) }])
      return
    }

    // 1. إذا كانت البيانات في الذاكرة حديثة (أقل من 45 ثانية)، نستخدمها فوراً بدون أي طلب شبكة
    const cachedMem = sidebarMemoryCache[wsId]
    if (cachedMem && Date.now() - cachedMem.timestamp < 45000) {
      setEmptyProjectsCount(cachedMem.emptyProjectsCount)
      setMembersCount(cachedMem.membersCount)
      setDatasets(cachedMem.datasets)
      setRecentReports(cachedMem.recentReports)
      const totalRows = cachedMem.datasets.reduce((sum, d) => sum + d.rowCount, 0)
      const introText =
        cachedMem.datasets.length > 0
          ? L.welcomeWithFiles(wsLabel, cachedMem.datasets.length, totalRows.toLocaleString(lang))
          : L.welcomeEmpty(wsLabel)
      setMessages((prev) =>
        prev.length > 1 ? prev : [{ id: 'welcome', sender: 'ai', text: introText }]
      )
      return
    }

    // 2. قراءة فورية من localStorage أولاً حتى لا يتعطل الشريط الجانبي أو يستهلك الشبكة
    async function loadSidebarLightweight() {
      setDataLoading(true)
      try {
        const cachedProjsRaw = JSON.parse(
          localStorage.getItem(`insightflow_projects_cache_${wsId}`) || '[]'
        )
        const projList =
          Array.isArray(cachedProjsRaw) && cachedProjsRaw.length > 0
            ? cachedProjsRaw
            : await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => [])

        if (!mountedRef.current) return

        const uniqueDatasetsMap = new Map<string, WorkspaceDatasetSummary>()
        const collectedReports: SavedReportSummary[] = []
        let emptyProjs = 0

        for (const p of Array.isArray(projList) ? projList : []) {
          const pid = p.id || p.projectId
          const pname = p.name || p.title || 'Project'
          if (!pid) continue

          const cachedFiles = JSON.parse(
            localStorage.getItem(`insightflow_project_files_${pid}`) || '[]'
          )

          if (Array.isArray(cachedFiles) && cachedFiles.length > 0) {
            for (const f of cachedFiles) {
              const fname = f.name || f.fileName || 'Dataset'
              const insightsArr = Array.isArray(f.insights) ? f.insights : []
              const statisticalFacts = insightsArr.map(
                (i: any) =>
                  `${i.title || i.Title}: ${(i.description || i.Description || '').split(/التوصية:|Recommendation:|Empfehlung:/)[0].trim()}`
              )
              uniqueDatasetsMap.set(`${pid}::${fname}`, {
                projectId: pid,
                projectName: pname,
                datasetId: f.id || f.datasetId || '',
                fileName: fname,
                rowCount: f.rowCount ?? 0,
                columnCount: f.columnCount ?? 0,
                uploadedAt: f.uploadedAt,
                columnNames: f.columnNames || [],
                sampleRows: f.sampleRows || [],
                statisticalFacts,
              })
            }
          } else {
            emptyProjs++
          }
        }

        const collectedDatasets = Array.from(uniqueDatasetsMap.values())

        sidebarMemoryCache[wsId] = {
          emptyProjectsCount: emptyProjs,
          membersCount: 1,
          datasets: collectedDatasets,
          recentReports: collectedReports,
          timestamp: Date.now(),
        }

        if (!mountedRef.current) return
        setEmptyProjectsCount(emptyProjs)
        setDatasets(collectedDatasets)
        setRecentReports(collectedReports)

        const totalRows = collectedDatasets.reduce((sum, d) => sum + d.rowCount, 0)
        const introText =
          collectedDatasets.length > 0
            ? L.welcomeWithFiles(wsLabel, collectedDatasets.length, totalRows.toLocaleString(lang))
            : L.welcomeEmpty(wsLabel)

        setMessages((prev) =>
          prev.length > 1 ? prev : [{ id: 'welcome', sender: 'ai', text: introText }]
        )
      } finally {
        if (mountedRef.current) setDataLoading(false)
      }
    }

    loadSidebarLightweight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId, activeWorkspace?.name, lang])

  const smartSuggestions = useMemo(() => {
    if (datasets.length === 0) {
      return [L.sugNoData1, L.sugNoData2]
    }
    const latestFile = datasets[datasets.length - 1]!
    return [L.sugFile(latestFile.fileName), L.sugPatterns, L.sugActions]
  }, [datasets, L])

  const dynamicRecommendations = useMemo(() => {
    const list: Array<{
      title: string
      body: string
      tone: string
      href: string
    }> = []

    if (emptyProjectsCount > 0 && canAnalyzeAndUpload) {
      list.push({
        title: L.recEmptyTitle(emptyProjectsCount),
        body: L.recEmptyBody,
        tone: 'text-primary bg-primary/15',
        href: '/upload',
      })
    }

    if (datasets.length > 0 && recentReports.length === 0) {
      list.push({
        title: L.recReportTitle,
        body: L.recReportBody(datasets.length),
        tone: 'text-emerald-400 bg-emerald-500/15',
        href: '/reports',
      })
    } else if (datasets.length > 0) {
      list.push({
        title: L.recAnalyticsTitle,
        body: L.recAnalyticsBody,
        tone: 'text-cyan-400 bg-cyan-500/15',
        href: '/analytics',
      })
    }

    if (membersCount <= 1 && canManageTeam) {
      list.push({
        title: L.recTeamTitle,
        body: L.recTeamBody,
        tone: 'text-amber-400 bg-amber-500/15',
        href: '/team',
      })
    }

    if (list.length === 0) {
      list.push({
        title: L.recProjectsTitle,
        body: L.recProjectsBody,
        tone: 'text-primary bg-primary/15',
        href: '/projects',
      })
    }

    return list.slice(0, 3)
  }, [
    emptyProjectsCount,
    datasets.length,
    recentReports.length,
    membersCount,
    canAnalyzeAndUpload,
    canManageTeam,
    L,
  ])

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
        workspaceName: activeWorkspace?.name || 'Workspace',
        preferredLanguage: `${currentLangObj.englishName} (${currentLangObj.nativeName})`,
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
          message: `[Respond strictly in ${currentLangObj.englishName} (${currentLangObj.nativeName})]\n${q}`,
          history: updatedMessages,
          workspaceContext,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || L.chatError)
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
          text: `${L.chatError}: ${err?.message || ''}`,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* AI Assistant */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{t.aiAssistant}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{' '}
                {dataLoading ? L.readingFiles : L.connectedLive}
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={() => setMessages((prev) => prev.slice(0, 1))}
              title={L.clearChat}
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
                      <Globe className="h-3 w-3 text-primary" /> {L.sources}
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
                          - {src.title}
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
                {L.thinking}
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
              placeholder={t.askAnythingData}
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

      {/* Recommendations */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.recommendations}</h3>
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

      {/* Recent Reports */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{L.recentReports}</h3>
          </div>
          <button
            type="button"
            onClick={() => router.push('/reports')}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {L.all}
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
                    {r.projectName} • {new Date(r.createdAt).toLocaleDateString(lang)}
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
            {L.noSavedReports}
          </p>
        )}
      </div>
    </div>
  )
}