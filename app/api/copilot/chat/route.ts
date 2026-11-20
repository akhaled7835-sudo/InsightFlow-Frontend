import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح ANTHROPIC_API_KEY غير مضاف في إعدادات البيئة.' },
        { status: 500 }
      )
    }

    const { message, history = [], workspaceContext } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'الرسالة مطلوبة.' }, { status: 400 })
    }

    const systemPrompt = `أنت المساعد الذكي لمنصة InsightFlow لتحليل البيانات والأعمال.
تتصرف كمحلل بيانات وخبير استراتيجي محترف بأسلوب واضح ومباشر وطبيعي (مثل ChatGPT)، وتجنب تماماً تكرار نصوص التقارير الجامدة.
- إذا سألك المستخدم عن بياناته أو مشاريعه أو ملفاته، اعتمد على "سياق القسم النشط" المرفق أدناه بدقة.
- إذا سألك المستخدم سؤالاً عاماً، اقتصادياً، تسويقياً، أو يطلب معلومات حديثة، استخدم أداة البحث في الويب (web_search) واذكر المصادر بوضوح.
- أجب باللغة العربية الفصحى المبسطة والاحترافية (أو بلغة سؤال المستخدم).

سياق القسم النشط حالياً:
${JSON.stringify(workspaceContext || {}, null, 2)}`

    const formattedMessages = [
      ...history
        .filter((m: any) => m.id !== 'welcome')
        .slice(-8)
        .map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          },
        ],
        messages: formattedMessages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API Error:', data)
      return NextResponse.json(
        { error: data?.error?.message || 'حدث خطأ أثناء الاتصال بالمساعد الذكي.' },
        { status: response.status }
      )
    }

    // استخراج النص والمصادر (Citations) من استجابة Claude
    const textParts: string[] = []
    const sources: Array<{ title: string; url: string }> = []
    const seenUrls = new Set<string>()

    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text' && block.text) {
          textParts.push(block.text)
          if (Array.isArray(block.citations)) {
            for (const cite of block.citations) {
              if (cite.url && !seenUrls.has(cite.url)) {
                seenUrls.add(cite.url)
                sources.push({
                  title: cite.title || cite.url,
                  url: cite.url,
                })
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      reply: textParts.join('\n').trim() || 'لم أتمكن من صياغة إجابة، حاول مرة أخرى.',
      sources,
    })
  } catch (error: any) {
    console.error('Copilot route error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم.' },
      { status: 500 }
    )
  }
}