import { NextRequest, NextResponse } from 'next/server'
import { complete } from '@/lib/ai'

const SYSTEM_PROMPT = `You are a concise personal finance analyst. Analyze the monthly expense summary and reply with ONLY a JSON object — no markdown, no explanation, no extra text.

Schema:
{"period":string,"categoryBreakdown":[{"name":string,"amount":number,"pct":number}],"insights":string[],"flags":string[],"recommendations":string[],"nextMonthGoals":string[]}

Rules:
- insights: exactly 3 short observations (1 sentence each, ≤15 words)
- flags: budget warnings or unusual spikes only; empty array if none
- recommendations: exactly 2 actionable suggestions (1 sentence each, ≤15 words)
- nextMonthGoals: exactly 2 specific, measurable improvement goals for next month (1 sentence each, ≤15 words)
- amounts in INR, no currency symbols in JSON numbers
- categoryBreakdown: top 5 categories by amount only
- respond with raw JSON only`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body?.totalSpent && body?.totalSpent !== 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const text = await complete(SYSTEM_PROMPT, JSON.stringify(body))
    const analysis = JSON.parse(text)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Analysis error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
