"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2 } from "lucide-react"
import { apiRequest, saveSession, ApiError } from "@/lib/api"
import { LanguageSwitcher } from "@/components/language-switcher"

type AuthMode = "login" | "register" | "demo"

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "demo") {
        const res = await apiRequest<any>("/api/auth/demo", {
          method: "POST",
          body: JSON.stringify({ fullName, email }),
        })
        saveSession({
          token: res.token,
          userId: res.userId,
          email: res.email || email,
          fullName: res.fullName || fullName,
          isDemo: true,
          workspaceId: res.workspaceId,
          defaultProjectId: res.defaultProjectId,
          expiresAtUtc: res.expiresAtUtc,
        })
      } else if (mode === "register") {
        const res = await apiRequest<any>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName, email, password }),
        })
        saveSession({
          token: res.token,
          userId: res.userId,
          email: res.email || email,
          fullName: res.fullName || fullName,
          isDemo: false,
        })
      } else {
        const res = await apiRequest<any>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })
        saveSession({
          token: res.token,
          userId: res.userId,
          email: res.email || email,
          fullName: res.fullName || email.split("@")[0],
          isDemo: false,
        })
      }

      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Unable to connect to InsightFlow server. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col animate-float-up">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">InsightFlow</span>
        </div>
        <LanguageSwitcher className="ml-auto" />
      </div>

      {/* Mode Switcher */}
      <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/40 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null) }}
          className={`rounded-lg py-2 transition-colors ${mode === "login" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null) }}
          className={`rounded-lg py-2 transition-colors ${mode === "register" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => { setMode("demo"); setError(null) }}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-colors ${mode === "demo" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Live Demo
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {mode === "login" && "Welcome back"}
          {mode === "register" && "Create your workspace"}
          {mode === "demo" && "Instant 30-Min Live Demo"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "login" && "Sign in to your account to continue to your dashboard."}
          {mode === "register" && "Get 3 free file uploads daily and AI-powered business insights."}
          {mode === "demo" && "No password required. Explore a live pre-configured workspace for 30 minutes."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {(mode === "register" || mode === "demo") && (
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amr Mohamed"
                className="h-11 w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">Work Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {mode !== "demo" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-1 h-11 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:bg-primary/90 active:scale-[0.99]"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "login" && "Sign in"}
          {mode === "register" && "Create Free Account"}
          {mode === "demo" && "Launch 30-Min Live Demo"}
        </Button>
      </form>
    </div>
  )
}
