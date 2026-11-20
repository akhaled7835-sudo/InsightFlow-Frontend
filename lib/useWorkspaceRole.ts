'use client'

import { useEffect, useState } from 'react'
import { apiRequest, getSession } from '@/lib/api'

export type WorkspaceRole = 'Owner' | 'Admin' | 'Analyst' | 'Viewer'

export function useWorkspaceRole() {
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      try {
        const session = getSession()
        const myEmail = session?.email?.toLowerCase()

        const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
        const activeWs = wsList?.[0]
        const wsId = activeWs?.id || activeWs?.workspaceId || session?.workspaceId

        if (!wsId || wsId === 'default') {
          setRole('Owner')
          return
        }

        const members = await apiRequest<any[]>(`/api/workspaces/${wsId}/members`).catch(() => [])
        const me = Array.isArray(members)
          ? members.find((m: any) => m.email?.toLowerCase() === myEmail)
          : null

        if (me?.role) {
          setRole(me.role as WorkspaceRole)
        } else {
          setRole('Viewer')
        }
      } catch {
        setRole('Viewer')
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  const isOwner = role === 'Owner'
  const isAdmin = role === 'Admin'
  const isAnalyst = role === 'Analyst'
  const isViewer = role === 'Viewer'

  return {
    role,
    loading,
    isOwner,
    isAdmin,
    isAnalyst,
    isViewer,
    // المالك والأدمن فقط يمكنهما دعوة أو تعديل أو حذف الأعضاء
    canManageTeam: isOwner || isAdmin,
    // المالك والأدمن والمحلل يمكنهم التحليل ورفع الملفات (المشاهد ممنوع)
    canAnalyzeAndUpload: isOwner || isAdmin || isAnalyst,
  }
}