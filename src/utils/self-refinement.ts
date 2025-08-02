import { createRefinementPrompt, type TestFailure } from '../core/create-prompts.ts.tsx'

export type TestResult = {
  testsPass: boolean
  code: string
  failures: TestFailure[]
}

export type RefineCodeOptions = {
  createCode: (prompt: string) => Promise<string> | string
  testCode: (code: string) => Promise<TestResult> | TestResult
  originalPrompt: string
  maxAttempts?: number
}

export const refineCode = async (options: RefineCodeOptions): Promise<string> => {
  const { createCode, testCode, originalPrompt, maxAttempts = 3 } = options

  let attempt = 0
  let previousCode: string | undefined
  let currentPrompt = originalPrompt

  while (attempt < maxAttempts) {
    attempt++

    const code = await Promise.resolve(createCode(currentPrompt))
    const result = await Promise.resolve(testCode(code))

    if (result.testsPass) {
      return code
    }

    if (attempt >= maxAttempts) {
      return code
    }

    previousCode = code
    currentPrompt = createRefinementPrompt(originalPrompt, result.failures, code)
  }

  // This should never be reached, but TypeScript needs it
  return previousCode || ''
}
