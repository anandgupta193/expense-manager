import type { ChatStreamEvent } from '@/lib/types'

/** Server: encode one event as an SSE `data:` frame. */
export function sseEncode(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/**
 * Client: incremental SSE parser. Feed it raw decoded chunks; it buffers
 * partial lines and returns any complete `ChatStreamEvent`s parsed so far.
 */
export function createSSEParser() {
  let buffer = ''
  return function push(chunk: string): ChatStreamEvent[] {
    buffer += chunk
    const events: ChatStreamEvent[] = []
    // SSE frames are separated by a blank line.
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? '' // keep the trailing (possibly incomplete) frame
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data:'))
      if (!line) continue
      const json = line.slice(5).trim()
      if (!json) continue
      try {
        events.push(JSON.parse(json) as ChatStreamEvent)
      } catch {
        // ignore malformed frame
      }
    }
    return events
  }
}
