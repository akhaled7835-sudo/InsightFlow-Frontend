'use client'

import { Search, Menu, LogOut, Clock, Building2, Plus, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSession, getSession, apiRequest, API_BASE_URL, type AuthSession } from '@/lib/api'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslation } from '@/lib/i18n'
import { useWorkspaceRole, setStoredActiveWorkspaceId } from '@/lib/useWorkspaceRole'

const ROLE_AR_LABELS: Record<string, string> = {
  Owner: 'مالك المساحة',
  Admin: 'مدير النظام',
  Analyst: 'محلل بيانات',
  Viewer: 'مشاهد فقط',
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const { t } = useTranslation()
  const { workspaces, activeWorkspaceId, switchWorkspace, role } = useWorkspaceRole()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [newWsDesc, setNewWsDesc] = useState('')
  const [creatingWs, setCreatingWs] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    setSession(getSession())
    fetch(`${API_BASE_URL}/swagger/index.html`, { mode: 'no-cors' }).catch(() => {})
  }, [])

  function handleLogout() {
    clearSession()
    router.push('/login')
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!newWsName.trim()) return
    setCreatingWs(true)
    setCreateError('')
    try {
      const created = await apiRequest<any>('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: newWsName.trim(),
          description: newWsDesc.trim() || `مساحة عمل خاصة بقسم ${newWsName.trim()}`,
        }),
      })
      const createdId = created?.id || created?.workspaceId
      if (createdId) {
        setStoredActiveWorkspaceId(createdId)
      }
      setShowCreateModal(false)
      setNewWsName('')
      setNewWsDesc('')
      window.location.reload()
    } catch (err: any) {
      setCreateError(err?.message || 'فشل إنشاء مساحة العمل الجديدة.')
    } finally {
      setCreatingWs(false)
    }
  }

  const displayName = session?.fullName || session?.email || 'Workspace User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* مبدّل مساحات العمل / الأقسام + زر إضافة قسم جديد */}
        {!session?.isDemo && (
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <Building2 className="pointer-events-none absolute start-2.5 h-4 w-4 text-primary" />
              <select
                value={activeWorkspaceId}
                onChange={(e) => switchWorkspace(e.target.value)}
                aria-label="اختر مساحة العمل أو القسم"
                className="h-10 max-w-[190px] truncate rounded-xl border border-border bg-card/80 ps-8 pe-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary"
              >
                {workspaces.length === 0 && <option value="">جاري التحميل...</option>}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id} className="bg-slate-900">
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              title="إنشاء قسم / مساحة عمل جديدة"
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">قسم جديد</span>
            </button>
          </div>
        )}

        <div className="relative hidden flex-1 max-w-xs sm:block lg:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-card/60 ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="ms-auto flex items-center gap-2.5">
          {session?.isDemo && (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 sm:inline-flex">
              <Clock className="h-3.5 w-3.5" />
              {t.demoBadge}
            </span>
          )}

          <LanguageSwitcher />

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 py-1.5 ps-1.5 pe-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              {initials || 'IF'}
            </span>
            <span className="hidden text-start sm:block">
              <span className="block text-sm font-medium leading-tight">{displayName}</span>
              <span className="block text-xs leading-tight text-primary font-medium">
                {session?.isDemo ? t.demoSession : (role ? ROLE_AR_LABELS[role] || role : t.proWorkspace)}
              </span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            title={t.logout}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={t.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* نافذة إنشاء قسم / مساحة عمل جديدة */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold">إنشاء مساحة عمل / قسم جديد</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs text-muted-foreground">
              أنشئ مساحة عمل مستقلة لكل قسم (مثل: قسم المالية، الماركتنج، المبيعات) بأعضاء وصلاحيات ومشاريع معزولة تماماً.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">اسم القسم / مساحة العمل</label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="مثال: قسم المالية - Finance"
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">وصف مختصر (اختياري)</label>
                <input
                  type="text"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="تحليلات وتقارير الإيرادات والمصروفات..."
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              {createError && <p className="text-xs font-medium text-red-400">{createError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creatingWs || !newWsName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {creatingWs && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  إنشاء والانتقال للقسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}