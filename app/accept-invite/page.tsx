'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest, TOKEN_KEY } from '@/lib/api'
import { CheckCircle2, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleAccept() {
    if (!token) {
      setStatus('error')
      setMessage('رابط الدعوة غير مكتمل.')
      return
    }

    const authToken = localStorage.getItem(TOKEN_KEY)
    if (!authToken) {
      router.push(`/login?redirect=/accept-invite?token=${token}`)
      return
    }

    setLoading(true)
    try {
      const res = await apiRequest<any>('/api/workspaces/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      setStatus('success')
      setMessage(res?.message || 'تم انضمامك إلى فريق العمل بنجاح!')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'تعذر قبول الدعوة. تأكد من تسجيل الدخول بحسابك أولاً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <h1 className="text-xl font-bold">دعوة للانضمام إلى فريق العمل</h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          لقد تمت دعوتك للتعاون في مساحة العمل على منصة InsightFlow. اضغط على الزر أدناه لتأكيد الموافقة والدخول للمنصة.
        </p>

        {status === 'success' && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-red-500/15 p-3 text-xs font-semibold text-red-400">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={loading || status === 'success'}
            onClick={handleAccept}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            موافق والانضمام إلى مساحة العمل
          </button>

          <Link href="/login" className="text-xs text-slate-400 hover:text-white">
            تسجيل الدخول أو إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-white">
          جاري التحميل...
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}