import { createPlaceholderTemplate, createTestFileTemplate } from '../templates.ts'

export const createPlaceholder = async (filename: string) => {
  const placeholderFile = new TextEncoder().encode(createPlaceholderTemplate(filename))
  await Deno.writeFile(`./${filename}.ts`, placeholderFile, { create: true })
  console.log(`Created ${filename}.ts (placeholder)`)
}

export const createCommand = async (args: string[]) => {
  const filename = args[0]
  if (!filename) {
    console.error('Error: filename is required')
    return
  }

  try {
    const content = createTestFileTemplate(filename)
    const file = new TextEncoder().encode(content)

    await Deno.writeFile(`./${filename}.test.ts`, file, { create: true })
    console.log(`Created ${filename}.test.ts`)

    await createPlaceholder(filename)
  } catch (e) {
    console.error('Error creating file:', e)
  }
}
