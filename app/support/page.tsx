'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
import { useTranslation } from '@/lib/i18n'
import {
  LifeBuoy,
  UploadCloud,
  Sparkles,
  Users,
  FileSpreadsheet,
  ChevronDown,
  Send,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '03204a83-f558-4f27-a13f-4a65e4ccaec2'

const SUPPORT_LOCALES: Record<
  string,
  {
    title: string
    subtitle: string
    statusBadge: string
    steps: Array<{ title: string; desc: string; href: string }>
    faqHeading: string
    faqs: Array<{ q: string; a: string }>
    contactHeading: string
    contactSubtitle: string
    successTitle: string
    refTicketLabel: string
    successDesc: string
    sendAnotherBtn: string
    categoryLabel: string
    categories: { technical: string; account: string; feature: string }
    subjectLabel: string
    subjectPlaceholder: string
    detailsLabel: string
    detailsPlaceholder: string
    sendingBtn: string
    submitBtn: string
    sendErrorDefault: string
  }
> = {
  en: {
    title: 'Help & Technical Support Center',
    subtitle: 'Quick start guides, frequently asked questions, and direct support from the InsightFlow team',
    statusBadge: 'All systems and AI analytics engine are operational',
    steps: [
      { title: '1. Create a Project', desc: 'Organize your datasets into dedicated projects for each department or client.', href: '/projects' },
      { title: '2. Upload Data', desc: 'Upload Excel or CSV files to be automatically cleaned, indexed, and analyzed.', href: '/upload' },
      { title: '3. Ask AI Assistant', desc: 'Discuss your results and extract instant insights from the side copilot panel.', href: '/analytics' },
      { title: '4. Invite Your Team', desc: 'Invite colleagues and configure role-based access permissions effortlessly.', href: '/team' },
    ],
    faqHeading: 'Frequently Asked Questions (FAQ)',
    faqs: [
      {
        q: 'Which file formats are supported in InsightFlow?',
        a: 'InsightFlow supports Microsoft Excel (.xlsx) and Comma-Separated Values (.csv) files up to 50 MB per file.',
      },
      {
        q: 'How does the AI Assistant read and analyze my data?',
        a: 'When you upload a dataset to a project, the system extracts column headers, rows, and statistical patterns and feeds them to the AI Copilot so it can answer questions directly from your numbers.',
      },
      {
        q: 'What is the difference between team member roles?',
        a: 'Owners and Admins can manage workspace members and projects. Analysts can upload datasets and generate reports. Viewers have read-only access to dashboards and reports.',
      },
      {
        q: 'Can I export analytics reports to share outside the platform?',
        a: 'Yes, from the AI Reports page or right after uploading a file, you can download formatted executive reports in PDF or Excel with one click.',
      },
    ],
    contactHeading: 'Contact Support Team',
    contactSubtitle: 'Facing a technical issue or have a feature idea? Send us a message and we will respond promptly.',
    successTitle: 'Message Sent Successfully',
    refTicketLabel: 'Reference Ticket ID:',
    successDesc: 'Your message has reached our technical support team, and we will reply to your email shortly.',
    sendAnotherBtn: 'Send Another Message',
    categoryLabel: 'Request Type',
    categories: {
      technical: 'Technical issue with file upload or analysis',
      account: 'Account & permissions management',
      feature: 'New feature suggestion',
    },
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Brief summary of your issue or inquiry...',
    detailsLabel: 'Details',
    detailsPlaceholder: 'Describe the details so we can help you as fast as possible...',
    sendingBtn: 'Sending...',
    submitBtn: 'Send to Support Team',
    sendErrorDefault: 'Failed to send message, please try again.',
  },
  ar: {
    title: 'مركز المساعدة والدعم الفني',
    subtitle: 'أدلة الاستخدام السريع، الإجابات الشائعة، والتواصل المباشر مع فريق دعم InsightFlow',
    statusBadge: 'جميع الأنظمة ومحرك الذكاء الاصطناعي تعمل بكفاءة',
    steps: [
      { title: '1. إنشاء مشروع', desc: 'نظّم بياناتك داخل مشاريع مستقلة لكل قسم أو عميل.', href: '/projects' },
      { title: '2. رفع البيانات', desc: 'ارفع ملفات Excel أو CSV ليتم تنظيفها وفهرستها تلقائياً.', href: '/upload' },
      { title: '3. اسأل المساعد الذكي', desc: 'ناقش نتائجك واستخرج استنتاجات فورية من الشريط الأيمن.', href: '/analytics' },
      { title: '4. مشاركة الفريق', desc: 'ادعُ زملاءك وحدد صلاحيات الوصول لكل عضو بسهولة.', href: '/team' },
    ],
    faqHeading: 'الأسئلة الشائعة (FAQ)',
    faqs: [
      {
        q: 'ما هي صيغ الملفات المدعومة في InsightFlow؟',
        a: 'تدعم المنصة ملفات Microsoft Excel (.xlsx) وملفات القيم المفصولة بفواصل (.csv) بحد أقصى 50 ميجابايت للملف الواحد.',
      },
      {
        q: 'كيف يقوم المساعد الذكي بقراءة وتحليل بياناتي؟',
        a: 'عند رفع أي ملف بيانات وربطه بمشروع، يقوم النظام باستخراج أسماء الأعمدة والصفوف والحقائق الإحصائية وتزويد المساعد الذكي بها للإجابة عن أي سؤال حول أرقامك مباشرة.',
      },
      {
        q: 'ما الفرق بين صلاحيات أعضاء الفريق؟',
        a: 'المالك (Owner) والمدير (Admin) يملكان صلاحية إدارة الأعضاء والمشاريع. المحلل (Analyst) يمكنه رفع الملفات وتوليد التقارير. المشاهد (Viewer) يقتصر دوره على استعراض اللوحات والتقارير فقط.',
      },
      {
        q: 'هل يمكنني تصدير التحليلات لمشاركتها خارج المنصة؟',
        a: 'نعم، من صفحة "تقارير الذكاء الاصطناعي" أو بعد رفع الملف مباشرة، يمكنك تصدير التقرير التنفيذي بصيغة PDF أو Excel بضغطة واحدة.',
      },
    ],
    contactHeading: 'تواصل مع فريق الدعم',
    contactSubtitle: 'واجهت مشكلة تقنية أو لديك اقتراح لميزة جديدة؟ أرسل رسالتك وستصلنا فوراً.',
    successTitle: 'تم إرسال رسالتك بنجاح',
    refTicketLabel: 'رقم التذكرة المرجعي:',
    successDesc: 'وصلت رسالتك إلى فريق الدعم الفني، وسنقوم بالرد على بريدك الإلكتروني في أقرب وقت.',
    sendAnotherBtn: 'إرسال رسالة أخرى',
    categoryLabel: 'نوع الطلب',
    categories: {
      technical: 'مشكلة تقنية في رفع أو تحليل الملفات',
      account: 'إدارة الحساب والصلاحيات',
      feature: 'اقتراح ميزة جديدة',
    },
    subjectLabel: 'عنوان الموضوع',
    subjectPlaceholder: 'ملخص قصير للمشكلة أو الاستفسار...',
    detailsLabel: 'التفاصيل',
    detailsPlaceholder: 'اشرح التفاصيل لمساعدتك بأسرع وقت...',
    sendingBtn: 'جاري الإرسال...',
    submitBtn: 'إرسال إلى الدعم الفني',
    sendErrorDefault: 'فشل إرسال الرسالة، حاول مرة أخرى.',
  },
  de: {
    title: 'Hilfe- & Support-Center',
    subtitle: 'Schnellstartanleitungen, häufig gestellte Fragen und direkter Kontakt zum InsightFlow-Support',
    statusBadge: 'Alle Systeme und die KI-Analyse-Engine arbeiten einwandfrei',
    steps: [
      { title: '1. Projekt erstellen', desc: 'Organisieren Sie Ihre Daten in eigenen Projekten für jede Abteilung oder jeden Kunden.', href: '/projects' },
      { title: '2. Daten hochladen', desc: 'Laden Sie Excel- oder CSV-Dateien hoch, um sie automatisch zu bereinigen und zu indizieren.', href: '/upload' },
      { title: '3. KI-Assistenten fragen', desc: 'Besprechen Sie Ergebnisse und gewinnen Sie sofortige Erkenntnisse in der Seitenleiste.', href: '/analytics' },
      { title: '4. Team einladen', desc: 'Laden Sie Kollegen ein und verwalten Sie Zugriffsrechte für jedes Mitglied.', href: '/team' },
    ],
    faqHeading: 'Häufig gestellte Fragen (FAQ)',
    faqs: [
      {
        q: 'Welche Dateiformate werden in InsightFlow unterstützt?',
        a: 'Die Plattform unterstützt Microsoft Excel (.xlsx) und CSV-Dateien (.csv) bis zu einer maximalen Größe von 50 MB pro Datei.',
      },
      {
        q: 'Wie liest und analysiert der KI-Assistent meine Daten?',
        a: 'Nach dem Hochladen einer Datei extrahiert das System Spaltennamen, Zeilen und statistische Kennzahlen für den KI-Assistenten, sodass er Fragen direkt anhand Ihrer Zahlen beantworten kann.',
      },
      {
        q: 'Worin unterscheiden sich die Rollen der Teammitglieder?',
        a: 'Inhaber (Owner) und Administratoren (Admin) verwalten Mitglieder und Projekte. Analysten können Dateien hochladen und Berichte erstellen. Betrachter (Viewer) haben nur Leserechte.',
      },
      {
        q: 'Kann ich Analysen für externe Zwecke exportieren?',
        a: 'Ja, auf der Seite „KI-Berichte“ oder direkt nach dem Hochladen können Sie den Bericht mit einem Klick als PDF oder Excel herunterladen.',
      },
    ],
    contactHeading: 'Support-Team kontaktieren',
    contactSubtitle: 'Haben Sie ein technisches Problem oder einen Funktionswunsch? Schreiben Sie uns direkt.',
    successTitle: 'Nachricht erfolgreich gesendet',
    refTicketLabel: 'Referenz-Ticketnummer:',
    successDesc: 'Ihre Nachricht ist bei unserem Support-Team eingegangen. Wir antworten Ihnen in Kürze per E-Mail.',
    sendAnotherBtn: 'Weitere Nachricht senden',
    categoryLabel: 'Anfragetyp',
    categories: {
      technical: 'Technisches Problem beim Hochladen oder Analysieren',
      account: 'Konto- und Berechtigungsverwaltung',
      feature: 'Vorschlag für eine neue Funktion',
    },
    subjectLabel: 'Betreff',
    subjectPlaceholder: 'Kurze Zusammenfassung Ihres Anliegens...',
    detailsLabel: 'Details',
    detailsPlaceholder: 'Beschreiben Sie die Details, damit wir schnell helfen können...',
    sendingBtn: 'Wird gesendet...',
    submitBtn: 'An den Support senden',
    sendErrorDefault: 'Nachricht konnte nicht gesendet werden, bitte erneut versuchen.',
  },
  es: {
    title: 'Centro de Ayuda y Soporte Técnico',
    subtitle: 'Guías rápidas, preguntas frecuentes y contacto directo con el equipo de soporte de InsightFlow',
    statusBadge: 'Todos los sistemas y el motor de IA funcionan correctamente',
    steps: [
      { title: '1. Crear un proyecto', desc: 'Organiza tus datos en proyectos independientes por departamento o cliente.', href: '/projects' },
      { title: '2. Subir datos', desc: 'Sube archivos Excel o CSV para limpiarlos e indexarlos automáticamente.', href: '/upload' },
      { title: '3. Preguntar al asistente IA', desc: 'Analiza tus resultados y obtén conclusiones al instante en el panel lateral.', href: '/analytics' },
      { title: '4. Compartir con el equipo', desc: 'Invita a tus colegas y configura los permisos de acceso fácilmente.', href: '/team' },
    ],
    faqHeading: 'Preguntas Frecuentes (FAQ)',
    faqs: [
      {
        q: '¿Qué formatos de archivo admite InsightFlow?',
        a: 'La plataforma admite archivos de Microsoft Excel (.xlsx) y valores separados por comas (.csv) de hasta 50 MB por archivo.',
      },
      {
        q: '¿Cómo lee y analiza mis datos el asistente IA?',
        a: 'Al subir un archivo a un proyecto, el sistema extrae columnas, filas y métricas estadísticas para responder preguntas directamente sobre tus cifras.',
      },
      {
        q: '¿Cuál es la diferencia entre los roles del equipo?',
        a: 'Propietarios y Administradores gestionan miembros y proyectos. Los Analistas suben archivos y generan informes. Los Lectores solo visualizan paneles.',
      },
      {
        q: '¿Puedo exportar los análisis fuera de la plataforma?',
        a: 'Sí, desde la página de Informes IA o justo después de subir un archivo, puedes descargar el informe en PDF o Excel con un clic.',
      },
    ],
    contactHeading: 'Contactar al equipo de soporte',
    contactSubtitle: '¿Tienes un problema técnico o una sugerencia? Envíanos tu mensaje y te responderemos pronto.',
    successTitle: 'Mensaje enviado con éxito',
    refTicketLabel: 'Número de ticket:',
    successDesc: 'Tu mensaje ha llegado a nuestro equipo técnico y te responderemos por correo muy pronto.',
    sendAnotherBtn: 'Enviar otro mensaje',
    categoryLabel: 'Tipo de solicitud',
    categories: {
      technical: 'Problema técnico al subir o analizar archivos',
      account: 'Gestión de cuenta y permisos',
      feature: 'Sugerencia de nueva función',
    },
    subjectLabel: 'Asunto',
    subjectPlaceholder: 'Breve resumen del problema o consulta...',
    detailsLabel: 'Detalles',
    detailsPlaceholder: 'Explica los detalles para ayudarte lo antes posible...',
    sendingBtn: 'Enviando...',
    submitBtn: 'Enviar a soporte técnico',
    sendErrorDefault: 'Error al enviar el mensaje, inténtalo de nuevo.',
  },
  it: {
    title: 'Centro Assistenza e Supporto Tecnico',
    subtitle: 'Guide rapide, domande frequenti e contatto diretto con il team di supporto InsightFlow',
    statusBadge: 'Tutti i sistemi e il motore di intelligenza artificiale sono operativi',
    steps: [
      { title: '1. Crea un progetto', desc: 'Organizza i dati in progetti dedicati per ogni reparto o cliente.', href: '/projects' },
      { title: '2. Carica i dati', desc: 'Carica file Excel o CSV per pulirli e indicizzarli automaticamente.', href: '/upload' },
      { title: '3. Chiedi all’assistente IA', desc: 'Analizza i risultati ed estrai conclusioni immediate dal pannello laterale.', href: '/analytics' },
      { title: '4. Condividi con il team', desc: 'Invita i colleghi e imposta i permessi di accesso per ciascun membro.', href: '/team' },
    ],
    faqHeading: 'Domande Frequenti (FAQ)',
    faqs: [
      {
        q: 'Quali formati di file sono supportati in InsightFlow?',
        a: 'La piattaforma supporta file Microsoft Excel (.xlsx) e CSV (.csv) fino a un massimo di 50 MB per file.',
      },
      {
        q: 'Come legge e analizza i miei dati l’assistente IA?',
        a: 'Quando carichi un file, il sistema estrae intestazioni, righe e metriche statistiche per rispondere direttamente alle domande sui tuoi numeri.',
      },
      {
        q: 'Qual è la differenza tra i ruoli dei membri del team?',
        a: 'Proprietari e Amministratori gestiscono membri e progetti. Gli Analisti caricano file e creano report. I Visualizzatori hanno accesso in sola lettura.',
      },
      {
        q: 'Posso esportare le analisi fuori dalla piattaforma?',
        a: 'Sì, dalla pagina Report IA o subito dopo il caricamento puoi scaricare il report esecutivo in PDF o Excel con un clic.',
      },
    ],
    contactHeading: 'Contatta il team di supporto',
    contactSubtitle: 'Hai riscontrato un problema tecnico o hai un suggerimento? Inviaci un messaggio.',
    successTitle: 'Messaggio inviato con successo',
    refTicketLabel: 'Numero ticket di riferimento:',
    successDesc: 'Il tuo messaggio è arrivato al nostro team tecnico; ti risponderemo via email al più presto.',
    sendAnotherBtn: 'Invia un altro messaggio',
    categoryLabel: 'Tipo di richiesta',
    categories: {
      technical: 'Problema tecnico nel caricamento o analisi dei file',
      account: 'Gestione account e permessi',
      feature: 'Suggerimento nuova funzionalità',
    },
    subjectLabel: 'Oggetto',
    subjectPlaceholder: 'Breve riepilogo del problema o richiesta...',
    detailsLabel: 'Dettagli',
    detailsPlaceholder: 'Descrivi i dettagli per ricevere assistenza rapida...',
    sendingBtn: 'Invio in corso...',
    submitBtn: 'Invia al supporto tecnico',
    sendErrorDefault: 'Invio non riuscito, riprova.',
  },
  fr: {
    title: 'Centre d’Aide et de Support Technique',
    subtitle: 'Guides rapides, questions fréquentes et contact direct avec l’équipe InsightFlow',
    statusBadge: 'Tous les systèmes et le moteur d’IA fonctionnent parfaitement',
    steps: [
      { title: '1. Créer un projet', desc: 'Organisez vos données dans des projets dédiés à chaque service ou client.', href: '/projects' },
      { title: '2. Importer des données', desc: 'Importez des fichiers Excel ou CSV pour les nettoyer et les indexer automatiquement.', href: '/upload' },
      { title: '3. Demander à l’assistant IA', desc: 'Analysez vos résultats et obtenez des conclusions instantanées dans le panneau latéral.', href: '/analytics' },
      { title: '4. Partager avec l’équipe', desc: 'Invitez vos collègues et gérez les permissions d’accès facilement.', href: '/team' },
    ],
    faqHeading: 'Questions Fréquentes (FAQ)',
    faqs: [
      {
        q: 'Quels formats de fichiers sont pris en charge par InsightFlow ?',
        a: 'La plateforme prend en charge les fichiers Microsoft Excel (.xlsx) et CSV (.csv) jusqu’à 50 Mo par fichier.',
      },
      {
        q: 'Comment l’assistant IA lit-il et analyse-t-il mes données ?',
        a: 'Lors de l’importation d’un fichier, le système extrait les colonnes, lignes et statistiques pour répondre directement à vos questions.',
      },
      {
        q: 'Quelle est la différence entre les rôles de l’équipe ?',
        a: 'Les Propriétaires et Administrateurs gèrent les membres et projets. Les Analystes importent des fichiers et génèrent des rapports. Les Lecteurs ont un accès en lecture seule.',
      },
      {
        q: 'Puis-je exporter les analyses en dehors de la plateforme ?',
        a: 'Oui, depuis la page Rapports IA ou juste après l’importation, téléchargez votre rapport en PDF ou Excel en un clic.',
      },
    ],
    contactHeading: 'Contacter l’équipe de support',
    contactSubtitle: 'Un problème technique ou une suggestion ? Envoyez-nous un message.',
    successTitle: 'Message envoyé avec succès',
    refTicketLabel: 'Numéro de ticket :',
    successDesc: 'Votre message a bien été transmis à notre équipe technique qui vous répondra par e-mail.',
    sendAnotherBtn: 'Envoyer un autre message',
    categoryLabel: 'Type de demande',
    categories: {
      technical: 'Problème technique lors de l’importation ou l’analyse',
      account: 'Gestion du compte et des permissions',
      feature: 'Suggestion d’une nouvelle fonctionnalité',
    },
    subjectLabel: 'Objet',
    subjectPlaceholder: 'Bref résumé du problème ou de la demande...',
    detailsLabel: 'Détails',
    detailsPlaceholder: 'Décrivez les détails pour que nous puissions vous aider rapidement...',
    sendingBtn: 'Envoi en cours...',
    submitBtn: 'Envoyer au support technique',
    sendErrorDefault: 'Échec de l’envoi du message, veuillez réessayer.',
  },
  ru: {
    title: 'Центр помощи и технической поддержки',
    subtitle: 'Краткие руководства, частые вопросы и прямая связь со службой поддержки InsightFlow',
    statusBadge: 'Все системы и ИИ-движок работают в штатном режиме',
    steps: [
      { title: '1. Создайте проект', desc: 'Организуйте данные в отдельных проектах для каждого отдела или клиента.', href: '/projects' },
      { title: '2. Загрузите данные', desc: 'Загружайте файлы Excel или CSV для автоматической очистки и индексации.', href: '/upload' },
      { title: '3. Спросите ИИ-помощника', desc: 'Обсуждайте результаты и получайте выводы на боковой панели.', href: '/analytics' },
      { title: '4. Пригласите команду', desc: 'Приглашайте коллег и настраивайте права доступа для каждого участника.', href: '/team' },
    ],
    faqHeading: 'Часто задаваемые вопросы (FAQ)',
    faqs: [
      {
        q: 'Какие форматы файлов поддерживаются в InsightFlow?',
        a: 'Платформа поддерживает файлы Microsoft Excel (.xlsx) и CSV (.csv) размером до 50 МБ.',
      },
      {
        q: 'Как ИИ-помощник читает и анализирует мои данные?',
        a: 'При загрузке файла система извлекает названия столбцов, строки и статистические показатели, чтобы отвечать на вопросы по вашим данным.',
      },
      {
        q: 'В чём разница между ролями участников команды?',
        a: 'Владельцы и администраторы управляют участниками и проектами. Аналитики загружают файлы и создают отчёты. Наблюдатели имеют доступ только для чтения.',
      },
      {
        q: 'Можно ли экспортировать отчёты за пределы платформы?',
        a: 'Да, на странице ИИ-отчётов или сразу после загрузки файла можно скачать отчёт в формате PDF или Excel одним нажатием.',
      },
    ],
    contactHeading: 'Связаться со службой поддержки',
    contactSubtitle: 'Возникла техническая проблема или есть предложение? Отправьте нам сообщение.',
    successTitle: 'Сообщение успешно отправлено',
    refTicketLabel: 'Номер обращения:',
    successDesc: 'Ваше обращение получено службой поддержки, мы ответим на вашу почту в ближайшее время.',
    sendAnotherBtn: 'Отправить ещё одно сообщение',
    categoryLabel: 'Тип обращения',
    categories: {
      technical: 'Техническая проблема при загрузке или анализе файлов',
      account: 'Управление аккаунтом и правами доступа',
      feature: 'Предложение новой функции',
    },
    subjectLabel: 'Тема',
    subjectPlaceholder: 'Краткое описание проблемы или вопроса...',
    detailsLabel: 'Подробности',
    detailsPlaceholder: 'Опишите детали, чтобы мы могли помочь как можно быстрее...',
    sendingBtn: 'Отправка...',
    submitBtn: 'Отправить в техподдержку',
    sendErrorDefault: 'Не удалось отправить сообщение, попробуйте ещё раз.',
  },
  tr: {
    title: 'Yardım ve Teknik Destek Merkezi',
    subtitle: 'Hızlı başlangıç kılavuzları, sık sorulan sorular ve InsightFlow destek ekibiyle doğrudan iletişim',
    statusBadge: 'Tüm sistemler ve yapay zeka motoru sorunsuz çalışıyor',
    steps: [
      { title: '1. Proje Oluşturun', desc: 'Verilerinizi her departman veya müşteri için ayrı projelerde düzenleyin.', href: '/projects' },
      { title: '2. Veri Yükleyin', desc: 'Otomatik temizleme ve dizinleme için Excel veya CSV dosyalarını yükleyin.', href: '/upload' },
      { title: '3. Yapay Zekaya Sorun', desc: 'Sağ panelden sonuçlarınızı tartışın ve anında içgörüler elde edin.', href: '/analytics' },
      { title: '4. Ekibinizi Davet Edin', desc: 'İş arkadaşlarınızı davet edin ve erişim izinlerini kolayca yönetin.', href: '/team' },
    ],
    faqHeading: 'Sıkça Sorulan Sorular (SSS)',
    faqs: [
      {
        q: 'InsightFlow hangi dosya formatlarını destekliyor?',
        a: 'Platform, dosya başına en fazla 50 MB boyutunda Microsoft Excel (.xlsx) ve CSV (.csv) dosyalarını destekler.',
      },
      {
        q: 'Yapay zeka asistanı verilerimi nasıl okur ve analiz eder?',
        a: 'Bir projeye dosya yüklediğinizde sistem sütun adlarını, satırları ve istatistiksel verileri çıkararak sorularınızı doğrudan rakamlarınıza göre yanıtlar.',
      },
      {
        q: 'Ekip üyesi rolleri arasındaki fark nedir?',
        a: 'Sahipler ve Yöneticiler üyeleri ve projeleri yönetir. Analistler dosya yükleyebilir ve rapor oluşturabilir. İzleyiciler yalnızca görüntüleme yetkisine sahiptir.',
      },
      {
        q: 'Analizleri platform dışına aktarabilir miyim?',
        a: 'Evet, Yapay Zeka Raporları sayfasından veya dosya yükledikten hemen sonra raporu tek tıkla PDF veya Excel olarak indirebilirsiniz.',
      },
    ],
    contactHeading: 'Destek Ekibiyle İletişime Geçin',
    contactSubtitle: 'Teknik bir sorunla mı karşılaştınız veya yeni bir özellik öneriniz mi var? Bize yazın.',
    successTitle: 'Mesajınız Başarıyla Gönderildi',
    refTicketLabel: 'Referans Talep Numarası:',
    successDesc: 'Mesajınız teknik destek ekibimize ulaştı, en kısa sürede e-posta adresinize dönüş yapacağız.',
    sendAnotherBtn: 'Başka Bir Mesaj Gönder',
    categoryLabel: 'Talep Türü',
    categories: {
      technical: 'Dosya yükleme veya analizinde teknik sorun',
      account: 'Hesap ve izin yönetimi',
      feature: 'Yeni özellik önerisi',
    },
    subjectLabel: 'Konu Başlığı',
    subjectPlaceholder: 'Sorunun veya talebin kısa özeti...',
    detailsLabel: 'Detaylar',
    detailsPlaceholder: 'Size en hızlı şekilde yardımcı olabilmemiz için detayları açıklayın...',
    sendingBtn: 'Gönderiliyor...',
    submitBtn: 'Teknik Desteğe Gönder',
    sendErrorDefault: 'Mesaj gönderilemedi, lütfen tekrar deneyin.',
  },
}

export default function SupportPage() {
  const { activeWorkspace } = useWorkspaceRole()
  const { lang } = useTranslation()
  const L = SUPPORT_LOCALES[lang] || SUPPORT_LOCALES.en

  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<'technical' | 'account' | 'feature'>('technical')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const stepIcons = [FileSpreadsheet, UploadCloud, Sparkles, Users]

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || sending) return

    setSending(true)
    setErrorMsg('')

    try {
      const session = getSession()
      const senderName = session?.fullName || (session as any)?.name || 'InsightFlow User'
      const senderEmail = session?.email || 'no-reply@insightflow.app'
      const generatedTicket = `SUP-${Math.floor(1000 + Math.random() * 9000)}`

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[InsightFlow Support #${generatedTicket}] ${subject.trim()}`,
          from_name: senderName,
          email: senderEmail,
          ticket_id: generatedTicket,
          sender_name: senderName,
          sender_email: senderEmail,
          workspace: activeWorkspace?.name || 'N/A',
          category: L.categories[category] || category,
          topic: subject.trim(),
          details: message.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || L.sendErrorDefault)
      }

      setTicketId(generatedTicket)
      setSubmitted(true)
      setSubject('')
      setMessage('')
    } catch (err: any) {
      setErrorMsg(err?.message || L.sendErrorDefault)
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardShell activeItem="support">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        {/* Header & System Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LifeBuoy className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{L.title}</h1>
              <p className="text-xs text-muted-foreground">{L.subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            {L.statusBadge}
          </div>
        </div>

        {/* Quick Start Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {L.steps.map((step, idx) => {
            const Icon = stepIcons[idx] || FileSpreadsheet
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Main Grid: FAQ + Contact Support */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* FAQ Section (7 cols) */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-7">
            <h2 className="mb-4 text-base font-bold">{L.faqHeading}</h2>
            <div className="space-y-2.5">
              {L.faqs.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-border bg-background/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-3 p-3.5 text-start text-xs font-semibold text-foreground hover:bg-secondary/40"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Support Ticket Form (5 cols) */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-5">
            <h2 className="mb-1 text-base font-bold">{L.contactHeading}</h2>
            <p className="mb-4 text-xs text-muted-foreground">{L.contactSubtitle}</p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-bold text-foreground">{L.successTitle}</p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {L.refTicketLabel} #{ticketId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{L.successDesc}</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-xl bg-secondary px-4 py-2 text-xs font-medium hover:bg-secondary/80"
                >
                  {L.sendAnotherBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{L.categoryLabel}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    disabled={sending}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="technical" className="bg-slate-900">
                      {L.categories.technical}
                    </option>
                    <option value="account" className="bg-slate-900">
                      {L.categories.account}
                    </option>
                    <option value="feature" className="bg-slate-900">
                      {L.categories.feature}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{L.subjectLabel}</label>
                  <input
                    type="text"
                    required
                    disabled={sending}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={L.subjectPlaceholder}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{L.detailsLabel}</label>
                  <textarea
                    rows={4}
                    required
                    disabled={sending}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={L.detailsPlaceholder}
                    className="w-full rounded-xl border border-input bg-background/60 p-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {L.sendingBtn}
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      {L.submitBtn}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}