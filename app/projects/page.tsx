'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Plus, ArrowRight, Clock, Database, Building2 } from 'lucide-react'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole, getCachedProjects, setCachedProjects } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

interface ProjectItem {
  id: string
  name: string
  description?: string
  createdAt?: string
}

const PROJECTS_LOCALES: Record<
  string,
  {
    title: string
    subtitle: string
    newBtn: string
    loading: string
    emptyTitle: string
    emptyDescUpload: string
    emptyDescViewer: string
    uploadNow: string
    activeBadge: string
    defaultDesc: string
    recentDate: string
    viewDashboard: string
  }
> = {
  en: {
    title: 'Projects & Data Analytics',
    subtitle: 'Manage your projects, datasets, and AI analytics linked to the active workspace.',
    newBtn: 'New Project or File',
    loading: 'Loading projects...',
    emptyTitle: 'No projects added in this department yet',
    emptyDescUpload: 'Upload your first dataset or create a project in this workspace to start AI analysis.',
    emptyDescViewer: 'Your team has not added any projects in this workspace yet.',
    uploadNow: 'Upload Dataset Now',
    activeBadge: 'Active',
    defaultDesc: 'Dedicated workspace for file analysis and executive reports.',
    recentDate: 'Recent',
    viewDashboard: 'View Dashboard',
  },
  ar: {
    title: 'المشاريع وتحليلات البيانات',
    subtitle: 'إدارة مشاريعك وملفاتك وتحليلات الذكاء الاصطناعي المرتبطة بمساحة العمل الحالية.',
    newBtn: 'مشروع أو ملف جديد',
    loading: 'جاري تحميل المشاريع...',
    emptyTitle: 'لا توجد مشاريع مضافة في هذا القسم حالياً',
    emptyDescUpload: 'قم برفع أول ملف بيانات أو إنشاء مشروع داخل مساحة العمل الحالية لكي يبدأ محرك الذكاء الاصطناعي بتحليله.',
    emptyDescViewer: 'لم يقم فريق العمل بإضافة أي مشاريع في هذه المساحة بعد.',
    uploadNow: 'رفع ملف بيانات الآن',
    activeBadge: 'نشط',
    defaultDesc: 'مساحة عمل مخصصة لتحليل الملفات والتقارير التنفيذية.',
    recentDate: 'حديث',
    viewDashboard: 'عرض الداشبورد',
  },
  de: {
    title: 'Projekte & Datenanalysen',
    subtitle: 'Verwalten Sie Ihre Projekte, Datensätze und KI-Analysen im aktuellen Arbeitsbereich.',
    newBtn: 'Neues Projekt oder Datei',
    loading: 'Projekte werden geladen...',
    emptyTitle: 'Noch keine Projekte in dieser Abteilung vorhanden',
    emptyDescUpload: 'Laden Sie Ihre erste Datendatei hoch oder erstellen Sie ein Projekt für die KI-Analyse.',
    emptyDescViewer: 'Ihr Team hat in diesem Arbeitsbereich noch keine Projekte hinzugefügt.',
    uploadNow: 'Jetzt Datendatei hochladen',
    activeBadge: 'Aktiv',
    defaultDesc: 'Dedizierter Bereich für Dateianalysen und Managementberichte.',
    recentDate: 'Aktuell',
    viewDashboard: 'Dashboard öffnen',
  },
  es: {
    title: 'Proyectos y Analítica de Datos',
    subtitle: 'Gestiona tus proyectos, archivos y análisis de IA vinculados al espacio de trabajo actual.',
    newBtn: 'Nuevo Proyecto o Archivo',
    loading: 'Cargando proyectos...',
    emptyTitle: 'Aún no hay proyectos en este departamento',
    emptyDescUpload: 'Sube tu primer archivo de datos o crea un proyecto para iniciar el análisis con IA.',
    emptyDescViewer: 'Tu equipo aún no ha añadido proyectos en este espacio.',
    uploadNow: 'Subir archivo ahora',
    activeBadge: 'Activo',
    defaultDesc: 'Espacio dedicado para análisis de archivos e informes ejecutivos.',
    recentDate: 'Reciente',
    viewDashboard: 'Ver panel',
  },
  it: {
    title: 'Progetti e Analisi Dati',
    subtitle: 'Gestisci progetti, file e analisi IA collegati all’area di lavoro attiva.',
    newBtn: 'Nuovo Progetto o File',
    loading: 'Caricamento progetti...',
    emptyTitle: 'Nessun progetto in questo reparto',
    emptyDescUpload: 'Carica il tuo primo file di dati o crea un progetto per iniziare l’analisi IA.',
    emptyDescViewer: 'Il team non ha ancora aggiunto progetti in quest’area.',
    uploadNow: 'Carica file ora',
    activeBadge: 'Attivo',
    defaultDesc: 'Area dedicata all’analisi di file e report esecutivi.',
    recentDate: 'Recente',
    viewDashboard: 'Apri dashboard',
  },
  fr: {
    title: 'Projets et Analyse de Données',
    subtitle: 'Gérez vos projets, fichiers et analyses IA liés à l’espace de travail actif.',
    newBtn: 'Nouveau Projet ou Fichier',
    loading: 'Chargement des projets...',
    emptyTitle: 'Aucun projet dans ce département pour le moment',
    emptyDescUpload: 'Importez votre premier fichier de données ou créez un projet pour lancer l’analyse IA.',
    emptyDescViewer: 'Votre équipe n’a pas encore ajouté de projets dans cet espace.',
    uploadNow: 'Importer un fichier',
    activeBadge: 'Actif',
    defaultDesc: 'Espace dédié à l’analyse de fichiers et aux rapports exécutifs.',
    recentDate: 'Récent',
    viewDashboard: 'Voir le tableau de bord',
  },
  ru: {
    title: 'Проекты и аналитика данных',
    subtitle: 'Управляйте проектами, файлами и ИИ-аналитикой в текущем рабочем пространстве.',
    newBtn: 'Новый проект или файл',
    loading: 'Загрузка проектов...',
    emptyTitle: 'В этом отделе пока нет проектов',
    emptyDescUpload: 'Загрузите первый файл данных или создайте проект для ИИ-анализа.',
    emptyDescViewer: 'Команда ещё не добавила проекты в это пространство.',
    uploadNow: 'Загрузить файл сейчас',
    activeBadge: 'Активен',
    defaultDesc: 'Пространство для анализа файлов и аналитических отчётов.',
    recentDate: 'Недавно',
    viewDashboard: 'Открыть дашборд',
  },
  tr: {
    title: 'Projeler ve Veri Analitiği',
    subtitle: 'Mevcut çalışma alanına bağlı projelerinizi, dosyalarınızı ve yapay zeka analizlerinizi yönetin.',
    newBtn: 'Yeni Proje veya Dosya',
    loading: 'Projeler yükleniyor...',
    emptyTitle: 'Bu departmanda henüz proje eklenmemiş',
    emptyDescUpload: 'Yapay zeka analizini başlatmak için ilk veri dosyanızı yükleyin veya bir proje oluşturun.',
    emptyDescViewer: 'Ekibiniz henüz bu çalışma alanına proje eklemedi.',
    uploadNow: 'Şimdi Veri Dosyası Yükle',
    activeBadge: 'Aktif',
    defaultDesc: 'Dosya analizi ve yönetici raporları için özel çalışma alanı.',
    recentDate: 'Yeni',
    viewDashboard: 'Paneli Görüntüle',
  },
}

export default function ProjectsPage() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    canAnalyzeAndUpload,
    loading: roleLoading,
  } = useWorkspaceRole()
  const { lang } = useTranslation()
  const L = PROJECTS_LOCALES[lang] || PROJECTS_LOCALES.en!

  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (roleLoading) return

    async function fetchProjectsWithRetry() {
      setLoading(true)
      try {
        const session = getSession()
        let wsId =
          (activeWorkspaceId && activeWorkspaceId !== 'default' ? activeWorkspaceId : '') ||
          session?.workspaceId ||
          ''

        if (!wsId) {
          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
          const firstWs = wsList?.[0]
          wsId = firstWs?.id || firstWs?.workspaceId || ''
        }

        if (wsId) {
          const cached = getCachedProjects(wsId)
          if (cached.length > 0) {
            setProjects(cached)
            setLoading(false)
          } else {
            setProjects([])
          }

          let projList = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => null)
          if (!Array.isArray(projList)) {
            await new Promise((r) => setTimeout(r, 2500))
            projList = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`).catch(() => null)
          }

          if (Array.isArray(projList)) {
            const mapped = projList.map((p) => ({
              id: p.id || p.projectId,
              name: p.name || p.title || p.projectName || p.Name || p.Title || 'Untitled Project',
              description: p.description || p.Description,
              createdAt: p.createdAt || p.CreatedAt,
            }))
            setProjects(mapped)
            setCachedProjects(wsId, mapped)
          }
        } else {
          setProjects([])
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsWithRetry()
  }, [activeWorkspaceId, roleLoading])

  return (
    <DashboardShell activeItem="projects">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{L.title}</h1>
              {activeWorkspace?.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {activeWorkspace.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{L.subtitle}</p>
          </div>
          {canAnalyzeAndUpload && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {L.newBtn}
            </Link>
          )}
        </div>

        {/* Loading & Projects Grid */}
        {loading || roleLoading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card/40">
            <p className="animate-pulse text-sm text-muted-foreground">{L.loading}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/40 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FolderKanban className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold">{L.emptyTitle}</h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              {canAnalyzeAndUpload ? L.emptyDescUpload : L.emptyDescViewer}
            </p>
            {canAnalyzeAndUpload && (
              <Link
                href="/upload"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                {L.uploadNow}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Database className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {L.activeBadge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {project.description || L.defaultDesc}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString(lang)
                      : L.recentDate}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {L.viewDashboard}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}