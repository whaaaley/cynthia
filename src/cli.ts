/**
 * The main entrypoint for the Cynthia CLI.
 *
 * Exports the {@link main} function, which parses CLI arguments and dispatches
 * to the appropriate command handler for Cynthia's code synthesis workflow.
 *
 * @module
 */

/**
 * Cynthia CLI entrypoint.
 *
 * Exports the main CLI handler and command routing for Cynthia's code synthesis tool.
 *
 * Commands:
 *   - create: Create new test file with boilerplate
 *   - gen: Generate code from tests
 *   - init: Initialize Cynthia project
 *   - test: Run tests
 */

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

/**
 * The main CLI handler for Cynthia.
 *
 * Parses command-line arguments and routes to the correct subcommand.
 *
 * @param args - The command-line arguments passed to the CLI.
 * @returns A promise that resolves when the command completes.
 *
 * @example
 * ```ts
 * import { main } from "@cynthia/cynthia";
 * await main(["gen", "my-test-file.test.ts"]);
 * ```
 */
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
    console.log('Cynthia CLI 0.0.6')
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
