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
    outlierTitle: (col: string) => string
    outlierDesc: (
      col: string,
      minVal: string,
      maxVal: string,
      avgVal: string,
      mult: string
    ) => string
    outlierRec: string
    comparisonTitle: (m1: string, m2: string) => string
    comparisonDesc: (
      isDrop: boolean,
      v1: string,
      m1: string,
      v2: string,
      m2: string,
      pct: string
    ) => string
    comparisonRecDrop: string
    comparisonRecRise: string
  }
> = {
  ar: {
    completenessTitle: (pct) => `اكتمال البيانات بنسبة ${pct}%`,
    completenessDesc: (rows) =>
      `جميع السجلات (${rows} صف) مكتملة دون أي قيم مفقودة، مما يضمن موثوقية عالية للقرارات المبنية على هذا التقرير.`,
    concentrationTitle: (col) => `تركّز التوزيع حسب (${col})`,
    concentrationDesc: (topCat, topCount, topPct, minCat, minCount) =>
      `تستحوذ فئة '${topCat}' على الحصة الأكبر بواقع ${topCount} سجل (${topPct}% من الإجمالي)، بينما سجلت '${minCat}' الحد الأدنى (${minCount}).`,
    concentrationRecHigh:
      'التوصية: هناك اعتماد مرتفع على فئة واحدة؛ يُنصح بتوزيع الموارد أو تنويع المحفظة لتقليل مخاطر التركز.',
    concentrationRecBalanced:
      'التوصية: التوزيع متوازن نسبياً؛ ركّز على رفع أداء الفئات الأقل تمثيلاً.',
    varianceTitle: (metric, col) => `تباين ${metric} حسب (${col})`,
    varianceDesc: (topCat, topVal, pctDiff, metric, lowCat, lowVal) =>
      `تتصدر فئة '${topCat}' بـ ${metric} يبلغ ${topVal} متفوقة بنسبة ${pctDiff}% على '${lowCat}' (${lowVal}).`,
    varianceRec: (topCat) =>
      `التوصية: دراسة عوامل التفوق في '${topCat}' وتعميم أفضل الممارسات لرفع أداء الفئات الأقل.`,
    outlierTitle: (col) => `تفاوت حاد وقيم مرتفعة في (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `يتراوح '${col}' بين ${minVal} و ${maxVal} بمتوسط ${avgVal} (أعلى قيمة تعادل ${mult} ضعف المتوسط).`,
    outlierRec:
      'التوصية: مراجعة السجلات ذات القيم القصوى للتحقق من كونها حالات استثنائية حقيقية أو أخطاء إدخال، واستخدام الوسيط (Median) بجانب المتوسط.',
    comparisonTitle: (m1, m2) => `مقارنة الأداء بين (${m1}) و (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `${isDrop ? 'تراجع' : 'ارتفع'} المتوسط من ${v1} في '${m1}' إلى ${v2} في '${m2}' بنسبة ${isDrop ? 'انخفاض' : 'نمو'} ${pct}%.`,
    comparisonRecDrop:
      'التوصية: تحليل أسباب التراجع في الفئات الأقل أداءً ووضع خطة تصحيحية فورية.',
    comparisonRecRise:
      'التوصية: استثمار هذا الزخم الإيجابي وتعميم عوامل التحسن على بقية الفئات.',
  },
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
    outlierTitle: (col) => `Sharp Spread & High Outliers in (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' ranges between ${minVal} and ${maxVal} with an average of ${avgVal} (maximum value equals ${mult}x the average).`,
    outlierRec:
      'Recommendation: Review records with extreme values to verify whether they are genuine exceptions or data entry errors, and use the Median alongside the Average.',
    comparisonTitle: (m1, m2) => `Performance Comparison between (${m1}) and (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `The average ${isDrop ? 'decreased' : 'increased'} from ${v1} in '${m1}' to ${v2} in '${m2}', a ${isDrop ? 'decline' : 'growth'} of ${pct}%.`,
    comparisonRecDrop:
      'Recommendation: Analyze the root causes of decline in underperforming segments and implement an immediate corrective action plan.',
    comparisonRecRise:
      'Recommendation: Capitalize on this positive momentum and scale the drivers behind the improvement across other segments.',
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
    outlierTitle: (col) => `Starke Streuung & hohe Ausreißer bei (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' reicht von ${minVal} bis ${maxVal} bei einem Durchschnitt von ${avgVal} (Höchstwert entspricht dem ${mult}-Fachen des Durchschnitts).`,
    outlierRec:
      'Empfehlung: Prüfen Sie Datensätze mit Extremwerten auf echte Ausnahmen oder Eingabefehler und verwenden Sie zusätzlich den Median.',
    comparisonTitle: (m1, m2) => `Leistungsvergleich zwischen (${m1}) und (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `Der Durchschnitt ${isDrop ? 'sank' : 'stieg'} von ${v1} in '${m1}' auf ${v2} in '${m2}', was einem ${isDrop ? 'Rückgang' : 'Anstieg'} von ${pct}% entspricht.`,
    comparisonRecDrop:
      'Empfehlung: Analysieren Sie die Ursachen des Rückgangs in leistungsschwächeren Segmenten und leiten Sie umgehend Korrekturmaßnahmen ein.',
    comparisonRecRise:
      'Empfehlung: Nutzen Sie diese positive Dynamik und übertragen Sie die Erfolgsfaktoren auf weitere Segmente.',
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
    outlierTitle: (col) => `Dispersión pronunciada y valores atípicos en (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' oscila entre ${minVal} y ${maxVal} con un promedio de ${avgVal} (el valor máximo equivale a ${mult} veces el promedio).`,
    outlierRec:
      'Recomendación: Revise los registros con valores extremos para verificar si son excepciones reales o errores de captura, y use la mediana junto al promedio.',
    comparisonTitle: (m1, m2) => `Comparación de rendimiento entre (${m1}) y (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `El promedio ${isDrop ? 'disminuyó' : 'aumentó'} de ${v1} en '${m1}' a ${v2} en '${m2}', una variación de ${pct}%.`,
    comparisonRecDrop:
      'Recomendación: Analice las causas de la caída en los segmentos de menor rendimiento y establezca un plan correctivo inmediato.',
    comparisonRecRise:
      'Recomendación: Aproveche este impulso positivo y replique los factores de mejora en otros segmentos.',
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
    outlierTitle: (col) => `Forte dispersione e valori anomali in (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' varia tra ${minVal} e ${maxVal} con una media di ${avgVal} (il valore massimo è pari a ${mult} volte la media).`,
    outlierRec:
      'Raccomandazione: Verificare i record con valori estremi per distinguere eccezioni reali da errori di inserimento e utilizzare la mediana accanto alla media.',
    comparisonTitle: (m1, m2) => `Confronto delle prestazioni tra (${m1}) e (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `La media è ${isDrop ? 'scesa' : 'salita'} da ${v1} in '${m1}' a ${v2} in '${m2}', con una variazione del ${pct}%.`,
    comparisonRecDrop:
      'Raccomandazione: Analizzare le cause del calo nei segmenti meno performanti e definire un piano correttivo immediato.',
    comparisonRecRise:
      'Raccomandazione: Sfruttare questo slancio positivo ed estendere i fattori di crescita agli altri segmenti.',
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
    outlierTitle: (col) => `Forte dispersion et valeurs aberrantes dans (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' varie entre ${minVal} et ${maxVal} avec une moyenne de ${avgVal} (la valeur maximale équivaut à ${mult} fois la moyenne).`,
    outlierRec:
      'Recommandation : Vérifiez les enregistrements extrêmes pour distinguer les exceptions réelles des erreurs de saisie, et utilisez la médiane en complément de la moyenne.',
    comparisonTitle: (m1, m2) => `Comparaison des performances entre (${m1}) et (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `La moyenne a ${isDrop ? 'diminué' : 'augmenté'} de ${v1} dans '${m1}' à ${v2} dans '${m2}', soit une variation de ${pct}%.`,
    comparisonRecDrop:
      'Recommandation : Analysez les causes de la baisse dans les segments les moins performants et mettez en place un plan correctif immédiat.',
    comparisonRecRise:
      'Recommandation : Capitalisez sur cette dynamique positive et déployez ces leviers sur les autres segments.',
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
    outlierTitle: (col) => `Резкий разброс и высокие выбросы в (${col})`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `Показатель '${col}' варьируется от ${minVal} до ${maxVal} при среднем значении ${avgVal} (максимум в ${mult} раза выше среднего).`,
    outlierRec:
      'Рекомендация: Проверьте записи с экстремальными значениями на предмет ошибок ввода или реальных исключений и используйте медиану наряду со средним.',
    comparisonTitle: (m1, m2) => `Сравнение показателей (${m1}) и (${m2})`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `Среднее значение ${isDrop ? 'снизилось' : 'выросло'} с ${v1} в '${m1}' до ${v2} в '${m2}' (${pct}%).`,
    comparisonRecDrop:
      'Рекомендация: Проанализируйте причины снижения в отстающих сегментах и разработайте план корректирующих мер.',
    comparisonRecRise:
      'Рекомендация: Закрепите положительную динамику и масштабируйте факторы роста на другие сегменты.',
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
    outlierTitle: (col) => `(${col}) Alanında Keskin Yayılım ve Uç Değerler`,
    outlierDesc: (col, minVal, maxVal, avgVal, mult) =>
      `'${col}' değeri ${minVal} ile ${maxVal} arasında değişmekte olup ortalaması ${avgVal}'dir (en yüksek değer ortalamanın ${mult} katıdır).`,
    outlierRec:
      'Öneri: Gerçek istisnaları veya veri girişi hatalarını doğrulamak için uç değerlere sahip kayıtları inceleyin ve ortalama ile birlikte medyanı kullanın.',
    comparisonTitle: (m1, m2) => `(${m1}) ve (${m2}) Performans Karşılaştırması`,
    comparisonDesc: (isDrop, v1, m1, v2, m2, pct) =>
      `Ortalama, '${m1}' dönemindeki ${v1} seviyesinden '${m2}' döneminde ${v2} seviyesine ${isDrop ? 'geriledi' : 'yükseldi'} (%${pct}).`,
    comparisonRecDrop:
      'Öneri: Düşük performanslı segmentlerdeki gerilemenin nedenlerini analiz edin ve acil düzeltici eylem planı uygulayın.',
    comparisonRecRise:
      'Öneri: Bu olumlu ivmeyi koruyun ve iyileşme sağlayan etkenleri diğer segmentlere yaygınlaştırın.',
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

    const outlierMatch = cleanTitle.match(/قيم مرتفعة في\s*\(([^)]+)\)/)
    const outlierVal = outlierMatch?.[1]
    if (outlierVal && /[\u0600-\u06FF]/.test(outlierVal)) {
      tokens.add(outlierVal.trim())
    }

    const compMatches = cleanTitle.matchAll(/\(([^)]+)\)/g)
    for (const cm of compMatches) {
      const cv = cm[1]
      if (cv && /[\u0600-\u06FF]/.test(cv)) {
        tokens.add(cv.trim())
      }
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
  const T = INSIGHT_TEMPLATES[lang] ?? INSIGHT_TEMPLATES.en!
  const tr = (s: string): string =>
    dict[s.trim()] ?? dict[normalizeArabic(s.trim())] ?? s.trim()

  return insights.map((ins) => {
    const rawTitle = normalizeArabic(ins.title)
    const rawDesc = normalizeArabic(ins.description)
    let title = ins.title
    let description = ins.description

    // 1) اكتمال البيانات / Datenvollständigkeit / Data Completeness
    const isCompleteness =
      rawTitle.includes('اكتمال البيانات') ||
      /Datenvollständigkeit|Data Completeness|integridad de datos|completezza dei dati|exhaustivité des données|Полнота данных|Veri Bütünlüğü/i.test(
        ins.title
      )
    if (isCompleteness) {
      const pctMatch = ins.title.match(/(\d+(?:\.\d+)?)%/)
      const pctStr = pctMatch?.[1] ?? '100'
      title = T.completenessTitle(pctStr)
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g)
      const firstNum = nums?.[0]
      if (firstNum) {
        description = T.completenessDesc(firstNum)
      }
      return { ...ins, title, description }
    }

    // 2) تركز التوزيع / Konzentrationsmuster / Verteilungskonzentration / Distribution Concentration
    const isConcentration =
      rawTitle.includes('تركز التوزيع') ||
      /Konzentrationsmuster|Verteilungskonzentration|Distribution Concentration|Concentración de distribución|Concentrazione della distribuzione|Concentration de la distribution|Концентрация распределения|Dağılım Yoğunluğu/i.test(
        ins.title
      )
    if (isConcentration) {
      const parenM = ins.title.match(/\(([^)]+)\)/)
      const quoteM = ins.title.match(/'([^']+)'/)
      const colRaw = parenM?.[1] ?? quoteM?.[1] ?? ''
      if (colRaw) {
        title = T.concentrationTitle(tr(colRaw))
      }
      const quotes = Array.from(ins.description.matchAll(/'([^']+)'/g)).map((m) =>
        tr(m[1] ?? '')
      )
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g) ?? []
      const [q0, q1] = quotes
      const [n0, n1, n2] = nums
      if (q0 && q1 && n0 && n1 && n2) {
        const body = T.concentrationDesc(q0, n0, n1, q1, n2)
        const isHigh =
          rawDesc.includes('اعتماد مرتفع') ||
          /High dependency|Hohe Abhängigkeit|Alta dependencia|Elevata dipendenza|Forte dépendance|Высокая зависимость|yüksek bağımlılık/i.test(
            ins.description
          )
        const rec = isHigh ? T.concentrationRecHigh : T.concentrationRecBalanced
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

    // 4) تفاوت حاد وقيم مرتفعة في (الراتب)
    const outM = rawTitle.match(/تفاوت حاد وقيم مرتفعة في\s*\(([^)]+)\)/)
    const outCol = outM?.[1]
    if (outCol) {
      const localizedCol = tr(outCol)
      title = T.outlierTitle(localizedCol)
      const nums = rawDesc.match(/\d[\d,]*(?:\.\d+)?/g) ?? []
      const [n0, n1, n2, n3] = nums
      if (n0 && n1 && n2 && n3) {
        const body = T.outlierDesc(localizedCol, n0, n1, n2, n3)
        description = `${body} ${T.outlierRec}`
      }
      return { ...ins, title, description }
    }

    // 5) مقارنة الأداء بين (PER 2019) و (PER 2020)
    const cmpM = rawTitle.match(/مقارنة الاداء بين\s*\(([^)]+)\)\s*و\s*\(([^)]+)\)/)
    const m1 = cmpM?.[1]
    const m2 = cmpM?.[2]
    if (m1 && m2) {
      const lm1 = tr(m1)
      const lm2 = tr(m2)
      title = T.comparisonTitle(lm1, lm2)
      const quotes = Array.from(ins.description.matchAll(/'([^']+)'/g)).map((m) =>
        tr(m[1] ?? '')
      )
      const descWithoutQuotes = rawDesc.replace(/'[^']+'/g, '')
      const nums = descWithoutQuotes.match(/-?\d[\d,]*(?:\.\d+)?/g) ?? []
      const [v1, v2, pct] = nums
      const isDrop = rawDesc.includes('تراجع') || rawDesc.includes('انخفاض')
      if (v1 && v2 && pct) {
        const body = T.comparisonDesc(
          isDrop,
          v1,
          quotes[0] || lm1,
          v2,
          quotes[1] || lm2,
          pct
        )
        const rec = isDrop ? T.comparisonRecDrop : T.comparisonRecRise
        description = `${body} ${rec}`
      }
      return { ...ins, title, description }
    }

    return { ...ins, title, description }
  })
}