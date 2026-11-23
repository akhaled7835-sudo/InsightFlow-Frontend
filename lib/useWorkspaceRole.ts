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

// حالة مشتركة في الذاكرة لمنع التعليق وإعادة التحميل عند التنقل بين الصفحات
let memoryWorkspaces: WorkspaceSummary[] = []
let memoryActiveWorkspace: WorkspaceSummary | null = null
let memoryRole: WorkspaceRole | null = null
let inFlightPromise: Promise<void> | null = null

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

export function getCachedProjects(workspaceId: string): any[] {
  if (typeof window === 'undefined' || !workspaceId) return []
  try {
    const raw = JSON.parse(localStorage.getItem(`insightflow_projects_cache_${workspaceId}`) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function setCachedProjects(workspaceId: string, projects: any[]) {
  if (typeof window === 'undefined' || !workspaceId || !Array.isArray(projects)) return
  localStorage.setItem(`insightflow_projects_cache_${workspaceId}`, JSON.stringify(projects))
}

export async function saveWorkspaceOverride(
  workspaceId: string,
  data: { name?: string; description?: string }
) {
  if (typeof window === 'undefined' || !workspaceId) return

  // 1. حفظ التعديل محلياً فوراً وبشكل دائم
  const current = getWorkspaceOverrides()
  current[workspaceId] = {
    ...(current[workspaceId] || {}),
    ...data,
  }
  localStorage.setItem(WORKSPACE_OVERRIDES_KEY, JSON.stringify(current))

  // 2. تحديث القائمة المخبأة والذاكرة المشتركة فوراً
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
      memoryWorkspaces = updatedCache
    }
    if (memoryActiveWorkspace?.id === workspaceId) {
      memoryActiveWorkspace = {
        ...memoryActiveWorkspace,
        name: data.name || memoryActiveWorkspace.name,
        description:
          data.description !== undefined ? data.description : memoryActiveWorkspace.description,
      }
    }
  } catch {
    // ignore
  }

  // 3. محاولة حفظ الاسم في قاعدة البيانات بالباك إند بجميع الصيغ المحتملة
  const payload = {
    name: data.name,
    Name: data.name,
    description: data.description,
    Description: data.description,
  }

  const attempts = [
    () =>
      apiRequest(`/api/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    () =>
      apiRequest(`/api/workspaces/${workspaceId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    () =>
      apiRequest(`/api/workspaces/${workspaceId}/rename`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  ]

  for (const run of attempts) {
    try {
      await run()
      break
    } catch {
      // جرّب المسار التالي
    }
  }

  // 4. إبلاغ جميع المكونات المفتوحة فوراً
  window.dispatchEvent(new Event('insightflow_workspace_updated'))
}

function hydrateInitialFromCache(): {
  workspaces: WorkspaceSummary[]
  active: WorkspaceSummary | null
  role: WorkspaceRole | null
} {
  if (memoryActiveWorkspace && memoryWorkspaces.length > 0) {
    return {
      workspaces: memoryWorkspaces,
      active: memoryActiveWorkspace,
      role: memoryRole || 'Owner',
    }
  }
  if (typeof window === 'undefined') {
    return { workspaces: [], active: null, role: null }
  }
  try {
    const overrides = getWorkspaceOverrides()
    const cachedRaw = JSON.parse(localStorage.getItem(WORKSPACE_LIST_CACHE_KEY) || '[]')
    if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
      const mapped = cachedRaw.map((w: any) => {
        const id = w.id || w.workspaceId
        const ov = overrides[id] || {}
        return {
          id,
          name: ov.name || w.name || w.Name || 'Workspace',
          description: ov.description !== undefined ? ov.description : w.description,
        }
      })
      const savedId = getStoredActiveWorkspaceId()
      const selected = mapped.find((w) => w.id === savedId) || mapped[0] || null
      memoryWorkspaces = mapped
      memoryActiveWorkspace = selected
      return { workspaces: mapped, active: selected, role: 'Owner' }
    }
  } catch {
    // ignore
  }
  return { workspaces: [], active: null, role: null }
}

export function useWorkspaceRole() {
  const initial = hydrateInitialFromCache()

  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>(initial.workspaces)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(initial.active)
  const [role, setRole] = useState<WorkspaceRole | null>(initial.role)
  const [loading, setLoading] = useState<boolean>(!initial.active)

  const syncFromMemory = useCallback(() => {
    if (memoryWorkspaces.length > 0) setWorkspaces(memoryWorkspaces)
    if (memoryActiveWorkspace) setActiveWorkspace(memoryActiveWorkspace)
    if (memoryRole) setRole(memoryRole)
    setLoading(false)
  }, [])

  const fetchWorkspaceAndRole = useCallback(
    async (force = false) => {
      if (inFlightPromise && !force) {
        await inFlightPromise
        syncFromMemory()
        return
      }

      const task = (async () => {
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
                name: ov.name || w.name || w.Name || 'Workspace',
                description:
                  ov.description !== undefined ? ov.description : w.description || w.Description,
              }
            })

          const wsList = await apiRequest<any[]>('/api/workspaces').catch(() => null)
          let mappedList: WorkspaceSummary[] =
            Array.isArray(wsList) && wsList.length > 0 ? applyOverrides(wsList) : []

          if (mappedList.length === 0) {
            const cachedRaw = JSON.parse(localStorage.getItem(WORKSPACE_LIST_CACHE_KEY) || '[]')
            if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
              mappedList = applyOverrides(cachedRaw)
            } else if (session?.workspaceId) {
              mappedList = applyOverrides([
                {
                  id: session.workspaceId,
                  name: 'Main Workspace',
                },
              ])
            }
          }

          if (mappedList.length > 0) {
            localStorage.setItem(WORKSPACE_LIST_CACHE_KEY, JSON.stringify(mappedList))
            memoryWorkspaces = mappedList
            setWorkspaces(mappedList)
          }

          const savedId = getStoredActiveWorkspaceId()
          const selected = mappedList.find((w) => w.id === savedId) || mappedList[0] || null
          memoryActiveWorkspace = selected
          setActiveWorkspace(selected)

          if (!selected?.id || selected.id === 'default') {
            memoryRole = 'Owner'
            setRole('Owner')
            return
          }

          setStoredActiveWorkspaceId(selected.id)

          const members = await apiRequest<any[]>(`/api/workspaces/${selected.id}/members`).catch(
            () => null
          )
          const me = Array.isArray(members)
            ? members.find((m: any) => m.email?.toLowerCase() === myEmail)
            : null

          const resolvedRole = (me?.role as WorkspaceRole) || 'Owner'
          memoryRole = resolvedRole
          setRole(resolvedRole)
        } catch {
          if (!memoryRole) {
            memoryRole = 'Owner'
            setRole('Owner')
          }
        } finally {
          inFlightPromise = null
          setLoading(false)
        }
      })()

      inFlightPromise = task
      await task
    },
    [syncFromMemory]
  )

  useEffect(() => {
    fetchWorkspaceAndRole(false)

    const onWorkspaceUpdated = () => {
      syncFromMemory()
      fetchWorkspaceAndRole(true)
    }
    window.addEventListener('insightflow_workspace_updated', onWorkspaceUpdated)
    return () => window.removeEventListener('insightflow_workspace_updated', onWorkspaceUpdated)
  }, [fetchWorkspaceAndRole, syncFromMemory])

  function switchWorkspace(workspaceId: string) {
    setStoredActiveWorkspaceId(workspaceId)
    const found = memoryWorkspaces.find((w) => w.id === workspaceId) || null
    if (found) {
      memoryActiveWorkspace = found
      setActiveWorkspace(found)
    }
    window.dispatchEvent(new Event('insightflow_workspace_updated'))
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
    refreshWorkspace: () => fetchWorkspaceAndRole(true),
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