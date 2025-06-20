import { exists } from '@std/fs'
import { ensureDir } from '@std/fs/ensure-dir'
import { join } from '@std/path'
import { createConfigTemplate } from '../templates.ts'

export const initCommand = async () => {
  try {
    const cwd = Deno.cwd()

    // Create .cynthia directory
    await ensureDir(join(cwd, '.cynthia'))
    console.log('Created .cynthia directory')

    // Create config file if it doesn't exist
    const configPath = join(cwd, 'cynthia.config.ts')
    if (!await exists(configPath)) {
      const configContent = createConfigTemplate()
      await Deno.writeTextFile(configPath, configContent)
      console.log(`Created configuration file: ${configPath}`)
      console.log('Edit this file to customize Cynthia behavior.')
    } else {
      console.log('Configuration file already exists')
    }

    console.log('\nCynthia project initialized successfully!')
    console.log('Next steps:')
    console.log('  1. Set OPENAI_API_KEY environment variable')
    console.log('  2. Create a test file: cyn create my-function')
    console.log('  3. Generate code: cyn gen my-function.cyn.ts')
  } catch (e) {
    console.error('Error initializing project:', e)
  }
}
