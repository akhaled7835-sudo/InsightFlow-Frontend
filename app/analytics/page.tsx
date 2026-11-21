'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
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

const ANALYTICS_LOCALES: Record<
  string,
  {
    title: string
    subtitle: string
    addSourceBtn: string
    activeBadge: string
    totalSourcesKpi: string
    totalRecordsKpi: string
    totalInsightsKpi: string
    highBadge: string
    reliabilityKpi: string
    loadingMsg: string
    volumeCompTitle: string
    volumeCompSub: string
    recordsUnit: string
    projectLabel: string
    variablesUnit: string
    refreshBtn: string
    projectDashBtn: string
    rowsUnit: string
    colsUnit: string
    metricBadge: (idx: number) => string
    emptyTitle: string
    emptyDescUpload: string
    emptyDescViewer: string
    uploadNowBtn: string
  }
> = {
  en: {
    title: 'Advanced Analytics Center',
    subtitle: 'Compare performance across all workspace files and projects and explore statistical metrics',
    addSourceBtn: 'Add New Data Source',
    activeBadge: 'Active',
    totalSourcesKpi: 'Total Data Sources',
    totalRecordsKpi: 'Total Processed Records',
    totalInsightsKpi: 'Discovered Patterns & Insights',
    highBadge: 'High',
    reliabilityKpi: 'Data Reliability Rate',
    loadingMsg: 'Aggregating analytics data across projects...',
    volumeCompTitle: 'Data Volume Comparison Across Projects',
    volumeCompSub: 'Select any file to inspect its detailed analysis',
    recordsUnit: 'records',
    projectLabel: 'Project',
    variablesUnit: 'variables',
    refreshBtn: 'Refresh Analysis',
    projectDashBtn: 'Project Dashboard',
    rowsUnit: 'rows',
    colsUnit: 'columns',
    metricBadge: (i) => `Metric #${i}`,
    emptyTitle: 'No data available for analysis yet',
    emptyDescUpload: 'Upload an Excel or CSV file first to view comprehensive cross-project statistical comparisons.',
    emptyDescViewer: 'Your team has not uploaded any datasets in this workspace yet.',
    uploadNowBtn: 'Upload File Now',
  },
  ar: {
    title: 'مركز التحليلات المتقدمة',
    subtitle: 'مقارنة الأداء عبر جميع ملفات ومشاريع مساحة العمل واستكشاف المؤشرات الإحصائية',
    addSourceBtn: 'إضافة مصدر بيانات جديد',
    activeBadge: 'نشط',
    totalSourcesKpi: 'إجمالي مصادر البيانات',
    totalRecordsKpi: 'إجمالي السجلات المعالجة',
    totalInsightsKpi: 'إجمالي الأنماط والرؤى المكتشفة',
    highBadge: 'عالية',
    reliabilityKpi: 'معدل موثوقية البيانات',
    loadingMsg: 'جاري تجميع بيانات التحليل عبر المشاريع...',
    volumeCompTitle: 'مقارنة حجم البيانات بين المشاريع',
    volumeCompSub: 'اختر أي ملف لاستعراض تحليله التفصيلي',
    recordsUnit: 'سجل',
    projectLabel: 'المشروع',
    variablesUnit: 'متغيرات',
    refreshBtn: 'تحديث التحليل',
    projectDashBtn: 'داشبورد المشروع',
    rowsUnit: 'صف',
    colsUnit: 'أعمدة',
    metricBadge: (i) => `مؤشر #${i}`,
    emptyTitle: 'لا توجد بيانات متاحة للتحليل بعد',
    emptyDescUpload: 'قم برفع ملف Excel أو CSV أولاً لتظهر هنا المقارنات الإحصائية الشاملة عبر جميع مشاريعك.',
    emptyDescViewer: 'لم يقم فريق العمل برفع أي ملفات بيانات للعرض في هذه المساحة بعد.',
    uploadNowBtn: 'رفع ملف الآن',
  },
  de: {
    title: 'Erweitertes Analysezentrum',
    subtitle: 'Leistung über alle Dateien und Projekte hinweg vergleichen und statistische Kennzahlen erkunden',
    addSourceBtn: 'Neue Datenquelle hinzufügen',
    activeBadge: 'Aktiv',
    totalSourcesKpi: 'Datenquellen gesamt',
    totalRecordsKpi: 'Verarbeitete Datensätze gesamt',
    totalInsightsKpi: 'Entdeckte Muster & Erkenntnisse',
    highBadge: 'Hoch',
    reliabilityKpi: 'Datenzuverlässigkeit',
    loadingMsg: 'Analysedaten werden projektübergreifend zusammengestellt...',
    volumeCompTitle: 'Datenvolumen-Vergleich zwischen Projekten',
    volumeCompSub: 'Wählen Sie eine Datei für die Detailanalyse aus',
    recordsUnit: 'Datensätze',
    projectLabel: 'Projekt',
    variablesUnit: 'Variablen',
    refreshBtn: 'Analyse aktualisieren',
    projectDashBtn: 'Projekt-Dashboard',
    rowsUnit: 'Zeilen',
    colsUnit: 'Spalten',
    metricBadge: (i) => `Kennzahl #${i}`,
    emptyTitle: 'Noch keine Daten zur Analyse verfügbar',
    emptyDescUpload: 'Laden Sie zuerst eine Excel- oder CSV-Datei hoch, um projektübergreifende Vergleiche zu sehen.',
    emptyDescViewer: 'Ihr Team hat in diesem Bereich noch keine Datensätze hochgeladen.',
    uploadNowBtn: 'Jetzt Datei hochladen',
  },
  es: {
    title: 'Centro de Analítica Avanzada',
    subtitle: 'Compara el rendimiento entre todos los archivos y proyectos del espacio de trabajo',
    addSourceBtn: 'Añadir nueva fuente de datos',
    activeBadge: 'Activo',
    totalSourcesKpi: 'Total de fuentes de datos',
    totalRecordsKpi: 'Total de registros procesados',
    totalInsightsKpi: 'Patrones y hallazgos descubiertos',
    highBadge: 'Alta',
    reliabilityKpi: 'Tasa de fiabilidad de datos',
    loadingMsg: 'Recopilando datos analíticos entre proyectos...',
    volumeCompTitle: 'Comparación de volumen de datos entre proyectos',
    volumeCompSub: 'Selecciona cualquier archivo para ver su análisis detallado',
    recordsUnit: 'registros',
    projectLabel: 'Proyecto',
    variablesUnit: 'variables',
    refreshBtn: 'Actualizar análisis',
    projectDashBtn: 'Panel del proyecto',
    rowsUnit: 'filas',
    colsUnit: 'columnas',
    metricBadge: (i) => `Métrica #${i}`,
    emptyTitle: 'Aún no hay datos disponibles para analizar',
    emptyDescUpload: 'Sube primero un archivo Excel o CSV para ver comparaciones estadísticas globales.',
    emptyDescViewer: 'Tu equipo aún no ha subido archivos de datos en este espacio.',
    uploadNowBtn: 'Subir archivo ahora',
  },
  it: {
    title: 'Centro di Analisi Avanzata',
    subtitle: 'Confronta le prestazioni di tutti i file e progetti e esplora le metriche statistiche',
    addSourceBtn: 'Aggiungi nuova fonte dati',
    activeBadge: 'Attivo',
    totalSourcesKpi: 'Totale fonti dati',
    totalRecordsKpi: 'Totale record elaborati',
    totalInsightsKpi: 'Pattern e analisi scoperte',
    highBadge: 'Alta',
    reliabilityKpi: 'Affidabilità dei dati',
    loadingMsg: 'Aggregazione dati analitici tra i progetti...',
    volumeCompTitle: 'Confronto volume dati tra progetti',
    volumeCompSub: 'Seleziona un file per visualizzarne l’analisi dettagliata',
    recordsUnit: 'record',
    projectLabel: 'Progetto',
    variablesUnit: 'variabili',
    refreshBtn: 'Aggiorna analisi',
    projectDashBtn: 'Dashboard progetto',
    rowsUnit: 'righe',
    colsUnit: 'colonne',
    metricBadge: (i) => `Metrica #${i}`,
    emptyTitle: 'Nessun dato disponibile per l’analisi',
    emptyDescUpload: 'Carica prima un file Excel o CSV per visualizzare i confronti statistici completi.',
    emptyDescViewer: 'Il team non ha ancora caricato file di dati in quest’area.',
    uploadNowBtn: 'Carica file ora',
  },
  fr: {
    title: 'Centre d’Analytique Avancée',
    subtitle: 'Comparez les performances sur tous les fichiers et projets et explorez les indicateurs',
    addSourceBtn: 'Ajouter une source de données',
    activeBadge: 'Actif',
    totalSourcesKpi: 'Total des sources de données',
    totalRecordsKpi: 'Total des lignes traitées',
    totalInsightsKpi: 'Tendances et analyses détectées',
    highBadge: 'Élevée',
    reliabilityKpi: 'Taux de fiabilité des données',
    loadingMsg: 'Agrégation des données analytiques entre projets...',
    volumeCompTitle: 'Comparaison du volume de données par projet',
    volumeCompSub: 'Sélectionnez un fichier pour voir son analyse détaillée',
    recordsUnit: 'lignes',
    projectLabel: 'Projet',
    variablesUnit: 'variables',
    refreshBtn: 'Actualiser l’analyse',
    projectDashBtn: 'Tableau de bord',
    rowsUnit: 'lignes',
    colsUnit: 'colonnes',
    metricBadge: (i) => `Indicateur #${i}`,
    emptyTitle: 'Aucune donnée disponible pour l’analyse',
    emptyDescUpload: 'Importez d’abord un fichier Excel ou CSV pour afficher les comparaisons statistiques.',
    emptyDescViewer: 'Votre équipe n’a pas encore importé de fichiers dans cet espace.',
    uploadNowBtn: 'Importer un fichier',
  },
  ru: {
    title: 'Центр расширенной аналитики',
    subtitle: 'Сравнение показателей по всем файлам и проектам и изучение статистических метрик',
    addSourceBtn: 'Добавить источник данных',
    activeBadge: 'Активен',
    totalSourcesKpi: 'Всего источников данных',
    totalRecordsKpi: 'Всего обработано записей',
    totalInsightsKpi: 'Обнаружено закономерностей',
    highBadge: 'Высокая',
    reliabilityKpi: 'Надёжность данных',
    loadingMsg: 'Сбор аналитических данных по проектам...',
    volumeCompTitle: 'Сравнение объёма данных по проектам',
    volumeCompSub: 'Выберите файл для просмотра подробного анализа',
    recordsUnit: 'записей',
    projectLabel: 'Проект',
    variablesUnit: 'переменных',
    refreshBtn: 'Обновить анализ',
    projectDashBtn: 'Дашборд проекта',
    rowsUnit: 'строк',
    colsUnit: 'столбцов',
    metricBadge: (i) => `Показатель #${i}`,
    emptyTitle: 'Пока нет данных для анализа',
    emptyDescUpload: 'Сначала загрузите файл Excel или CSV, чтобы увидеть статистическое сравнение.',
    emptyDescViewer: 'Команда ещё не загрузила файлы данных в это пространство.',
    uploadNowBtn: 'Загрузить файл сейчас',
  },
  tr: {
    title: 'Gelişmiş Analitik Merkezi',
    subtitle: 'Tüm çalışma alanı dosyaları ve projelerindeki performansı karşılaştırın ve metrikleri inceleyin',
    addSourceBtn: 'Yeni Veri Kaynağı Ekle',
    activeBadge: 'Aktif',
    totalSourcesKpi: 'Toplam Veri Kaynağı',
    totalRecordsKpi: 'İşlenen Toplam Kayıt',
    totalInsightsKpi: 'Keşfedilen Örüntü ve İçgörüler',
    highBadge: 'Yüksek',
    reliabilityKpi: 'Veri Güvenilirlik Oranı',
    loadingMsg: 'Projeler genelindeki analiz verileri toplanıyor...',
    volumeCompTitle: 'Projeler Arası Veri Hacmi Karşılaştırması',
    volumeCompSub: 'Ayrıntılı analizini görmek için bir dosya seçin',
    recordsUnit: 'kayıt',
    projectLabel: 'Proje',
    variablesUnit: 'değişken',
    refreshBtn: 'Analizi Yenile',
    projectDashBtn: 'Proje Paneli',
    rowsUnit: 'satır',
    colsUnit: 'sütun',
    metricBadge: (i) => `Metrik #${i}`,
    emptyTitle: 'Henüz analiz edilecek veri yok',
    emptyDescUpload: 'Kapsamlı istatistiksel karşılaştırmaları görmek için önce bir Excel veya CSV dosyası yükleyin.',
    emptyDescViewer: 'Ekibiniz henüz bu çalışma alanına veri dosyası yüklemedi.',
    uploadNowBtn: 'Şimdi Dosya Yükle',
  },
}

export default function AnalyticsPage() {
  const { canAnalyzeAndUpload, loading: roleLoading, activeWorkspaceId } = useWorkspaceRole()
  const { lang } = useTranslation()
  const L = ANALYTICS_LOCALES[lang] || ANALYTICS_LOCALES.en

  const [datasets, setDatasets] = useState<AnalyticsDatasetItem[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [translatedInsights, setTranslatedInsights] = useState<
    Array<{ title: string; description: string }>
  >([])

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
              name: p.name || 'Project',
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

  useEffect(() => {
    if (!activeItem) {
      setTranslatedInsights([])
      return
    }
    if (lang === 'ar' || activeItem.insights.length === 0) {
      setTranslatedInsights(activeItem.insights)
      return
    }

    const hasArabic = activeItem.insights.some(
      (ins) => /[\u0600-\u06FF]/.test(ins.title) || /[\u0600-\u06FF]/.test(ins.description)
    )
    if (!hasArabic) {
      setTranslatedInsights(activeItem.insights)
      return
    }

    const cacheKey = `insightflow_analytics_tr_${lang}_${activeItem.datasetId}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (Array.isArray(cached) && cached.length > 0) {
        setTranslatedInsights(cached)
        return
      }
    } catch {
      // ignore
    }

    setTranslatedInsights(activeItem.insights)
    fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate each object's "title" and "description" in this JSON array into language code "${lang}". Keep all numbers and column names accurate. Return ONLY a valid JSON array with the exact same structure:\n${JSON.stringify(activeItem.insights)}`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const raw = (data?.reply || '').replace(/```json|```/g, '').trim()
        const start = raw.indexOf('[')
        const end = raw.lastIndexOf(']')
        if (start !== -1 && end !== -1) {
          const parsed = JSON.parse(raw.slice(start, end + 1))
          if (Array.isArray(parsed)) {
            setTranslatedInsights(parsed)
            localStorage.setItem(cacheKey, JSON.stringify(parsed))
          }
        }
      })
      .catch(() => null)
  }, [activeItem, lang])

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
              <h1 className="text-xl font-bold tracking-tight">{L.title}</h1>
              <p className="text-xs text-muted-foreground">{L.subtitle}</p>
            </div>
          </div>

          {canAnalyzeAndUpload && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5" />
              {L.addSourceBtn}
            </Link>
          )}
        </div>

        {/* Workspace-Wide KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">{L.activeBadge}</span>
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{datasets.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{L.totalSourcesKpi}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> 100%
              </span>
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalRecordsAll.toLocaleString(lang)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{L.totalRecordsKpi}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">AI Engine</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{totalInsightsAll}</p>
            <p className="mt-1 text-xs text-muted-foreground">{L.totalInsightsKpi}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">{L.highBadge}</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{datasets.length > 0 ? '100%' : '0%'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{L.reliabilityKpi}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="animate-pulse text-sm text-muted-foreground">{L.loadingMsg}</p>
          </div>
        ) : datasets.length > 0 && activeItem ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Cross-Project Volume Comparison (5 cols) */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div className="text-end">
                  <h2 className="text-base font-bold">{L.volumeCompTitle}</h2>
                  <p className="text-xs text-muted-foreground">{L.volumeCompSub}</p>
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
                      className={`w-full rounded-xl border p-3.5 text-start transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border/70 bg-background/40 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-primary">
                          {ds.rowCount.toLocaleString(lang)} {L.recordsUnit}
                        </span>
                        <span className="font-bold text-foreground">{ds.fileName}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {L.projectLabel}: {ds.projectName} • {ds.columnCount} {L.variablesUnit}
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
                      {L.refreshBtn}
                    </button>
                  )}
                  <Link
                    href={`/projects/${activeItem.projectId}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25"
                  >
                    {L.projectDashBtn}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="text-end">
                  <h2 className="text-base font-bold">{activeItem.fileName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeItem.rowCount.toLocaleString(lang)} {L.rowsUnit} •{' '}
                    {activeItem.columnCount} {L.colsUnit}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {translatedInsights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/70 bg-background/50 p-4 text-start"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">{ins.title}</h3>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {L.metricBadge(idx + 1)}
                      </span>
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
            <h3 className="text-base font-bold">{L.emptyTitle}</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              {canAnalyzeAndUpload ? L.emptyDescUpload : L.emptyDescViewer}
            </p>
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
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