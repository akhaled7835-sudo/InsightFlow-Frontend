'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Loader2,
  Sparkles,
  Plus,
  FolderPlus,
  Download,
} from 'lucide-react'
import { apiRequest, getSession, ApiError, API_BASE_URL, TOKEN_KEY, getLang } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

type FileStatus = 'uploading' | 'processing' | 'success' | 'error'

type UploadFile = {
  id: string
  name: string
  size: number
  type: string
  status: FileStatus
  error?: string
  datasetId?: string
  fileId?: string
  rows?: number
  columns?: number
  insights?: Array<{ type?: string; title: string; description: string; severity?: string }>
}

const MAX_SIZE = 50 * 1024 * 1024
const ACCEPTED = ['csv', 'xlsx']

function ext(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function fileIcon(type: string, className = 'h-5 w-5') {
  if (type === 'csv') return <FileText className={className} />
  return <FileSpreadsheet className={className} />
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

export function UploadManager() {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [newProjectName, setNewProjectName] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  const [exporting, setExporting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadContext() {
      const session = getSession()
      if (session?.workspaceId) setWorkspaceId(session.workspaceId)
      if (session?.defaultProjectId) {
        setSelectedProjectId(session.defaultProjectId)
        setProjects([{ id: session.defaultProjectId, name: 'Demo Default Project' }])
      }

      try {
        const wsList = await apiRequest<any[]>('/api/workspaces')
        const firstWs = wsList?.[0]
        const wsId = firstWs?.id || firstWs?.workspaceId || session?.workspaceId
        if (wsId) {
          setWorkspaceId(wsId)
          const projList = await apiRequest<any[]>(`/api/workspaces/${wsId}/projects`)
          if (Array.isArray(projList) && projList.length > 0) {
            const mapped = projList.map((p) => ({
              id: p.id || p.projectId,
              name: p.name || 'Untitled Project',
            }))
            setProjects(mapped)
            setSelectedProjectId((prev) => prev || mapped[0].id)
          }
        }
      } catch {
        // fallback to session defaults if already populated
      }
    }
    loadContext()
  }, [])

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId || !newProjectName.trim()) return
    setCreatingProject(true)
    try {
      const created = await apiRequest<any>(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: 'Created from InsightFlow Upload Center',
        }),
      })
      const id = created?.id || created?.projectId
      if (id) {
        setProjects((prev) => [{ id, name: newProjectName.trim() }, ...prev])
        setSelectedProjectId(id)
        setNewProjectName('')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }

  const processSingleFile = useCallback(
    async (f: File, itemId: string) => {
      if (!selectedProjectId) {
        setFiles((prev) =>
          prev.map((x) =>
            x.id === itemId
              ? { ...x, status: 'error', error: 'Please select or create a project first.' }
              : x
          )
        )
        return
      }

      try {
        // 1. Upload file to /api/projects/{projectId}/files
        const formData = new FormData()
        formData.append('file', f)

        const uploaded = await apiRequest<any>(
          `/api/projects/${selectedProjectId}/files`,
          { method: 'POST', body: formData }
        )

        const datasetId = uploaded?.datasetId || uploaded?.id
        const fileId = uploaded?.fileId

        setFiles((prev) =>
          prev.map((x) =>
            x.id === itemId ? { ...x, status: 'processing', datasetId, fileId } : x
          )
        )

        // 2. Clean & process dataset
        let rows: number | undefined
        let columns: number | undefined
        if (datasetId) {
          const proc = await apiRequest<any>(
            `/api/analytics/datasets/${datasetId}/process`,
            { method: 'POST' }
          )
          rows = proc?.rowCount ?? proc?.rowsProcessed
          columns = proc?.columnCount ?? proc?.columnsCount

          // 3. Generate AI Insights in user's selected language
          const insightsRes = await apiRequest<any>(
            `/api/analytics/datasets/${datasetId}/insights`,
            {
              method: 'POST',
              body: JSON.stringify({
                metrics: [],
                groupBy: [],
                filters: [],
                comparisons: [],
              }),
            }
          )

          const insightsList = insightsRes?.insights || insightsRes?.Insights || []

          setFiles((prev) =>
            prev.map((x) =>
              x.id === itemId
                ? {
                    ...x,
                    status: 'success',
                    rows,
                    columns,
                    insights: insightsList,
                  }
                : x
            )
          )
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Upload or analysis failed. Please try again.'
        setFiles((prev) =>
          prev.map((x) =>
            x.id === itemId ? { ...x, status: 'error', error: message } : x
          )
        )
      }
    },
    [selectedProjectId]
  )

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return
      Array.from(incoming).forEach((f) => {
        const type = ext(f.name)
        const id = `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

        if (!ACCEPTED.includes(type)) {
          setFiles((prev) => [
            {
              id,
              name: f.name,
              size: f.size,
              type,
              status: 'error',
              error: 'Unsupported format. Please upload .xlsx or .csv files.',
            },
            ...prev,
          ])
          return
        }

        if (f.size > MAX_SIZE) {
          setFiles((prev) => [
            {
              id,
              name: f.name,
              size: f.size,
              type,
              status: 'error',
              error: 'File exceeds 50 MB limit.',
            },
            ...prev,
          ])
          return
        }

        setFiles((prev) => [
          { id, name: f.name, size: f.size, type, status: 'uploading' },
          ...prev,
        ])
        processSingleFile(f, id)
      })
    },
    [processSingleFile]
  )

  async function handleExportReport(format: 'pdf' | 'excel', fileItem: UploadFile) {
    if (!selectedProjectId) return
    setExporting(true)
    try {
      const created = await apiRequest<any>(
        `/api/projects/${selectedProjectId}/reports`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: `${fileItem.name} - Executive Report`,
            description: 'Generated automatically from InsightFlow AI Analytics',
            datasetId: fileItem.datasetId,
          }),
        }
      )
      const reportId = created?.id || created?.reportId
      if (!reportId) throw new Error('Report ID missing')

      const token = localStorage.getItem(TOKEN_KEY) || ''
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${selectedProjectId}/reports/${reportId}/${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': getLang(),
          },
        }
      )
      if (!res.ok) throw new Error('Failed to download report')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileItem.name}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))
  const latestSuccess = files.find((f) => f.status === 'success')

  return (
    <div className="flex flex-col gap-6">
      {/* Project Selector & Quick Create */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t.targetProject}
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm font-medium outline-none focus:border-primary"
          >
            {projects.length === 0 && <option value="">Loading projects...</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {workspaceId && (
          <form onSubmit={handleCreateProject} className="flex items-center gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t.newProjectPlaceholder}
              className="h-10 rounded-xl border border-input bg-secondary/40 px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={creatingProject || !newProjectName.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-secondary px-3 text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
            >
              <FolderPlus className="h-4 w-4 text-primary" />
              {t.newProjectBtn}
            </button>
          </form>
        )}
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          dragging ? 'border-primary bg-primary/10' : 'border-border bg-card/40 hover:border-primary/40'
        }`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UploadCloud className="h-8 w-8" />
        </span>
        <div>
          <p className="text-base font-semibold">
            {dragging ? 'Drop your Excel or CSV file here' : '{t.dropzoneTitle}'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.dropzoneSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t.selectFileBtn}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {['CSV', 'XLSX'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {t}
            </span>
          ))}
          <span>• Max 50 MB • Demo: 1 file / Standard: 3 files daily</span>
        </div>
      </div>

      {/* Uploaded Files & Live Status */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Processing & Results</h3>
          {files.map((f) => (
            <div key={f.id} className="rounded-xl border border-border bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  {fileIcon(f.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatSize(f.size)}
                    {f.rows !== undefined && ` • ${f.rows.toLocaleString()} rows • ${f.columns} columns`}
                  </p>
                  {f.status === 'uploading' && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.uploadingStatus}
                    </p>
                  )}
                  {f.status === 'processing' && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.processingStatus}
                    </p>
                  )}
                  {f.status === 'success' && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t.successStatus}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={exporting}
                          onClick={() => handleExportReport('pdf', f)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/80"
                        >
                          <Download className="h-3.5 w-3.5 text-primary" /> {t.exportPdf}
                        </button>
                        <button
                          type="button"
                          disabled={exporting}
                          onClick={() => handleExportReport('excel', f)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/80"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-400" /> {t.exportExcel}
                        </button>
                      </div>
                    </div>
                  )}
                  {f.status === 'error' && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {f.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live AI Insights Output */}
      {latestSuccess && latestSuccess.insights && latestSuccess.insights.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-card/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">{t.aiInsightsTitle} — {latestSuccess.name}</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {latestSuccess.insights.map((ins, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background/60 p-4">
                <p className="text-sm font-semibold text-foreground">{ins.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
