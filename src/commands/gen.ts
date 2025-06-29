import { join, parse, relative } from '@std/path'
import { findUp } from 'find-up-simple'
import { loadConfig } from '../config.ts'
import { testMorph } from '../core/test-morph.ts'
import { synthesize } from '../openai-code-synthesis.ts'
import { retryWithCallback } from '../utils/retry-with-callback.ts'
import { runDenoTests } from '../utils/test-runner.ts'

export const genCommand = async (args: string[]) => {
  // Early check for required environment variable
  if (!Deno.env.get('OPENAI_API_KEY')) {
    console.error([
      'Error: OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.',
      'Get your API key from: https://platform.openai.com/api-keys',
    ].join('\n'))
    return
  }

  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return // Exit early if no path is provided
  }

  try {
    const cwd = Deno.cwd()

    const cynthiaDir = await findUp('.cynthia', { cwd, type: 'directory' })
    if (!cynthiaDir) {
      console.error('No .cynthia directory found. Run "cyn init" first.')
      return // Exit early if no .cynthia directory
    }

    const fullPath = join(cwd, path)

    const prompt = testMorph(fullPath)
    const parsedPath = parse(fullPath)

    const config = await loadConfig(cwd)
    const name = parse(parse(path).name).name

    const generateAndTest = async () => {
      const result = await synthesize(prompt, cwd)

      if (!result.code || !result.code.trim()) {
        throw new Error('Generated code or prompt is empty')
      }

      // Write the generated files
      const base = `${Date.now()}-${name}`
      const genPath = join(cynthiaDir, `${base}.gen.ts`)
      const featurePath = join(cynthiaDir, `${base}.feature`)

      await Deno.writeFile(genPath, new TextEncoder().encode(result.code))
      await Deno.writeFile(featurePath, new TextEncoder().encode(result.prompt))

      const relPath = relative(parsedPath.dir, genPath)
      const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)
      await Deno.writeFile(expPath, new TextEncoder().encode(`export { default } from './${relPath}'`))

      // Run tests if configured
      if (config.testing.runTestsAfterGeneration) {
        const exitCode = await runDenoTests(fullPath)
        return { testsPass: exitCode === 0 }
      }

      // If we're not running tests, consider it successful
      return { testsPass: true }
    }

    const validateSuccess = (result: { testsPass: boolean }) => result.testsPass

    // Retry generation until tests pass
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
