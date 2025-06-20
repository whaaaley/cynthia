// Cynthia CLI Entry Point
//
// This file provides the main CLI interface for the Cynthia tool,
// routing commands to their respective implementations.

import { parseArgs } from '@std/cli'
import { createCommand } from './commands/create.ts'
import { genCommand } from './commands/gen.ts'
import { initCommand } from './commands/init.ts'
import { testCommand } from './commands/test.ts'

const helpText = `
Cynthia CLI

Commands:
  create <filename>   Create new test file with boilerplate
  gen <filepath>      Generate code from tests
  init                Initialize Cynthia project (.cynthia dir + config)
  test <filepath>     Run tests

Options:
  -h, --help      Show help
  -v, --version   Show version` as const

export const main = async (args: string[]) => {
  const { _, ...parsedArgs } = parseArgs(args, {
    string: [],
    boolean: ['help', 'h', 'version', 'v'],
    alias: { h: 'help', v: 'version' },
    '--': false, // Don't collect remaining args after --
  })

  if (parsedArgs.help) {
    console.log(helpText)
    return
  }

  if (parsedArgs.version) {
    console.log('Cynthia CLI v0.0.1')
    return
  }

  const [cmd, ...rest] = _
  const stringArgs = rest.filter((arg) => typeof arg === 'string')

  switch (cmd) {
    case 'create': {
      await createCommand(stringArgs)
      break
    }
    case 'init': {
      await initCommand()
      break
    }
    case 'gen': {
      await genCommand(stringArgs)
      break
    }
    case 'test': {
      await testCommand(stringArgs)
      break
    }
    default: {
      console.log(helpText)
    }
  }
}
