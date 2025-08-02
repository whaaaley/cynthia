import { assertEquals } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'
import type { TestFailure } from '../src/core/create-prompts.ts'
import { refineCode, type TestResult } from '../src/utils/self-refinement.ts'

describe('Self-Refinement System', () => {
  describe('refineCode', () => {
    it('should succeed on first attempt when tests pass', async () => {
      let createAttempts = 0
      let testAttempts = 0

      const createCode = (_prompt: string) => {
        createAttempts++
        return 'working code'
      }

      const testCode = (code: string): TestResult => {
        testAttempts++
        return { testsPass: true, code, failures: [] }
      }

      const result = await refineCode({
        createCode,
        testCode,
        originalPrompt: 'Create a function',
        maxAttempts: 3,
      })

      assertEquals(createAttempts, 1)
      assertEquals(testAttempts, 1)
      assertEquals(result, 'working code')
    })

    it('should refine and eventually succeed', async () => {
      let createAttempts = 0
      let testAttempts = 0

      const mockFailures: TestFailure[] = [{
        type: 'assertion',
        message: 'Values are not equal',
        expected: '"(123) 456-7890"',
        actual: '"1234567890"',
      }]

      const createCode = (_prompt: string) => {
        createAttempts++
        return createAttempts === 1 ? 'failing code' : 'working code'
      }

      const testCode = (code: string): TestResult => {
        testAttempts++
        if (code === 'failing code') {
          return { testsPass: false, code, failures: mockFailures }
        }
        return { testsPass: true, code, failures: [] }
      }

      const result = await refineCode({
        createCode,
        testCode,
        originalPrompt: 'Create a function',
        maxAttempts: 3,
      })

      assertEquals(createAttempts, 2)
      assertEquals(testAttempts, 2)
      assertEquals(result, 'working code')
    })

    it('should return code after max attempts even if tests fail', async () => {
      let createAttempts = 0
      let testAttempts = 0
      const mockFailures: TestFailure[] = [{
        type: 'syntax',
        message: 'Unexpected token',
      }]

      const createCode = (_prompt: string) => {
        createAttempts++
        return 'always failing code'
      }

      const testCode = (code: string): TestResult => {
        testAttempts++
        return { testsPass: false, code, failures: mockFailures }
      }

      const result = await refineCode({
        createCode,
        testCode,
        originalPrompt: 'Create a function',
        maxAttempts: 2,
      })

      assertEquals(createAttempts, 2)
      assertEquals(testAttempts, 2)
      assertEquals(result, 'always failing code')
    })

    it('should enhance prompt with failure context between attempts', async () => {
      let createAttempts = 0
      const receivedPrompts: string[] = []

      const createCode = (prompt: string) => {
        createAttempts++
        receivedPrompts.push(prompt)
        return createAttempts === 1 ? 'first attempt code' : 'working code'
      }

      const testCode = (code: string): TestResult => {
        if (code === 'first attempt code') {
          return {
            testsPass: false,
            code,
            failures: [{ type: 'assertion', message: 'test failed' }],
          }
        }
        return { testsPass: true, code, failures: [] }
      }

      await refineCode({
        createCode,
        testCode,
        originalPrompt: 'Create a function',
        maxAttempts: 3,
      })

      assertEquals(receivedPrompts.length, 2)
      assertEquals(receivedPrompts[0], 'Create a function')

      // Second prompt should be enhanced with failure context
      assertEquals(receivedPrompts[1].includes('Create a function'), true)
      assertEquals(receivedPrompts[1].includes('test failed'), true)
      assertEquals(receivedPrompts[1].includes('first attempt code'), true)
    })

    it('should work with default max attempts', async () => {
      let createAttempts = 0

      const createCode = (_prompt: string) => {
        createAttempts++
        return 'working code'
      }

      const testCode = (code: string): TestResult => {
        return { testsPass: true, code, failures: [] }
      }

      const result = await refineCode({
        createCode,
        testCode,
        originalPrompt: 'Create a function',
      })

      assertEquals(createAttempts, 1)
      assertEquals(result, 'working code')
    })
  })
})
