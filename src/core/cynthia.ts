import { serializeCalls } from './serialize-calls.ts'

type Module = Record<string, unknown>

type CapturedCall = {
  function: string
  args: unknown[]
  timestamp: number
}

type CynthiaOptions = {
  assert: Module
  bdd: Module
}

export const cynthia = ({ assert, bdd }: CynthiaOptions) => {
  const capturedCalls: CapturedCall[] = []
  const allExports = Object.assign({}, assert, bdd)

  const wrapped: Record<string, unknown> = {
    getCapturedCalls: () => capturedCalls,
    serializeTest: () => serializeCalls(capturedCalls),
  }

  for (const [key, value] of Object.entries(allExports)) {
    if (typeof value === 'function') {
      wrapped[key] = (...args: unknown[]) => {
        capturedCalls.push({
          function: key,
          args,
          timestamp: Date.now(),
        })

        // TODO: Don't assume callback position
        if (key in bdd && typeof args[1] === 'function') {
          try {
            args[1]()
          } catch {
            // If an error occurs in the BDD function, we still want to capture the call
          }
        }

        if (Deno.env.get('CYNTHIA_CAPTURE') === 'true') {
          return
        } else {
          return value(...args)
        }
      }
    } else {
      wrapped[key] = value
    }
  }

  return wrapped
}
