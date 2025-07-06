import { createChatPrompt, createLlmExecutor, createParser, useLlm } from 'llm-exe'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { loadConfig } from './config.ts'
import { generatePrompts } from './core/generate-prompts.ts'

export const codeBlockSchema = z.object({
  name: z.string(),
  language: z.literal('typescript'),
  type: z.literal('function'),
  dependencies: z.literal('none'),
  code: z.string()
    .refine((code) => code.startsWith('export default'), {
      message: 'Code must start with "export default"',
    })
    .refine((code) => code.endsWith('}'), {
      message: 'Code must end with closing brace',
    }),
})

export const synthesize = async (testPrompt: string, cwd?: string) => {
  const config = await loadConfig(cwd)

  console.log('Generating TypeScript from tests...')
  const { systemPrompt } = await generatePrompts(cwd)

  const llm = useLlm(config.llm.provider, config.llm.options)
  const prompt = createChatPrompt(systemPrompt).addUserMessage(testPrompt)
  const parser = createParser('json', { schema: zodToJsonSchema(codeBlockSchema) })

  const executor = createLlmExecutor({ llm, prompt, parser })

  try {
    const response = await executor.execute({})
    const validatedResponse = codeBlockSchema.parse(response)

    return {
      code: validatedResponse.code,
      prompt: testPrompt,
    }
  } catch (error) {
    console.error('Error generating code:', error)

    return {
      code: '',
      prompt: testPrompt,
    }
  }
}
