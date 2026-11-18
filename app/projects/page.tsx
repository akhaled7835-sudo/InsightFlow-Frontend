'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, FileSpreadsheet, Plus, ArrowRight, Sparkles, Clock, Database } from 'lucide-react'

interface ProjectItem {
  id: string
  name: string
  description?: string
  createdAt?: string
  datasetsCount?: number
  reportsCount?: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://insightflow.runasp.net/api'
        const res = await fetch(`${apiUrl}/projects`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (res.ok) {
          const data = await res.json()
          // Adjust based on your API response structure (e.g., data or direct array)
          setProjects(Array.isArray(data) ? data : data.items || [])
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المشاريع وتحليلات البيانات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة مشاريعك وملفاتك وتحليلات الذكاء الاصطناعي المرتبطة بها.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          مشروع أو ملف جديد
        </Link>
      </div>

      {/* Loading & Projects Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card/40">
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل المشاريع...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/40 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FolderKanban className="h-6 w-6" />
          </span>
          <h3 className="text-base font-semibold">لا توجد مشاريع مضافة حالياً</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            قم برفع أول ملف بيانات لك لكي يبدأ محرك الذكاء الاصطناعي بتحليله وإنشاء التقارير تلقائياً.
          </p>
          <Link
            href="/upload"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
          >
            رفع ملف بيانات الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Database className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    نشط
                  </span>
                </div>
                <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {project.description || 'مساحة عمل مخصصة لتحليل الملفات والتقارير التنفيذية.'}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
                </span>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  عرض الداشبورد
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}