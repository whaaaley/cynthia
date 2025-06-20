import OpenAI from '@openai/openai'
import { zodResponseFormat } from '@openai/openai/helpers/zod'
import { z } from 'zod'
import { loadConfig } from './config.ts'
import { generatePrompts } from './prompt-generation.ts'
import type { Suite } from './types.ts'

const codeBlockSchema = z.object({
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

const responseSchema = zodResponseFormat(codeBlockSchema, 'typescript_function')

export const synthesize = async (suites: Suite[], cwd?: string) => {
  const config = await loadConfig(cwd)
  const apiKey = Deno.env.get('OPENAI_API_KEY')

  if (!apiKey) {
    throw new Error([
      'Error: OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.',
      'Get your API key from: https://platform.openai.com/api-keys',
    ].join('\n'))
  }

  const client = new OpenAI({ apiKey })

  console.log('Synthesizing TypeScript from test suites...')
  const { systemPrompt, userPrompt } = await generatePrompts(suites, cwd)

  const response = await client.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: responseSchema,
    temperature: config.openai.temperature,
    max_tokens: config.openai.maxTokens,
    seed: config.openai.seed,
  })

  const [choice] = response.choices
  const { content } = choice.message

  if (!content) {
    console.error('Error: invalid response format from OpenAI')
    return { code: '', prompt: userPrompt }
  }

  try {
    const parsed = JSON.parse(content)
    return { code: parsed.code ?? '', prompt: userPrompt }
  } catch (e) {
    console.error('Error: failed to parse OpenAI response:', e)
    return { code: '', prompt: userPrompt }
  }
}
