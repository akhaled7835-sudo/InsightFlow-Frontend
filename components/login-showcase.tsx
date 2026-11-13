"use client"

import { BarChart3, TrendingUp, Sparkles, Activity } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

const bars = [42, 65, 48, 78, 58, 88, 72]

export function LoginShowcase() {
  const { t } = useTranslation()
  return (
    <div className="relative hidden overflow-hidden rounded-3xl lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 15% 10%, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.08) 40%, rgba(15,23,42,0) 70%), linear-gradient(160deg, #16233f 0%, #0f172a 55%, #0b1120 100%)",
        }}
      />
      <div className="relative flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </span>
        <span className="text-lg font-semibold tracking-tight">InsightFlow</span>
      </div>

      <div className="relative my-8 flex flex-1 items-center justify-center">
        <div className="glass animate-float-up w-full max-w-sm rounded-2xl p-5 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">InsightFlow Analytics</p>
              <p className="mt-1 text-2xl font-semibold">$48,250</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.2%
            </span>
          </div>
          <div className="mt-6 flex h-28 items-end justify-between gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end">
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass animate-float-up absolute -end-2 top-2 w-56 rounded-2xl p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs font-medium">{t.aiInsightsTitle}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.aiCard1Body}</p>
        </div>

        <div className="glass animate-float-up absolute -start-3 bottom-4 w-44 rounded-2xl p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
              <Activity className="h-4 w-4 text-success" />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">Live</p>
              <p className="text-sm font-semibold">12,480</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-balance text-2xl font-semibold leading-snug">{t.showcaseTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.showcaseSubtitle}</p>
      </div>
    </div>
  )
}