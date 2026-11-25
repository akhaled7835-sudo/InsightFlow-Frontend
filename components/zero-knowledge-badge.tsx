"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const ZK_LABELS: Record<string, { title: string; subtitle: string }> = {
  ar: {
    title: "حماية Zero-Knowledge مفعّلة (AES-256-GCM)",
    subtitle: "تُشفّر بياناتك وتقاريرك في متصفحك بمفتاحك الخاص قبل الحفظ — لا يمكن لأي مطور أو جهة خارجية قراءتها.",
  },
  en: {
    title: "Zero-Knowledge Encryption Active (AES-256-GCM)",
    subtitle: "Your datasets and reports are encrypted in your browser with your private key — unreadable by developers or third parties.",
  },
  de: {
    title: "Zero-Knowledge-Verschlüsselung aktiv (AES-256-GCM)",
    subtitle: "Ihre Daten werden im Browser mit Ihrem privaten Schlüssel verschlüsselt — für Entwickler nicht lesbar.",
  },
  es: {
    title: "Cifrado Zero-Knowledge Activo (AES-256-GCM)",
    subtitle: "Tus datos se cifran en tu navegador con tu clave privada; ni siquiera los desarrolladores pueden leerlos.",
  },
  it: {
    title: "Crittografia Zero-Knowledge Attiva (AES-256-GCM)",
    subtitle: "I tuoi dati sono crittografati nel browser con la tua chiave privata — illeggibili per chiunque altro.",
  },
  fr: {
    title: "Chiffrement Zero-Knowledge Actif (AES-256-GCM)",
    subtitle: "Vos données sont chiffrées dans votre navigateur avec votre clé privée — illisibles par les développeurs.",
  },
  ru: {
    title: "Шифрование Zero-Knowledge активно (AES-256-GCM)",
    subtitle: "Ваши данные шифруются в браузере вашим личным ключом и недоступны для чтения разработчикам.",
  },
  tr: {
    title: "Zero-Knowledge Şifreleme Aktif (AES-256-GCM)",
    subtitle: "Verileriniz tarayıcınızda özel anahtarınızla şifrelenir — geliştiriciler dahil kimse tarafından okunamaz.",
  },
};

export function ZeroKnowledgeBadge({ compact = false }: { compact?: boolean }) {
  const { lang } = useTranslation();
  const text = ZK_LABELS[lang] || ZK_LABELS.en!;

  if (compact) {
    return (
      <span
        title={text.subtitle}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
      >
        <Lock className="h-3 w-3 text-emerald-400" />
        {text.title}
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold text-emerald-300 sm:text-sm">{text.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/80">{text.subtitle}</p>
      </div>
    </div>
  );
}