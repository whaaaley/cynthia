import { assertEquals, assertStringIncludes } from '@std/assert'
import { existsSync } from '@std/fs'
import { join } from '@std/path'
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd'
import { main } from '../src/cli.ts'

describe('CLI Tests', () => {
  let tempDir: string
  let originalCwd: string

  beforeAll(async () => {
    // Create temporary directory for testing
    tempDir = await Deno.makeTempDir()
    originalCwd = Deno.cwd()
    Deno.chdir(tempDir)
  })

  afterAll(async () => {
    // Restore original directory
    Deno.chdir(originalCwd)

    // Clean up temp directory
    await Deno.remove(tempDir, { recursive: true })
  })

  it('should show help when no arguments provided', async () => {
    const originalConsoleLog = console.log
    let output = ''
    console.log = (msg: string) => {
      output += msg
    }

    try {
      await main([])
      assertStringIncludes(output, 'Cynthia CLI')
      assertStringIncludes(output, 'Commands:')
    } finally {
      console.log = originalConsoleLog
    }
  })

  it('should show help with -h flag', async () => {
    const originalConsoleLog = console.log
    let output = ''
    console.log = (msg: string) => {
      output += msg
    }

    try {
      await main(['-h'])
      assertStringIncludes(output, 'Cynthia CLI')
    } finally {
      console.log = originalConsoleLog
    }
  })

  it('should initialize project with init command', async () => {
    await main(['init'])

    const cynthiaDir = join(tempDir, '.cynthia')
    assertEquals(existsSync(cynthiaDir), true)

    const configFile = join(tempDir, 'cynthia.config.ts')
    assertEquals(existsSync(configFile), true)
  })

  it('should create test file with create command', async () => {
    await main(['create', 'test-cli'])

    const testFile = join(tempDir, `test-cli.test.ts`)
    assertEquals(existsSync(testFile), true)

    const content = await Deno.readTextFile(testFile)
    assertEquals(content.length > 0, true)
    assertStringIncludes(content, 'describe')
    assertStringIncludes(content, 'it')
    assertStringIncludes(content, 'testFn')
  })

  it('should generate code from test file', async () => {
    // First initialize project
    await main(['init'])

    // Create a test file using string literal
    await main(['create', 'fibonacci'])

    // Generate code from test using string literal
    await main(['gen', 'fibonacci'])

    // Check if generated files exist
    const cynthiaDir = join(tempDir, '.cynthia')
    const files = Array.from(Deno.readDirSync(cynthiaDir))
    const genFiles = files.filter((f) => f.name.endsWith('.gen.ts'))

    assertEquals(genFiles.length > 0, true)

    // Check if export file was created
    const exportFile = join(tempDir, `fibonacci.ts`)
    assertEquals(existsSync(exportFile), true)
  })

  it('should run tests with test command', async () => {
    // Initialize and create test
    await main(['init'])
    await main(['create', 'test-run'])

    // Run tests
    const originalConsoleLog = console.log
    let output = ''
    console.log = (msg: string) => {
      output += msg
    }

    try {
      await main(['test', `test-run.test.ts`])
      // Test should pass since it's a basic template
      assertStringIncludes(output, 'ok')
    } finally {
      console.log = originalConsoleLog
    }
  })
})
