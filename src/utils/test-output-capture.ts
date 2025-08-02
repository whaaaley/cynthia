import { XMLParser } from 'fast-xml-parser'
import type { TestFailure } from '../core/create-prompts.ts'

export type TestOutput = {
  exitCode: number
  stdout: string
  stderr: string
  junitXml?: string
}

export type ParsedTestResults = {
  passed: number
  failed: number
  errors: number
  failures: TestFailure[]
  successful: boolean
}

export const runTestsWithOutput = async (testFilePath: string): Promise<TestOutput> => {
  let tempFile: string | undefined

  try {
    // Use secure temp file creation
    tempFile = await Deno.makeTempFile({ suffix: '.xml' })

    const process = new Deno.Command('deno', {
      args: [
        'test',
        '--allow-all',
        '--reporter=junit',
        `--junit-path=${tempFile}`,
        testFilePath,
      ],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code, stdout, stderr } = await process.output()

    // Read the JUnit XML file
    let junitXml: string | undefined
    try {
      junitXml = await Deno.readTextFile(tempFile)
    } catch {
      // If we can't read the XML file, continue without it
      junitXml = undefined
    }

    return {
      exitCode: code,
      stdout: new TextDecoder().decode(stdout),
      stderr: new TextDecoder().decode(stderr),
      junitXml,
    }
  } catch (error) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: `Failed to run deno test: ${error}`,
    }
  } finally {
    // Clean up temp file
    if (tempFile) {
      try {
        await Deno.remove(tempFile)
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export const parseJUnitXml = (xmlContent: string): ParsedTestResults => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
  })

  try {
    const result = parser.parse(xmlContent)
    const testsuites = result.testsuites || result.testsuite

    if (!testsuites) {
      return {
        passed: 0,
        failed: 0,
        errors: 0,
        failures: [],
        successful: true,
      }
    }

    // Handle both single testsuite and multiple testsuites
    const suite = testsuites.testsuite || testsuites
    const suites = Array.isArray(suite) ? suite : [suite]

    let totalPassed = 0
    let totalFailed = 0
    let totalErrors = 0
    const allFailures: TestFailure[] = []

    for (const suite of suites) {
      if (!suite) continue

      const tests = parseInt(suite['@tests'] || '0', 10)
      const failures = parseInt(suite['@failures'] || '0', 10)
      const errors = parseInt(suite['@errors'] || '0', 10)
      const skipped = parseInt(suite['@skipped'] || '0', 10)

      totalFailed += failures
      totalErrors += errors
      totalPassed += tests - failures - errors - skipped

      // Parse individual test cases
      const testcases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase].filter(Boolean)

      for (const testcase of testcases) {
        if (testcase.failure || testcase.error) {
          const failure = testcase.failure || testcase.error
          const isError = !!testcase.error

          allFailures.push({
            type: isError ? 'runtime' : 'assertion',
            message: `${testcase['@name'] || 'Unknown test'}: ${failure['@message'] || failure['#text'] || 'No message'}`,
            expected: failure['@expected'],
            actual: failure['@actual'],
          })
        }
      }
    }

    return {
      passed: totalPassed,
      failed: totalFailed,
      errors: totalErrors,
      failures: allFailures,
      successful: totalFailed === 0 && totalErrors === 0,
    }
  } catch (error) {
    return {
      passed: 0,
      failed: 1,
      errors: 0,
      failures: [{
        type: 'runtime',
        message: `Failed to parse JUnit XML: ${error}`,
      }],
      successful: false,
    }
  }
}

export const parseTestResults = (output: TestOutput): ParsedTestResults => {
  // If we have JUnit XML, use that for structured parsing
  if (output.junitXml) {
    return parseJUnitXml(output.junitXml)
  }

  // Fallback: if no XML but tests failed, create basic failure info
  if (output.exitCode !== 0) {
    return {
      passed: 0,
      failed: 1,
      errors: 0,
      failures: [{
        type: 'runtime',
        message: 'Test failed without JUnit XML output',
      }],
      successful: false,
    }
  }

  // Success case
  return {
    passed: 1,
    failed: 0,
    errors: 0,
    failures: [],
    successful: true,
  }
}

export const isTestOutputSuccessful = (output: TestOutput): boolean => {
  return output.exitCode === 0
}