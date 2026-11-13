import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Welcome } from '@/components/dashboard/welcome'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { RecentProjects, RecentFiles } from '@/components/dashboard/projects-files'
import { InsightsPanel, QuickActions } from '@/components/dashboard/insights-actions'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'

export const metadata: Metadata = {
  title: 'Dashboard | InsightFlow',
  description:
    'Your AI-powered analytics workspace — track revenue, users, files, and AI reports in real time.',
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Welcome />
        <KpiCards />
        <ChartsSection />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentProjects />
          <RecentFiles />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InsightsPanel />
          <QuickActions />
        </div>

        <ActivityTimeline />
      </div>
    </DashboardShell>
  )
}
