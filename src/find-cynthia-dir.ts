import { exists } from '@std/fs'
import { dirname, join } from '@std/path'

const findCynthiaDir = async (currentDir: string = Deno.cwd()) => {
  const cynthiaPath = join(currentDir, '.cynthia')

  const hasCynthiaDir = await exists(cynthiaPath, { isDirectory: true })
  if (hasCynthiaDir) {
    return cynthiaPath
  }

  const parentDir = dirname(cynthiaPath)
  if (parentDir === cynthiaPath) {
    throw new Error('No .cynthia directory found in directory tree')
  }

  return findCynthiaDir(parentDir)
}

export default findCynthiaDir
