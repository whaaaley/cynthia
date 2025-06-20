import { join, parse, relative } from '@std/path'
import { findUp } from 'find-up-simple'
import { loadConfig } from '../config.ts'
import { synthesize } from '../openai-code-synthesis.ts'
import { retryWithCallback } from '../utils/retry.ts'

// Test runner that returns success status
const runTests = async (testFilePath: string): Promise<boolean> => {
  const process = new Deno.Command('deno', { args: ['test', '-A', testFilePath] })
  const output = await process.output()

  if (output.stdout.length > 0) await Deno.stdout.write(output.stdout)
  if (output.stderr.length > 0) await Deno.stderr.write(output.stderr)

  return output.code === 0
}

export const genCommand = async (args: string[]) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return
  }

  try {
    const cwd = Deno.cwd()
    const fullPath = join(cwd, path)
    const parsedPath = parse(fullPath)
    const name = parse(parse(path).name).name

    const config = await loadConfig(cwd)
    const mod = await import(`file://${fullPath}`)

    const cynthiaDir = await findUp('.cynthia', { cwd, type: 'directory' })
    if (!cynthiaDir) {
      console.error('No .cynthia directory found. Run "cyn init" first.')
      return
    }

    // Define callback functions
    const generateAndTest = async () => {
      // Generate code
      const result = await synthesize(mod.default.suites, cwd)

      if (!result.code || !result.code.trim()) {
        throw new Error('Generated code is empty')
      }

      // Write the generated files
      const base = `${Date.now()}-${name}`
      const genPath = join(cynthiaDir, `${base}.gen.ts`)
      const promptPath = join(cynthiaDir, `${base}.prompt.txt`)

      await Deno.writeFile(genPath, new TextEncoder().encode(result.code))
      await Deno.writeFile(promptPath, new TextEncoder().encode(result.prompt))

      const relPath = relative(parsedPath.dir, genPath)
      const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)
      await Deno.writeFile(expPath, new TextEncoder().encode(`export { default } from './${relPath}'`))

      // Run tests if configured
      if (config.testing.runTestsAfterGeneration) {
        const testsPass = await runTests(fullPath)
        return { testsPass }
      } else {
        // If we're not running tests, consider it successful
        return { testsPass: true }
      }
    }

    const validateSuccess = (result: { testsPass: boolean }) => result.testsPass

    // Agentic retry loop: generate code and validate with tests
    await retryWithCallback({
      operation: generateAndTest,
      isSuccess: validateSuccess,
      maxRetries: config.generation.maxRetries,
      operationName: 'Agentic code generation and test validation',
    })

    console.log('Code generation completed successfully!')
  } catch (e) {
    console.error('Error generating file:', e)
  }
}
