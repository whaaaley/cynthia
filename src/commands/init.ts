import { ensureDir } from '@std/fs/ensure-dir'
import { join } from '@std/path'

export const initCommand = async () => {
  try {
    await ensureDir(join(Deno.cwd(), '.cynthia'))
    console.log('Created .cynthia directory')
  } catch (e) {
    console.error('Error creating .cynthia directory:', e)
  }
}
