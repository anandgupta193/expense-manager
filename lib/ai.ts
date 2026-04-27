import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const PROVIDER = process.env.AI_PROVIDER ?? 'gemini'

function stripMarkdown(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export async function complete(system: string, user: string): Promise<string> {
  console.log('AI provider:', PROVIDER)

  if (PROVIDER === 'gemini') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: system,
    })
    const result = await model.generateContent(user)
    return stripMarkdown(result.response.text())
  }

  if (PROVIDER === 'claude') {
    const client = new Anthropic()
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: user }],
    })
    return res.content[0].type === 'text' ? stripMarkdown(res.content[0].text) : ''
  }

  // openai
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return stripMarkdown(res.choices[0]?.message?.content ?? '')
}
