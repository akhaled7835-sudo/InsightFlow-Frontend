import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { UploadManager } from '@/components/upload/upload-manager'

export const metadata: Metadata = {
  title: 'Upload Data · InsightFlow',
  description: 'Upload and import Excel, CSV, and JSON datasets into InsightFlow.',
}

export default function UploadPage() {
  return (
    <DashboardShell activeItem="Data Files">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Upload Data</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Import your Excel, CSV, or JSON files to start building AI-powered analytics and reports.
          </p>
        </div>
        <UploadManager />
      </div>
    </DashboardShell>
  )
}
