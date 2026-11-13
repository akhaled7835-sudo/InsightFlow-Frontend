"use client";

import { useEffect, useState } from "react";

export interface SupportedLanguage {
  code: string;
  nativeName: string;
  englishName: string;
  direction: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", nativeName: "English", englishName: "English", direction: "ltr" },
  { code: "ar", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", englishName: "Arabic", direction: "rtl" },
  { code: "de", nativeName: "Deutsch", englishName: "German", direction: "ltr" },
  { code: "es", nativeName: "Espa\u00f1ol", englishName: "Spanish", direction: "ltr" },
  { code: "it", nativeName: "Italiano", englishName: "Italian", direction: "ltr" },
  { code: "fr", nativeName: "Fran\u00e7ais", englishName: "French", direction: "ltr" },
  { code: "ru", nativeName: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", englishName: "Russian", direction: "ltr" },
  { code: "tr", nativeName: "T\u00fcrk\u00e7e", englishName: "Turkish", direction: "ltr" },
];

export type TranslationKeys = {
  features: string;
  dashboard: string;
  insights: string;
  pricing: string;
  faq: string;
  signIn: string;
  signUp: string;
  liveDemo: string;
  tryLiveDemo: string;
  welcomeBack: string;
  createWorkspace: string;
  instantDemoTitle: string;
  loginSubtitle: string;
  registerSubtitle: string;
  demoSubtitle: string;
  fullName: string;
  workEmail: string;
  password: string;
  createFreeAccount: string;
  launchDemo: string;
  demoBanner: string;
  workspaceSubtitle: string;
  uploadAnalyzeBtn: string;
  targetProject: string;
  newProjectPlaceholder: string;
  newProjectBtn: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  selectFileBtn: string;
  uploadingStatus: string;
  processingStatus: string;
  successStatus: string;
  exportPdf: string;
  exportExcel: string;
  aiInsightsTitle: string;
  workspaceProjects: string;
  quickActions: string;
  uploadData: string;
  generateReport: string;
};

const DICTIONARY: Record<string, TranslationKeys> = {
  en: {
    features: "Features",
    dashboard: "Dashboard",
    insights: "Insights",
    pricing: "Pricing",
    faq: "FAQ",
    signIn: "Sign In",
    signUp: "Sign Up",
    liveDemo: "Live Demo",
    tryLiveDemo: "Try Live Demo",
    welcomeBack: "Welcome back",
    createWorkspace: "Create your workspace",
    instantDemoTitle: "Instant 30-Min Live Demo",
    loginSubtitle: "Sign in to your account to continue to your dashboard.",
    registerSubtitle: "Get 3 free file uploads daily and AI-powered business insights.",
    demoSubtitle: "No password required. Explore a live pre-configured workspace for 30 minutes.",
    fullName: "Full Name",
    workEmail: "Work Email",
    password: "Password",
    createFreeAccount: "Create Free Account",
    launchDemo: "Launch 30-Min Live Demo",
    demoBanner: "You are exploring a live 30-minute demo workspace (1 file upload included).",
    workspaceSubtitle: "Here is what is happening across your analytics workspace today.",
    uploadAnalyzeBtn: "Upload & Analyze File",
    targetProject: "Target Project:",
    newProjectPlaceholder: "New project name...",
    newProjectBtn: "New Project",
    dropzoneTitle: "Drag & drop your Excel or CSV file",
    dropzoneSubtitle: "Auto-cleans duplicates, computes statistics & generates AI insights in your selected language",
    selectFileBtn: "Select File (.xlsx / .csv)",
    uploadingStatus: "Uploading to InsightFlow...",
    processingStatus: "Cleaning data & generating AI insights...",
    successStatus: "Cleaned, analyzed & AI insights ready",
    exportPdf: "Export PDF",
    exportExcel: "Export Excel",
    aiInsightsTitle: "AI Business Insights",
    workspaceProjects: "Workspace Projects",
    quickActions: "Quick Actions",
    uploadData: "Upload Data",
    generateReport: "Generate Report",
  },
  ar: {
    features: "\u0627\u0644\u0645\u0645\u064a\u0632\u0627\u062a",
    dashboard: "\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645",
    insights: "\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0627\u0644\u0630\u0643\u064a\u0629",
    pricing: "\u0627\u0644\u0628\u0627\u0642\u0627\u062a",
    faq: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629",
    signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    signUp: "\u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f",
    liveDemo: "\u062a\u062c\u0631\u0628\u0629 \u062d\u064a\u0629",
    tryLiveDemo: "\u062c\u0631\u0651\u0628 \u0627\u0644\u062f\u064a\u0645\u0648 \u0627\u0644\u062d\u064a",
    welcomeBack: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643",
    createWorkspace: "\u0623\u0646\u0634\u0626 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644\u0643",
    instantDemoTitle: "\u062a\u062c\u0631\u0628\u0629 \u062d\u064a\u0629 \u0641\u0648\u0631\u064a\u0629 \u0644\u0645\u062f\u0629 30 \u062f\u0642\u064a\u0642\u0629",
    loginSubtitle: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u0643 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645.",
    registerSubtitle: "\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 3 \u0645\u0644\u0641\u0627\u062a \u0645\u062c\u0627\u0646\u064a\u0629 \u064a\u0648\u0645\u064a\u0627\u064b \u0648\u062a\u0648\u0635\u064a\u0627\u062a \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0644\u0623\u0639\u0645\u0627\u0644\u0643.",
    demoSubtitle: "\u0628\u062f\u0648\u0646 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631. \u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u062d\u064a\u0629 \u062c\u0627\u0647\u0632\u0629 \u0644\u0645\u062f\u0629 30 \u062f\u0642\u064a\u0642\u0629.",
    fullName: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644",
    workEmail: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0644\u0644\u0639\u0645\u0644",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    createFreeAccount: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a",
    launchDemo: "\u0627\u0628\u062f\u0623 \u0627\u0644\u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u062d\u064a\u0629 (30 \u062f\u0642\u064a\u0642\u0629)",
    demoBanner: "\u0623\u0646\u062a \u062a\u0633\u062a\u0643\u0634\u0641 \u062d\u0627\u0644\u064a\u0627\u064b \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u062a\u062c\u0631\u064a\u0628\u064a\u0629 \u0644\u0645\u062f\u0629 30 \u062f\u0642\u064a\u0642\u0629 (\u062a\u0634\u0645\u0644 \u0631\u0641\u0639 \u0645\u0644\u0641 \u0648\u0627\u062d\u062f).",
    workspaceSubtitle: "\u0625\u0644\u064a\u0643 \u0645\u0644\u062e\u0635 \u0645\u0627 \u064a\u062d\u062f\u062b \u0641\u064a \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643 \u0627\u0644\u064a\u0648\u0645.",
    uploadAnalyzeBtn: "\u0631\u0641\u0639 \u0648\u062a\u062d\u0644\u064a\u0644 \u0645\u0644\u0641",
    targetProject: "\u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641:",
    newProjectPlaceholder: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u062c\u062f\u064a\u062f...",
    newProjectBtn: "\u0645\u0634\u0631\u0648\u0639 \u062c\u062f\u064a\u062f",
    dropzoneTitle: "\u0627\u0633\u062d\u0628 \u0648\u0623\u0641\u0644\u062a \u0645\u0644\u0641 Excel \u0623\u0648 CSV \u0647\u0646\u0627",
    dropzoneSubtitle: "\u062a\u0646\u0638\u064a\u0641 \u062a\u0644\u0642\u0627\u0626\u064a \u0644\u0644\u062a\u0643\u0631\u0627\u0631\u0627\u062a\u060c \u062d\u0633\u0627\u0628 \u0627\u0644\u0625\u062d\u0635\u0627\u0621\u0627\u062a\u060c \u0648\u062a\u0648\u0644\u064a\u062f \u0631\u0624\u0649 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0628\u0644\u063a\u062a\u0643 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629",
    selectFileBtn: "\u0627\u062e\u062a\u0631 \u0645\u0644\u0641\u0627\u064b (.xlsx / .csv)",
    uploadingStatus: "\u062c\u0627\u0631\u064d \u0627\u0644\u0631\u0641\u0639 \u0625\u0644\u0649 InsightFlow...",
    processingStatus: "\u062c\u0627\u0631\u064d \u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u062a\u0648\u0644\u064a\u062f \u0631\u0624\u0649 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a...",
    successStatus: "\u062a\u0645 \u0627\u0644\u062a\u0646\u0638\u064a\u0641 \u0648\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0648\u062a\u062c\u0647\u064a\u0632 \u0627\u0644\u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0644\u0630\u0643\u064a\u0629",
    exportPdf: "\u062a\u0635\u062f\u064a\u0631 PDF",
    exportExcel: "\u062a\u0635\u062f\u064a\u0631 Excel",
    aiInsightsTitle: "\u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0644\u0644\u0623\u0639\u0645\u0627\u0644",
    workspaceProjects: "\u0645\u0634\u0627\u0631\u064a\u0639 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
    quickActions: "\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0633\u0631\u064a\u0639\u0629",
    uploadData: "\u0631\u0641\u0639 \u0628\u064a\u0627\u0646\u0627\u062a",
    generateReport: "\u062a\u0648\u0644\u064a\u062f \u062a\u0642\u0631\u064a\u0631",
  },
  de: {
    features: "Funktionen",
    dashboard: "Dashboard",
    insights: "KI-Erkenntnisse",
    pricing: "Preise",
    faq: "FAQ",
    signIn: "Anmelden",
    signUp: "Registrieren",
    liveDemo: "Live-Demo",
    tryLiveDemo: "Live-Demo testen",
    welcomeBack: "Willkommen zur\u00fcck",
    createWorkspace: "Arbeitsbereich erstellen",
    instantDemoTitle: "Sofortige 30-Minuten-Live-Demo",
    loginSubtitle: "Melden Sie sich an, um zu Ihrem Dashboard zu gelangen.",
    registerSubtitle: "3 kostenlose Datei-Uploads t\u00e4glich und KI-gest\u00fctzte Analysen.",
    demoSubtitle: "Kein Passwort erforderlich. Testen Sie 30 Minuten lang einen Live-Arbeitsbereich.",
    fullName: "Vollst\u00e4ndiger Name",
    workEmail: "Gesch\u00e4ftliche E-Mail",
    password: "Passwort",
    createFreeAccount: "Kostenloses Konto erstellen",
    launchDemo: "30-Min-Live-Demo starten",
    demoBanner: "Sie nutzen einen 30-min\u00fctigen Demo-Arbeitsbereich (1 Datei-Upload inklusive).",
    workspaceSubtitle: "Hier ist der aktuelle \u00dcberblick Ihres Analyse-Arbeitsbereichs.",
    uploadAnalyzeBtn: "Datei hochladen & analysieren",
    targetProject: "Zielprojekt:",
    newProjectPlaceholder: "Neuer Projektname...",
    newProjectBtn: "Neues Projekt",
    dropzoneTitle: "Excel- oder CSV-Datei hierher ziehen",
    dropzoneSubtitle: "Bereinigt Duplikate automatisch und erstellt KI-Erkenntnisse in Ihrer Sprache",
    selectFileBtn: "Datei ausw\u00e4hlen (.xlsx / .csv)",
    uploadingStatus: "Wird hochgeladen...",
    processingStatus: "Daten werden bereinigt & KI-Analysen erstellt...",
    successStatus: "Bereinigt, analysiert & KI-Erkenntnisse bereit",
    exportPdf: "PDF exportieren",
    exportExcel: "Excel exportieren",
    aiInsightsTitle: "KI-Gesch\u00e4ftserkenntnisse",
    workspaceProjects: "Arbeitsbereich-Projekte",
    quickActions: "Schnellaktionen",
    uploadData: "Daten hochladen",
    generateReport: "Bericht erstellen",
  },
  es: {
    features: "Caracter\u00edsticas",
    dashboard: "Panel",
    insights: "Perspectivas IA",
    pricing: "Precios",
    faq: "Preguntas",
    signIn: "Iniciar sesi\u00f3n",
    signUp: "Registrarse",
    liveDemo: "Demo en vivo",
    tryLiveDemo: "Probar Demo",
    welcomeBack: "Bienvenido de nuevo",
    createWorkspace: "Crea tu espacio de trabajo",
    instantDemoTitle: "Demo instant\u00e1nea de 30 min",
    loginSubtitle: "Inicia sesi\u00f3n para continuar a tu panel de control.",
    registerSubtitle: "Obt\u00e9n 3 cargas gratuitas diarias e informaci\u00f3n empresarial con IA.",
    demoSubtitle: "Sin contrase\u00f1a. Explora un espacio de trabajo en vivo durante 30 minutos.",
    fullName: "Nombre completo",
    workEmail: "Correo laboral",
    password: "Contrase\u00f1a",
    createFreeAccount: "Crear cuenta gratis",
    launchDemo: "Iniciar Demo de 30 min",
    demoBanner: "Est\u00e1s explorando una demo en vivo de 30 minutos (1 archivo incluido).",
    workspaceSubtitle: "Esto es lo que sucede hoy en tu espacio de an\u00e1lisis.",
    uploadAnalyzeBtn: "Subir y analizar archivo",
    targetProject: "Proyecto destino:",
    newProjectPlaceholder: "Nombre del nuevo proyecto...",
    newProjectBtn: "Nuevo proyecto",
    dropzoneTitle: "Arrastra y suelta tu archivo Excel o CSV aqu\u00ed",
    dropzoneSubtitle: "Limpia duplicados autom\u00e1ticamente y genera perspectivas con IA en tu idioma",
    selectFileBtn: "Seleccionar archivo (.xlsx / .csv)",
    uploadingStatus: "Subiendo a InsightFlow...",
    processingStatus: "Limpiando datos y generando an\u00e1lisis con IA...",
    successStatus: "Limpiado, analizado y listo",
    exportPdf: "Exportar PDF",
    exportExcel: "Exportar Excel",
    aiInsightsTitle: "Perspectivas de Negocio con IA",
    workspaceProjects: "Proyectos del espacio",
    quickActions: "Acciones r\u00e1pidas",
    uploadData: "Subir datos",
    generateReport: "Generar informe",
  },
  it: {
    features: "Funzionalit\u00e0",
    dashboard: "Dashboard",
    insights: "Analisi IA",
    pricing: "Prezzi",
    faq: "FAQ",
    signIn: "Accedi",
    signUp: "Registrati",
    liveDemo: "Demo Live",
    tryLiveDemo: "Prova Demo Live",
    welcomeBack: "Bentornato",
    createWorkspace: "Crea il tuo spazio di lavoro",
    instantDemoTitle: "Demo Live istantanea di 30 min",
    loginSubtitle: "Accedi al tuo account per continuare nella dashboard.",
    registerSubtitle: "3 caricamenti gratuiti al giorno e analisi aziendali con IA.",
    demoSubtitle: "Nessuna password richiesta. Esplora uno spazio live per 30 minuti.",
    fullName: "Nome completo",
    workEmail: "Email aziendale",
    password: "Password",
    createFreeAccount: "Crea account gratuito",
    launchDemo: "Avvia Demo Live (30 min)",
    demoBanner: "Stai esplorando una demo live di 30 minuti (1 caricamento incluso).",
    workspaceSubtitle: "Ecco cosa sta succedendo oggi nel tuo spazio di analisi.",
    uploadAnalyzeBtn: "Carica e analizza file",
    targetProject: "Progetto di destinazione:",
    newProjectPlaceholder: "Nome nuovo progetto...",
    newProjectBtn: "Nuovo progetto",
    dropzoneTitle: "Trascina e rilascia qui il tuo file Excel o CSV",
    dropzoneSubtitle: "Pulisce automaticamente i duplicati e genera analisi IA nella tua lingua",
    selectFileBtn: "Seleziona file (.xlsx / .csv)",
    uploadingStatus: "Caricamento su InsightFlow...",
    processingStatus: "Pulizia dati e generazione analisi IA...",
    successStatus: "Pulito, analizzato e pronto",
    exportPdf: "Esporta PDF",
    exportExcel: "Esporta Excel",
    aiInsightsTitle: "Analisi Aziendali IA",
    workspaceProjects: "Progetti dell'area",
    quickActions: "Azioni rapide",
    uploadData: "Carica dati",
    generateReport: "Genera report",
  },
  fr: {
    features: "Fonctionnalit\u00e9s",
    dashboard: "Tableau de bord",
    insights: "Analyses IA",
    pricing: "Tarifs",
    faq: "FAQ",
    signIn: "Connexion",
    signUp: "S'inscrire",
    liveDemo: "D\u00e9mo Live",
    tryLiveDemo: "Essayer la D\u00e9mo",
    welcomeBack: "Bon retour",
    createWorkspace: "Cr\u00e9ez votre espace",
    instantDemoTitle: "D\u00e9mo Live instantan\u00e9e de 30 min",
    loginSubtitle: "Connectez-vous pour acc\u00e9der \u00e0 votre tableau de bord.",
    registerSubtitle: "3 t\u00e9l\u00e9versements gratuits par jour et analyses IA.",
    demoSubtitle: "Aucun mot de passe requis. Explorez un espace live pendant 30 minutes.",
    fullName: "Nom complet",
    workEmail: "Email professionnel",
    password: "Mot de passe",
    createFreeAccount: "Cr\u00e9er un compte gratuit",
    launchDemo: "Lancer la D\u00e9mo (30 min)",
    demoBanner: "Vous explorez une d\u00e9mo live de 30 minutes (1 fichier inclus).",
    workspaceSubtitle: "Voici l'activit\u00e9 de votre espace analytique aujourd'hui.",
    uploadAnalyzeBtn: "Importer et analyser un fichier",
    targetProject: "Projet cible :",
    newProjectPlaceholder: "Nom du nouveau projet...",
    newProjectBtn: "Nouveau projet",
    dropzoneTitle: "Glissez-d\u00e9posez votre fichier Excel ou CSV ici",
    dropzoneSubtitle: "Nettoie automatiquement les doublons et g\u00e9n\u00e8re des analyses IA dans votre langue",
    selectFileBtn: "Choisir un fichier (.xlsx / .csv)",
    uploadingStatus: "T\u00e9l\u00e9versement vers InsightFlow...",
    processingStatus: "Nettoyage des donn\u00e9es et g\u00e9n\u00e9ration IA...",
    successStatus: "Nettoy\u00e9, analys\u00e9 et pr\u00eat",
    exportPdf: "Exporter PDF",
    exportExcel: "Exporter Excel",
    aiInsightsTitle: "Analyses Business IA",
    workspaceProjects: "Projets de l'espace",
    quickActions: "Actions rapides",
    uploadData: "Importer des donn\u00e9es",
    generateReport: "G\u00e9n\u00e9rer un rapport",
  },
  ru: {
    features: "\u0424\u0443\u043d\u043a\u0446\u0438\u0438",
    dashboard: "\u041f\u0430\u043d\u0435\u043b\u044c",
    insights: "\u0418\u0418-\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
    pricing: "\u0422\u0430\u0440\u0438\u0444\u044b",
    faq: "\u0412\u043e\u043f\u0440\u043e\u0441\u044b",
    signIn: "\u0412\u043e\u0439\u0442\u0438",
    signUp: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
    liveDemo: "\u0414\u0435\u043c\u043e",
    tryLiveDemo: "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0434\u0435\u043c\u043e",
    welcomeBack: "\u0421 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435\u043c",
    createWorkspace: "\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u0440\u0430\u0431\u043e\u0447\u0435\u0435 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e",
    instantDemoTitle: "\u041c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u043e\u0435 30-\u043c\u0438\u043d\u0443\u0442\u043d\u043e\u0435 \u0434\u0435\u043c\u043e",
    loginSubtitle: "\u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f.",
    registerSubtitle: "3 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0432 \u0434\u0435\u043d\u044c \u0438 \u0431\u0438\u0437\u043d\u0435\u0441-\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u043d\u0430 \u0431\u0430\u0437\u0435 \u0418\u0418.",
    demoSubtitle: "\u041f\u0430\u0440\u043e\u043b\u044c \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f. \u0418\u0441\u0441\u043b\u0435\u0434\u0443\u0439\u0442\u0435 \u0433\u043e\u0442\u043e\u0432\u043e\u0435 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e 30 \u043c\u0438\u043d\u0443\u0442.",
    fullName: "\u041f\u043e\u043b\u043d\u043e\u0435 \u0438\u043c\u044f",
    workEmail: "\u0420\u0430\u0431\u043e\u0447\u0438\u0439 Email",
    password: "\u041f\u0430\u0440\u043e\u043b\u044c",
    createFreeAccount: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442",
    launchDemo: "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c 30-\u043c\u0438\u043d \u0434\u0435\u043c\u043e",
    demoBanner: "\u0412\u044b \u0438\u0441\u0441\u043b\u0435\u0434\u0443\u0435\u0442\u0435 30-\u043c\u0438\u043d\u0443\u0442\u043d\u043e\u0435 \u0434\u0435\u043c\u043e-\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e (1 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u0430\u0439\u043b\u0430).",
    workspaceSubtitle: "\u041e\u0431\u0437\u043e\u0440 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0432 \u0432\u0430\u0448\u0435\u043c \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u043c \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435 \u0441\u0435\u0433\u043e\u0434\u043d\u044f.",
    uploadAnalyzeBtn: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
    targetProject: "\u0426\u0435\u043b\u0435\u0432\u043e\u0439 \u043f\u0440\u043e\u0435\u043a\u0442:",
    newProjectPlaceholder: "\u0418\u043c\u044f \u043d\u043e\u0432\u043e\u0433\u043e \u043f\u0440\u043e\u0435\u043a\u0442\u0430...",
    newProjectBtn: "\u041d\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442",
    dropzoneTitle: "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043b Excel \u0438\u043b\u0438 CSV \u0441\u044e\u0434\u0430",
    dropzoneSubtitle: "\u0410\u0432\u0442\u043e\u043e\u0447\u0438\u0441\u0442\u043a\u0430 \u0434\u0443\u0431\u043b\u0438\u043a\u0430\u0442\u043e\u0432 \u0438 \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f \u0418\u0418-\u0432\u044b\u0432\u043e\u0434\u043e\u0432 \u043d\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u043c \u044f\u0437\u044b\u043a\u0435",
    selectFileBtn: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0444\u0430\u0439\u043b (.xlsx / .csv)",
    uploadingStatus: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0432 InsightFlow...",
    processingStatus: "\u041e\u0447\u0438\u0441\u0442\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u0438 \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f \u0418\u0418-\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438...",
    successStatus: "\u041e\u0447\u0438\u0449\u0435\u043d\u043e, \u043f\u0440\u043e\u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u0438 \u0433\u043e\u0442\u043e\u0432\u043e",
    exportPdf: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442 PDF",
    exportExcel: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442 Excel",
    aiInsightsTitle: "\u0411\u0438\u0437\u043d\u0435\u0441-\u0432\u044b\u0432\u043e\u0434\u044b \u0418\u0418",
    workspaceProjects: "\u041f\u0440\u043e\u0435\u043a\u0442\u044b \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0430",
    quickActions: "\u0411\u044b\u0441\u0442\u0440\u044b\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f",
    uploadData: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435",
    generateReport: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043e\u0442\u0447\u0451\u0442",
  },
  tr: {
    features: "\u00d6zellikler",
    dashboard: "Kontrol Paneli",
    insights: "Yapay Zeka \u0130\u00e7g\u00f6r\u00fcleri",
    pricing: "Fiyatland\u0131rma",
    faq: "SSS",
    signIn: "Giri\u015f Yap",
    signUp: "Kay\u0131t Ol",
    liveDemo: "Canl\u0131 Demo",
    tryLiveDemo: "Canl\u0131 Demoyu Dene",
    welcomeBack: "Tekrar ho\u015f geldiniz",
    createWorkspace: "\u00c7al\u0131\u015fma alan\u0131n\u0131z\u0131 olu\u015fturun",
    instantDemoTitle: "An\u0131nda 30 Dakikal\u0131k Canl\u0131 Demo",
    loginSubtitle: "Kontrol panelinize devam etmek i\u00e7in giri\u015f yap\u0131n.",
    registerSubtitle: "G\u00fcnl\u00fck 3 \u00fccretsiz dosya y\u00fckleme ve yapay zeka destekli i\u015f i\u00e7g\u00f6r\u00fcleri.",
    demoSubtitle: "\u015eifre gerekmez. Haz\u0131r \u00e7al\u0131\u015fma alan\u0131n\u0131 30 dakika boyunca ke\u015ffedin.",
    fullName: "Ad Soyad",
    workEmail: "\u0130\u015f E-postas\u0131",
    password: "\u015eifre",
    createFreeAccount: "\u00dccretsiz Hesap Olu\u015ftur",
    launchDemo: "30 Dk Canl\u0131 Demoyu Ba\u015flat",
    demoBanner: "\u015eu anda 30 dakikal\u0131k canl\u0131 demo alan\u0131n\u0131 ke\u015ffediyorsunuz (1 dosya y\u00fckleme dahil).",
    workspaceSubtitle: "Bug\u00fcn analitik \u00e7al\u0131\u015fma alan\u0131n\u0131zda olup bitenler.",
    uploadAnalyzeBtn: "Dosya Y\u00fckle ve Analiz Et",
    targetProject: "Hedef Proje:",
    newProjectPlaceholder: "Yeni proje ad\u0131...",
    newProjectBtn: "Yeni Proje",
    dropzoneTitle: "Excel veya CSV dosyan\u0131z\u0131 buraya s\u00fcr\u00fckleyip b\u0131rak\u0131n",
    dropzoneSubtitle: "Yinelenenleri otomatik temizler ve se\u00e7ti\u011finiz dilde yapay zeka i\u00e7g\u00f6r\u00fcleri \u00fcretir",
    selectFileBtn: "Dosya Se\u00e7 (.xlsx / .csv)",
    uploadingStatus: "InsightFlow'a y\u00fckleniyor...",
    processingStatus: "Veriler temizleniyor ve yapay zeka analizleri olu\u015fturuluyor...",
    successStatus: "Temizlendi, analiz edildi ve haz\u0131r",
    exportPdf: "PDF D\u0131\u015fa Aktar",
    exportExcel: "Excel D\u0131\u015fa Aktar",
    aiInsightsTitle: "Yapay Zeka \u0130\u015f \u0130\u00e7g\u00f6r\u00fcleri",
    workspaceProjects: "\u00c7al\u0131\u015fma Alan\u0131 Projeleri",
    quickActions: "H\u0131zl\u0131 \u0130\u015flemler",
    uploadData: "Veri Y\u00fckle",
    generateReport: "Rapor Olu\u015ftur",
  },
};

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

export function useTranslation() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const saved = localStorage.getItem("insightflow_lang") || "en";
    setLang(saved);
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLanguage>;
      if (custom.detail?.code) setLang(custom.detail.code);
    };
    window.addEventListener("insightflow:languageChanged", handler);
    return () => window.removeEventListener("insightflow:languageChanged", handler);
  }, []);

  return {
    lang,
    t: DICTIONARY[lang] || DICTIONARY.en,
  };
}
