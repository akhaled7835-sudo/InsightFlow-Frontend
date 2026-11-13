"use client"

import { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { SUPPORTED_LANGUAGES, applyDocumentLanguage } from "@/lib/i18n"

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [current, setCurrent] = useState("en")

  useEffect(() => {
    const saved = localStorage.getItem("insightflow_lang") || "en"
    setCurrent(saved)
    applyDocumentLanguage(saved)
  }, [])

  function handleChange(code: string) {
    setCurrent(code)
    applyDocumentLanguage(code)
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-2.5 py-1.5 text-xs ${className}`}>
      <Globe className="h-3.5 w-3.5 text-primary" />
      <select
        aria-label="Select Language"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-foreground outline-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-background text-foreground">
            {l.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}