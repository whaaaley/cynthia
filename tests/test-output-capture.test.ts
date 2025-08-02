import { assertEquals, assertExists } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'
import { isTestOutputSuccessful, parseJUnitXml, parseTestResults, runTestsWithOutput, type TestOutput } from '../src/utils/test-output-capture.ts'

// Test content templates
const passingTestContent = `
import { assertEquals } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'

describe('Sample Test', () => {
  it('should pass', () => {
    assertEquals(1 + 1, 2)
  })
})
`

const failingTestContent = `
import { assertEquals } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'

describe('Failing Test', () => {
  it('should fail', () => {
    assertEquals(1 + 1, 3)
  })
})
`

const successfulJUnitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="0" errors="0" time="0.001">
  <testsuite name="Test Suite" tests="1" failures="0" errors="0" time="0.001">
    <testcase name="should pass" time="0.001"/>
  </testsuite>
</testsuites>`

const failedJUnitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="1" errors="0" time="0.001">
  <testsuite name="Test Suite" tests="1" failures="1" errors="0" time="0.001">
    <testcase name="should fail" time="0.001">
      <failure message="Values are not equal" type="AssertionError">
        AssertionError: Values are not equal.
        Expected: 3
        Actual: 2
      </failure>
    </testcase>
  </testsuite>
</testsuites>`

const testCaseJUnitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="1" errors="0" time="0.001">
  <testsuite name="Test Suite" tests="1" failures="1" errors="0" time="0.001">
    <testcase name="test case" time="0.001">
      <failure message="Test failed">Test failed</failure>
    </testcase>
  </testsuite>
</testsuites>`

describe('Test Output Capture', () => {
  describe('runTestsWithOutput', () => {
    it('should capture test output with exit code', async () => {
      const tempTestFile = './temp-test.ts'
      await Deno.writeTextFile(tempTestFile, passingTestContent)

      try {
        const result = await runTestsWithOutput(tempTestFile)

        assertExists(result.exitCode)
        assertExists(result.stdout)
        assertExists(result.stderr)
        assertEquals(typeof result.exitCode, 'number')
        assertEquals(typeof result.stdout, 'string')
        assertEquals(typeof result.stderr, 'string')

        assertEquals(result.exitCode, 0)
        assertExists(result.junitXml)

        const parsed = parseTestResults(result)
        assertEquals(parsed.successful, true)
        assertEquals(parsed.passed > 0, true)
      } finally {
        try {
          await Deno.remove(tempTestFile)
        } catch {
          // Ignore cleanup errors
        }
      }
    })

    it('should capture failing test output', async () => {
      const tempTestFile = './temp-failing-test.ts'
      await Deno.writeTextFile(tempTestFile, failingTestContent)

      try {
        const result = await runTestsWithOutput(tempTestFile)

        assertExists(result.exitCode)
        assertExists(result.stdout)
        assertExists(result.stderr)

        assertEquals(result.exitCode !== 0, true)

        const parsed = parseTestResults(result)
        assertEquals(parsed.successful, false)
        assertEquals(parsed.failed > 0, true)
      } finally {
        try {
          await Deno.remove(tempTestFile)
        } catch {
          // Ignore cleanup errors
        }
      }
    })
  })

  describe('parseJUnitXml', () => {
    it('should parse successful test results', () => {
      const results = parseJUnitXml(successfulJUnitXml)
      assertEquals(results.passed, 1)
      assertEquals(results.failed, 0)
      assertEquals(results.errors, 0)
      assertEquals(results.successful, true)
      assertEquals(results.failures.length, 0)
    })

    it('should parse failed test results', () => {
      const results = parseJUnitXml(failedJUnitXml)
      assertEquals(results.passed, 0)
      assertEquals(results.failed, 1)
      assertEquals(results.errors, 0)
      assertEquals(results.successful, false)
      assertEquals(results.failures.length, 1)
      assertEquals(results.failures[0].message.includes('should fail'), true)
      assertEquals(results.failures[0].message.includes('Values are not equal'), true)
      assertEquals(results.failures[0].type, 'assertion')
    })
  })

  describe('parseTestResults', () => {
    it('should use JUnit XML when available', () => {
      const mockOutput: TestOutput = {
        exitCode: 1,
        stdout: '',
        stderr: '',
        junitXml: testCaseJUnitXml,
      }

      const results = parseTestResults(mockOutput)
      assertEquals(results.successful, false)
      assertEquals(results.failed, 1)
      assertEquals(results.failures[0].message.includes('test case'), true)
    })

    it('should fallback when no XML available', () => {
      const mockOutput: TestOutput = {
        exitCode: 1,
        stdout: 'Test failed',
        stderr: 'Error occurred',
      }

      const results = parseTestResults(mockOutput)
      assertEquals(results.successful, false)
      assertEquals(results.failed, 1)
      assertEquals(results.failures[0].message.includes('Test failed without JUnit XML output'), true)
    })
  })

  describe('isTestOutputSuccessful', () => {
    it('should return true for successful tests', () => {
      const mockOutput: TestOutput = {
        exitCode: 0,
        stdout: 'all tests passed',
        stderr: '',
      }

      assertEquals(isTestOutputSuccessful(mockOutput), true)
    })

    it('should return false for failed tests', () => {
      const mockOutput: TestOutput = {
        exitCode: 1,
        stdout: 'test failed',
        stderr: '',
      }

      assertEquals(isTestOutputSuccessful(mockOutput), false)
    })
  })
})