// Template for *.ts placeholder files
export const createPlaceholderTemplate = (filename: string) => {
  return `export default () => {
  throw new Error('Function not implemented yet. Run "cyn gen ${filename}.test.ts" to generate it.')
}
`
}

// Template for *.test.ts test files
export const createTestFileTemplate = (filename: string) => {
  return `// @ts-nocheck: imports generated code that may not exist yet
/* eslint-disable */

import { assertEquals } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'
import testFn from './${filename}.ts'

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
`
}

// Template for cynthia.config.ts file
export const createConfigTemplate = () => {
  return `import type { CynthiaConfig } from 'jsr:@cynthia/cynthia'

const config: CynthiaConfig = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0,
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
