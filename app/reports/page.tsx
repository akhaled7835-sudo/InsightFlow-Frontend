'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, FileText, Download, ArrowRight, Calendar, Layers, ShieldCheck } from 'lucide-react'

interface ReportItem {
  id: string
  title: string
  description?: string
  createdAt: string
  snapshot?: {
    analytics?: {
      rowCount: number
      ColumnCount: number
    }
    insights?: Array<{
      title: string
      severity: string
    }>
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://insightflow.runasp.net/api'
        // Fetch reports list (adjust endpoint according to your API routes)
        const res = await fetch(`${apiUrl}/reports`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (res.ok) {
          const data = await res.json()
          setReports(Array.isArray(data) ? data : data.items || [])
        }
      } catch (error) {
        console.error('Failed to load reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">تقارير الذكاء الاصطناعي والتحليلات</h1>
          <p className="text-sm text-muted-foreground">
            استعرض التقارير التنفيذية التلقائية ورؤى الذكاء الاصطناعي المستخرجة من ملفاتك.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          تحليل ملف جديد وإنشاء تقرير
        </Link>
      </div>

      {/* Loading & Reports Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card/40">
          <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل التقارير الذكية...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/40 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </span>
          <h3 className="text-base font-semibold">لا توجد تقارير مخزنة حالياً</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            بمجرد قيامك برفع وتحليل أي ملف بيانات، سيقوم النظام بتوليد تقرير تنفيذي شامل ورؤى ذكية هنا تلقائياً.
          </p>
          <Link
            href="/upload"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
          >
            رفع ملف وتحليل الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3 w-3" />
                    تقرير ذكي معتمد
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {report.description || 'تقرير تنفيذي يحتوي على مؤشرات الأداء والتحليلات الآلية.'}
                </p>

                {report.snapshot?.insights && report.snapshot.insights.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3">
                    <p className="text-[11px] font-semibold text-primary mb-1">أبرز رؤى الذكاء الاصطناعي:</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      • {report.snapshot.insights[0].title}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {report.snapshot?.analytics?.rowCount || 0} سجل
                  </span>
                </div>
                <Link
                  href={`/reports/${report.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
                >
                  عرض الداشبورد والتقرير
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