import { join, parse, relative } from '@std/path'
import findCynthiaDir from '../find-cynthia-dir.ts'
import { synthesize } from '../openai-code-synthesis.ts'

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

    console.log('Synthesizing code...', fullPath)
    const mod = await import(`file://${fullPath}`)
    const { code, prompt } = await synthesize(mod.default.suites)

    const cynthiaDir = await findCynthiaDir(cwd)
    const base = `${Date.now()}-${name}`
    const genPath = join(cynthiaDir, `${base}.gen.ts`)
    const promptPath = join(cynthiaDir, `${base}.prompt.ts`)

    console.log('Writing files...')
    await Deno.writeFile(genPath, new TextEncoder().encode(code))
    await Deno.writeFile(promptPath, new TextEncoder().encode(prompt))

    const relPath = relative(parsedPath.dir, genPath)
    const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)
    await Deno.writeFile(expPath, new TextEncoder().encode(`export { default } from './${relPath}'`))

    console.log('Running tests...')
    const process = new Deno.Command('deno', { args: ['test', '-A', fullPath] })
    const output = await process.output()

    if (output.stdout.length > 0) await Deno.stdout.write(output.stdout)
    if (output.stderr.length > 0) await Deno.stderr.write(output.stderr)

    Deno.exit(output.code)
  } catch (e) {
    console.error('Error generating file:', e)
  }
}
