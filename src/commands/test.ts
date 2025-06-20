import { join } from '@std/path'

export const testCommand = async (args: string[]) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return
  }

  try {
    const cwd = Deno.cwd()
    const fullPath = join(cwd, path)

    console.log('Running tests...')
    const process = new Deno.Command('deno', { args: ['test', '-A', fullPath] })
    const output = await process.output()

    if (output.stdout.length > 0) await Deno.stdout.write(output.stdout)
    if (output.stderr.length > 0) await Deno.stderr.write(output.stderr)

    Deno.exit(output.code)
  } catch (e) {
    console.error('Error running tests:', e)
  }
}
