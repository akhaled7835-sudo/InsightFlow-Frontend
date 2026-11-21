'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getSession } from '@/lib/api'
import { useWorkspaceRole } from '@/lib/useWorkspaceRole'
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
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'bc7f0489-a0ab-43fe-b918-12f3e1580066'

const FAQS = [
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
]

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'مشكلة تقنية في رفع أو تحليل الملفات',
  account: 'إدارة الحساب والصلاحيات',
  feature: 'اقتراح ميزة جديدة',
}

export default function SupportPage() {
  const { activeWorkspace } = useWorkspaceRole()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('technical')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || sending) return

    setSending(true)
    setErrorMsg('')

    try {
      const session = getSession()
      const senderName = session?.fullName || (session as any)?.name || 'مستخدم InsightFlow'
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
          'رقم التذكرة': generatedTicket,
          'اسم المرسل': senderName,
          'البريد الإلكتروني': senderEmail,
          'مساحة العمل': activeWorkspace?.name || 'غير محدد',
          'نوع الطلب': CATEGORY_LABELS[category] || category,
          'عنوان الموضوع': subject.trim(),
          'تفاصيل الرسالة': message.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'فشل إرسال الرسالة، حاول مرة أخرى.')
      }

      setTicketId(generatedTicket)
      setSubmitted(true)
      setSubject('')
      setMessage('')
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إرسال الرسالة.')
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
              <h1 className="text-xl font-bold tracking-tight">مركز المساعدة والدعم الفني</h1>
              <p className="text-xs text-muted-foreground">
                أدلة الاستخدام السريع، الإجابات الشائعة، والتواصل المباشر مع فريق دعم InsightFlow
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            جميع الأنظمة ومحرك الذكاء الاصطناعي تعمل بكفاءة
          </div>
        </div>

        {/* Quick Start Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '1. إنشاء مشروع',
              desc: 'نظّم بياناتك داخل مشاريع مستقلة لكل قسم أو عميل.',
              href: '/projects',
              icon: FileSpreadsheet,
            },
            {
              title: '2. رفع البيانات',
              desc: 'ارفع ملفات Excel أو CSV ليتم تنظيفها وفهرستها تلقائياً.',
              href: '/upload',
              icon: UploadCloud,
            },
            {
              title: '3. اسأل المساعد الذكي',
              desc: 'ناقش نتائجك واستخرج استنتاجات فورية من الشريط الأيمن.',
              href: '/analytics',
              icon: Sparkles,
            },
            {
              title: '4. مشاركة الفريق',
              desc: 'ادعُ زملاءك وحدد صلاحيات الوصول لكل عضو بسهولة.',
              href: '/team',
              icon: Users,
            },
          ].map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Grid: FAQ + Contact Support */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* FAQ Section (7 cols) */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 lg:col-span-7">
            <h2 className="mb-4 text-base font-bold">الأسئلة الشائعة (FAQ)</h2>
            <div className="space-y-2.5">
              {FAQS.map((item, idx) => {
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
            <h2 className="mb-1 text-base font-bold">تواصل مع فريق الدعم</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              واجهت مشكلة تقنية أو لديك اقتراح لميزة جديدة؟ أرسل رسالتك وستصلنا فوراً.
            </p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-bold text-foreground">تم إرسال رسالتك بنجاح</p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  رقم التذكرة المرجعي: #{ticketId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  وصلت رسالتك إلى فريق الدعم الفني، وسنقوم بالرد على بريدك الإلكتروني في أقرب وقت.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-xl bg-secondary px-4 py-2 text-xs font-medium hover:bg-secondary/80"
                >
                  إرسال رسالة أخرى
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
                  <label className="text-xs font-medium text-muted-foreground">نوع الطلب</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={sending}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="technical" className="bg-slate-900">
                      مشكلة تقنية في رفع أو تحليل الملفات
                    </option>
                    <option value="account" className="bg-slate-900">
                      إدارة الحساب والصلاحيات
                    </option>
                    <option value="feature" className="bg-slate-900">
                      اقتراح ميزة جديدة
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">عنوان الموضوع</label>
                  <input
                    type="text"
                    required
                    disabled={sending}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="ملخص قصير للمشكلة أو الاستفسار..."
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">التفاصيل</label>
                  <textarea
                    rows={4}
                    required
                    disabled={sending}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اشرح التفاصيل لمساعدتك بأسرع وقت..."
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
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      إرسال إلى الدعم الفني
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