import { join, parse } from '@std/path'
import { runTestSuites } from '../test-harness.ts'

export const testCommand = async (args: string[]) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return
  }

  try {
    const cwd = Deno.cwd()
    const fullPath = join(cwd, path)
    const parsedPath = parse(fullPath)
    const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)

    console.log('Importing files...')
    const mod = await import(`file://${fullPath}`)
    const gen = await import(`file://${expPath}`)

    console.log('Running tests...')
    runTestSuites(mod.default, gen.default)
  } catch (e) {
    console.error('Error running tests:', e)
  }
}
