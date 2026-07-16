import { NextRequest, NextResponse } from 'next/server'
import { complete } from '@/lib/ai'
import agentConfig from '@/config/agent.json'

const SYSTEM_PROMPT = agentConfig.analyzeInstruction

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
