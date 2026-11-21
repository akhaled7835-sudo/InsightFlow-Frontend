'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { apiRequest, getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
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
  status: 'active' | 'pending'
  joinedAt: string
}

const TEAM_LOCALES: Record<
  string,
  {
    title: string
    subtitle: string
    totalMembersLabel: string
    inviteCardTitle: string
    namePlaceholder: string
    emailPlaceholder: string
    sendInviteBtn: string
    inviteSuccessMsg: (email: string) => string
    inviteErrorDefault: string
    noWorkspaceError: string
    permissionNotice: string
    membersListTitle: string
    searchPlaceholder: string
    statusActive: string
    statusPending: string
    removeMemberTitle: string
    roleOwner: string
    roleAdmin: string
    roleAnalyst: string
    roleViewer: string
  }
> = {
  en: {
    title: 'Team Management',
    subtitle: 'Manage workspace members, send email invitations, and configure access permissions',
    totalMembersLabel: 'Total Members:',
    inviteCardTitle: 'Invite New Member via Email',
    namePlaceholder: 'Member name (optional)...',
    emailPlaceholder: 'Member email address...',
    sendInviteBtn: 'Send Invitation',
    inviteSuccessMsg: (email) => `Invitation sent successfully to ${email}!`,
    inviteErrorDefault: 'Failed to send invitation email from server.',
    noWorkspaceError: 'No active workspace found to send invitation.',
    permissionNotice: 'Sending invitations and modifying member roles is restricted to Workspace Owners and Admins.',
    membersListTitle: 'Team Members & Permissions',
    searchPlaceholder: 'Search by name or email...',
    statusActive: 'Active',
    statusPending: 'Pending Invite',
    removeMemberTitle: 'Remove member',
    roleOwner: 'Workspace Owner',
    roleAdmin: 'System Admin',
    roleAnalyst: 'Data Analyst',
    roleViewer: 'Viewer',
  },
  ar: {
    title: 'إدارة فريق العمل',
    subtitle: 'تحكم في أعضاء مساحة العمل، أرسل الدعوات عبر البريد الإلكتروني، وحدد صلاحيات الوصول',
    totalMembersLabel: 'إجمالي الأعضاء:',
    inviteCardTitle: 'دعوة عضو جديد عبر البريد الإلكتروني',
    namePlaceholder: 'اسم العضو (اختياري)...',
    emailPlaceholder: 'البريد الإلكتروني للعضو...',
    sendInviteBtn: 'إرسال دعوة',
    inviteSuccessMsg: (email) => `تم إرسال دعوة حقيقية إلى البريد الإلكتروني ${email} بنجاح!`,
    inviteErrorDefault: 'فشل إرسال البريد الإلكتروني من الخادم.',
    noWorkspaceError: 'لم يتم العثور على مساحة عمل نشطة لإرسال الدعوة.',
    permissionNotice: 'إرسال الدعوات وتعديل صلاحيات الأعضاء متاح لمالك مساحة العمل (Owner) ومدير النظام (Admin) فقط.',
    membersListTitle: 'أعضاء الفريق والصلاحيات',
    searchPlaceholder: 'بحث بالاسم أو البريد...',
    statusActive: 'نشط',
    statusPending: 'دعوة معلقة',
    removeMemberTitle: 'إزالة العضو',
    roleOwner: 'مالك مساحة العمل',
    roleAdmin: 'مدير النظام',
    roleAnalyst: 'محلل بيانات',
    roleViewer: 'مشاهد فقط',
  },
  de: {
    title: 'Teamverwaltung',
    subtitle: 'Verwalten Sie Mitglieder, senden Sie E-Mail-Einladungen und legen Sie Zugriffsrechte fest',
    totalMembersLabel: 'Mitglieder gesamt:',
    inviteCardTitle: 'Neues Mitglied per E-Mail einladen',
    namePlaceholder: 'Name des Mitglieds (optional)...',
    emailPlaceholder: 'E-Mail-Adresse des Mitglieds...',
    sendInviteBtn: 'Einladung senden',
    inviteSuccessMsg: (email) => `Einladung erfolgreich an ${email} gesendet!`,
    inviteErrorDefault: 'Einladungs-E-Mail konnte nicht gesendet werden.',
    noWorkspaceError: 'Kein aktiver Arbeitsbereich für die Einladung gefunden.',
    permissionNotice: 'Das Senden von Einladungen und Ändern von Rollen ist nur Inhabern und Administratoren vorbehalten.',
    membersListTitle: 'Teammitglieder & Berechtigungen',
    searchPlaceholder: 'Nach Name oder E-Mail suchen...',
    statusActive: 'Aktiv',
    statusPending: 'Ausstehend',
    removeMemberTitle: 'Mitglied entfernen',
    roleOwner: 'Arbeitsbereichs-Inhaber',
    roleAdmin: 'Systemadministrator',
    roleAnalyst: 'Datenanalyst',
    roleViewer: 'Betrachter',
  },
  es: {
    title: 'Gestión del Equipo',
    subtitle: 'Administra miembros del espacio de trabajo, envía invitaciones por correo y define permisos',
    totalMembersLabel: 'Total de miembros:',
    inviteCardTitle: 'Invitar nuevo miembro por correo',
    namePlaceholder: 'Nombre del miembro (opcional)...',
    emailPlaceholder: 'Correo electrónico del miembro...',
    sendInviteBtn: 'Enviar invitación',
    inviteSuccessMsg: (email) => `¡Invitación enviada correctamente a ${email}!`,
    inviteErrorDefault: 'Error al enviar el correo de invitación.',
    noWorkspaceError: 'No se encontró un espacio de trabajo activo.',
    permissionNotice: 'Solo los propietarios y administradores pueden enviar invitaciones y cambiar roles.',
    membersListTitle: 'Miembros del Equipo y Permisos',
    searchPlaceholder: 'Buscar por nombre o correo...',
    statusActive: 'Activo',
    statusPending: 'Pendiente',
    removeMemberTitle: 'Eliminar miembro',
    roleOwner: 'Propietario',
    roleAdmin: 'Administrador',
    roleAnalyst: 'Analista de datos',
    roleViewer: 'Lector',
  },
  it: {
    title: 'Gestione del Team',
    subtitle: 'Gestisci i membri dell’area di lavoro, invia inviti via email e imposta i permessi',
    totalMembersLabel: 'Membri totali:',
    inviteCardTitle: 'Invita nuovo membro via email',
    namePlaceholder: 'Nome membro (opzionale)...',
    emailPlaceholder: 'Indirizzo email del membro...',
    sendInviteBtn: 'Invia invito',
    inviteSuccessMsg: (email) => `Invito inviato con successo a ${email}!`,
    inviteErrorDefault: 'Invio email di invito non riuscito.',
    noWorkspaceError: 'Nessuna area di lavoro attiva trovata.',
    permissionNotice: 'L’invio di inviti e la modifica dei ruoli sono consentiti solo a Proprietari e Amministratori.',
    membersListTitle: 'Membri del Team e Permessi',
    searchPlaceholder: 'Cerca per nome o email...',
    statusActive: 'Attivo',
    statusPending: 'In sospeso',
    removeMemberTitle: 'Rimuovi membro',
    roleOwner: 'Proprietario',
    roleAdmin: 'Amministratore',
    roleAnalyst: 'Analista dati',
    roleViewer: 'Visualizzatore',
  },
  fr: {
    title: 'Gestion de l’Équipe',
    subtitle: 'Gérez les membres de l’espace, envoyez des invitations par e-mail et définissez les accès',
    totalMembersLabel: 'Total des membres :',
    inviteCardTitle: 'Inviter un nouveau membre par e-mail',
    namePlaceholder: 'Nom du membre (facultatif)...',
    emailPlaceholder: 'Adresse e-mail du membre...',
    sendInviteBtn: 'Envoyer l’invitation',
    inviteSuccessMsg: (email) => `Invitation envoyée avec succès à ${email} !`,
    inviteErrorDefault: 'Échec de l’envoi de l’e-mail d’invitation.',
    noWorkspaceError: 'Aucun espace de travail actif trouvé.',
    permissionNotice: 'L’envoi d’invitations et la modification des rôles sont réservés aux Propriétaires et Administrateurs.',
    membersListTitle: 'Membres de l’Équipe et Permissions',
    searchPlaceholder: 'Rechercher par nom ou e-mail...',
    statusActive: 'Actif',
    statusPending: 'En attente',
    removeMemberTitle: 'Supprimer le membre',
    roleOwner: 'Propriétaire',
    roleAdmin: 'Administrateur',
    roleAnalyst: 'Analyste de données',
    roleViewer: 'Lecteur',
  },
  ru: {
    title: 'Управление командой',
    subtitle: 'Управляйте участниками пространства, отправляйте приглашения по почте и настраивайте права',
    totalMembersLabel: 'Всего участников:',
    inviteCardTitle: 'Пригласить участника по электронной почте',
    namePlaceholder: 'Имя участника (необязательно)...',
    emailPlaceholder: 'Электронная почта участника...',
    sendInviteBtn: 'Отправить приглашение',
    inviteSuccessMsg: (email) => `Приглашение успешно отправлено на ${email}!`,
    inviteErrorDefault: 'Не удалось отправить письмо с приглашением.',
    noWorkspaceError: 'Активное рабочее пространство не найдено.',
    permissionNotice: 'Отправка приглашений и изменение ролей доступны только владельцам и администраторам.',
    membersListTitle: 'Участники команды и права доступа',
    searchPlaceholder: 'Поиск по имени или почте...',
    statusActive: 'Активен',
    statusPending: 'Ожидает',
    removeMemberTitle: 'Удалить участника',
    roleOwner: 'Владелец',
    roleAdmin: 'Администратор',
    roleAnalyst: 'Аналитик данных',
    roleViewer: 'Наблюдатель',
  },
  tr: {
    title: 'Ekip Yönetimi',
    subtitle: 'Çalışma alanı üyelerini yönetin, e-posta davetiyeleri gönderin ve erişim izinlerini belirleyin',
    totalMembersLabel: 'Toplam Üye:',
    inviteCardTitle: 'E-posta ile Yeni Üye Davet Et',
    namePlaceholder: 'Üye adı (isteğe bağlı)...',
    emailPlaceholder: 'Üye e-posta adresi...',
    sendInviteBtn: 'Davetiye Gönder',
    inviteSuccessMsg: (email) => `Davetiye ${email} adresine başarıyla gönderildi!`,
    inviteErrorDefault: 'Sunucudan davetiye e-postası gönderilemedi.',
    noWorkspaceError: 'Davetiye göndermek için aktif çalışma alanı bulunamadı.',
    permissionNotice: 'Davetiye gönderme ve üye rollerini değiştirme yalnızca Çalışma Alanı Sahipleri ve Yöneticilerine açıktır.',
    membersListTitle: 'Ekip Üyeleri ve İzinler',
    searchPlaceholder: 'İsim veya e-posta ile ara...',
    statusActive: 'Aktif',
    statusPending: 'Beklemede',
    removeMemberTitle: 'Üyeyi kaldır',
    roleOwner: 'Çalışma Alanı Sahibi',
    roleAdmin: 'Sistem Yöneticisi',
    roleAnalyst: 'Veri Analisti',
    roleViewer: 'İzleyici',
  },
}

export default function TeamPage() {
  const {
    canManageTeam,
    loading: roleLoading,
    activeWorkspaceId,
    activeWorkspace,
  } = useWorkspaceRole()
  const { lang } = useTranslation()
  const L = TEAM_LOCALES[lang] || TEAM_LOCALES.en

  const roleLabels: Record<TeamMember['role'], { label: string; color: string }> = {
    Owner: { label: L.roleOwner, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    Admin: { label: L.roleAdmin, color: 'bg-primary/15 text-primary border-primary/30' },
    Analyst: { label: L.roleAnalyst, color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    Viewer: { label: L.roleViewer, color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  }

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
            name: m.fullName || m.userName || m.email?.split('@')[0] || 'Member',
            email: m.email || '',
            role: (m.role as TeamMember['role']) || 'Analyst',
            status: 'active',
            joinedAt: m.joinedAt || new Date().toISOString(),
          }))
        }
      }

      if (backendMembers.length > 0) {
        const backendEmails = new Set(backendMembers.map((b) => b.email.toLowerCase()))
        const pendingLocal = savedLocal
          .filter(
            (l) =>
              (l.status === 'pending' || (l.status as any) === 'دعوة معلقة') &&
              !backendEmails.has(l.email.toLowerCase())
          )
          .map((l) => ({ ...l, status: 'pending' as const }))
        const merged = [...backendMembers, ...pendingLocal]
        setMembers(merged)
        localStorage.setItem(storageKey, JSON.stringify(merged))
      } else if (Array.isArray(savedLocal) && savedLocal.length > 0) {
        const normalized = savedLocal.map((m) => ({
          ...m,
          status:
            m.status === 'pending' || (m.status as any) === 'دعوة معلقة'
              ? ('pending' as const)
              : ('active' as const),
        }))
        setMembers(normalized)
      } else {
        const initialMembers: TeamMember[] = [
          {
            id: 'owner-1',
            name: currentUserName,
            email: currentUserEmail,
            role: 'Owner',
            status: 'active',
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
        throw new Error(L.noWorkspaceError)
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
        status: 'pending',
        joinedAt: new Date().toISOString(),
      }

      const updated = [...members.filter((m) => m.email !== newMember.email), newMember]
      persistMembers(updated)

      setInviteEmail('')
      setInviteName('')
      setInviteSuccess(L.inviteSuccessMsg(newMember.email))
      setTimeout(() => setInviteSuccess(''), 6000)
    } catch (err: any) {
      setInviteError(err?.message || L.inviteErrorDefault)
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

  const displayedWorkspaceName = activeWorkspace?.name || workspaceName || 'Workspace'

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
                <h1 className="text-xl font-bold tracking-tight">{L.title}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Building2 className="h-3 w-3 text-primary" />
                  {displayedWorkspaceName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{L.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2 text-xs">
            <span className="text-muted-foreground">{L.totalMembersLabel}</span>
            <span className="text-base font-bold text-primary">{members.length}</span>
          </div>
        </div>

        {!roleLoading && canManageTeam ? (
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">{L.inviteCardTitle}</h2>
            </div>

            <form onSubmit={handleInviteMember} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder={L.namePlaceholder}
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="relative sm:col-span-4">
                <Mail className="pointer-events-none absolute top-3 end-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={L.emailPlaceholder}
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 pe-10 ps-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="h-10 w-full rounded-xl border border-input bg-secondary/50 px-3 text-xs font-medium outline-none focus:border-primary"
                >
                  <option value="Admin" className="bg-slate-900">
                    {L.roleAdmin} (Admin)
                  </option>
                  <option value="Analyst" className="bg-slate-900">
                    {L.roleAnalyst} (Analyst)
                  </option>
                  <option value="Viewer" className="bg-slate-900">
                    {L.roleViewer} (Viewer)
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {L.sendInviteBtn}
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
            <span>{L.permissionNotice}</span>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold">{L.membersListTitle}</h2>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-2.5 end-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={L.searchPlaceholder}
                className="h-9 w-full rounded-xl border border-input bg-background/60 pe-9 ps-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {filteredMembers.map((member) => {
              const roleBadge = roleLabels[member.role]
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
                            member.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {member.status === 'active' ? L.statusActive : L.statusPending}
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
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value as TeamMember['role'])
                          }
                          className="h-9 rounded-xl border border-input bg-secondary/70 px-3 text-xs font-medium outline-none focus:border-primary"
                        >
                          <option value="Admin" className="bg-slate-900">
                            {L.roleAdmin}
                          </option>
                          <option value="Analyst" className="bg-slate-900">
                            {L.roleAnalyst}
                          </option>
                          <option value="Viewer" className="bg-slate-900">
                            {L.roleViewer}
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          title={L.removeMemberTitle}
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