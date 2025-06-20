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

    // Create placeholder implementation file so imports don't break
    const placeholderContent = [
      'export default () => {',
      `  throw new Error('Implementation not generated yet. Run: cyn gen ${filename}.cyn.ts')`,
      '}',
    ].join('\n')

    const placeholderFile = new TextEncoder().encode(placeholderContent)
    await Deno.writeFile(`./${filename}.ts`, placeholderFile, { create: true })
    console.log(`Created ${filename}.ts (placeholder)`)
  } catch (e) {
    console.error('Error creating file:', e)
  }
}
