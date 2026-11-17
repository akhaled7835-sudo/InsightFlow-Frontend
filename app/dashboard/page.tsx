'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Welcome } from '@/components/dashboard/welcome'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { RecentProjects, RecentFiles } from '@/components/dashboard/projects-files'
import { InsightsPanel, AIInsightItem } from '@/components/dashboard/insights-actions'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'

export default function DashboardPage() {
  const [insights, setInsights] = useState<AIInsightItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch latest reports or analytics insights from your .NET Backend API
    async function fetchDashboardData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://insightflow.runasp.net/api'
        
        // Example: Fetching projects/reports to pull live AI insights
        // You can adjust this endpoint according to your API routes for reports or analytics
        const res = await fetch(`${apiUrl}/projects`, {
          headers: {
            'Content-Type': 'application/json',
            // Add Authorization token if stored in localStorage
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          // If your API returns projects with reports/insights, extract them here
          // For demonstration, we keep fallback state if array is empty
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Welcome />
        
        {/* KPI Cards showcasing live metrics */}
        <KpiCards />

        {/* Charts Section with aggregations */}
        <ChartsSection />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentProjects />
          <RecentFiles />
        </div>

        {/* Live AI Insights Panel connected to .NET backend analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InsightsPanel insights={insights} />
          {/* QuickActions embedded inside insights-actions.tsx */}
        </div>

        <ActivityTimeline />
      </div>
    </DashboardShell>
  )
}