import { join, parse, relative } from '@std/path'
import { findUp } from 'find-up-simple'
import { loadConfig } from '../config.ts'
import { testMorph } from '../core/test-morph.ts'
import { synthesize } from '../llm-exe-synthesis.ts'
import { retryWithCallback } from '../utils/retry-with-callback.ts'
import { runDenoTests } from '../utils/test-runner.ts'

export const genCommand = async (args: string[]) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return
  }

  try {
    const cwd = Deno.cwd()

    const cynthiaDir = await findUp('.cynthia', { cwd, type: 'directory' })
    if (!cynthiaDir) {
      console.error('No .cynthia directory found. Run "cyn init" first.')
      return
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

      const base = `${Date.now()}-${name}`
      const genPath = join(cynthiaDir, `${base}.gen.ts`)
      const featurePath = join(cynthiaDir, `${base}.feature`)

      await Deno.writeFile(genPath, new TextEncoder().encode(result.code))
      await Deno.writeFile(featurePath, new TextEncoder().encode(result.prompt))

      const relPath = relative(parsedPath.dir, genPath)
      const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)
      await Deno.writeFile(expPath, new TextEncoder().encode(`export { default } from './${relPath}'`))

      const exitCode = await runDenoTests(fullPath)
      return { testsPass: exitCode === 0 }
    }

    const validateSuccess = (result: { testsPass: boolean }) => result.testsPass

    await retryWithCallback({
      operation: generateAndTest,
      isSuccess: validateSuccess,
      maxRetries: config.maxRetries,
      operationName: 'Agentic code generation and test validation',
    })

    console.log('Code generation completed successfully!')
  } catch (e) {
    console.error('Error generating file:', e)
  }
}
