'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiRequest, getSession } from '@/lib/api'

export type WorkspaceRole = 'Owner' | 'Admin' | 'Analyst' | 'Viewer'

export type WorkspaceSummary = {
  id: string
  name: string
  description?: string
}

export const ACTIVE_WORKSPACE_KEY = 'insightflow_active_workspace_id'
const WORKSPACE_OVERRIDES_KEY = 'insightflow_workspace_overrides'

export function getStoredActiveWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY)
}

export function setStoredActiveWorkspaceId(workspaceId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId)
}

export function saveWorkspaceOverride(
  workspaceId: string,
  data: { name?: string; description?: string }
) {
  if (typeof window === 'undefined' || !workspaceId) return
  const current = JSON.parse(localStorage.getItem(WORKSPACE_OVERRIDES_KEY) || '{}')
  current[workspaceId] = {
    ...(current[workspaceId] || {}),
    ...data,
  }
  localStorage.setItem(WORKSPACE_OVERRIDES_KEY, JSON.stringify(current))
}

function getWorkspaceOverrides(): Record<string, { name?: string; description?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(WORKSPACE_OVERRIDES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useWorkspaceRole() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(null)
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorkspaceAndRole = useCallback(async () => {
    try {
      const session = getSession()
      const myEmail = session?.email?.toLowerCase()
      const overrides = getWorkspaceOverrides()

      const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
      const mappedList: WorkspaceSummary[] = Array.isArray(wsList)
        ? wsList.map((w: any) => {
            const id = w.id || w.workspaceId
            const ov = overrides[id] || {}
            return {
              id,
              name: ov.name || w.name || 'مساحة عمل',
              description: ov.description !== undefined ? ov.description : w.description,
            }
          })
        : []

      setWorkspaces(mappedList)

      const savedId = getStoredActiveWorkspaceId()
      const selected =
        mappedList.find((w) => w.id === savedId) ||
        mappedList[0] ||
        (session?.workspaceId
          ? {
              id: session.workspaceId,
              name: overrides[session.workspaceId]?.name || 'مساحة العمل الرئيسية',
              description: overrides[session.workspaceId]?.description,
            }
          : null)

      setActiveWorkspace(selected)

      if (!selected?.id || selected.id === 'default') {
        setRole('Owner')
        return
      }

      setStoredActiveWorkspaceId(selected.id)

      const members = await apiRequest<any[]>(`/api/workspaces/${selected.id}/members`).catch(
        () => []
      )
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
  }, [])

  useEffect(() => {
    fetchWorkspaceAndRole()
  }, [fetchWorkspaceAndRole])

  function switchWorkspace(workspaceId: string) {
    setStoredActiveWorkspaceId(workspaceId)
    window.location.reload()
  }

  const isOwner = role === 'Owner'
  const isAdmin = role === 'Admin'
  const isAnalyst = role === 'Analyst'
  const isViewer = role === 'Viewer'

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId: activeWorkspace?.id || '',
    switchWorkspace,
    refreshWorkspace: fetchWorkspaceAndRole,
    role,
    loading,
    isOwner,
    isAdmin,
    isAnalyst,
    isViewer,
    canManageTeam: isOwner || isAdmin,
    canAnalyzeAndUpload: isOwner || isAdmin || isAnalyst,
  }
}