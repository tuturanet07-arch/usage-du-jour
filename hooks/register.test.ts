import { expect, mock, test } from 'claude-code/testing'

// 30 oct. 2026, 10 h et 23 h 59, heure locale.
const MORNING = new Date(2026, 9, 30, 10, 0).getTime()
const MIDNIGHT_SOON = new Date(2026, 9, 30, 23, 59).getTime()

const usage = (input: number, output: number) => ({
  input_tokens: input,
  output_tokens: output,
  cache_read_input_tokens: 50_000,
  cache_creation_input_tokens: 0,
  model: 'claude-opus-5-5',
})

test('compte les messages et les tokens, puis repart à zéro le lendemain', async ($, on) => {
  const lines: (string | undefined)[] = []
  on('ui.status', (_, e) => {
    lines.push(e.text)
    return { value: undefined }
  })
  const clock = mock.clock(on, { now: MORNING })
  mock.store(on, { day: { date: '2026-10-29', messages: 99, tokens: 999_999 } })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('turn.complete', (_, e) => ({ text: e.answer, usage: e.usage }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(lines.at(-1)).toBe("Aujourd'hui · 0 msg · 0 tokens ░░░░░░░░░░ 0 % de 1,0 M")

  await $.prompt.submit({ text: 'bonjour' })
  await $.turn.complete({ answer: 'salut', durationMs: 10, isAborted: false, turnId: 't1', reason: 'answer', usage: usage(200_000, 100_000) })
  expect(lines.at(-1)).toBe("Aujourd'hui · 1 msg · 300 k tokens ███░░░░░░░ 30 % de 1,0 M")

  await clock.set(MIDNIGHT_SOON + 2 * 60_000)
  expect(lines.at(-1)).toBe("Aujourd'hui · 0 msg · 0 tokens ░░░░░░░░░░ 0 % de 1,0 M")
})
