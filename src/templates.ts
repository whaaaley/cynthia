// Cynthia Template Functions
//
// This file contains template functions that return the boilerplate
// code for various Cynthia files and configurations.

// Template for .cyn.ts test files
export function createTestFileTemplate(filename: string): string {
  return `// @ts-nocheck: imports generated code that may not exist yet
/* eslint-disable */
// Cynthia test file - imports generated code that may not exist yet

import { createTestSuites, runTestSuites } from 'cynthia'
import testFn from './${filename}.ts'

const t = createTestSuites()

t.describe('My Synthetic Code', () => {
  t.it('should do something', () => {
    t.expect([]).toBe(true)
  })
})

runTestSuites(t.getState(), testFn)

export default t.getState()
`
}

// Template for cynthia.config.ts file
export function createConfigTemplate(): string {
  return `// Cynthia Configuration
//
// This file configures the behavior of the Cynthia code synthesis tool.
// API key should be set via OPENAI_API_KEY environment variable.
//
// Seed option: Defaults to timestamp for variation. Set a fixed number
// (e.g., 42) for reproducible results across runs.

import type { CynthiaConfig } from 'cynthia'

const config: CynthiaConfig = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0, // Set to 0 for deterministic results with seed
    // maxTokens: 4000, // Optional: limit response tokens
    // seed: 42, // Optional: override default timestamp-based seed
  },

  generation: {
    maxRetries: 3, // Agentic retries when tests fail
  },

  testing: {
    runTestsAfterGeneration: true,
  },

  cli: {
    confirmGenerations: false,
  },
}

export default config
`
}
