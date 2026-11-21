'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getSession } from '@/lib/api'
import { useWorkspaceRole, saveWorkspaceOverride } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
import {
  Settings,
  User,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Save,
  Loader2,
  Bell,
} from 'lucide-react'

const SETTINGS_LOCALES: Record<
  string,
  {
    pageTitle: string
    pageSubtitle: string
    roleLabel: string
    tabProfile: string
    tabWorkspace: string
    tabPreferences: string
    profileSectionTitle: string
    fullNameLabel: string
    emailLabel: string
    jobTitleLabel: string
    jobTitlePlaceholder: string
    workspaceSectionTitle: string
    ownerOnlyNotice: string
    workspaceNameLabel: string
    workspaceDescLabel: string
    workspaceDescPlaceholder: string
    prefsSectionTitle: string
    aiStyleLabel: string
    styleConciseTitle: string
    styleConciseDesc: string
    styleBalancedTitle: string
    styleBalancedDesc: string
    styleDetailedTitle: string
    styleDetailedDesc: string
    autoInsightsTitle: string
    autoInsightsDesc: string
    notificationsTitle: string
    notificationsDesc: string
    instantNotice: string
    saveBtn: string
    savedWorkspaceMsg: string
    savedGeneralMsg: string
  }
> = {
  en: {
    pageTitle: 'Account & Workspace Settings',
    pageSubtitle: 'Customize your personal profile, active workspace details, and AI engine preferences.',
    roleLabel: 'Role',
    tabProfile: 'Personal Profile',
    tabWorkspace: 'Current Workspace',
    tabPreferences: 'AI & Notifications',
    profileSectionTitle: 'Personal Account Details',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email Address',
    jobTitleLabel: 'Job Title',
    jobTitlePlaceholder: 'e.g. Senior Data Analyst / Project Manager',
    workspaceSectionTitle: 'Workspace Settings',
    ownerOnlyNotice: 'Editing is restricted to the Workspace Owner',
    workspaceNameLabel: 'Workspace Name',
    workspaceDescLabel: 'Department Description & Goals',
    workspaceDescPlaceholder: 'Add a brief description of this workspace and the analyzed data...',
    prefsSectionTitle: 'Customize AI Copilot & Notifications',
    aiStyleLabel: 'AI Copilot Response Style',
    styleConciseTitle: 'Concise & Direct',
    styleConciseDesc: 'Quick bullet points and core metrics',
    styleBalancedTitle: 'Balanced (Recommended)',
    styleBalancedDesc: 'Clear analysis with actionable advice',
    styleDetailedTitle: 'Deep Analytical',
    styleDetailedDesc: 'Detailed breakdown of patterns and anomalies',
    autoInsightsTitle: 'Auto-Extract Insights on Upload',
    autoInsightsDesc: 'Analyze columns and detect patterns immediately when uploading Excel or CSV files',
    notificationsTitle: 'Report & Team Invitation Alerts',
    notificationsDesc: 'Notify you when new members join or executive reports finish generating',
    instantNotice: 'Changes apply immediately to your active session',
    saveBtn: 'Save Settings',
    savedWorkspaceMsg: 'Workspace name and description updated successfully.',
    savedGeneralMsg: 'Changes saved successfully.',
  },
  ar: {
    pageTitle: 'إعدادات الحساب والمساحة',
    pageSubtitle: 'تخصيص ملفك الشخصي، إعدادات القسم النشط، وتفضيلات محرك الذكاء الاصطناعي',
    roleLabel: 'الصلاحية',
    tabProfile: 'الملف الشخصي',
    tabWorkspace: 'مساحة العمل الحالية',
    tabPreferences: 'الذكاء الاصطناعي والإشعارات',
    profileSectionTitle: 'بيانات الحساب الشخصي',
    fullNameLabel: 'الاسم الكامل',
    emailLabel: 'البريد الإلكتروني',
    jobTitleLabel: 'المسمى الوظيفي',
    jobTitlePlaceholder: 'مثال: محلل بيانات أول / مدير مشاريع',
    workspaceSectionTitle: 'إعدادات القسم (Workspace)',
    ownerOnlyNotice: 'التعديل متاح لمالك مساحة العمل فقط',
    workspaceNameLabel: 'اسم مساحة العمل',
    workspaceDescLabel: 'وصف القسم وأهدافه',
    workspaceDescPlaceholder: 'أضف وصفاً مختصراً لمجال عمل هذا القسم ونوع البيانات المحللة...',
    prefsSectionTitle: 'تخصيص المساعد الذكي والتنبيهات',
    aiStyleLabel: 'أسلوب إجابات المساعد الذكي (AI Copilot)',
    styleConciseTitle: 'مختصر ومباشر',
    styleConciseDesc: 'نقاط سريعة وأرقام أساسية',
    styleBalancedTitle: 'متوازن (موصى به)',
    styleBalancedDesc: 'تحليل واضح مع توصيات عملية',
    styleDetailedTitle: 'تحليلي معمّق',
    styleDetailedDesc: 'شرح تفصيلي للأنماط والفروق',
    autoInsightsTitle: 'استخراج الرؤى التلقائي عند الرفع',
    autoInsightsDesc: 'تحليل الأعمدة واكتشاف الأنماط فور رفع أي ملف Excel أو CSV',
    notificationsTitle: 'إشعارات التقارير ودعوات الفريق',
    notificationsDesc: 'تنبيهك عند انضمام عضو جديد أو اكتمال توليد التقارير التنفيذية',
    instantNotice: 'تُطبق التغييرات فوراً على جلستك الحالية',
    saveBtn: 'حفظ الإعدادات',
    savedWorkspaceMsg: 'تم تحديث اسم ووصف مساحة العمل بنجاح.',
    savedGeneralMsg: 'تم حفظ التغييرات بنجاح.',
  },
  de: {
    pageTitle: 'Konto- & Arbeitsbereichs-Einstellungen',
    pageSubtitle: 'Passen Sie Ihr Profil, den aktiven Arbeitsbereich und die KI-Einstellungen an.',
    roleLabel: 'Rolle',
    tabProfile: 'Persönliches Profil',
    tabWorkspace: 'Aktueller Arbeitsbereich',
    tabPreferences: 'KI & Benachrichtigungen',
    profileSectionTitle: 'Persönliche Kontodaten',
    fullNameLabel: 'Vollständiger Name',
    emailLabel: 'E-Mail-Adresse',
    jobTitleLabel: 'Berufsbezeichnung',
    jobTitlePlaceholder: 'z.B. Senior Datenanalyst / Projektleiter',
    workspaceSectionTitle: 'Arbeitsbereichs-Einstellungen',
    ownerOnlyNotice: 'Bearbeitung nur für den Inhaber des Arbeitsbereichs möglich',
    workspaceNameLabel: 'Name des Arbeitsbereichs',
    workspaceDescLabel: 'Beschreibung & Ziele der Abteilung',
    workspaceDescPlaceholder: 'Kurze Beschreibung dieses Bereichs und der analysierten Daten...',
    prefsSectionTitle: 'KI-Assistent & Benachrichtigungen anpassen',
    aiStyleLabel: 'Antwortstil des KI-Assistenten (AI Copilot)',
    styleConciseTitle: 'Kurz & Direkt',
    styleConciseDesc: 'Schnelle Stichpunkte und Kennzahlen',
    styleBalancedTitle: 'Ausgewogen (Empfohlen)',
    styleBalancedDesc: 'Klare Analyse mit Handlungsempfehlungen',
    styleDetailedTitle: 'Tiefgehend Analytisch',
    styleDetailedDesc: 'Detaillierte Erklärung von Mustern und Abweichungen',
    autoInsightsTitle: 'Automatische Erkenntnisse beim Hochladen',
    autoInsightsDesc: 'Spalten analysieren und Muster sofort beim Hochladen von Excel oder CSV erkennen',
    notificationsTitle: 'Berichts- & Team-Benachrichtigungen',
    notificationsDesc: 'Benachrichtigung bei neuen Mitgliedern oder fertigen Managementberichten',
    instantNotice: 'Änderungen werden sofort auf Ihre Sitzung angewendet',
    saveBtn: 'Einstellungen speichern',
    savedWorkspaceMsg: 'Name und Beschreibung des Arbeitsbereichs erfolgreich aktualisiert.',
    savedGeneralMsg: 'Änderungen erfolgreich gespeichert.',
  },
  es: {
    pageTitle: 'Configuración de Cuenta y Espacio de Trabajo',
    pageSubtitle: 'Personaliza tu perfil, el espacio de trabajo activo y las preferencias de IA.',
    roleLabel: 'Rol',
    tabProfile: 'Perfil Personal',
    tabWorkspace: 'Espacio de Trabajo Actual',
    tabPreferences: 'IA y Notificaciones',
    profileSectionTitle: 'Datos de la Cuenta Personal',
    fullNameLabel: 'Nombre Completo',
    emailLabel: 'Correo Electrónico',
    jobTitleLabel: 'Cargo',
    jobTitlePlaceholder: 'ej. Analista de Datos Senior / Gerente de Proyectos',
    workspaceSectionTitle: 'Configuración del Espacio de Trabajo',
    ownerOnlyNotice: 'La edición está restringida al propietario del espacio',
    workspaceNameLabel: 'Nombre del Espacio de Trabajo',
    workspaceDescLabel: 'Descripción y Objetivos',
    workspaceDescPlaceholder: 'Añade una breve descripción de este departamento...',
    prefsSectionTitle: 'Personalizar Asistente IA y Notificaciones',
    aiStyleLabel: 'Estilo de Respuesta del Asistente IA',
    styleConciseTitle: 'Conciso y Directo',
    styleConciseDesc: 'Puntos clave y métricas principales',
    styleBalancedTitle: 'Equilibrado (Recomendado)',
    styleBalancedDesc: 'Análisis claro con recomendaciones prácticas',
    styleDetailedTitle: 'Analítico Profundo',
    styleDetailedDesc: 'Desglose detallado de patrones y anomalías',
    autoInsightsTitle: 'Extraer Hallazgos Automáticamente al Subir',
    autoInsightsDesc: 'Analizar columnas y detectar patrones al subir archivos Excel o CSV',
    notificationsTitle: 'Alertas de Informes e Invitaciones',
    notificationsDesc: 'Notificar cuando se unan nuevos miembros o se generen informes',
    instantNotice: 'Los cambios se aplican inmediatamente a tu sesión actual',
    saveBtn: 'Guardar Configuración',
    savedWorkspaceMsg: 'Nombre y descripción del espacio de trabajo actualizados.',
    savedGeneralMsg: 'Cambios guardados correctamente.',
  },
  it: {
    pageTitle: 'Impostazioni Account e Area di Lavoro',
    pageSubtitle: 'Personalizza il profilo, l’area di lavoro attiva e le preferenze IA.',
    roleLabel: 'Ruolo',
    tabProfile: 'Profilo Personale',
    tabWorkspace: 'Area di Lavoro Attuale',
    tabPreferences: 'IA e Notifiche',
    profileSectionTitle: 'Dati Account Personale',
    fullNameLabel: 'Nome Completo',
    emailLabel: 'Indirizzo Email',
    jobTitleLabel: 'Qualifica',
    jobTitlePlaceholder: 'es. Senior Data Analyst / Project Manager',
    workspaceSectionTitle: 'Impostazioni Area di Lavoro',
    ownerOnlyNotice: 'Modifica consentita solo al proprietario dell’area di lavoro',
    workspaceNameLabel: 'Nome Area di Lavoro',
    workspaceDescLabel: 'Descrizione e Obiettivi',
    workspaceDescPlaceholder: 'Aggiungi una breve descrizione di questo reparto...',
    prefsSectionTitle: 'Personalizza Assistente IA e Notifiche',
    aiStyleLabel: 'Stile di Risposta Assistente IA',
    styleConciseTitle: 'Conciso e Diretto',
    styleConciseDesc: 'Punti rapidi e metriche principali',
    styleBalancedTitle: 'Bilanciato (Consigliato)',
    styleBalancedDesc: 'Analisi chiara con consigli pratici',
    styleDetailedTitle: 'Analitico Approfondito',
    styleDetailedDesc: 'Spiegazione dettagliata di trend e anomalie',
    autoInsightsTitle: 'Estrazione Automatica al Caricamento',
    autoInsightsDesc: 'Analizza le colonne e rileva i trend al caricamento di Excel o CSV',
    notificationsTitle: 'Avvisi Report e Inviti Team',
    notificationsDesc: 'Notifica quando nuovi membri si uniscono o i report sono pronti',
    instantNotice: 'Le modifiche vengono applicate immediatamente alla sessione',
    saveBtn: 'Salva Impostazioni',
    savedWorkspaceMsg: 'Nome e descrizione dell’area di lavoro aggiornati.',
    savedGeneralMsg: 'Modifiche salvate con successo.',
  },
  fr: {
    pageTitle: 'Paramètres du Compte et de l’Espace',
    pageSubtitle: 'Personnalisez votre profil, l’espace de travail actif et les préférences IA.',
    roleLabel: 'Rôle',
    tabProfile: 'Profil Personnel',
    tabWorkspace: 'Espace de Travail Actuel',
    tabPreferences: 'IA et Notifications',
    profileSectionTitle: 'Informations du Compte',
    fullNameLabel: 'Nom Complet',
    emailLabel: 'Adresse E-mail',
    jobTitleLabel: 'Poste',
    jobTitlePlaceholder: 'ex. Data Analyst Senior / Chef de Projet',
    workspaceSectionTitle: 'Paramètres de l’Espace de Travail',
    ownerOnlyNotice: 'Modification réservée au propriétaire de l’espace',
    workspaceNameLabel: 'Nom de l’Espace de Travail',
    workspaceDescLabel: 'Description et Objectifs',
    workspaceDescPlaceholder: 'Ajoutez une brève description de ce département...',
    prefsSectionTitle: 'Personnaliser l’Assistant IA et les Notifications',
    aiStyleLabel: 'Style de Réponse de l’Assistant IA',
    styleConciseTitle: 'Concis et Direct',
    styleConciseDesc: 'Points clés et indicateurs essentiels',
    styleBalancedTitle: 'Équilibré (Recommandé)',
    styleBalancedDesc: 'Analyse claire avec recommandations concrètes',
    styleDetailedTitle: 'Analytique Approfondi',
    styleDetailedDesc: 'Explication détaillée des tendances et anomalies',
    autoInsightsTitle: 'Extraction Automatique à l’Importation',
    autoInsightsDesc: 'Analyser les colonnes dès l’importation d’un fichier Excel ou CSV',
    notificationsTitle: 'Alertes Rapports et Invitations',
    notificationsDesc: 'Notifier lors de l’arrivée d’un membre ou de la création d’un rapport',
    instantNotice: 'Les modifications s’appliquent immédiatement à votre session',
    saveBtn: 'Enregistrer les Paramètres',
    savedWorkspaceMsg: 'Nom et description de l’espace mis à jour avec succès.',
    savedGeneralMsg: 'Modifications enregistrées avec succès.',
  },
  ru: {
    pageTitle: 'Настройки аккаунта и пространства',
    pageSubtitle: 'Настройте личный профиль, параметры активного отдела и ИИ-движка.',
    roleLabel: 'Роль',
    tabProfile: 'Личный профиль',
    tabWorkspace: 'Текущее пространство',
    tabPreferences: 'ИИ и уведомления',
    profileSectionTitle: 'Данные личного аккаунта',
    fullNameLabel: 'Полное имя',
    emailLabel: 'Электронная почта',
    jobTitleLabel: 'Должность',
    jobTitlePlaceholder: 'например: Старший аналитик данных / Руководитель проектов',
    workspaceSectionTitle: 'Настройки рабочего пространства',
    ownerOnlyNotice: 'Редактирование доступно только владельцу пространства',
    workspaceNameLabel: 'Название пространства',
    workspaceDescLabel: 'Описание и цели отдела',
    workspaceDescPlaceholder: 'Добавьте краткое описание этого отдела...',
    prefsSectionTitle: 'Настройка ИИ-ассистента и уведомлений',
    aiStyleLabel: 'Стиль ответов ИИ-ассистента',
    styleConciseTitle: 'Краткий и прямой',
    styleConciseDesc: 'Быстрые тезисы и ключевые цифры',
    styleBalancedTitle: 'Сбалансированный (Рекомендуется)',
    styleBalancedDesc: 'Чёткий анализ с практическими рекомендациями',
    styleDetailedTitle: 'Глубокий аналитический',
    styleDetailedDesc: 'Подробный разбор закономерностей и отклонений',
    autoInsightsTitle: 'Автоматические выводы при загрузке',
    autoInsightsDesc: 'Анализировать столбцы сразу при загрузке Excel или CSV',
    notificationsTitle: 'Уведомления об отчётах и команде',
    notificationsDesc: 'Уведомлять о новых участниках и готовых отчётах',
    instantNotice: 'Изменения сразу применяются к текущей сессии',
    saveBtn: 'Сохранить настройки',
    savedWorkspaceMsg: 'Название и описание пространства успешно обновлены.',
    savedGeneralMsg: 'Изменения успешно сохранены.',
  },
  tr: {
    pageTitle: 'Hesap ve Çalışma Alanı Ayarları',
    pageSubtitle: 'Kişisel profilinizi, aktif çalışma alanını ve yapay zeka tercihlerini özelleştirin.',
    roleLabel: 'Rol',
    tabProfile: 'Kişisel Profil',
    tabWorkspace: 'Mevcut Çalışma Alanı',
    tabPreferences: 'Yapay Zeka ve Bildirimler',
    profileSectionTitle: 'Kişisel Hesap Bilgileri',
    fullNameLabel: 'Ad Soyad',
    emailLabel: 'E-posta Adresi',
    jobTitleLabel: 'Unvan',
    jobTitlePlaceholder: 'örn. Kıdemli Veri Analisti / Proje Yöneticisi',
    workspaceSectionTitle: 'Çalışma Alanı Ayarları',
    ownerOnlyNotice: 'Düzenleme yalnızca çalışma alanı sahibine açıktır',
    workspaceNameLabel: 'Çalışma Alanı Adı',
    workspaceDescLabel: 'Departman Açıklaması ve Hedefleri',
    workspaceDescPlaceholder: 'Bu departman ve analiz edilen veriler hakkında kısa bir açıklama ekleyin...',
    prefsSectionTitle: 'Yapay Zeka Asistanı ve Bildirimler',
    aiStyleLabel: 'Yapay Zeka Asistanı Yanıt Stili',
    styleConciseTitle: 'Kısa ve Doğrudan',
    styleConciseDesc: 'Hızlı maddeler ve temel metrikler',
    styleBalancedTitle: 'Dengeli (Önerilen)',
    styleBalancedDesc: 'Uygulanabilir önerilerle net analiz',
    styleDetailedTitle: 'Derin Analitik',
    styleDetailedDesc: 'Eğilimlerin ve farkların ayrıntılı açıklaması',
    autoInsightsTitle: 'Yüklemede Otomatik İçgörü Çıkarma',
    autoInsightsDesc: 'Excel veya CSV dosyaları yüklendiğinde sütunları anında analiz et',
    notificationsTitle: 'Rapor ve Ekip Daveti Bildirimleri',
    notificationsDesc: 'Yeni üyeler katıldığında veya raporlar hazırlandığında bildirim al',
    instantNotice: 'Değişiklikler mevcut oturumunuza anında uygulanır',
    saveBtn: 'Ayarları Kaydet',
    savedWorkspaceMsg: 'Çalışma alanı adı ve açıklaması başarıyla güncellendi.',
    savedGeneralMsg: 'Değişiklikler başarıyla kaydedildi.',
  },
}

export default function SettingsPage() {
  const { activeWorkspace, activeWorkspaceId, role, isOwner, refreshWorkspace } =
    useWorkspaceRole()
  const { lang } = useTranslation()
  const L = SETTINGS_LOCALES[lang] || SETTINGS_LOCALES.en

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'preferences'>('profile')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('Data Analyst')

  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDesc, setWorkspaceDesc] = useState('')

  const [aiDetailLevel, setAiDetailLevel] = useState<'concise' | 'balanced' | 'detailed'>('balanced')
  const [autoInsights, setAutoInsights] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  const [saving, setSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => {
    const session = getSession()
    const savedPrefs = JSON.parse(localStorage.getItem('insightflow_user_prefs') || '{}')

    setFullName(savedPrefs.fullName || session?.fullName || (session as any)?.name || 'Amr Khaled')
    setEmail(session?.email || '')

    if (savedPrefs.jobTitle) setJobTitle(savedPrefs.jobTitle)
    if (savedPrefs.aiDetailLevel) setAiDetailLevel(savedPrefs.aiDetailLevel)
    if (typeof savedPrefs.autoInsights === 'boolean') setAutoInsights(savedPrefs.autoInsights)
    if (typeof savedPrefs.emailNotifications === 'boolean') {
      setEmailNotifications(savedPrefs.emailNotifications)
    }
  }, [])

  useEffect(() => {
    if (activeWorkspace?.name) {
      setWorkspaceName(activeWorkspace.name)
    }
    if (activeWorkspace?.description !== undefined) {
      setWorkspaceDesc(activeWorkspace.description || '')
    }
  }, [activeWorkspace?.name, activeWorkspace?.description])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSavedNotice('')
    try {
      localStorage.setItem(
        'insightflow_user_prefs',
        JSON.stringify({
          fullName,
          jobTitle,
          aiDetailLevel,
          autoInsights,
          emailNotifications,
        })
      )

      if (activeTab === 'workspace' && isOwner && activeWorkspaceId && workspaceName.trim()) {
        const cleanName = workspaceName.trim()
        const cleanDesc = workspaceDesc.trim()

        // حفظ التحديث محلياً ومزامنته مع الباك إند عبر saveWorkspaceOverride
        await saveWorkspaceOverride(activeWorkspaceId, {
          name: cleanName,
          description: cleanDesc,
        })

        await refreshWorkspace()
        setSavedNotice(L.savedWorkspaceMsg)
        setTimeout(() => setSavedNotice(''), 3500)
        return
      }

      setSavedNotice(L.savedGeneralMsg)
      setTimeout(() => setSavedNotice(''), 3500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell activeItem="settings">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Settings className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{L.pageTitle}</h1>
              <p className="text-xs text-muted-foreground">{L.pageSubtitle}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {L.roleLabel}: {role || 'Owner'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            {L.tabProfile}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'workspace'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {L.tabWorkspace}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {L.tabPreferences}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card/50 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">{L.profileSectionTitle}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {L.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {L.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 w-full cursor-not-allowed rounded-xl border border-input bg-secondary/40 px-3 text-sm text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {L.jobTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={L.jobTitlePlaceholder}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{L.workspaceSectionTitle}</h2>
                {!isOwner && <span className="text-xs text-amber-400">{L.ownerOnlyNotice}</span>}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {L.workspaceNameLabel}
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    disabled={!isOwner}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {L.workspaceDescLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceDesc}
                    disabled={!isOwner}
                    onChange={(e) => setWorkspaceDesc(e.target.value)}
                    placeholder={L.workspaceDescPlaceholder}
                    className="w-full rounded-xl border border-input bg-background/60 p-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold">{L.prefsSectionTitle}</h2>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{L.aiStyleLabel}</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'concise', title: L.styleConciseTitle, desc: L.styleConciseDesc },
                    { id: 'balanced', title: L.styleBalancedTitle, desc: L.styleBalancedDesc },
                    { id: 'detailed', title: L.styleDetailedTitle, desc: L.styleDetailedDesc },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAiDetailLevel(opt.id as any)}
                      className={`rounded-xl border p-3 text-start transition-colors ${
                        aiDetailLevel === opt.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background/40 hover:border-primary/40'
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">{opt.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3.5">
                  <div>
                    <p className="text-xs font-semibold">{L.autoInsightsTitle}</p>
                    <p className="text-[11px] text-muted-foreground">{L.autoInsightsDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoInsights}
                    onChange={(e) => setAutoInsights(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold">{L.notificationsTitle}</p>
                      <p className="text-[11px] text-muted-foreground">{L.notificationsDesc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {savedNotice ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {savedNotice}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{L.instantNotice}</span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {L.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}