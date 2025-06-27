import { assertEquals, assertExists } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { cynthia } from './cynthia.ts'

// Mock modules to test with
const mockAssert = {
  assertEquals: (actual: unknown, expected: unknown) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
  },
  assertExists: (value: unknown) => {
    if (value === null || value === undefined) {
      throw new Error('Value does not exist')
    }
  },
}

const mockBdd = {
  describe: (_name: string, _fn: () => void) => {
    // Don't execute the callback - let cynthia handle it
  },
  it: (_name: string, _fn: () => void) => {
    // Don't execute the callback - let cynthia handle it
  },
}

describe('Cynthia Function', () => {
  it('should wrap all functions from input modules', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: mockBdd })

    // Should have all the original functions
    assertExists(wrapped.assertEquals)
    assertExists(wrapped.assertExists)
    assertExists(wrapped.describe)
    assertExists(wrapped.it)
    assertExists(wrapped.getCapturedCalls)
  })

  it('should preserve non-function properties', () => {
    const moduleWithConstant = {
      myFunction: () => 'test',
      myConstant: 'hello world',
      myNumber: 42,
    }

    const wrapped = cynthia({ assert: moduleWithConstant, bdd: {} })

    assertEquals(wrapped.myConstant, 'hello world')
    assertEquals(wrapped.myNumber, 42)
  })

  it('should capture function calls', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: {} })
    const wrappedAssertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const getCapturedCalls = wrapped.getCapturedCalls as () => Array<{ function: string; args: unknown[]; timestamp: number }>

    // Make some function calls
    wrappedAssertEquals(1, 1)
    wrappedAssertEquals('hello', 'hello')

    const captured = getCapturedCalls()

    assertEquals(captured.length, 2)
    assertEquals(captured[0].function, 'assertEquals')
    assertEquals(captured[0].args, [1, 1])
    assertEquals(captured[1].function, 'assertEquals')
    assertEquals(captured[1].args, ['hello', 'hello'])
  })

  it('should preserve original function behavior', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: {} })
    const wrappedAssertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void

    // This should not throw (functions work normally)
    wrappedAssertEquals(5, 5)

    // This should throw (original behavior preserved)
    let didThrow = false
    try {
      wrappedAssertEquals(1, 2)
    } catch {
      didThrow = true
    }

    assertEquals(didThrow, true)
  })

  it('should add timestamps to captured calls', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: {} })
    const wrappedAssertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const getCapturedCalls = wrapped.getCapturedCalls as () => Array<{ function: string; args: unknown[]; timestamp: number }>

    const beforeTime = Date.now()
    wrappedAssertEquals('test', 'test')
    const afterTime = Date.now()

    const captured = getCapturedCalls()
    const call = captured[0]

    assertExists(call.timestamp)
    assertEquals(typeof call.timestamp, 'number')
    assertEquals(call.timestamp >= beforeTime, true)
    assertEquals(call.timestamp <= afterTime, true)
  })

  it('should handle multiple modules', () => {
    const module1 = { func1: () => 'one' }
    const module2 = { func2: () => 'two' }

    const wrapped = cynthia({ assert: module1, bdd: module2 })

    assertExists(wrapped.func1)
    assertExists(wrapped.func2)
    assertExists(wrapped.getCapturedCalls)
  })

  it('should return function results correctly', () => {
    const testModule = {
      add: (a: number, b: number) => a + b,
      greet: (name: string) => `Hello, ${name}!`,
    }

    const wrapped = cynthia({ assert: testModule, bdd: {} })
    const add = wrapped.add as (a: number, b: number) => number
    const greet = wrapped.greet as (name: string) => string

    const sum = add(2, 3)
    const greeting = greet('World')

    assertEquals(sum, 5)
    assertEquals(greeting, 'Hello, World!')
  })

  it('should capture complex arguments correctly', () => {
    const testModule = {
      processArray: (arr: number[]) => arr.map((x) => x * 2),
      processObject: (obj: { name: string }) => obj.name.toUpperCase(),
    }

    const wrapped = cynthia({ assert: testModule, bdd: {} })
    const processArray = wrapped.processArray as (arr: number[]) => number[]
    const processObject = wrapped.processObject as (obj: { name: string }) => string
    const getCapturedCalls = wrapped.getCapturedCalls as () => Array<{ function: string; args: unknown[]; timestamp: number }>

    processArray([1, 2, 3])
    processObject({ name: 'test' })

    const captured = getCapturedCalls()

    assertEquals(captured.length, 2)
    assertEquals(captured[0].function, 'processArray')
    assertEquals(captured[0].args, [[1, 2, 3]])
    assertEquals(captured[1].function, 'processObject')
    assertEquals(captured[1].args, [{ name: 'test' }])
  })
})

describe('Cynthia Integration', () => {
  it('should work with real assert and bdd modules', () => {
    // Import the real modules
    const realAssert = { assertEquals }
    const realBdd = { describe, it }

    const wrapped = cynthia({ assert: realAssert, bdd: realBdd })

    // Should have the functions
    assertExists(wrapped.assertEquals)
    assertExists(wrapped.describe)
    assertExists(wrapped.it)

    // Should capture calls
    const wrappedAssertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const getCapturedCalls = wrapped.getCapturedCalls as () => Array<{ function: string; args: unknown[]; timestamp: number }>

    wrappedAssertEquals(1, 1)

    const captured = getCapturedCalls()
    assertEquals(captured.length >= 1, true)
    assertEquals(captured[captured.length - 1].function, 'assertEquals')
  })
})

describe('Cynthia Serialization', () => {
  it('should serialize simple test structure', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: mockBdd })
    const describe = wrapped.describe as (name: string, fn: () => void) => void
    const it = wrapped.it as (name: string, fn: () => void) => void
    const assertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const serializeTest = wrapped.serializeTest as () => string

    describe('Calculator Functions', () => {
      it('should add correctly', () => {
        assertEquals(5, 5)
      })
    })

    const serialized = serializeTest()
    const expected = [
      'Describe Calculator Functions:',
      '  It should add correctly:',
      '    Assert that 5 equals 5',
    ].join('\n')

    assertEquals(serialized, expected)
  })

  it('should serialize multiple assertions', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: mockBdd })
    const describe = wrapped.describe as (name: string, fn: () => void) => void
    const it = wrapped.it as (name: string, fn: () => void) => void
    const assertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const assertExists = wrapped.assertExists as (value: unknown) => void
    const serializeTest = wrapped.serializeTest as () => string

    describe('Test Suite', () => {
      it('first test', () => {
        assertEquals(1, 1)
        assertExists(true)
      })
    })

    const serialized = serializeTest()
    const lines = serialized.split('\n')

    assertEquals(lines[0], 'Describe Test Suite:')
    assertEquals(lines[1], '  It first test:')
    assertEquals(lines[2], '    Assert that 1 equals 1')
    assertEquals(lines[3], '    Assert that true exists')
  })

  it('should serialize different assertion patterns', () => {
    const mockExtendedAssert = {
      ...mockAssert,
      assertThrows: (_fn: () => void, _ErrorClass: unknown, _message: string) => {
        try {
          _fn()
          throw new Error('Expected function to throw')
        } catch (_error) {
          // Expected to throw
        }
      },
      assertTrue: (value: boolean) => {
        if (!value) throw new Error('Expected true')
      },
      assertContains: (arr: unknown[], item: unknown) => {
        if (!arr.includes(item)) throw new Error('Array does not contain item')
      },
    }

    const wrapped = cynthia({ assert: mockExtendedAssert, bdd: mockBdd })
    const describe = wrapped.describe as (name: string, fn: () => void) => void
    const it = wrapped.it as (name: string, fn: () => void) => void
    const assertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const assertThrows = wrapped.assertThrows as (fn: () => void, ErrorClass: unknown, message: string) => void
    const assertTrue = wrapped.assertTrue as (value: boolean) => void
    const assertContains = wrapped.assertContains as (arr: unknown[], item: unknown) => void
    const serializeTest = wrapped.serializeTest as () => string

    describe('Pattern Tests', () => {
      it('should test various patterns', () => {
        assertEquals(1, 1)
        assertThrows(
          () => {
            throw new Error('test')
          },
          Error,
          'test error',
        )
        assertTrue(true)
        assertContains([1, 2, 3], 2)
      })
    })

    const serialized = serializeTest()
    const lines = serialized.split('\n')

    assertEquals(lines[2], '    Assert that 1 equals 1')
    assertEquals(lines[3], '    Assert that function throws "test error"')
    assertEquals(lines[4], '    Assert that true is true')
    assertEquals(lines[5], '    Assert that [ 1, 2, 3 ] contains 2')
  })

  it('should handle multiple test suites', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: mockBdd })
    const describe = wrapped.describe as (name: string, fn: () => void) => void
    const it = wrapped.it as (name: string, fn: () => void) => void
    const assertEquals = wrapped.assertEquals as (actual: unknown, expected: unknown) => void
    const serializeTest = wrapped.serializeTest as () => string

    describe('First Suite', () => {
      it('first test', () => {
        assertEquals(1, 1)
      })
    })

    describe('Second Suite', () => {
      it('second test', () => {
        assertEquals(2, 2)
      })
    })

    const serialized = serializeTest()
    const lines = serialized.split('\n')

    assertEquals(lines[0], 'Describe First Suite:')
    assertEquals(lines[1], '  It first test:')
    assertEquals(lines[2], '    Assert that 1 equals 1')
    assertEquals(lines[3], 'Describe Second Suite:')
    assertEquals(lines[4], '  It second test:')
    assertEquals(lines[5], '    Assert that 2 equals 2')
  })

  it('should handle empty serialization', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: {} })
    const serializeTest = wrapped.serializeTest as () => string

    const serialized = serializeTest()
    assertEquals(serialized, '')
  })

  it('should capitalize function names properly', () => {
    const wrapped = cynthia({ assert: mockAssert, bdd: mockBdd })
    const describe = wrapped.describe as (name: string, fn: () => void) => void
    const it = wrapped.it as (name: string, fn: () => void) => void
    const serializeTest = wrapped.serializeTest as () => string

    describe('test suite', () => {
      it('test case', () => {
        // No assertions, just structure
      })
    })

    const serialized = serializeTest()
    const lines = serialized.split('\n')

    assertEquals(lines[0], 'Describe test suite:')
    assertEquals(lines[1], '  It test case:')
  })
})
