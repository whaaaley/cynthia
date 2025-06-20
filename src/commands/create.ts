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

export const createCommand = async (args: string[]) => {
  const filename = args[0]
  if (!filename) {
    console.error('Error: filename is required')
    return
  }

  try {
    const file = new TextEncoder().encode(boilerplate)
    await Deno.writeFile(`./${filename}.cyn.ts`, file, { create: true })
    console.log(`Created ${filename}.cyn.ts`)
  } catch (e) {
    console.error('Error creating file:', e)
  }
}
