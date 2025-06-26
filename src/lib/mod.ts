// Cynthia Library Exports
//
// This file exports the public API for the Cynthia library
// when used as a dependency in other projects.

import { serializeCalls } from '../utils/serialize-calls.ts'

export { loadConfig } from '../config.ts'
export { synthesize } from '../openai-code-synthesis.ts'
export { readPersonalizationInstructions } from '../personalization.ts'
export { generatePrompts } from '../prompt-generation.ts'
export { createTestSuites, runTestSuites } from '../test-harness.ts'
export { retryWithCallback } from '../utils/retry-with-callback.ts'

export type { CynthiaConfig } from '../config.ts'
export type * from '../types.ts'
export type { RetryOptions } from '../utils/retry-with-callback.ts'

type Module = Record<string, unknown>

type CapturedCall = {
  function: string
  args: unknown[]
  timestamp: number
}

export const cynthia = (...modules: Module[]) => {
  const capturedCalls: CapturedCall[] = []
  const allExports = Object.assign({}, ...modules)
  const wrapped: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(allExports)) {
    if (typeof value === 'function') {
      wrapped[key] = (...args: unknown[]) => {
        capturedCalls.push({
          function: key,
          args,
          timestamp: Date.now(),
        })

        return (value as (...args: unknown[]) => unknown)(...args)
      }
    } else {
      wrapped[key] = value
    }
  }

  wrapped.getCapturedCalls = () => capturedCalls
  wrapped.serializeCalls = () => serializeCalls(capturedCalls)

  return wrapped
}
