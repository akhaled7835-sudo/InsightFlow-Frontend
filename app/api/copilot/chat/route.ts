import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح GROQ_API_KEY غير مضاف في إعدادات البيئة.' },
        { status: 500 }
      )
    }

    const { message, history = [], workspaceContext } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'الرسالة مطلوبة.' }, { status: 400 })
    }

    const systemPrompt = `أنت المساعد الذكي لمنصة InsightFlow لتحليل البيانات والأعمال.
تتصرف كمحلل بيانات وخبير استراتيجي محترف بأسلوب محادثة طبيعي وواضح (مثل ChatGPT)، وتجنب تماماً تكرار نصوص التقارير الجامدة.
- إذا سألك المستخدم عن بياناته أو مشاريعه أو ملفاته، اعتمد على "سياق القسم النشط" المرفق بدقة.
- إذا سألك المستخدم سؤالاً عاماً، اقتصادياً، أو يطلب أحدث المعلومات من الإنترنت، ابحث في الويب وقدم إجابة دقيقة مدعومة بالمصادر.
- أجب باللغة العربية الواضحة والاحترافية (أو بلغة سؤال المستخدم).

سياق القسم النشط حالياً:
${JSON.stringify(workspaceContext || {}, null, 2)}`

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m: any) => m.id !== 'welcome')
        .slice(-8)
        .map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      { role: 'user', content: message },
    ]

    // compound يدعم البحث الحي في الإنترنت، و llama-3.3-70b-versatile كاحتياطي فائق السرعة
    const modelsToTry = ['groq/compound', 'llama-3.3-70b-versatile']
    let data: any = null
    let okResponse = false
    let lastStatus = 500

    for (const modelName of modelsToTry) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature: 0.4,
          max_tokens: 1024,
        }),
      })

      data = await response.json()
      lastStatus = response.status

      if (response.ok) {
        okResponse = true
        break
      }
    }

    if (!okResponse) {
      console.error('Groq API Error:', data)
      return NextResponse.json(
        { error: data?.error?.message || 'حدث خطأ أثناء الاتصال بالمساعد الذكي.' },
        { status: lastStatus }
      )
    }

    const choice = data?.choices?.[0]?.message
    const replyText =
      choice?.content?.trim() || 'لم أتمكن من صياغة إجابة، حاول مرة أخرى.'

    // استخراج روابط المصادر إذا قام الموديل بالبحث في الإنترنت
    const sources: Array<{ title: string; url: string }> = []
    const seenUrls = new Set<string>()
    const executedTools = choice?.executed_tools || []

    for (const tool of executedTools) {
      const results = tool?.search_results?.results || []
      for (const r of results) {
        if (r?.url && !seenUrls.has(r.url)) {
          seenUrls.add(r.url)
          sources.push({
            title: r.title || r.url,
            url: r.url,
          })
        }
      }
    }

    return NextResponse.json({
      reply: replyText,
      sources: sources.slice(0, 4),
    })
  } catch (error: any) {
    console.error('Copilot route error:', error)
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم.' }, { status: 500 })
  }
}