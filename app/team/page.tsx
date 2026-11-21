'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Search,
  Building2,
  Loader2,
  Lock,
} from 'lucide-react'

type TeamMember = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Analyst' | 'Viewer'
  status: 'نشط' | 'دعوة معلقة'
  joinedAt: string
}

const ROLE_LABELS: Record<TeamMember['role'], { label: string; color: string }> = {
  Owner: { label: 'مالك مساحة العمل', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  Admin: { label: 'مدير النظام', color: 'bg-primary/15 text-primary border-primary/30' },
  Analyst: { label: 'محلل بيانات', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  Viewer: { label: 'مشاهد فقط', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
}

export default function TeamPage() {
  const {
    canManageTeam,
    loading: roleLoading,
    activeWorkspaceId,
    activeWorkspace,
  } = useWorkspaceRole()

  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Analyst')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    if (activeWorkspace?.name) {
      setWorkspaceName(activeWorkspace.name)
    }
  }, [activeWorkspace?.name])

  useEffect(() => {
    if (roleLoading) return

    async function loadWorkspaceTeam() {
      const session = getSession()
      const currentUserName = session?.fullName || (session as any)?.name || 'Amr Khaled'
      const currentUserEmail = session?.email || 'akhaled7835@gmail.com'

      const wsId = activeWorkspaceId || session?.workspaceId || 'default'
      setWorkspaceId(wsId)

      const storageKey = `insightflow_team_${wsId}`
      const savedLocal: TeamMember[] = JSON.parse(localStorage.getItem(storageKey) || '[]')

      let backendMembers: TeamMember[] = []
      if (wsId && wsId !== 'default') {
        const rawMembers = await apiRequest<any[]>(`/api/workspaces/${wsId}/members`).catch(() => [])
        if (Array.isArray(rawMembers)) {
          backendMembers = rawMembers.map((m: any) => ({
            id: m.userId || m.id || `backend-${m.email}`,
            name: m.fullName || m.userName || m.email?.split('@')[0] || 'عضو الفريق',
            email: m.email || '',
            role: (m.role as TeamMember['role']) || 'Analyst',
            status: 'نشط',
            joinedAt: m.joinedAt || new Date().toISOString(),
          }))
        }
      }

      if (backendMembers.length > 0) {
        const backendEmails = new Set(backendMembers.map((b) => b.email.toLowerCase()))
        const pendingLocal = savedLocal.filter(
          (l) => l.status === 'دعوة معلقة' && !backendEmails.has(l.email.toLowerCase())
        )
        const merged = [...backendMembers, ...pendingLocal]
        setMembers(merged)
        localStorage.setItem(storageKey, JSON.stringify(merged))
      } else if (Array.isArray(savedLocal) && savedLocal.length > 0) {
        setMembers(savedLocal)
      } else {
        const initialMembers: TeamMember[] = [
          {
            id: 'owner-1',
            name: currentUserName,
            email: currentUserEmail,
            role: 'Owner',
            status: 'نشط',
            joinedAt: new Date().toISOString(),
          },
        ]
        setMembers(initialMembers)
        localStorage.setItem(storageKey, JSON.stringify(initialMembers))
      }
    }

    loadWorkspaceTeam()
  }, [activeWorkspaceId, roleLoading])

  function persistMembers(updated: TeamMember[]) {
    setMembers(updated)
    if (workspaceId) {
      localStorage.setItem(`insightflow_team_${workspaceId}`, JSON.stringify(updated))
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault()
    if (!canManageTeam || !inviteEmail.trim()) return
    setInviting(true)
    setInviteSuccess('')
    setInviteError('')

    try {
      if (!workspaceId || workspaceId === 'default') {
        throw new Error('لم يتم العثور على مساحة عمل نشطة لإرسال الدعوة.')
      }

      await apiRequest(`/api/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const derivedName =
        inviteName.trim() ||
        inviteEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())

      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: derivedName,
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'دعوة معلقة',
        joinedAt: new Date().toISOString(),
      }

      const updated = [...members.filter((m) => m.email !== newMember.email), newMember]
      persistMembers(updated)

      setInviteEmail('')
      setInviteName('')
      setInviteSuccess(`تم إرسال دعوة حقيقية إلى البريد الإلكتروني ${newMember.email} بنجاح!`)
      setTimeout(() => setInviteSuccess(''), 6000)
    } catch (err: any) {
      setInviteError(err?.message || 'فشل إرسال البريد الإلكتروني من الخادم.')
    } finally {
      setInviting(false)
    }
  }

  function handleRoleChange(memberId: string, newRole: TeamMember['role']) {
    if (!canManageTeam) return
    const updated = members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    persistMembers(updated)
  }

  function handleRemoveMember(memberId: string) {
    if (!canManageTeam) return
    const updated = members.filter((m) => m.id !== memberId)
    persistMembers(updated)
  }

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayedWorkspaceName = activeWorkspace?.name || workspaceName || 'مساحة العمل'

  return (
    <DashboardShell activeItem="team">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">إدارة فريق العمل</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Building2 className="h-3 w-3 text-primary" />
                  {displayedWorkspaceName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                تحكم في أعضاء مساحة العمل، أرسل الدعوات عبر البريد الإلكتروني، وحدد صلاحيات الوصول
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2 text-xs">
            <span className="text-muted-foreground">إجمالي الأعضاء:</span>
            <span className="text-base font-bold text-primary">{members.length}</span>
          </div>
        </div>

        {!roleLoading && canManageTeam ? (
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">دعوة عضو جديد عبر البريد الإلكتروني</h2>
            </div>

            <form onSubmit={handleInviteMember} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="اسم العضو (اختياري)..."
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="relative sm:col-span-4">
                <Mail className="pointer-events-none absolute top-3 right-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="البريد الإلكتروني للعضو..."
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 pr-10 pl-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3 text-xs font-medium outline-none focus:border-primary"
                >
                  <option value="Admin" className="bg-slate-900">مدير (Admin)</option>
                  <option value="Analyst" className="bg-slate-900">محلل بيانات (Analyst)</option>
                  <option value="Viewer" className="bg-slate-900">مشاهد فقط (Viewer)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  إرسال دعوة
                </button>
              </div>
            </form>

            {inviteSuccess && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {inviteSuccess}
              </p>
            )}

            {inviteError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-400">
                <AlertCircle className="h-4 w-4" />
                {inviteError}
              </p>
            )}
          </div>
        ) : !roleLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              إرسال الدعوات وتعديل صلاحيات الأعضاء متاح لمالك مساحة العمل (Owner) ومدير النظام (Admin) فقط.
            </span>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold">أعضاء الفريق والصلاحيات</h2>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو البريد..."
                className="h-9 w-full rounded-xl border border-input bg-background/60 pr-9 pl-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {filteredMembers.map((member) => {
              const roleBadge = ROLE_LABELS[member.role]
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {initials || 'U'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{member.name}</p>
                        {member.role === 'Owner' && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            member.status === 'نشط'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {member.role === 'Owner' || !canManageTeam ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold ${roleBadge.color}`}
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {roleBadge.label}
                      </span>
                    ) : (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                          className="h-9 rounded-xl border border-input bg-secondary/70 px-3 text-xs font-medium outline-none focus:border-primary"
                        >
                          <option value="Admin" className="bg-slate-900">مدير النظام</option>
                          <option value="Analyst" className="bg-slate-900">محلل بيانات</option>
                          <option value="Viewer" className="bg-slate-900">مشاهد فقط</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          title="إزالة العضو"
                          className="rounded-xl border border-border bg-background/50 p-2 text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}