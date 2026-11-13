export interface SupportedLanguage {
  code: string;
  nativeName: string;
  englishName: string;
  direction: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", nativeName: "English", englishName: "English", direction: "ltr" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", direction: "rtl" },
  { code: "de", nativeName: "Deutsch", englishName: "German", direction: "ltr" },
  { code: "es", nativeName: "Español", englishName: "Spanish", direction: "ltr" },
  { code: "it", nativeName: "Italiano", englishName: "Italian", direction: "ltr" },
  { code: "fr", nativeName: "Français", englishName: "French", direction: "ltr" },
  { code: "ru", nativeName: "Русский", englishName: "Russian", direction: "ltr" },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish", direction: "ltr" },
];

export function applyDocumentLanguage(code: string) {
  const found =
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
  if (typeof document !== "undefined") {
    document.documentElement.lang = found.code;
    document.documentElement.dir = found.direction;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("insightflow_lang", found.code);
    window.dispatchEvent(
      new CustomEvent("insightflow:languageChanged", { detail: found })
    );
  }
  return found;
}
