import { createChatPrompt, createLlmExecutor, createParser, useLlm } from 'llm-exe'
import { z } from 'zod'
import { loadConfig } from './config.ts'
import { createPrompts } from './core/create-prompts.ts'

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

  console.log('Creating TypeScript from tests...')
  const { systemPrompt } = await createPrompts(cwd)

  const llm = useLlm(config.llm.provider, config.llm.options)
  const prompt = createChatPrompt(systemPrompt).addUserMessage(testPrompt)
  const parser = createParser('json', { schema: z.toJSONSchema(codeBlockSchema) })

  const executor = createLlmExecutor({ llm, prompt, parser })

  const response = await executor.execute({})
  const validatedResponse = codeBlockSchema.parse(response)

  return {
    code: validatedResponse.code,
    prompt: testPrompt,
  }
}
