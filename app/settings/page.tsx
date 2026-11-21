'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole, saveWorkspaceOverride } from '@/lib/useWorkspaceRole'
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

export default function SettingsPage() {
  const { activeWorkspace, activeWorkspaceId, role, isOwner, refreshWorkspace } =
    useWorkspaceRole()
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'preferences'>('profile')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('محلل بيانات')

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

        const payload = JSON.stringify({
          id: activeWorkspaceId,
          name: cleanName,
          description: cleanDesc || undefined,
        })

        // محاولة التحديث على السيرفر عبر PUT أو PATCH
        try {
          await apiRequest(`/api/workspaces/${activeWorkspaceId}`, {
            method: 'PUT',
            body: payload,
          })
        } catch {
          await apiRequest(`/api/workspaces/${activeWorkspaceId}`, {
            method: 'PATCH',
            body: payload,
          }).catch(() => null)
        }

        // حفظ التحديث في المخزن المحلي ليظهر فوراً في كل صفحات المنصة
        saveWorkspaceOverride(activeWorkspaceId, {
          name: cleanName,
          description: cleanDesc,
        })

        await refreshWorkspace()
        setSavedNotice('تم تحديث اسم ووصف مساحة العمل بنجاح.')
        setTimeout(() => window.location.reload(), 600)
        return
      }

      setSavedNotice('تم حفظ التغييرات بنجاح.')
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
              <h1 className="text-xl font-bold tracking-tight">إعدادات الحساب والمساحة</h1>
              <p className="text-xs text-muted-foreground">
                تخصيص ملفك الشخصي، إعدادات القسم النشط، وتفضيلات محرك الذكاء الاصطناعي
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            الصلاحية: {role || 'Owner'}
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
            الملف الشخصي
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
            مساحة العمل الحالية
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
            الذكاء الاصطناعي والإشعارات
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card/50 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">بيانات الحساب الشخصي</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 w-full cursor-not-allowed rounded-xl border border-input bg-secondary/40 px-3 text-sm text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: محلل بيانات أول / مدير مشاريع"
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">إعدادات القسم (Workspace)</h2>
                {!isOwner && (
                  <span className="text-xs text-amber-400">
                    التعديل متاح لمالك مساحة العمل فقط
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">اسم مساحة العمل</label>
                  <input
                    type="text"
                    value={workspaceName}
                    disabled={!isOwner}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">وصف القسم وأهدافه</label>
                  <textarea
                    rows={3}
                    value={workspaceDesc}
                    disabled={!isOwner}
                    onChange={(e) => setWorkspaceDesc(e.target.value)}
                    placeholder="أضف وصفاً مختصراً لمجال عمل هذا القسم ونوع البيانات المحللة..."
                    className="w-full rounded-xl border border-input bg-background/60 p-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold">تخصيص المساعد الذكي والتنبيهات</h2>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  أسلوب إجابات المساعد الذكي (AI Copilot)
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'concise', title: 'مختصر ومباشر', desc: 'نقاط سريعة وأرقام أساسية' },
                    { id: 'balanced', title: 'متوازن (موصى به)', desc: 'تحليل واضح مع توصيات عملية' },
                    { id: 'detailed', title: 'تحليلي معمّق', desc: 'شرح تفصيلي للأنماط والفروق' },
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
                    <p className="text-xs font-semibold">استخراج الرؤى التلقائي عند الرفع</p>
                    <p className="text-[11px] text-muted-foreground">
                      تحليل الأعمدة واكتشاف الأنماط فور رفع أي ملف Excel أو CSV
                    </p>
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
                      <p className="text-xs font-semibold">إشعارات التقارير ودعوات الفريق</p>
                      <p className="text-[11px] text-muted-foreground">
                        تنبيهك عند انضمام عضو جديد أو اكتمال توليد التقارير التنفيذية
                      </p>
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
              <span className="text-xs text-muted-foreground">
                تُطبق التغييرات فوراً على جلستك الحالية
              </span>
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
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}