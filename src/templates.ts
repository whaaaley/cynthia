// Cynthia Template Functions
//
// This file contains template functions that return the boilerplate
// code for various Cynthia files and configurations.

// Template for .cyn.ts test files
export const createTestFileTemplate = (filename: string) => {
  return `// @ts-nocheck: imports generated code that may not exist yet
/* eslint-disable */

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
export const createConfigTemplate = () => {
  return `// Cynthia Configuration

import type { CynthiaConfig } from 'cynthia'

const config: CynthiaConfig = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0,
    // maxTokens: 4000,
    // seed: 42,
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

export default config
`
}
