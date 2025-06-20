// Cynthia Library Exports
//
// This file exports the public API for the Cynthia library
// when used as a dependency in other projects.

export { loadConfig } from '../config.ts'
export { synthesize } from '../openai-code-synthesis.ts'
export { readPersonalizationInstructions } from '../personalization.ts'
export { generatePrompts } from '../prompt-generation.ts'
export { createTestSuites, runTestSuites } from '../test-harness.ts'

export type { CynthiaConfig } from '../config.ts'
export type * from '../types.ts'
