import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح GEMINI_API_KEY غير مضاف في إعدادات البيئة.' },
        { status: 500 }
      )
    }

    const { message, history = [], workspaceContext } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'الرسالة مطلوبة.' }, { status: 400 })
    }

    const systemInstruction = `أنت المساعد الذكي لمنصة InsightFlow لتحليل البيانات والأعمال.
تتصرف كمحلل بيانات وخبير استراتيجي محترف بأسلوب محادثة طبيعي وواضح (مثل ChatGPT)، وتجنب تماماً تكرار نصوص التقارير الجامدة.
- إذا سألك المستخدم عن بياناته أو مشاريعه أو ملفاته، اعتمد على "سياق القسم النشط" المرفق بدقة.
- إذا سألك المستخدم سؤالاً عاماً، اقتصادياً، أو تقنياً، قدم إجابة شاملة وموثوقة مع ذكر المراجع أو المنهجيات المعروفة.
- أجب باللغة العربية الواضحة والاحترافية (أو بلغة سؤال المستخدم).

سياق القسم النشط حالياً:
${JSON.stringify(workspaceContext || {}, null, 2)}`

    const contents = [
      ...history
        .filter((m: any) => m.id !== 'welcome')
        .slice(-8)
        .map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
      { role: 'user', parts: [{ text: message }] },
    ]

    // محاولة الموديلات المجانية بالترتيب (مع البحث أولاً ثم بدونه إذا كانت الباقة المجانية تمنع البحث)
    const attempts = [
      { model: 'gemini-3.8-flash', useSearch: true },
      { model: 'gemini-3.8-flash-lite', useSearch: true },
      { model: 'gemini-2.5-flash-lite', useSearch: true },
      { model: 'gemini-3.8-flash-lite', useSearch: false },
      { model: 'gemini-2.5-flash-lite', useSearch: false },
      { model: 'gemini-2.0-flash', useSearch: false },
    ]

    let data: any = null
    let okResponse = false
    let lastStatus = 500

    for (const attempt of attempts) {
      const payload: any = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
      }
      if (attempt.useSearch) {
        payload.tools = [{ google_search: {} }]
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${attempt.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      data = await response.json()
      lastStatus = response.status

      if (response.ok) {
        okResponse = true
        break
      }

      // إذا كان الخطأ بسبب الحصة (429) أو عدم توفر الموديل (404/400)، ننتقل للمحاولة التالية
      if (response.status === 429 || response.status === 404 || response.status === 400) {
        continue
      }
      break
    }

    if (!okResponse) {
      console.error('Gemini API Error:', data)
      return NextResponse.json(
        { error: data?.error?.message || 'حدث خطأ أثناء الاتصال بالمساعد الذكي.' },
        { status: lastStatus }
      )
    }

    const candidate = data?.candidates?.[0]
    const replyText =
      candidate?.content?.parts?.map((p: any) => p.text || '').join('\n').trim() ||
      'لم أتمكن من صياغة إجابة، حاول مرة أخرى.'

    const sources: Array<{ title: string; url: string }> = []
    const seenUrls = new Set<string>()
    const chunks = candidate?.groundingMetadata?.groundingChunks || []

    for (const chunk of chunks) {
      const uri = chunk?.web?.uri
      const title = chunk?.web?.title
      if (uri && !seenUrls.has(uri)) {
        seenUrls.add(uri)
        sources.push({ title: title || uri, url: uri })
      }
    }

    return NextResponse.json({
      reply: replyText,
      sources,
    })
  } catch (error: any) {
    console.error('Copilot route error:', error)
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم.' }, { status: 500 })
  }
}