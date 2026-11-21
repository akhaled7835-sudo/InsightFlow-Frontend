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

    let availableIds: string[] = []
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json()
        availableIds = (modelsData?.data || [])
          .map((m: any) => m.id)
          .filter(
            (id: string) =>
              id &&
              !id.includes('whisper') &&
              !id.includes('guard') &&
              !id.includes('tts') &&
              !id.includes('orpheus') &&
              !id.includes('safeguard')
          )
      }
    } catch {
      // تجاهل
    }

    const preferredOrder = [
      'groq/compound',
      'groq/compound-mini',
      'compound-beta',
      'compound-beta-mini',
      'openai/gpt-oss-120b',
      'qwen/qwen3-32b',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
    ]

    const prioritizedModels = [
      ...preferredOrder.filter((id) => availableIds.includes(id)),
      ...availableIds.filter((id) => !preferredOrder.includes(id)),
    ]

    const modelsToTry =
      prioritizedModels.length > 0
        ? prioritizedModels.slice(0, 5)
        : ['groq/compound', 'groq/compound-mini', 'llama-3.1-8b-instant']

    const systemPrompt = `أنت مستشار ذكاء اصطناعي ومحلل بيانات خبير مستقل (بمستوى ChatGPT / Claude).
لديك في السياق أدناه البيانات الفعلية (أسماء الأعمدة والصفوف الحقيقية) المستخرجة من ملفات المستخدم.

مهمتك وطريقة ردك:
1. **اقرأ الجدول والأرقام الحقيقية مباشرة:** عند سؤالك عن أي ملف، انظر إلى أسماء الأعمدة (columns) والصفوف الفعلية (actualDataRows)، واحسب أو استنتج منها أنماطاً، علاقات، فروقاً، نقاط قوة وضعف، وتفسيرات منطقية للأرقام الموجودة أمامك.
2. **تصرّف كخبير مستقل:** لا تشرح للمستخدم كيفية استخدام أزرار الموقع أو القوائم (لا تقل "اذهب لصفحة كذا" أو "ارفع الملف")، ولا تكرر نصوص التقارير التلقائية الجامدة. أجب مباشرة في صميم البيانات والموضوع كمحلل محترف.
3. **التنسيق:** لا تستخدم جداول Markdown عريضة (Tables). استخدم فقرات قصيرة ونقاطاً مرقمة واضحة باللغة العربية، واجعل الإجابة مركزة ومكتملة (150 - 280 كلمة).
4. **البحث والمعرفة العامة:** إذا كان السؤال عاماً أو خارج نطاق الملفات، أجب بدقة عالية واعتمد على البحث الحي في الإنترنت عند الحاجة.

البيانات الفعلية لملفات المستخدم:
${JSON.stringify(workspaceContext || {}, null, 2)}`

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m: any) => m.id !== 'welcome')
        .slice(-6)
        .map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      { role: 'user', content: message },
    ]

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
          max_tokens: 1500,
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
    const rawContent: string = choice?.content || ''
    const cleanedReply = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

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
      reply: cleanedReply || 'لم أتمكن من صياغة إجابة، حاول مرة أخرى.',
      sources: sources.slice(0, 4),
    })
  } catch (error: any) {
    console.error('Copilot route error:', error)
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم.' }, { status: 500 })
  }
}