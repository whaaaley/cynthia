import { join } from '@std/path'
import { runDenoTests } from '../utils/test-runner.ts'

export const testCommand = async (args: string[]) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return // Exit early if no path is provided
  }

  try {
    const cwd = Deno.cwd()
    const fullPath = join(cwd, path)

    console.log('Running tests...')
    const exitCode = await runDenoTests(fullPath)

    Deno.exit(exitCode)
  } catch (e) {
    console.error('Error running tests:', e)
  }
}
