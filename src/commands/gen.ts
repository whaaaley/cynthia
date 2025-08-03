import { join, parse, relative } from '@std/path'
import { findUp } from 'find-up-simple'
import { createChatPrompt, createLlmExecutor, createParser, useLlm } from 'llm-exe'
import { z } from 'zod'
import { loadConfig } from '../config.ts'
import { createPrompts } from '../core/create-prompts.ts'
import { testMorph } from '../core/test-morph.ts'
import { convertMessagesToMcp, type MCPSession } from '../mcp/server.ts'
import { retryWithCallback } from '../utils/retry-with-callback.ts'
import { runDenoTests } from '../utils/test-runner.ts'

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

export const genCommand = async (args: string[], session: MCPSession | null) => {
  const path = args[0]
  if (!path) {
    console.error('Error: filepath is required')
    return
  }

  try {
    const cwd = Deno.cwd()

    const cynthiaDir = await findUp('.cynthia', { cwd, type: 'directory' })
    if (!cynthiaDir) {
      console.error('No .cynthia directory found. Run "cyn init" first.')
      return
    }

    // Ensure test file has .test.ts extension for consistency across CLI and MCP
    // This allows users to run `cyn gen fibonacci` instead of `cyn gen fibonacci.test.ts`
    let testPath = path
    if (!testPath.endsWith('.test.ts')) {
      testPath = `${testPath}.test.ts`
    }

    const fullPath = join(cwd, testPath)

    const testPrompt = testMorph(fullPath) // Morphs a test file into a prompt
    const parsedPath = parse(fullPath)

    const config = await loadConfig(cwd)
    const name = parse(parse(path).name).name

    const { systemPrompt } = await createPrompts(cwd)
    const chat = createChatPrompt(systemPrompt) // Creates a chat prompt instance
    const parser = createParser('json', { schema: z.toJSONSchema(codeBlockSchema) })

    const getExecutor = () => {
      if (session && session.requestSampling) {
        return {
          execute: async (input: Record<string, unknown>) => {
            const llmExeMessages = chat.format(input)
            const mcpMessages = convertMessagesToMcp(llmExeMessages)

            const result = await session.requestSampling({
              messages: mcpMessages,
              maxTokens: 1000,
            })

            if (!result.content) {
              throw new Error('No content received from FastMCP sampling')
            }

            if (result.content.type !== 'text') {
              throw new Error(`Expected text content but got: ${result.content.type}`)
            }

            return parser.parse(result.content.text)
          },
        }
      }

      // Fallback to LLM executor
      const llm = useLlm(config.llm.provider, config.llm.options)
      return createLlmExecutor({ llm, prompt: chat, parser })
    }

    const createAndTest = async () => {
      chat.addUserMessage(testPrompt)

      const response = await getExecutor().execute({})
      const validatedResponse = codeBlockSchema.parse(response)

      const result = {
        code: validatedResponse.code,
        prompt: testPrompt,
      }

      if (!result.code || !result.code.trim()) {
        throw new Error('Created code or prompt is empty')
      }

      const base = `${Date.now()}-${name}`
      const genPath = join(cynthiaDir, `${base}.gen.ts`)
      const featurePath = join(cynthiaDir, `${base}.feature`)

      await Deno.writeFile(genPath, new TextEncoder().encode(result.code))
      await Deno.writeFile(featurePath, new TextEncoder().encode(result.prompt))

      const relPath = relative(parsedPath.dir, genPath)
      const expPath = join(parsedPath.dir, `${parse(parsedPath.name).name}.ts`)
      await Deno.writeFile(expPath, new TextEncoder().encode(`export { default } from './${relPath}'`))

      const exitCode = await runDenoTests(fullPath)
      return { testsPass: exitCode === 0 }
    }

    const validateSuccess = (result: { testsPass: boolean }) => result.testsPass

    await retryWithCallback({
      operation: createAndTest,
      isSuccess: validateSuccess,
      maxRetries: config.maxRetries,
      operationName: 'Agentic code generation and test validation',
    })

    console.log('Code generation completed successfully!')
  } catch (e) {
    console.error('Error generating file:', e)
  }
}
