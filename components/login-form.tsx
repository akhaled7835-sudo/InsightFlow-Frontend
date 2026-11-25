"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2 } from "lucide-react"
import { apiRequest, saveSession, ApiError } from "@/lib/api"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n"

type AuthMode = "login" | "register" | "demo"

type StoredAccount = {
  email: string
  password: string
  fullName: string
}

const ACCOUNTS_STORAGE_KEY = "insightflow_registered_accounts"

const AUTH_MESSAGES: Record<
  string,
  {
    emailAlreadyExists: string
    invalidCredentials: string
    serverError: string
  }
> = {
  ar: {
    emailAlreadyExists: "هذا البريد الإلكتروني مسجل بالفعل. يرجى الانتقال إلى تبويب «تسجيل الدخول».",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو أن الحساب غير مسجل.",
    serverError: "تعذر الاتصال بخادم InsightFlow. يرجى المحاولة مرة أخرى.",
  },
  en: {
    emailAlreadyExists: "This email is already registered. Please switch to Sign In.",
    invalidCredentials: "Invalid email or password, or account does not exist.",
    serverError: "Unable to connect to InsightFlow server. Please try again.",
  },
  de: {
    emailAlreadyExists: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",
    invalidCredentials: "Ungültige E-Mail-Adresse oder falsches Passwort.",
    serverError: "Verbindung zum InsightFlow-Server fehlgeschlagen.",
  },
  es: {
    emailAlreadyExists: "Este correo ya está registrado. Por favor, inicia sesión.",
    invalidCredentials: "Correo electrónico o contraseña incorrectos.",
    serverError: "No se pudo conectar con el servidor de InsightFlow.",
  },
  it: {
    emailAlreadyExists: "Questa email è già registrata. Effettua l'accesso.",
    invalidCredentials: "Email o password non validi.",
    serverError: "Impossibile connettersi al server InsightFlow.",
  },
  fr: {
    emailAlreadyExists: "Cet e-mail est déjà enregistré. Veuillez vous connecter.",
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    serverError: "Impossible de se connecter au serveur InsightFlow.",
  },
  ru: {
    emailAlreadyExists: "Этот адрес электронной почты уже зарегистрирован. Пожалуйста, войдите.",
    invalidCredentials: "Неверный адрес электронной почты или пароль.",
    serverError: "Не удалось подключиться к серверу InsightFlow.",
  },
  tr: {
    emailAlreadyExists: "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.",
    invalidCredentials: "Geçersiz e-posta veya şifre.",
    serverError: "InsightFlow sunucusuna bağlanılamadı.",
  },
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAccount[]) : []
  } catch {
    return []
  }
}

function saveStoredAccount(account: StoredAccount) {
  if (typeof window === "undefined") return
  const existing = getStoredAccounts().filter(
    (a) => a.email.toLowerCase() !== account.email.toLowerCase()
  )
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...existing, account]))
}

export function LoginForm() {
  const router = useRouter()
  const { t, lang } = useTranslation()
  const msg = AUTH_MESSAGES[lang] || AUTH_MESSAGES.en!

  const [mode, setMode] = useState<AuthMode>("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const m = params.get("mode") as AuthMode
      if (m === "login" || m === "register" || m === "demo") {
        setMode(m)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const cleanEmail = email.trim()
    const cleanName = fullName.trim()

    try {
      if (mode === "demo") {
        const res = await apiRequest<any>("/api/auth/demo", {
          method: "POST",
          body: JSON.stringify({ fullName: cleanName, email: cleanEmail }),
        })
        saveSession({
          token: res.token,
          userId: res.userId,
          email: res.email || cleanEmail,
          fullName: res.fullName || cleanName,
          isDemo: true,
          workspaceId: res.workspaceId,
          defaultProjectId: res.defaultProjectId,
          expiresAtUtc: res.expiresAtUtc,
        })
      } else if (mode === "register") {
        // 1. منع التسجيل بنفس البريد الإلكتروني إذا كان مسجلاً مسبقاً
        const localMatch = getStoredAccounts().find(
          (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
        )
        if (localMatch) {
          setError(msg.emailAlreadyExists)
          setLoading(false)
          return
        }

        const res = await apiRequest<any>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            fullName: cleanName,
            email: cleanEmail,
            password,
            confirmPassword: password,
          }),
        })

        saveStoredAccount({
          email: cleanEmail,
          password,
          fullName: res.fullName || cleanName,
        })

        saveSession({
          token: res.token,
          userId: res.userId,
          email: res.email || cleanEmail,
          fullName: res.fullName || cleanName,
          isDemo: false,
        })
      } else {
        // تسجيل الدخول
        try {
          const res = await apiRequest<any>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: cleanEmail, password }),
          })

          const existingLocal = getStoredAccounts().find(
            (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
          )
          saveStoredAccount({
            email: cleanEmail,
            password,
            fullName: res.fullName || existingLocal?.fullName || cleanEmail.split("@")[0],
          })

          saveSession({
            token: res.token,
            userId: res.userId,
            email: res.email || cleanEmail,
            fullName: res.fullName || existingLocal?.fullName || cleanEmail.split("@")[0],
            isDemo: false,
          })
        } catch (loginErr) {
          // في حال إعادة تشغيل السيرفر المجاني وفقدان الحساب من الذاكرة المؤقتة مع تطابق بيانات المستخدم المسجل سابقاً
          const localMatch = getStoredAccounts().find(
            (a) =>
              a.email.toLowerCase() === cleanEmail.toLowerCase() &&
              a.password === password
          )

          if (loginErr instanceof ApiError && loginErr.status === 401 && localMatch) {
            const reSync = await apiRequest<any>("/api/auth/register", {
              method: "POST",
              body: JSON.stringify({
                fullName: localMatch.fullName,
                email: localMatch.email,
                password: localMatch.password,
                confirmPassword: localMatch.password,
              }),
            })
            saveSession({
              token: reSync.token,
              userId: reSync.userId,
              email: reSync.email || localMatch.email,
              fullName: reSync.fullName || localMatch.fullName,
              isDemo: false,
            })
          } else {
            throw loginErr
          }
        }
      }

      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(msg.invalidCredentials)
        } else if (err.status === 409 || /exist|already|taken/i.test(err.message)) {
          setError(msg.emailAlreadyExists)
        } else {
          setError(err.message)
        }
      } else {
        setError(msg.serverError)
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
        <LanguageSwitcher className="ms-auto" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/40 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null) }}
          className={`rounded-lg py-2 transition-colors ${mode === "login" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          {t.signIn}
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null) }}
          className={`rounded-lg py-2 transition-colors ${mode === "register" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          {t.signUp}
        </button>
        <button
          type="button"
          onClick={() => { setMode("demo"); setError(null) }}
          className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-colors ${mode === "demo" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t.liveDemo}
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {mode === "login" && t.welcomeBack}
          {mode === "register" && t.createWorkspace}
          {mode === "demo" && t.instantDemoTitle}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "login" && t.loginSubtitle}
          {mode === "register" && t.registerSubtitle}
          {mode === "demo" && t.demoSubtitle}
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
            <label htmlFor="fullName" className="text-sm font-medium">{t.fullName}</label>
            <div className="relative">
              <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amr Mohamed"
                className="h-11 w-full rounded-xl border border-input bg-secondary/50 ps-10 pe-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">{t.workEmail}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 w-full rounded-xl border border-input bg-secondary/50 ps-10 pe-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {mode !== "demo" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">{t.password}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-input bg-secondary/50 ps-10 pe-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
          {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {mode === "login" && t.signIn}
          {mode === "register" && t.createFreeAccount}
          {mode === "demo" && t.launchDemo}
        </Button>
      </form>
    </div>
  )
}