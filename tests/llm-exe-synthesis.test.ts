import { assertEquals, assertExists } from 'jsr:@std/assert'
import { describe, it } from 'jsr:@std/testing/bdd'
import { loadConfig } from '../src/config.ts'
import { codeBlockSchema, synthesize } from '../src/llm-exe-synthesis.ts'

describe('LLM-exe Synthesis Tests', () => {
  describe('Structural Tests', () => {
    it('should load config correctly', async () => {
      const config = await loadConfig()

      assertExists(config.llm)
      assertExists(config.llm.provider)
      assertExists(config.llm.options)
      assertEquals(typeof config.maxRetries, 'number')
      assertEquals(typeof config.selfRefinement, 'boolean')
      assertEquals(typeof config.refinementLoops, 'number')

      const validProviders = [
        'openai.gpt-4o-mini',
        'openai.gpt-4o',
        'anthropic.claude-3-opus',
        'google.gemini-2.0-flash',
        'deepseek.chat',
      ]

      assertEquals(validProviders.includes(config.llm.provider), true)
    })

    it('should have correct synthesis function signature', () => {
      assertEquals(typeof synthesize, 'function')
      assertEquals(synthesize.length, 2)
    })

    it('should validate Zod schema structure', () => {
      const mockLlmResponse = {
        name: 'testFunction',
        language: 'typescript',
        type: 'function',
        dependencies: 'none',
        code: 'export default () => { return "hello" }',
      }

      const result = codeBlockSchema.parse(mockLlmResponse)

      assertEquals(result.name, 'testFunction')
      assertEquals(result.language, 'typescript')
      assertEquals(result.type, 'function')
      assertEquals(result.dependencies, 'none')
      assertEquals(result.code, 'export default () => { return "hello" }')
    })
  })

  describe('Behavioral Tests', () => {
    it('should handle synthesis function call structure', async () => {
      const testPrompt = 'Create a simple function that returns "hello world"'

      const result = await synthesize(testPrompt)

      assertExists(result.code)
      assertExists(result.prompt)
      assertEquals(typeof result.code, 'string')
      assertEquals(typeof result.prompt, 'string')
      assertEquals(result.prompt, testPrompt)
    })
  })
})
