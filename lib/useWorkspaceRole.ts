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
const WORKSPACE_LIST_CACHE_KEY = 'insightflow_workspaces_cache'

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

      // قراءة النسخة المخبأة فوراً لتجنب ظهور "جاري التحميل..." أثناء انتظار السيرفر
      const cachedRaw = JSON.parse(localStorage.getItem(WORKSPACE_LIST_CACHE_KEY) || '[]')
      if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
        const cachedMapped = cachedRaw.map((w: any) => ({
          id: w.id,
          name: overrides[w.id]?.name || w.name || 'مساحة عمل',
          description: overrides[w.id]?.description !== undefined ? overrides[w.id].description : w.description,
        }))
        setWorkspaces(cachedMapped)
        const savedId = getStoredActiveWorkspaceId()
        const preSelected = cachedMapped.find((w: any) => w.id === savedId) || cachedMapped[0]
        if (preSelected) setActiveWorkspace(preSelected)
      }

      const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
      let mappedList: WorkspaceSummary[] = Array.isArray(wsList)
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

      // إذا فشل السيرفر مؤقتاً نستخدم القائمة المخبأة أو الجلسة
      if (mappedList.length === 0 && Array.isArray(cachedRaw) && cachedRaw.length > 0) {
        mappedList = cachedRaw.map((w: any) => ({
          id: w.id,
          name: overrides[w.id]?.name || w.name || 'مساحة عمل',
          description: overrides[w.id]?.description !== undefined ? overrides[w.id].description : w.description,
        }))
      } else if (mappedList.length === 0 && session?.workspaceId) {
        mappedList = [
          {
            id: session.workspaceId,
            name: overrides[session.workspaceId]?.name || 'مساحة العمل الرئيسية',
            description: overrides[session.workspaceId]?.description,
          },
        ]
      }

      if (mappedList.length > 0) {
        localStorage.setItem(WORKSPACE_LIST_CACHE_KEY, JSON.stringify(mappedList))
      }

      setWorkspaces(mappedList)

      const savedId = getStoredActiveWorkspaceId()
      const selected = mappedList.find((w) => w.id === savedId) || mappedList[0] || null
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
        setRole('Owner')
      }
    } catch {
      setRole('Owner')
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