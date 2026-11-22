'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { extractArabicTokens, formatLocalizedInsights } from '@/lib/insightTranslator'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
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
  RefreshCw,
  Sparkles,
  Lightbulb,
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

const PROJECT_DASH_LOCALES: Record<
  string,
  {
    loadingMsg: string
    defaultTitle: string
    subtitle: string
    refreshingBtn: string
    refreshBtn: string
    reportsBtn: string
    uploadBtn: string
    projectsBtn: string
    actualLegend: string
    baselineLegend: string
    actualTooltip: string
    baselineTooltip: string
    otherCategories: string
    recordsUnit: string
    segmentLabel: string
    trendTitle: string
    trendSubtitle: string
    metricsDistTitle: string
    metricsDistSubtitle: string
    peakAvgKpi: string
    peakBadge: string
    totalCasesKpi: string
    variablesUnit: string
    extractedInsightsKpi: string
    activeAnalysisBadge: string
    avgPrefix: string
    sharePrefix: string
    shareDistTitle: (cat: string) => string
    shareDistSub: (lbl: string) => string
    compTitle: (a: string, b: string) => string
    compSub: (a: string, b: string) => string
    insightsSectionTitle: string
    recommendationLabel: string
    emptyTitle: string
    emptyDescUpload: string
    emptyDescViewer: string
    uploadNowBtn: string
  }
> = {
  en: {
    loadingMsg: 'Analyzing project data and building charts...',
    defaultTitle: 'Project Dashboard',
    subtitle: 'Interactive data analytics dashboard — hover over any chart to inspect detailed values',
    refreshingBtn: 'Updating...',
    refreshBtn: 'Refresh Analysis',
    reportsBtn: 'Reports & Recommendations',
    uploadBtn: 'Upload File',
    projectsBtn: 'Projects',
    actualLegend: 'Actual',
    baselineLegend: 'Baseline',
    actualTooltip: 'Actual Value',
    baselineTooltip: 'Baseline',
    otherCategories: 'Other categories',
    recordsUnit: 'records',
    segmentLabel: 'Segment',
    trendTitle: 'Project Metrics Trajectory',
    trendSubtitle: 'Actual variable performance vs statistical baseline',
    metricsDistTitle: 'Statistical Metrics Summary',
    metricsDistSubtitle: 'Comparison of values and averages extracted from file columns',
    peakAvgKpi: 'Highest Recorded Value',
    peakBadge: 'Peak Metric',
    totalCasesKpi: 'Total Analyzed Cases',
    variablesUnit: 'variables',
    extractedInsightsKpi: 'Extracted Insights',
    activeAnalysisBadge: 'Active Analysis',
    avgPrefix: 'Avg',
    sharePrefix: 'Share of',
    shareDistTitle: (cat) => `Share Distribution by ${cat}`,
    shareDistSub: (lbl) => `Share of (${lbl}) out of total records`,
    compTitle: (a, b) => `Comparison: ${a} vs ${b}`,
    compSub: (a, b) => `Numerical variance analysis between ${a} and ${b}`,
    insightsSectionTitle: 'Detailed Findings & Actionable Recommendations',
    recommendationLabel: 'Recommendation',
    emptyTitle: 'No data uploaded for this project yet',
    emptyDescUpload: 'Go to Upload Data, select this project, and upload an Excel or CSV file to generate KPIs and charts.',
    emptyDescViewer: 'Your team has not uploaded any datasets to this project yet.',
    uploadNowBtn: 'Upload File to Project Now',
  },
  ar: {
    loadingMsg: 'جاري تحليل بيانات المشروع وبناء الرسوم البيانية...',
    defaultTitle: 'لوحة تحكم المشروع',
    subtitle: 'لوحة تحليل البيانات التفاعلية — مرر المؤشر فوق أي رسم بياني لعرض القيم التفصيلية',
    refreshingBtn: 'جاري التحديث...',
    refreshBtn: 'تحديث التحليل',
    reportsBtn: 'التقارير والتوصيات',
    uploadBtn: 'رفع ملف',
    projectsBtn: 'المشاريع',
    actualLegend: 'الفعلي',
    baselineLegend: 'خط الأساس',
    actualTooltip: 'القيمة الفعلية',
    baselineTooltip: 'خط الأساس',
    otherCategories: 'فئات أخرى',
    recordsUnit: 'سجل',
    segmentLabel: 'شريحة',
    trendTitle: 'مسار تطور مؤشرات المشروع',
    trendSubtitle: 'الأداء الفعلي للمتغيرات مقابل خط الأساس الإحصائي',
    metricsDistTitle: 'ملخص المؤشرات الإحصائية للبيانات',
    metricsDistSubtitle: 'مقارنة القيم والمتوسطات المستخرجة من أعمدة الملف',
    peakAvgKpi: 'أعلى قيمة مسجلة',
    peakBadge: 'ذروة المؤشرات',
    totalCasesKpi: 'إجمالي الحالات المحللة',
    variablesUnit: 'متغيرات',
    extractedInsightsKpi: 'الرؤى المستخرجة',
    activeAnalysisBadge: 'تحليل نشط',
    avgPrefix: 'متوسط',
    sharePrefix: 'حصة',
    shareDistTitle: (cat) => `توزيع الحصص حسب ${cat}`,
    shareDistSub: (lbl) => `استحواذ شريحة (${lbl}) من إجمالي السجلات`,
    compTitle: (a, b) => `مقارنة ${a} و ${b}`,
    compSub: (a, b) => `تحليل الفروق الرقمية بين ${a} و ${b}`,
    insightsSectionTitle: 'النتائج التفصيلية والتوصيات القابلة للتنفيذ',
    recommendationLabel: 'التوصية',
    emptyTitle: 'لا توجد بيانات مرفوعة لهذا المشروع بعد',
    emptyDescUpload: 'اذهب إلى صفحة رفع البيانات، اختر هذا المشروع، وارفع ملف Excel أو CSV لتظهر هنا مؤشرات الأعمال والرسوم البيانية المتكاملة.',
    emptyDescViewer: 'لم يقم فريق العمل برفع أي ملفات بيانات لهذا المشروع بعد.',
    uploadNowBtn: 'رفع ملف لهذا المشروع الآن',
  },
  de: {
    loadingMsg: 'Projektdaten werden analysiert und Diagramme erstellt...',
    defaultTitle: 'Projekt-Dashboard',
    subtitle: 'Interaktives Analyse-Dashboard — bewegen Sie den Mauszeiger über ein Diagramm für Detailwerte',
    refreshingBtn: 'Wird aktualisiert...',
    refreshBtn: 'Analyse aktualisieren',
    reportsBtn: 'Berichte & Empfehlungen',
    uploadBtn: 'Datei hochladen',
    projectsBtn: 'Projekte',
    actualLegend: 'Ist-Wert',
    baselineLegend: 'Basislinie',
    actualTooltip: 'Tatsächlicher Wert',
    baselineTooltip: 'Basislinie',
    otherCategories: 'Andere Kategorien',
    recordsUnit: 'Datensätze',
    segmentLabel: 'Segment',
    trendTitle: 'Entwicklungsverlauf der Projektkennzahlen',
    trendSubtitle: 'Tatsächliche Leistung im Vergleich zur statistischen Basislinie',
    metricsDistTitle: 'Zusammenfassung der statistischen Kennzahlen',
    metricsDistSubtitle: 'Vergleich der aus den Dateispalten extrahierten Werte und Durchschnitte',
    peakAvgKpi: 'Höchster gemessener Wert',
    peakBadge: 'Spitzenwert',
    totalCasesKpi: 'Analysierte Datensätze gesamt',
    variablesUnit: 'Variablen',
    extractedInsightsKpi: 'Extrahierte Erkenntnisse',
    activeAnalysisBadge: 'Aktive Analyse',
    avgPrefix: 'Ø',
    sharePrefix: 'Anteil',
    shareDistTitle: (cat) => `Anteilsverteilung nach ${cat}`,
    shareDistSub: (lbl) => `Anteil von (${lbl}) an den Gesamtdatensätzen`,
    compTitle: (a, b) => `Vergleich: ${a} vs. ${b}`,
    compSub: (a, b) => `Numerische Abweichungsanalyse zwischen ${a} und ${b}`,
    insightsSectionTitle: 'Detaillierte Ergebnisse & Handlungsempfehlungen',
    recommendationLabel: 'Empfehlung',
    emptyTitle: 'Noch keine Daten für dieses Projekt hochgeladen',
    emptyDescUpload: 'Gehen Sie zu Daten hochladen, wählen Sie dieses Projekt und laden Sie eine Excel- oder CSV-Datei hoch.',
    emptyDescViewer: 'Ihr Team hat für dieses Projekt noch keine Datensätze hochgeladen.',
    uploadNowBtn: 'Jetzt Datei für Projekt hochladen',
  },
  es: {
    loadingMsg: 'Analizando datos del proyecto y generando gráficos...',
    defaultTitle: 'Panel del Proyecto',
    subtitle: 'Panel de análisis interactivo — pasa el cursor sobre cualquier gráfico para ver detalles',
    refreshingBtn: 'Actualizando...',
    refreshBtn: 'Actualizar análisis',
    reportsBtn: 'Informes y Recomendaciones',
    uploadBtn: 'Subir archivo',
    projectsBtn: 'Proyectos',
    actualLegend: 'Real',
    baselineLegend: 'Línea base',
    actualTooltip: 'Valor real',
    baselineTooltip: 'Línea base',
    otherCategories: 'Otras categorías',
    recordsUnit: 'registros',
    segmentLabel: 'Segmento',
    trendTitle: 'Trayectoria de métricas del proyecto',
    trendSubtitle: 'Rendimiento real frente a la línea base estadística',
    metricsDistTitle: 'Resumen de métricas estadísticas',
    metricsDistSubtitle: 'Comparación de valores y promedios extraídos de las columnas',
    peakAvgKpi: 'Valor máximo registrado',
    peakBadge: 'Pico máximo',
    totalCasesKpi: 'Total de casos analizados',
    variablesUnit: 'variables',
    extractedInsightsKpi: 'Hallazgos extraídos',
    activeAnalysisBadge: 'Análisis activo',
    avgPrefix: 'Prom.',
    sharePrefix: 'Cuota de',
    shareDistTitle: (cat) => `Distribución por ${cat}`,
    shareDistSub: (lbl) => `Participación de (${lbl}) sobre el total de registros`,
    compTitle: (a, b) => `Comparación: ${a} vs ${b}`,
    compSub: (a, b) => `Análisis de diferencia numérica entre ${a} y ${b}`,
    insightsSectionTitle: 'Hallazgos detallados y recomendaciones',
    recommendationLabel: 'Recomendación',
    emptyTitle: 'Aún no hay datos subidos para este proyecto',
    emptyDescUpload: 'Ve a Subir datos, selecciona este proyecto y sube un archivo Excel o CSV.',
    emptyDescViewer: 'Tu equipo aún no ha subido archivos para este proyecto.',
    uploadNowBtn: 'Subir archivo ahora',
  },
  it: {
    loadingMsg: 'Analisi dei dati del progetto e creazione grafici...',
    defaultTitle: 'Dashboard Progetto',
    subtitle: 'Dashboard interattiva — passa il cursore sui grafici per i valori dettagliati',
    refreshingBtn: 'Aggiornamento...',
    refreshBtn: 'Aggiorna analisi',
    reportsBtn: 'Report e Raccomandazioni',
    uploadBtn: 'Carica file',
    projectsBtn: 'Progetti',
    actualLegend: 'Reale',
    baselineLegend: 'Linea base',
    actualTooltip: 'Valore reale',
    baselineTooltip: 'Linea base',
    otherCategories: 'Altre categorie',
    recordsUnit: 'record',
    segmentLabel: 'Segmento',
    trendTitle: 'Andamento metriche di progetto',
    trendSubtitle: 'Prestazioni reali rispetto alla linea base statistica',
    metricsDistTitle: 'Riepilogo metriche statistiche',
    metricsDistSubtitle: 'Confronto dei valori e delle medie estratte dalle colonne',
    peakAvgKpi: 'Valore massimo registrato',
    peakBadge: 'Valore di picco',
    totalCasesKpi: 'Totale casi analizzati',
    variablesUnit: 'variabili',
    extractedInsightsKpi: 'Analisi estratte',
    activeAnalysisBadge: 'Analisi attiva',
    avgPrefix: 'Media',
    sharePrefix: 'Quota',
    shareDistTitle: (cat) => `Distribuzione per ${cat}`,
    shareDistSub: (lbl) => `Quota di (${lbl}) sul totale dei record`,
    compTitle: (a, b) => `Confronto: ${a} vs ${b}`,
    compSub: (a, b) => `Analisi dello scostamento numerico tra ${a} e ${b}`,
    insightsSectionTitle: 'Risultati dettagliati e raccomandazioni',
    recommendationLabel: 'Raccomandazione',
    emptyTitle: 'Nessun dato caricato per questo progetto',
    emptyDescUpload: 'Vai su Carica dati, seleziona questo progetto e carica un file Excel o CSV.',
    emptyDescViewer: 'Il team non ha ancora caricato file per questo progetto.',
    uploadNowBtn: 'Carica file ora',
  },
  fr: {
    loadingMsg: 'Analyse des données du projet et création des graphiques...',
    defaultTitle: 'Tableau de bord du projet',
    subtitle: 'Tableau de bord interactif — survolez un graphique pour afficher les valeurs détaillées',
    refreshingBtn: 'Mise à jour...',
    refreshBtn: 'Actualiser l’analyse',
    reportsBtn: 'Rapports & Recommandations',
    uploadBtn: 'Importer un fichier',
    projectsBtn: 'Projets',
    actualLegend: 'Réel',
    baselineLegend: 'Référence',
    actualTooltip: 'Valeur réelle',
    baselineTooltip: 'Référence',
    otherCategories: 'Autres catégories',
    recordsUnit: 'lignes',
    segmentLabel: 'Segment',
    trendTitle: 'Trajectoire des indicateurs du projet',
    trendSubtitle: 'Performance réelle par rapport à la base statistique',
    metricsDistTitle: 'Résumé des indicateurs statistiques',
    metricsDistSubtitle: 'Comparaison des valeurs et moyennes extraites des colonnes',
    peakAvgKpi: 'Valeur maximale enregistrée',
    peakBadge: 'Pic maximal',
    totalCasesKpi: 'Total des cas analysés',
    variablesUnit: 'variables',
    extractedInsightsKpi: 'Analyses extraites',
    activeAnalysisBadge: 'Analyse active',
    avgPrefix: 'Moy.',
    sharePrefix: 'Part de',
    shareDistTitle: (cat) => `Répartition par ${cat}`,
    shareDistSub: (lbl) => `Part de (${lbl}) sur le total des enregistrements`,
    compTitle: (a, b) => `Comparaison : ${a} vs ${b}`,
    compSub: (a, b) => `Analyse de l’écart numérique entre ${a} et ${b}`,
    insightsSectionTitle: 'Résultats détaillés et recommandations',
    recommendationLabel: 'Recommandation',
    emptyTitle: 'Aucune donnée importée pour ce projet',
    emptyDescUpload: 'Allez dans Importer un fichier, choisissez ce projet et chargez un fichier Excel ou CSV.',
    emptyDescViewer: 'Votre équipe n’a pas encore importé de fichiers pour ce projet.',
    uploadNowBtn: 'Importer un fichier maintenant',
  },
  ru: {
    loadingMsg: 'Анализ данных проекта и построение графиков...',
    defaultTitle: 'Дашборд проекта',
    subtitle: 'Интерактивная панель аналитики — наведите курсор на график для просмотра деталей',
    refreshingBtn: 'Обновление...',
    refreshBtn: 'Обновить анализ',
    reportsBtn: 'Отчёты и рекомендации',
    uploadBtn: 'Загрузить файл',
    projectsBtn: 'Проекты',
    actualLegend: 'Факт',
    baselineLegend: 'База',
    actualTooltip: 'Фактическое значение',
    baselineTooltip: 'Базовый уровень',
    otherCategories: 'Другие категории',
    recordsUnit: 'записей',
    segmentLabel: 'Сегмент',
    trendTitle: 'Динамика показателей проекта',
    trendSubtitle: 'Фактические показатели в сравнении со статистической базой',
    metricsDistTitle: 'Сводка статистических показателей',
    metricsDistSubtitle: 'Сравнение значений и средних величин по столбцам файла',
    peakAvgKpi: 'Максимальное значение',
    peakBadge: 'Пик показателей',
    totalCasesKpi: 'Всего проанализировано',
    variablesUnit: 'переменных',
    extractedInsightsKpi: 'Извлечённые выводы',
    activeAnalysisBadge: 'Активный анализ',
    avgPrefix: 'Средн.',
    sharePrefix: 'Доля',
    shareDistTitle: (cat) => `Распределение по: ${cat}`,
    shareDistSub: (lbl) => `Доля (${lbl}) от общего числа записей`,
    compTitle: (a, b) => `Сравнение: ${a} и ${b}`,
    compSub: (a, b) => `Анализ числовой разницы между ${a} и ${b}`,
    insightsSectionTitle: 'Подробные результаты и рекомендации',
    recommendationLabel: 'Рекомендация',
    emptyTitle: 'Для этого проекта ещё не загружены данные',
    emptyDescUpload: 'Перейдите в раздел загрузки данных, выберите проект и загрузите файл Excel или CSV.',
    emptyDescViewer: 'Команда ещё не загрузила файлы для этого проекта.',
    uploadNowBtn: 'Загрузить файл сейчас',
  },
  tr: {
    loadingMsg: 'Proje verileri analiz ediliyor ve grafikler oluşturuluyor...',
    defaultTitle: 'Proje Kontrol Paneli',
    subtitle: 'Etkileşimli veri analizi paneli — ayrıntılı değerleri görmek için grafiklerin üzerine gelin',
    refreshingBtn: 'Güncelleniyor...',
    refreshBtn: 'Analizi Yenile',
    reportsBtn: 'Raporlar ve Öneriler',
    uploadBtn: 'Dosya Yükle',
    projectsBtn: 'Projeler',
    actualLegend: 'Gerçekleşen',
    baselineLegend: 'Temel Çizgi',
    actualTooltip: 'Gerçekleşen Değer',
    baselineTooltip: 'Temel Değer',
    otherCategories: 'Diğer kategoriler',
    recordsUnit: 'kayıt',
    segmentLabel: 'Segment',
    trendTitle: 'Proje Metrikleri Gelişim Seyri',
    trendSubtitle: 'İstatistiksel temel çizgiye kıyasla gerçekleşen performans',
    metricsDistTitle: 'İstatistiksel Metrik Özeti',
    metricsDistSubtitle: 'Dosya sütunlarından çıkarılan değerlerin ve ortalamaların karşılaştırması',
    peakAvgKpi: 'Kaydedilen En Yüksek Değer',
    peakBadge: 'Zirve Metrik',
    totalCasesKpi: 'Analiz Edilen Toplam Kayıt',
    variablesUnit: 'değişken',
    extractedInsightsKpi: 'Çıkarılan İçgörüler',
    activeAnalysisBadge: 'Aktif Analiz',
    avgPrefix: 'Ort.',
    sharePrefix: 'Payı:',
    shareDistTitle: (cat) => `${cat} Bazında Pay Dağılımı`,
    shareDistSub: (lbl) => `Toplam kayıtlar içinde (${lbl}) payı`,
    compTitle: (a, b) => `Karşılaştırma: ${a} ve ${b}`,
    compSub: (a, b) => `${a} ile ${b} arasındaki sayısal fark analizi`,
    insightsSectionTitle: 'Ayrıntılı Bulgular ve Öneriler',
    recommendationLabel: 'Öneri',
    emptyTitle: 'Bu proje için henüz veri yüklenmedi',
    emptyDescUpload: 'Veri Yükle sayfasına gidin, bu projeyi seçin ve bir Excel veya CSV dosyası yükleyin.',
    emptyDescViewer: 'Ekibiniz henüz bu proje için veri dosyası yüklemedi.',
    uploadNowBtn: 'Şimdi Bu Projeye Dosya Yükle',
  },
}

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = (params?.projectId || params?.id) as string
  const { activeWorkspaceId, canAnalyzeAndUpload, loading: roleLoading } = useWorkspaceRole()
  const { lang } = useTranslation()
  const L = PROJECT_DASH_LOCALES[lang] ?? PROJECT_DASH_LOCALES.en!

  const [project, setProject] = useState<any>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({})

  const [hoveredWidgetPoint, setHoveredWidgetPoint] = useState<{
    widgetId: string
    index: number
  } | null>(null)

  async function hydrateFromBackend(forceRefresh = false) {
    if (!projectId) return
    if (forceRefresh) setReanalyzing(true)
    else setLoading(true)

    try {
      const session = getSession()
      const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
      const allWsIds = new Set<string>()
      if (activeWorkspaceId && activeWorkspaceId !== 'default') allWsIds.add(activeWorkspaceId)
      if (session?.workspaceId && session.workspaceId !== 'default') allWsIds.add(session.workspaceId)
      if (Array.isArray(wsList)) {
        wsList.forEach((w) => {
          const id = w?.id || w?.workspaceId
          if (id && id !== 'default') allWsIds.add(id)
        })
      }

      for (const wId of allWsIds) {
        const projRes = await apiRequest<any>(
          `/api/workspaces/${wId}/projects/${projectId}`
        ).catch(() => null)
        if (projRes && (projRes.id || projRes.name)) {
          setProject(projRes)
          break
        }
      }

      const storageKey = `insightflow_project_files_${projectId}`
      const cachedFiles: any[] = forceRefresh
        ? []
        : JSON.parse(localStorage.getItem(storageKey) || '[]')

      const remoteFiles = await apiRequest<any[]>(`/api/projects/${projectId}/files`).catch(
        () => []
      )

      const cachedMap = new Map<string, any>(
        Array.isArray(cachedFiles)
          ? cachedFiles.flatMap((c: any) => [
              [c.id, c],
              [c.fileId, c],
              [c.name, c],
            ])
          : []
      )

      const sourceList =
        Array.isArray(remoteFiles) && remoteFiles.length > 0 ? remoteFiles : cachedFiles

      if (Array.isArray(sourceList) && sourceList.length > 0) {
        const uniqueByName = new Map<string, any>()
        sourceList.forEach((item: any) => {
          const fname = item.fileName || item.originalFileName || item.name || 'Dataset'
          uniqueByName.set(fname, item)
        })

        const hydrated = await Promise.all(
          Array.from(uniqueByName.values()).map(async (rf: any) => {
            const dsId = rf.datasetId || rf.id
            const fname = rf.fileName || rf.originalFileName || rf.name || 'Dataset'
            const localMatch = cachedMap.get(dsId) || cachedMap.get(fname)

            let insightsList: any[] =
              !forceRefresh && Array.isArray(localMatch?.insights) && localMatch.insights.length > 0
                ? localMatch.insights
                : []

            if (insightsList.length === 0 && dsId) {
              await apiRequest<any>(`/api/analytics/datasets/${dsId}/process`, {
                method: 'POST',
              }).catch(() => null)

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

              const rawInsights = insRes?.insights || insRes?.Insights || []
              if (Array.isArray(rawInsights) && rawInsights.length > 0) {
                insightsList = rawInsights.map((item: any) => ({
                  title: item.title || item.Title || 'Metric',
                  description: item.description || item.Description || item.message || '',
                }))
              }
            }

            const rows = rf.rowCount ?? localMatch?.rowCount ?? 0
            const cols = rf.columnCount ?? localMatch?.columnCount ?? 0

            return {
              id: dsId,
              fileId: rf.fileId || rf.id,
              name: fname,
              rowCount: rows,
              columnCount: cols,
              insights: insightsList,
              uploadedAt: rf.uploadedAt || rf.createdAt || new Date().toISOString(),
            }
          })
        )

        setDatasets(hydrated)
        setSelectedDatasetIndex(hydrated.length - 1)
        localStorage.setItem(storageKey, JSON.stringify(hydrated))
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
    } finally {
      setLoading(false)
      setReanalyzing(false)
    }
  }

  useEffect(() => {
    if (roleLoading) return
    hydrateFromBackend(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeWorkspaceId, roleLoading])

  const activeDataset = datasets[selectedDatasetIndex]
  const rawInsights: Array<{ title: string; description: string }> = activeDataset?.insights ?? []

  useEffect(() => {
    if (lang === 'ar' || rawInsights.length === 0) {
      setTranslatedMap({})
      return
    }

    const tokens = extractArabicTokens(rawInsights)
    if (tokens.length === 0) return

    const cacheKey = `insightflow_all_tokens_${lang}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (cached && typeof cached === 'object') {
        setTranslatedMap(cached)
        return
      }
    } catch {
      // ignore
    }

    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate each short Arabic word/phrase in this array into language "${lang}". Return ONLY a valid JSON object {"original": "translation"}:\n${JSON.stringify(tokens)}`,
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
            setTranslatedMap((prev) => {
              const merged = { ...prev, ...parsed }
              localStorage.setItem(cacheKey, JSON.stringify(merged))
              return merged
            })
          }
        }
      })
      .catch(() => null)
  }, [lang, rawInsights])

  const insights = useMemo(
    () => formatLocalizedInsights(rawInsights, lang, translatedMap),
    [rawInsights, lang, translatedMap]
  )

  const tr = useCallback(
    (text: string) => {
      if (!text || lang === 'ar') return text
      const trimmed = text.trim()
      return translatedMap[trimmed] || text
    },
    [lang, translatedMap]
  )

  const totalRecords = useMemo(() => {
    if (activeDataset?.rowCount && activeDataset.rowCount > 0) {
      return activeDataset.rowCount
    }
    for (const ins of rawInsights) {
      const match = ins.description?.match(/\((\d[\d,]*)\s*(?:صف|rows|Zeilen|lignes|строк|satır)/i)
      if (match?.[1]) {
        return Number(match[1].replace(/,/g, ''))
      }
    }
    return 0
  }, [activeDataset, rawInsights])

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

    rawInsights.forEach((ins, idx) => {
      const title = ins.title || ''
      const desc = ins.description || ''

      if (
        title.includes('اكتمال البيانات') ||
        /Datenvollständigkeit|Data Completeness/i.test(title)
      ) {
        return
      }

      const quotes = Array.from(desc.matchAll(/'([^']+)'/g)).map((m) => tr(m[1] ?? ''))
      const nums = (desc.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) =>
        parseFloat(n.replace(/,/g, ''))
      )

      if (title.startsWith('تباين') && quotes.length >= 2 && nums.length >= 3) {
        const topLabel = quotes[0]!
        const lowLabel = quotes[1]!
        const topVal = nums[0]!
        const pctDiff = nums[1]!
        const lowVal = nums[2]!
        const changeStr = `+${pctDiff}%`

        widgets.push({
          id: `comp-${idx}`,
          chartType: 'comparison_bar',
          title: L.compTitle(topLabel, lowLabel),
          subtitle: L.compSub(topLabel, lowLabel),
          items: [
            { label: topLabel, value: topVal },
            { label: lowLabel, value: lowVal },
          ],
          changePct: changeStr,
          isNegative: false,
        })

        if (kpis.length < 2) {
          kpis.push({
            title: `${L.avgPrefix} ${topLabel}`,
            value: topVal.toLocaleString(lang),
            change: changeStr,
            isNegative: false,
            sparkline: 'M2 25 L20 20 L38 14 L56 16 L78 5',
            icon: 'trend',
          })
        }

        if (!allSeriesPoints.some((p) => p.label === topLabel)) {
          allSeriesPoints.push({
            label: topLabel,
            actual: topVal,
            benchmark: Number((topVal * 0.92).toFixed(2)),
          })
        }
        if (!allSeriesPoints.some((p) => p.label === lowLabel)) {
          allSeriesPoints.push({
            label: lowLabel,
            actual: lowVal,
            benchmark: Number((lowVal * 1.08).toFixed(2)),
          })
        }

        extractedBarsForDistribution.push({
          label: `${topLabel} vs ${lowLabel}`,
          value: topVal,
          pct: Math.min(100, Math.round(pctDiff)),
          isNegative: false,
        })
        return
      }

      const isConcentration =
        title.includes('تركز') ||
        title.includes('تركّز') ||
        /Konzentrationsmuster|Verteilungskonzentration|Distribution Concentration/i.test(title)

      if (isConcentration && quotes.length >= 1 && nums.length >= 2) {
        const primaryLabel = quotes[0]!
        const primaryCount = nums[0]!
        const pct = Math.min(100, Math.max(1, Math.round(nums[1]!)))
        const total = totalRecords > 0 ? totalRecords : Math.round((primaryCount * 100) / pct)
        const parenM = title.match(/\(([^)]+)\)/)
        const quoteM = title.match(/'([^']+)'/)
        const catName = tr(parenM?.[1] ?? quoteM?.[1] ?? 'Category')

        widgets.push({
          id: `donut-${idx}`,
          chartType: 'donut_share',
          title: L.shareDistTitle(catName),
          subtitle: L.shareDistSub(primaryLabel),
          primaryLabel,
          primaryCount,
          secondaryCount: Math.max(0, total - primaryCount),
          percentage: pct,
        })

        if (kpis.length < 3) {
          kpis.push({
            title: `${L.sharePrefix} ${primaryLabel}`,
            value: `${pct}%`,
            change: `${primaryCount.toLocaleString(lang)} ${L.recordsUnit}`,
            isNegative: false,
            sparkline: 'M2 22 L22 17 L42 15 L60 9 L78 4',
            icon: 'award',
          })
        }

        extractedBarsForDistribution.push({
          label: `${catName}: ${primaryLabel}`,
          value: primaryCount,
          pct,
          isNegative: false,
        })
        return
      }

      const firstNum = nums[0]
      if (firstNum !== undefined && !isNaN(firstNum)) {
        const cleanLabel = tr(title.replace(/[()]/g, '').trim())
        extractedBarsForDistribution.push({
          label: cleanLabel.slice(0, 34),
          value: firstNum,
          pct: Math.min(100, Math.max(15, Math.round(firstNum))),
          isNegative: desc.includes('انخفاض') || desc.includes('تراجع'),
        })
      }
    })

    if (extractedBarsForDistribution.length > 0) {
      const maxDist = Math.max(...extractedBarsForDistribution.map((b) => b.value), 1)
      widgets.push({
        id: 'data-metrics-bars',
        chartType: 'metric_distribution',
        title: L.metricsDistTitle,
        subtitle: L.metricsDistSubtitle,
        metrics: extractedBarsForDistribution.slice(0, 5).map((b) => ({
          ...b,
          pct: Math.min(100, Math.max(12, Math.round((b.value / maxDist) * 100))),
        })),
      })
    }

    if (allSeriesPoints.length >= 2) {
      const first = allSeriesPoints[0]!.actual
      const last = allSeriesPoints[allSeriesPoints.length - 1]!.actual
      const diffPct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0.0'
      const isNeg = Number(diffPct) < 0

      widgets.unshift({
        id: 'master-trend',
        chartType: 'trend_line',
        title: L.trendTitle,
        subtitle: L.trendSubtitle,
        points: allSeriesPoints,
        changePct: `${Number(diffPct) > 0 ? '+' : ''}${diffPct}%`,
        isNegative: isNeg,
      })
    }

    if (activeDataset) {
      if (extractedBarsForDistribution.length > 0 && kpis.length < 4) {
        const peak = Math.max(...extractedBarsForDistribution.map((p) => p.value))
        kpis.push({
          title: L.peakAvgKpi,
          value: peak.toLocaleString(lang),
          change: L.peakBadge,
          isNegative: false,
          sparkline: 'M2 26 L22 21 L44 13 L62 15 L78 3',
          icon: 'award',
        })
      }
      if (kpis.length < 4) {
        kpis.push({
          title: L.totalCasesKpi,
          value: totalRecords.toLocaleString(lang),
          change: `${activeDataset.columnCount ?? 0} ${L.variablesUnit}`,
          isNegative: false,
          sparkline: 'M2 24 L20 18 L40 20 L60 11 L78 5',
          icon: 'layers',
        })
      }
      if (kpis.length < 4) {
        kpis.push({
          title: L.extractedInsightsKpi,
          value: `${insights.length}`,
          change: L.activeAnalysisBadge,
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
  }, [rawInsights, insights.length, totalRecords, activeDataset, L, lang, tr])

  if (loading || roleLoading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <p className="animate-pulse text-sm text-muted-foreground">{L.loadingMsg}</p>
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
                  {project?.name || L.defaultTitle}
                </h1>
                {activeDataset && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {activeDataset.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{L.subtitle}</p>
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
            {activeDataset && (
              <button
                type="button"
                onClick={() => hydrateFromBackend(true)}
                disabled={reanalyzing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-xs font-medium hover:bg-secondary disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
                {reanalyzing ? L.refreshingBtn : L.refreshBtn}
              </button>
            )}
            <Link
              href={`/reports?projectId=${projectId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <FileText className="h-3.5 w-3.5" />
              {L.reportsBtn}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {canAnalyzeAndUpload && (
              <Link
                href={`/upload?projectId=${projectId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-3.5 w-3.5" />
                {L.uploadBtn}
              </Link>
            )}
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-medium hover:bg-secondary/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {L.projectsBtn}
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
                  <div className="text-end">
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
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {smartWidgets.map((widget, widgetIdx) => {
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
                    const firstPt = arr[0]
                    if (!firstPt) return ''
                    let d = `M ${firstPt.x} ${firstPt.y}`
                    for (let i = 0; i < arr.length - 1; i++) {
                      const curr = arr[i]!
                      const next = arr[i + 1]!
                      const midX = (curr.x + next.x) / 2
                      d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
                    }
                    return d
                  }

                  const actPath = buildSmooth(pts.map((p) => ({ x: p.x, y: p.yAct })))
                  const benchPath = buildSmooth(pts.map((p) => ({ x: p.x, y: p.yBench })))
                  const lastPt = pts[pts.length - 1]
                  const firstPt = pts[0]
                  const areaPath =
                    lastPt && firstPt
                      ? `${actPath} L ${lastPt.x} ${h - padY} L ${firstPt.x} ${h - padY} Z`
                      : ''

                  const activeHoverIdx =
                    hoveredWidgetPoint?.widgetId === widget.id ? hoveredWidgetPoint.index : null
                  const hoveredPt = activeHoverIdx !== null ? pts[activeHoverIdx] : undefined

                  return (
                    <div
                      key={widget.id}
                      className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-8"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <span className="h-2.5 w-5 rounded-full bg-primary" /> {L.actualLegend}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                            <span className="h-0.5 w-5 border-t-2 border-dashed border-slate-400" />{' '}
                            {L.baselineLegend}
                          </span>
                        </div>
                        <div className="text-end">
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

                        {hoveredPt && (
                          <div
                            className="pointer-events-none absolute top-3 z-20 min-w-[165px] -translate-x-1/2 rounded-xl border border-border bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md"
                            style={{ left: `${(hoveredPt.x / w) * 100}%` }}
                          >
                            <p className="mb-1.5 text-end text-xs font-bold text-foreground">
                              {hoveredPt.label}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-bold text-slate-300">
                                  {hoveredPt.benchmark.toLocaleString(lang)}
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  {L.baselineTooltip}{' '}
                                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-bold text-primary">
                                  {hoveredPt.actual.toLocaleString(lang)}
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  {L.actualTooltip}{' '}
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

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
                        <div className="text-end">
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
                              <span>{L.otherCategories}</span>
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
                              {activeHoverIdx === 1
                                ? widget.secondaryCount.toLocaleString(lang)
                                : widget.primaryCount.toLocaleString(lang)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {L.recordsUnit}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-center text-xs text-muted-foreground">
                        {activeHoverIdx === 1 ? (
                          <span>
                            {L.otherCategories}:{' '}
                            <strong className="text-emerald-400">
                              {widget.secondaryCount.toLocaleString(lang)} {L.recordsUnit}
                            </strong>{' '}
                            ({remPct}%)
                          </span>
                        ) : (
                          <span>
                            {L.segmentLabel}{' '}
                            <strong className="text-foreground">{widget.primaryLabel}</strong>:{' '}
                            <strong className="text-primary">
                              {widget.primaryCount.toLocaleString(lang)} {L.recordsUnit}
                            </strong>{' '}
                            ({widget.percentage}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }

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
                        <div className="text-end">
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
                                  isHov
                                    ? 'bg-primary text-primary-foreground shadow'
                                    : 'text-foreground'
                                }`}
                              >
                                {bar.value.toLocaleString(lang)}
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

                if (widget.chartType === 'metric_distribution') {
                  return (
                    <div
                      key={widget.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 lg:col-span-6"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <Activity className="h-5 w-5 text-cyan-400" />
                        <div className="text-end">
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
                                {m.value.toLocaleString(lang)}
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

            {/* Detailed Findings & Actionable Recommendations (0ms instant localization) */}
            {insights.length > 0 && (
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>
                    {L.insightsSectionTitle} ({insights.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {insights.map((ins, iIdx) => {
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
                                {L.recommendationLabel}:{' '}
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
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">{L.emptyTitle}</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              {canAnalyzeAndUpload ? L.emptyDescUpload : L.emptyDescViewer}
            </p>
            {canAnalyzeAndUpload && (
              <Link
                href={`/upload?projectId=${projectId}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                {L.uploadNowBtn}
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}