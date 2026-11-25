'use client'

import { useTranslation } from '@/lib/i18n'

const TESTIMONIALS_I18N: Record<
  string,
  {
    badge: string
    title: string
    items: Array<{ quote: string; name: string; role: string; initials: string }>
  }
> = {
  en: {
    badge: 'Testimonials',
    title: 'Loved by teams who move fast',
    items: [
      {
        quote:
          'InsightFlow replaced three tools and a weekly reporting meeting. We upload the export and the dashboard is just… ready.',
        name: 'Sofia Martinez',
        role: 'Head of Ops, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'The AI insights caught a churn spike we would have missed for weeks. It paid for itself in the first month.',
        name: 'James Okafor',
        role: 'Growth Lead, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Our non-technical team finally understands the numbers. The auto-cleaning alone saves us hours every week.',
        name: 'Priya Nair',
        role: 'Finance Manager, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'It feels like Linear and Stripe had a data baby. Fast, gorgeous, and genuinely useful.',
        name: 'Daniel Cho',
        role: 'Founder, Cascade',
        initials: 'DC',
      },
    ],
  },
  ar: {
    badge: 'آراء العملاء',
    title: 'موثوق به من قِبل الفرق سريعة النمو',
    items: [
      {
        quote:
          'أغنانا InsightFlow عن ثلاث أدوات مختلفة واجتماع التقارير الأسبوعي. نرفع ملف البيانات وتصبح لوحة التحكم جاهزة فوراً.',
        name: 'صوفيا مارتينيز',
        role: 'مديرة العمليات، Northwind',
        initials: 'SM',
      },
      {
        quote:
          'اكتشفت تحليلات الذكاء الاصطناعي ارتفاعاً مفاجئاً في تراجع العملاء كنا سنغفله لأسابيع. لقد أثبت قيمته منذ الشهر الأول.',
        name: 'جيمس أوكافور',
        role: 'قائد النمو، Lumen',
        initials: 'JO',
      },
      {
        quote:
          'أصبح فريقنا غير التقني يفهم الأرقام بوضوح تام. ميزة التنظيف التلقائي للبيانات وحدها توفر لنا ساعات كل أسبوع.',
        name: 'بريا ناير',
        role: 'مديرة المالية، Vertex',
        initials: 'PN',
      },
      {
        quote:
          'تجربة استخدام تجمع بين السرعة والأناقة والعملية الحقيقية في تحليل البيانات.',
        name: 'دانيال تشو',
        role: 'مؤسس، Cascade',
        initials: 'DC',
      },
    ],
  },
  de: {
    badge: 'Kundenstimmen',
    title: 'Geschätzt von schnellen Teams',
    items: [
      {
        quote:
          'InsightFlow hat drei Tools und unser wöchentliches Reporting-Meeting ersetzt. Datei hochladen und das Dashboard ist sofort bereit.',
        name: 'Sofia Martinez',
        role: 'Head of Ops, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'Die KI-Erkenntnisse haben einen Abwanderungsanstieg erkannt, den wir wochenlang übersehen hätten.',
        name: 'James Okafor',
        role: 'Growth Lead, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Unser nicht-technisches Team versteht endlich die Zahlen. Allein die automatische Bereinigung spart uns jede Woche Stunden.',
        name: 'Priya Nair',
        role: 'Finance Manager, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Schnell, elegant und im Arbeitsalltag wirklich unverzichtbar.',
        name: 'Daniel Cho',
        role: 'Gründer, Cascade',
        initials: 'DC',
      },
    ],
  },
  es: {
    badge: 'Testimonios',
    title: 'Elegido por equipos que avanzan rápido',
    items: [
      {
        quote:
          'InsightFlow reemplazó tres herramientas y nuestra reunión semanal de reportes. Subimos el archivo y el panel ya está listo.',
        name: 'Sofia Martinez',
        role: 'Directora de Operaciones, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'Los insights de IA detectaron un pico de cancelaciones que habríamos pasado por alto durante semanas.',
        name: 'James Okafor',
        role: 'Líder de Crecimiento, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Nuestro equipo no técnico por fin entiende los números. Solo la limpieza automática nos ahorra horas cada semana.',
        name: 'Priya Nair',
        role: 'Gerente Financiera, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Rápido, elegante y genuinamente útil para tomar decisiones diarias.',
        name: 'Daniel Cho',
        role: 'Fundador, Cascade',
        initials: 'DC',
      },
    ],
  },
  it: {
    badge: 'Testimonianze',
    title: 'Amato dai team che si muovono velocemente',
    items: [
      {
        quote:
          'InsightFlow ha sostituito tre strumenti e la riunione settimanale sui report. Carichiamo il file e la dashboard è subito pronta.',
        name: 'Sofia Martinez',
        role: 'Head of Ops, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'Gli insight AI hanno individuato un picco di abbandono che ci sarebbe sfuggito per settimane.',
        name: 'James Okafor',
        role: 'Growth Lead, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Il nostro team non tecnico finalmente comprende i numeri. La pulizia automatica fa risparmiare ore ogni settimana.',
        name: 'Priya Nair',
        role: 'Finance Manager, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Veloce, curato nei dettagli e davvero utile per il business.',
        name: 'Daniel Cho',
        role: 'Fondatore, Cascade',
        initials: 'DC',
      },
    ],
  },
  fr: {
    badge: 'Témoignages',
    title: 'Adopté par les équipes qui avancent vite',
    items: [
      {
        quote:
          'InsightFlow a remplacé trois outils et notre réunion hebdomadaire de reporting. On importe le fichier et le tableau de bord est prêt.',
        name: 'Sofia Martinez',
        role: 'Directrice des Opérations, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'Les analyses IA ont détecté un pic d’attrition que nous aurions manqué pendant des semaines.',
        name: 'James Okafor',
        role: 'Responsable Croissance, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Notre équipe non technique comprend enfin les chiffres. Le nettoyage automatique nous fait gagner des heures chaque semaine.',
        name: 'Priya Nair',
        role: 'Directrice Financière, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Rapide, élégant et véritablement indispensable au quotidien.',
        name: 'Daniel Cho',
        role: 'Fondateur, Cascade',
        initials: 'DC',
      },
    ],
  },
  ru: {
    badge: 'Отзывы',
    title: 'Выбор быстрорастущих команд',
    items: [
      {
        quote:
          'InsightFlow заменил три инструмента и еженедельные планёрки по отчётам. Загружаем файл — и дашборд уже готов.',
        name: 'София Мартинес',
        role: 'Руководитель операций, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'ИИ-аналитика выявила скачок оттока клиентов, который мы бы не замечали неделями.',
        name: 'Джеймс Окафор',
        role: 'Руководитель роста, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Наша нетехническая команда наконец-то понимает цифры. Автоочистка данных экономит нам часы каждую неделю.',
        name: 'Прия Наир',
        role: 'Финансовый менеджер, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Быстро, красиво и по-настоящему полезно для бизнеса.',
        name: 'Дэниел Чо',
        role: 'Основатель, Cascade',
        initials: 'DC',
      },
    ],
  },
  tr: {
    badge: 'Müşteri Yorumları',
    title: 'Hızlı hareket eden ekiplerin tercihi',
    items: [
      {
        quote:
          'InsightFlow üç farklı aracın ve haftalık raporlama toplantımızın yerini aldı. Dosyayı yüklüyoruz ve kontrol paneli anında hazır oluyor.',
        name: 'Sofia Martinez',
        role: 'Operasyon Direktörü, Northwind',
        initials: 'SM',
      },
      {
        quote:
          'Yapay zeka içgörüleri haftalarca fark edemeyeceğimiz bir müşteri kaybı artışını anında yakaladı.',
        name: 'James Okafor',
        role: 'Büyüme Lideri, Lumen',
        initials: 'JO',
      },
      {
        quote:
          'Teknik olmayan ekibimiz sonunda rakamları net anlıyor. Otomatik veri temizleme bile her hafta saatler kazandırıyor.',
        name: 'Priya Nair',
        role: 'Finans Müdürü, Vertex',
        initials: 'PN',
      },
      {
        quote:
          'Hızlı, şık ve iş kararları için gerçekten çok faydalı.',
        name: 'Daniel Cho',
        role: 'Kurucu, Cascade',
        initials: 'DC',
      },
    ],
  },
}

export function Testimonials() {
  const { lang } = useTranslation()
  const content = TESTIMONIALS_I18N[lang] || TESTIMONIALS_I18N.en!

  return (
    <section className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{content.badge}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {content.items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
            >
              <blockquote className="text-pretty leading-relaxed text-foreground/90">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}