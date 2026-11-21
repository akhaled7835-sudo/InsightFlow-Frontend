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

    // جلب الموديلات المتاحة فعلياً في حساب Groq
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

    const systemPrompt = `أنت "المساعد الذكي" المدمج داخل منصة InsightFlow لتحليل البيانات والأعمال.
تتحدث بأسلوب استشاري ذكي ومباشر وعملـي يناسب مساحة الشريط الجانبي الضيقة (320px).

قواعد صارمة يجب الالتزام بها في كل رد:
1. **التنسيق المناسب للمساحة الضيقة:** لا تستخدم الجداول (Markdown Tables) أو الرموز الزخرفية المبالغ فيها إطلاقاً. استخدم فقرات قصيرة ونقاطاً مرقمة واضحة ومباشرة.
2. **الواقعية والالتزام بإمكانيات المنصة:** ميزات منصة InsightFlow الفعلية هي فقط:
   - رفع ملفات Excel و CSV وربطها بالمشاريع.
   - لوحة تحكم المشروع التفاعلية (KPIs، منحنيات الاتجاه، التوزيع الفئوي، ومقارنات الأداء).
   - مركز التحليلات المتقدم (تحديد المقاييس، التجميع حسب الأبعاد، والتصفية).
   - صفحة "تقارير الذكاء الاصطناعي والتوصيات" لتوليد واستعراض النتائج والتوصيات التنفيذية.
   - إدارة فريق العمل والصلاحيات (مالك، مدير، محلل، مشاهد).
   لا تخترع ميزات غير موجودة (مثل Merge Files أو SQLite أو Data Pipelines) ولا تقترح برامج منافسة (مثل Tableau أو Power BI).
3. **تحليل السياق الفعلي:** اعتمد على "سياق القسم النشط" المرفق أدناه. إذا وجدت ملفات مكررة بنفس الاسم، انصح بتنظيمها بلطف دون افتراض أن المنصة بلا رؤى.
4. **الإيجاز والاكتمال:** اجعل إجابتك مركزة (بين 120 و 250 كلمة)، عملية، ومكتملة النهاية دائماً باللغة العربية.

سياق القسم النشط حالياً:
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
          temperature: 0.35,
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
    // تنظيف أي وسوم تفكير داخلية <think>...</think> إن وجدت في نماذج Qwen/DeepSeek
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