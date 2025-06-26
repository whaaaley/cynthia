// Cynthia Template Functions
//
// This file contains template functions that return the boilerplate
// code for various Cynthia files and configurations.

// Template for .ts placeholder files
export const createPlaceholderTemplate = (filename: string) => {
  return `export default () => {
  // Implementation not generated yet. Run: cyn gen ${filename}.test.ts
}`
}

// Template for .test.ts test files
export const createTestFileTemplate = (filename: string) => {
  return `// @ts-nocheck: imports generated code that may not exist yet
/* eslint-disable */

import * as assert from "jsr:@std/assert"
import * as bdd from "jsr:@std/testing/bdd"
import { cynthia } from 'cynthia'
import testFn from './${filename}.ts'

const { assertEquals, describe, it, serializeTest } = cynthia({ assert, bdd })

describe('Phone number formatter', () => {
  it('should format 10-digit numbers', () => {
    const result = testFn('1234567890')
    assertEquals(result, '(123) 456-7890')
  })

  it('should handle numbers with dashes', () => {
    const result = testFn('123-456-7890')
    assertEquals(result, '(123) 456-7890')
  })
})

export default serializeTest()
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
