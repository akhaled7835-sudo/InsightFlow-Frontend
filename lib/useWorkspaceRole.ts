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

function getWorkspaceOverrides(): Record<string, { name?: string; description?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(WORKSPACE_OVERRIDES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveWorkspaceOverride(
  workspaceId: string,
  data: { name?: string; description?: string }
) {
  if (typeof window === 'undefined' || !workspaceId) return

  // 1. حفظ التعديل في قاموس التخصيصات
  const current = getWorkspaceOverrides()
  current[workspaceId] = {
    ...(current[workspaceId] || {}),
    ...data,
  }
  localStorage.setItem(WORKSPACE_OVERRIDES_KEY, JSON.stringify(current))

  // 2. تحديث القائمة المخبأة مباشرة بنفس الاسم والوصف الجديدين
  try {
    const cachedRaw = JSON.parse(localStorage.getItem(WORKSPACE_LIST_CACHE_KEY) || '[]')
    if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
      const updatedCache = cachedRaw.map((w: any) =>
        w.id === workspaceId
          ? {
              ...w,
              name: data.name || w.name,
              description: data.description !== undefined ? data.description : w.description,
            }
          : w
      )
      localStorage.setItem(WORKSPACE_LIST_CACHE_KEY, JSON.stringify(updatedCache))
    }
  } catch {
    // ignore
  }

  // 3. إبلاغ جميع المكونات المفتوحة (Topbar / Settings / Team / Sidebar) فوراً
  window.dispatchEvent(new Event('insightflow_workspace_updated'))
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

      const applyOverrides = (list: any[]): WorkspaceSummary[] =>
        list.map((w: any) => {
          const id = w.id || w.workspaceId
          const ov = overrides[id] || {}
          return {
            id,
            name: ov.name || w.name || 'مساحة عمل',
            description: ov.description !== undefined ? ov.description : w.description,
          }
        })

      // قراءة النسخة المخبأة فوراً لتجنب ظهور "جاري التحميل..."
      const cachedRaw = JSON.parse(localStorage.getItem(WORKSPACE_LIST_CACHE_KEY) || '[]')
      if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
        const cachedMapped = applyOverrides(cachedRaw)
        setWorkspaces(cachedMapped)
        const savedId = getStoredActiveWorkspaceId()
        const preSelected = cachedMapped.find((w) => w.id === savedId) || cachedMapped[0]
        if (preSelected) setActiveWorkspace(preSelected)
      }

      const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => [])
      let mappedList: WorkspaceSummary[] =
        Array.isArray(wsList) && wsList.length > 0 ? applyOverrides(wsList) : []

      if (mappedList.length === 0 && Array.isArray(cachedRaw) && cachedRaw.length > 0) {
        mappedList = applyOverrides(cachedRaw)
      } else if (mappedList.length === 0 && session?.workspaceId) {
        mappedList = applyOverrides([
          {
            id: session.workspaceId,
            name: 'مساحة العمل الرئيسية',
          },
        ])
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

    const onWorkspaceUpdated = () => {
      fetchWorkspaceAndRole()
    }
    window.addEventListener('insightflow_workspace_updated', onWorkspaceUpdated)
    return () => window.removeEventListener('insightflow_workspace_updated', onWorkspaceUpdated)
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