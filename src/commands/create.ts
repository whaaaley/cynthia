import { createTestFileTemplate } from '../templates.ts'

export const createCommand = async (args: string[]) => {
  const filename = args[0]
  if (!filename) {
    console.error('Error: filename is required')
    return
  }

  try {
    const content = createTestFileTemplate(filename)
    const file = new TextEncoder().encode(content)
    await Deno.writeFile(`./${filename}.cyn.ts`, file, { create: true })
    console.log(`Created ${filename}.cyn.ts`)
  } catch (e) {
    console.error('Error creating file:', e)
  }
}
