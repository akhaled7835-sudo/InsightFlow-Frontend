import { BarChart3, TrendingUp, Sparkles, Activity } from "lucide-react"

const bars = [42, 65, 48, 78, 58, 88, 72]

export function LoginShowcase() {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl lg:flex lg:flex-col lg:justify-between lg:p-10">
      {/* gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 15% 10%, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.08) 40%, rgba(15,23,42,0) 70%), linear-gradient(160deg, #16233f 0%, #0f172a 55%, #0b1120 100%)",
        }}
      />
      {/* subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(100% 100% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* brand */}
      <div className="relative flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </span>
        <span className="text-lg font-semibold tracking-tight">InsightFlow</span>
      </div>

      {/* floating visualization */}
      <div className="relative my-8 flex flex-1 items-center justify-center">
        {/* main chart card */}
        <div className="glass animate-float-up w-full max-w-sm rounded-2xl p-5 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Monthly revenue</p>
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
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* floating AI card */}
        <div
          className="glass animate-float-up absolute -right-2 top-2 w-52 rounded-2xl p-4 shadow-2xl shadow-black/40"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs font-medium">AI Insight</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Q3 churn dropped 12%. Upsell enterprise tier to top cohorts.
          </p>
        </div>

        {/* floating metric card */}
        <div
          className="glass animate-float-up absolute -left-3 bottom-4 w-44 rounded-2xl p-4 shadow-2xl shadow-black/40"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
              <Activity className="h-4 w-4 text-success" />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">Active users</p>
              <p className="text-sm font-semibold">12,480</p>
            </div>
          </div>
        </div>
      </div>

      {/* marketing text */}
      <div className="relative max-w-md">
        <h2 className="text-balance text-2xl font-semibold leading-snug">
          Transform your data into intelligent business decisions.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Join thousands of teams using InsightFlow to turn raw spreadsheets into
          real-time dashboards and AI-powered recommendations.
        </p>
      </div>
    </div>
  )
}
