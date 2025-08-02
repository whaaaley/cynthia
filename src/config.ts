import { findUp } from 'find-up-simple'
import { z } from 'zod'
import { env } from './env.ts'

export const providers = [
  'openai.gpt-4o-mini',
  'openai.gpt-4o',
  'anthropic.claude-3-opus',
  'google.gemini-2.0-flash',
  'deepseek.chat',
] as const

export type Provider = typeof providers[number]

// Note: configSchema has implicit complex type that would trigger JSR slow-types
// This is acceptable for internal use - explicit typing would be too verbose

export const configSchema = z.object({
  // LLM configuration (maps directly to llm-exe useLlm calls)
  llm: z.object({
    provider: z.enum(providers).default('openai.gpt-4o-mini'),
    options: z.record(z.string(), z.unknown()).default({}),
  }).default({ provider: 'openai.gpt-4o-mini', options: {} }),

  // Cynthia-specific
  maxRetries: z.number().min(0).max(10).default(3),
  selfRefinement: z.boolean().default(true),
  refinementLoops: z.number().min(1).max(5).default(3),
})

export type CynthiaConfig = z.infer<typeof configSchema>

const defaultConfig: CynthiaConfig = {
  llm: {
    provider: 'openai.gpt-4o-mini',
    options: {
      temperature: 0,
      ...(env.OPENAI_API_KEY && { openAIApiKey: env.OPENAI_API_KEY }),
    },
  },
  maxRetries: 3,
  selfRefinement: true,
  refinementLoops: 3,
}

let cachedConfig: CynthiaConfig | null = null
export const loadConfig = async (cwd?: string): Promise<CynthiaConfig> => {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    const tsConfigPath = await findUp('cynthia.config.ts', { cwd })

    if (tsConfigPath) {
      const configModule = await import(`file://${tsConfigPath}`)

      const validatedConfig = configSchema.parse(configModule.default)
      cachedConfig = validatedConfig

      return validatedConfig
    }
  } catch (e) {
    console.error('Error loading config file, using defaults:', e)
  }

  cachedConfig = defaultConfig
  return defaultConfig
}
