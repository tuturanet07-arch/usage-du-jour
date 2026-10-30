import type { EngineInterface, Register } from 'claude-code'

type Day = { date: string; messages: number; tokens: number }

const BAR_WIDTH = 10

// Clé du jour en heure locale, ex. "2026-10-30": un nouveau jour repart de zéro.
async function today($: EngineInterface) {
  const d = new Date(await $.clock.now())
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

async function load($: EngineInterface): Promise<Day> {
  const date = await today($)
  const stored = (await $.store.get('day')) as Day | undefined
  return stored?.date === date ? stored : { date, messages: 0, tokens: 0 }
}

const formatTokens = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)} k`
      : String(n)

const bar = (ratio: number) => {
  const filled = Math.min(BAR_WIDTH, Math.round(ratio * BAR_WIDTH))
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
}

async function show($: EngineInterface, budget: number) {
  const day = await load($)
  const ratio = day.tokens / budget
  $.ui.status(
    `Aujourd'hui · ${day.messages} msg · ${formatTokens(day.tokens)} tokens ` +
      `${bar(ratio)} ${Math.round(ratio * 100)} % de ${formatTokens(budget)}`,
  )
}

async function add($: EngineInterface, budget: number, messages: number, tokens: number) {
  const day = await load($)
  await $.store.set('day', {
    ...day,
    messages: day.messages + messages,
    tokens: day.tokens + tokens,
  })
  await show($, budget)
}

export const register: Register = (on, options) => {
  const budget = Math.max(1, Number(options.budget_tokens) || 1_000_000)

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await show($, budget)
    // Redessine chaque minute pour que la barre retombe à zéro à minuit.
    $.clock.every(60_000, () => show($, budget))
    return result
  })

  on('prompt.submit', async ($, e, next) => {
    if (!e.isMeta && !e.command) {
      await add($, budget, 1, 0)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Tokens de chaque tour, sous-agents compris : entrée + écriture de cache + sortie
  // (les lectures de cache, re-servies à chaque requête, ne sont pas comptées).
  on('turn.complete', async ($, e, next) => {
    const u = e.usage
    if (u) {
      await add($, budget, 0, u.input_tokens + u.cache_creation_input_tokens + u.output_tokens)
    }
    return next(e)
  })
}
