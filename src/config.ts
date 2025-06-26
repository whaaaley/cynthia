// Cynthia Configuration Management
//
// This file handles loading and validating configuration from cynthia.config.json
// and provides defaults for all configurable options.

import { findUp } from 'find-up-simple'
import { z } from 'zod'

// Configuration schema with validation
const configSchema = z.object({
  // OpenAI Configuration
  openai: z.object({
    model: z.string().default('gpt-4o-mini'),
    temperature: z.number().min(0).max(2).default(0),
    maxTokens: z.number().optional(),
    seed: z.number().default(Date.now()).optional(),
  }).default({}),

  // Generation Settings
  generation: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
  }).default({}),

  // Test Configuration
  testing: z.object({
    runTestsAfterGeneration: z.boolean().default(true),
  }).default({}),

  // CLI Settings
  cli: z.object({
    confirmGenerations: z.boolean().default(false),
  }).default({}),
})

export type CynthiaConfig = z.infer<typeof configSchema>

// Default configuration
const defaultConfig: CynthiaConfig = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0,
    seed: Date.now(),
  },
  generation: {
    maxRetries: 3,
  },
  testing: {
    runTestsAfterGeneration: true,
  },
  cli: {
    confirmGenerations: false,
  },
}

// Cache for loaded config
let cachedConfig: CynthiaConfig | null = null

// Load configuration from cynthia.config.ts or return defaults
export const loadConfig = async (cwd?: string): Promise<CynthiaConfig> => {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    // Try to find TypeScript config using find-up-simple
    const tsConfigPath = await findUp('cynthia.config.ts', { cwd })

    if (tsConfigPath) {
      // Import the TypeScript config file
      const configModule = await import(`file://${tsConfigPath}`)

      // Validate and merge with defaults
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
