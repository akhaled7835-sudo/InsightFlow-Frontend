"use client"

import { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { SUPPORTED_LANGUAGES, applyDocumentLanguage } from "@/lib/i18n"
import { getLang } from "@/lib/api"

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLang] = useState("en")

  useEffect(() => {
    const saved = getLang()
    setLang(saved)
    applyDocumentLanguage(saved)
  }, [])

  function handleChange(nextCode: string) {
    setLang(nextCode)
    applyDocumentLanguage(nextCode)
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-2.5 py-1.5 text-xs ${className}`}>
      <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
      <select
        aria-label="Select Language"
        value={lang}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent font-medium text-foreground outline-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="bg-slate-900 text-slate-100">
            {item.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}
