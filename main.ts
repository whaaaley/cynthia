#!/usr/bin/env -S deno run -A

import { parseArgs } from '@std/cli'
import { ensureDir } from '@std/fs/ensure-dir'
import { join, parse, relative } from '@std/path'
import findCynthiaDir from './src/find-cynthia-dir.ts'
import { synthesize } from './src/openai-code-synthesis.ts'
import { runTestSuites } from './src/test-harness.ts'

export { createTestSuites, runTestSuites } from './src/test-harness.ts'

const helpText = `
Cynthia CLI

Commands:
  create <filename>   Create new test file with boilerplate
  gen <filepath>      Generate code from tests
  init                Create .cynthia dir in current directory
  test <filepath>     Run tests

Options:
  -h, --help      Show help
  -v, --version   Show version` as const

const boilerplate = `import { createTestSuites, runTestSuites } from 'cynthia'
import testFn from './hello-world.ts'

const t = createTestSuites()

t.describe('My Synthetic Code', () => {
  t.it('should do something', () => {
    t.expect(true).toBe(true)
  })
})

runTestSuites(t.getState(), testFn)

export default t.getState()
` as const

const main = async () => {
  const { _, ...args } = parseArgs(Deno.args)

  if ('help' in args || 'h' in args) {
    console.log(helpText)
    return
  }

  if ('version' in args || 'v' in args) {
    console.log('Cynthia CLI v0.0.1')
    return
  }

  const [cmd, ...rest] = _
  const cwd = Deno.cwd()

  if (cmd === 'create') {
    try {
      const file = new TextEncoder().encode(boilerplate)
      await Deno.writeFile(`./${rest[0]}.cyn.ts`, file, { create: true })
    } catch (e) {
      console.error('Error creating file:', e)
    }
  }

  if (cmd === 'init') {
    ensureDir(join(cwd, '.cynthia'))
  }

  if (cmd === 'gen') {
    try {
      const path = rest[0]
      if (typeof path !== 'string') {
        throw new Error('Invalid file path')
      }

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

      // console.log('Running tests...')
      // const gen = await import(`file://${genPath}`)
      // runTestSuites(mod.default, gen)

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

  if (cmd === 'test') {
    const path = rest[0]
    if (typeof path !== 'string') {
      throw new Error('Invalid file path')
    }

    const fullPath = join(cwd, path)
    const parsedPath = parse(fullPath)
    const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)

    console.log('Importing files...')
    const mod = await import(`file://${fullPath}`)
    const gen = await import(`file://${expPath}`)

    console.log('Running tests...')
    runTestSuites(mod.default, gen)
  }
}

if (import.meta.main) {
  main()
}
