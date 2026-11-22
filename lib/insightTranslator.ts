export type InsightItem = {
  title: string
  description: string
  severity?: string
}

const INSIGHT_TEMPLATES: Record<
  string,
  {
    completenessTitle: (pct: string) => string
    completenessDesc: (rows: string) => string
    concentrationTitle: (col: string) => string
    concentrationDesc: (
      topCat: string,
      topCount: string,
      topPct: string,
      minCat: string,
      minCount: string
    ) => string
    concentrationRecHigh: string
    concentrationRecBalanced: string
    varianceTitle: (metric: string, col: string) => string
    varianceDesc: (
      topCat: string,
      topVal: string,
      pctDiff: string,
      metric: string,
      lowCat: string,
      lowVal: string
    ) => string
    varianceRec: (topCat: string) => string
  }
> = {
  en: {
    completenessTitle: (pct) => `${pct}% Data Completeness`,
    completenessDesc: (rows) =>
      `All records (${rows} rows) are complete with zero missing values, ensuring high reliability for decisions based on this report.`,
    concentrationTitle: (col) => `Distribution Concentration by (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `Category '${topCat}' holds the largest share with ${topCount} records (${topPct}% of total), while '${minCat}' recorded the lowest (${minCount}).`,
    concentrationRecHigh:
      'Recommendation: High dependency on a single category; consider resource redistribution or portfolio diversification to reduce concentration risk.',
    concentrationRecBalanced:
      'Recommendation: Distribution is relatively balanced; focus on boosting the performance of under-represented categories.',
    varianceTitle: (metric, col) => `${metric} Variance by (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `Category '${topCat}' leads with ${metric} of ${topVal}, outperforming '${lowCat}' (${lowVal}) by ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Recommendation: Study the outperformance drivers of '${topCat}' and replicate best practices to elevate lower-performing segments.`,
  },
  de: {
    completenessTitle: (pct) => `${pct}% Datenvollständigkeit`,
    completenessDesc: (rows) =>
      `Alle Datensätze (${rows} Zeilen) sind vollständig ohne fehlende Werte, was eine hohe Zuverlässigkeit für Entscheidungen auf Basis dieses Berichts gewährleistet.`,
    concentrationTitle: (col) => `Verteilungskonzentration nach (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `Die Kategorie '${topCat}' hält mit ${topCount} Datensätzen (${topPct}% der Gesamtmenge) den größten Anteil, während '${minCat}' den niedrigsten Wert (${minCount}) verzeichnete.`,
    concentrationRecHigh:
      'Empfehlung: Hohe Abhängigkeit von einer einzelnen Kategorie; erwägen Sie eine Umverteilung der Ressourcen oder Diversifizierung zur Risikominderung.',
    concentrationRecBalanced:
      'Empfehlung: Die Verteilung ist relativ ausgewogen; konzentrieren Sie sich auf die Leistungssteigerung schwächer vertretener Kategorien.',
    varianceTitle: (metric, col) => `${metric}-Abweichung nach (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `Die Kategorie '${topCat}' führt mit ${metric} von ${topVal} und übertrifft '${lowCat}' (${lowVal}) um ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Empfehlung: Analysieren Sie die Erfolgsfaktoren von '${topCat}' und übertragen Sie Best Practices auf schwächere Segmente.`,
  },
  es: {
    completenessTitle: (pct) => `${pct}% de integridad de datos`,
    completenessDesc: (rows) =>
      `Todos los registros (${rows} filas) están completos sin valores faltantes, garantizando alta fiabilidad para las decisiones.`,
    concentrationTitle: (col) => `Concentración de distribución por (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `La categoría '${topCat}' tiene la mayor participación con ${topCount} registros (${topPct}% del total), mientras que '${minCat}' registró el mínimo (${minCount}).`,
    concentrationRecHigh:
      'Recomendación: Alta dependencia de una sola categoría; considere redistribuir recursos o diversificar para reducir el riesgo.',
    concentrationRecBalanced:
      'Recomendación: La distribución es relativamente equilibrada; enfoque esfuerzos en impulsar las categorías con menor representación.',
    varianceTitle: (metric, col) => `Variación de ${metric} por (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `La categoría '${topCat}' lidera con ${metric} de ${topVal}, superando a '${lowCat}' (${lowVal}) en un ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Recomendación: Estudie los factores de éxito de '${topCat}' y replique las mejores prácticas en los segmentos de menor rendimiento.`,
  },
  it: {
    completenessTitle: (pct) => `${pct}% di completezza dei dati`,
    completenessDesc: (rows) =>
      `Tutti i record (${rows} righe) sono completi senza valori mancanti, garantendo elevata affidabilità per le decisioni.`,
    concentrationTitle: (col) => `Concentrazione della distribuzione per (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `La categoria '${topCat}' detiene la quota maggiore con ${topCount} record (${topPct}% del totale), mentre '${minCat}' ha registrato il minimo (${minCount}).`,
    concentrationRecHigh:
      'Raccomandazione: Elevata dipendenza da una singola categoria; valutare la ridistribuzione delle risorse per ridurre il rischio.',
    concentrationRecBalanced:
      'Raccomandazione: La distribuzione è relativamente equilibrata; concentrarsi sul miglioramento delle categorie meno rappresentate.',
    varianceTitle: (metric, col) => `Variazione di ${metric} per (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `La categoria '${topCat}' è in testa con ${metric} pari a ${topVal}, superando '${lowCat}' (${lowVal}) del ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Raccomandazione: Analizzare i fattori di successo di '${topCat}' e replicare le best practice nei segmenti meno performanti.`,
  },
  fr: {
    completenessTitle: (pct) => `${pct}% d’exhaustivité des données`,
    completenessDesc: (rows) =>
      `Tous les enregistrements (${rows} lignes) sont complets sans valeur manquante, garantissant une haute fiabilité décisionnelle.`,
    concentrationTitle: (col) => `Concentration de la distribution par (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `La catégorie '${topCat}' détient la plus grande part avec ${topCount} lignes (${topPct}% du total), tandis que '${minCat}' enregistre le minimum (${minCount}).`,
    concentrationRecHigh:
      'Recommandation : Forte dépendance à une seule catégorie ; envisagez de diversifier ou redistribuer les ressources pour réduire le risque.',
    concentrationRecBalanced:
      'Recommandation : La distribution est relativement équilibrée ; concentrez-vous sur l’amélioration des catégories moins représentées.',
    varianceTitle: (metric, col) => `Écart de ${metric} par (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `La catégorie '${topCat}' arrive en tête avec ${metric} de ${topVal}, dépassant '${lowCat}' (${lowVal}) de ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Recommandation : Étudiez les facteurs de performance de '${topCat}' et appliquez ces bonnes pratiques aux segments moins performants.`,
  },
  ru: {
    completenessTitle: (pct) => `Полнота данных: ${pct}%`,
    completenessDesc: (rows) =>
      `Все записи (${rows} строк) заполнены без пропусков, что гарантирует высокую надёжность решений на основе этого отчёта.`,
    concentrationTitle: (col) => `Концентрация распределения по (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `Категория '${topCat}' занимает наибольшую долю — ${topCount} записей (${topPct}% от общего числа), а '${minCat}' показала минимум (${minCount}).`,
    concentrationRecHigh:
      'Рекомендация: Высокая зависимость от одной категории; рекомендуется перераспределить ресурсы или диверсифицировать портфель.',
    concentrationRecBalanced:
      'Рекомендация: Распределение относительно сбалансировано; сфокусируйтесь на росте отстающих категорий.',
    varianceTitle: (metric, col) => `Разброс (${metric}) по (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `Категория '${topCat}' лидирует (${metric}: ${topVal}), опережая '${lowCat}' (${lowVal}) на ${pctDiff}%.`,
    varianceRec: (topCat) =>
      `Рекомендация: Изучите факторы успеха категории '${topCat}' и внедрите лучшие практики в менее результативных сегментах.`,
  },
  tr: {
    completenessTitle: (pct) => `%${pct} Veri Bütünlüğü`,
    completenessDesc: (rows) =>
      `Tüm kayıtlar (${rows} satır) eksik değer olmadan tamdır; bu da rapora dayalı kararlar için yüksek güvenilirlik sağlar.`,
    concentrationTitle: (col) => `(${col}) Bazında Dağılım Yoğunluğu`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `'${topCat}' kategorisi ${topCount} kayıt (%${topPct}) ile en büyük paya sahipken, '${minCat}' en düşük (${minCount}) değeri kaydetti.`,
    concentrationRecHigh:
      'Öneri: Tek bir kategoriye yüksek bağımlılık var; yoğunlaşma riskini azaltmak için kaynak dağılımını veya çeşitlendirmeyi değerlendirin.',
    concentrationRecBalanced:
      'Öneri: Dağılım nispeten dengeli; daha az temsil edilen kategorilerin performansını artırmaya odaklanın.',
    varianceTitle: (metric, col) => `(${col}) Bazında ${metric} Farkı`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `'${topCat}' kategorisi (${metric}: ${topVal}) lider konumda olup '${lowCat}' (${lowVal}) kategorisinden %${pctDiff} daha yüksek performans gösterdi.`,
    varianceRec: (topCat) =>
      `Öneri: '${topCat}' kategorisinin başarı faktörlerini inceleyin ve en iyi uygulamaları düşük performanslı segmentlere yaygınlaştırın.`,
  },
}

function normalizeArabic(str: string): string {
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
}

export function extractArabicTokens(insights: InsightItem[]): string[] {
  const tokens = new Set<string>()
  for (const ins of insights) {
    const cleanTitle = normalizeArabic(ins.title)
    const colMatch = cleanTitle.match(/حسب\s*\(([^)]+)\)/)
    const colVal = colMatch?.[1]
    if (colVal && /[\u0600-\u06FF]/.test(colVal)) {
      tokens.add(colVal.trim())
    }
    const metricMatch = cleanTitle.match(/^تباين\s+(.+?)\s+حسب/)
    const metricVal = metricMatch?.[1]
    if (metricVal && /[\u0600-\u06FF]/.test(metricVal)) {
      tokens.add(metricVal.trim())
    }
    const quoted = ins.description.matchAll(/'([^']+)'/g)
    for (const q of quoted) {
      const qVal = q[1]
      if (qVal && /[\u0600-\u06FF]/.test(qVal)) {
        tokens.add(qVal.trim())
      }
    }
  }
  return Array.from(tokens)
}

export function formatLocalizedInsights(
  insights: InsightItem[],
  lang: string,
  dict: Record<string, string> = {}
): InsightItem[] {
  if (lang === 'ar') return insights
  const T = INSIGHT_TEMPLATES[lang] ?? INSIGHT_TEMPLATES.en!
  const tr = (s: string): string =>
    dict[s.trim()] ?? dict[normalizeArabic(s.trim())] ?? s.trim()

  return insights.map((ins) => {
    const rawTitle = normalizeArabic(ins.title)
    const rawDesc = normalizeArabic(ins.description)
    let title = ins.title
    let description = ins.description

    // 1) اكتمال البيانات بنسبة 100%
    const compPct = rawTitle.match(/اكتمال البيانات بنسبة\s*(\d+(?:\.\d+)?)%/)
    const pctStr = compPct?.[1]
    if (pctStr) {
      title = T.completenessTitle(pctStr)
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g)
      const firstNum = nums?.[0]
      if (firstNum) {
        description = T.completenessDesc(firstNum)
      }
      return { ...ins, title, description }
    }

    // 2) تركز التوزيع حسب (العمود)
    const concCol = rawTitle.match(/تركز التوزيع حسب\s*\(([^)]+)\)/)
    const concColName = concCol?.[1]
    if (concColName) {
      title = T.concentrationTitle(tr(concColName))
      const quotes = Array.from(ins.description.matchAll(/'([^']+)'/g)).map((m) =>
        tr(m[1] ?? '')
      )
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g) ?? []
      const [q0, q1] = quotes
      const [n0, n1, n2] = nums
      if (q0 && q1 && n0 && n1 && n2) {
        const body = T.concentrationDesc(q0, n0, n1, q1, n2)
        const rec = rawDesc.includes('اعتماد مرتفع')
          ? T.concentrationRecHigh
          : T.concentrationRecBalanced
        description = `${body} ${rec}`
      }
      return { ...ins, title, description }
    }

    // 3) تباين X حسب (Y)
    const varM = rawTitle.match(/^تباين\s+(.+?)\s+حسب\s*\(([^)]+)\)/)
    const varMetric = varM?.[1]
    const varCol = varM?.[2]
    if (varMetric && varCol) {
      title = T.varianceTitle(tr(varMetric), tr(varCol))
      const quotes = Array.from(ins.description.matchAll(/'([^']+)'/g)).map((m) =>
        tr(m[1] ?? '')
      )
      const metricMatch = rawDesc.match(/بـ\s*([^\s]+)\s+/)
      const metricName = metricMatch?.[1] ? tr(metricMatch[1]) : tr(varMetric)
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g) ?? []
      const [q0, q1] = quotes
      const [n0, n1, n2] = nums

      if (q0 && q1 && n0 && n1 && n2) {
        const body = T.varianceDesc(q0, n0, n1, metricName, q1, n2)
        const rec = T.varianceRec(q0)
        description = `${body} ${rec}`
      }
      return { ...ins, title, description }
    }

    return { ...ins, title, description }
  })
}