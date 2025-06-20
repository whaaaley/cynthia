import { expect } from 'jsr:@std/expect'
import { describe, it } from 'jsr:@std/testing/bdd'
import type { Suite, TestState } from './types.ts'

export function createTestSuites() {
  const state: TestState = {
    suites: [],
  }

  let currentSuite: Suite | null = null

  const describe = (name: string, fn: () => void) => {
    currentSuite = { name, tests: [] }
    state.suites.push(currentSuite)
    fn()
  }

  const it = (name: string, fn: () => void) => {
    if (!currentSuite) {
      console.error('Error: no active suite - call describe() first')
      return
    }

    currentSuite.tests.push({ name, expects: [] })
    fn()
  }

  const expect = (input: unknown[]) => {
    if (!currentSuite) {
      console.error('Error: no active suite - call describe() first')
      return {
        toBe: () => {},
        toMatchObject: () => {},
        not: {
          toBe: () => {},
          toMatchObject: () => {},
        },
      }
    }

    const currentTest = currentSuite.tests[currentSuite.tests.length - 1]

    const matcher = (key: string, value: unknown) => {
      currentTest.expects.push({ input, [key]: value })
    }

    const matchers = (prefix: string = '') => ({
      toBe: (value: unknown) => matcher(prefix + 'toBe', value),
      toMatchObject: (value: unknown) => matcher(prefix + 'toMatchObject', value),
    })

    return {
      ...matchers(),
      not: matchers('not.'),
    }
  }

  const getState = (): TestState => state

  return { describe, it, expect, getState }
}

type TestFn<T extends unknown[] = unknown[], R = unknown> = (...args: T) => R

export const runTestSuites = <T extends unknown[], R>(state: TestState, testFn: TestFn<T, R>) => {
  state.suites.forEach((suite) => {
    describe(suite.name, () => {
      suite.tests.forEach((test) => {
        it(test.name, () => {
          test.expects.forEach((expectation) => {
            const result = testFn(...expectation.input as T)

            if ('toBe' in expectation) {
              expect(result).toBe(expectation.toBe)
            }

            if ('toMatchObject' in expectation) {
              expect(result).toMatchObject(expectation.toMatchObject as Record<PropertyKey, unknown>)
            }

            if ('not.toBe' in expectation) {
              expect(result).not.toBe(expectation['not.toBe'])
            }

            if ('not.toMatchObject' in expectation) {
              expect(result).not.toMatchObject(expectation['not.toMatchObject'] as Record<PropertyKey, unknown>)
            }
          })
        })
      })
    })
  })
}
