import { type Context, FastMCP, type FastMCPSession } from 'fastmcp'
import type { IChatMessages } from 'llm-exe'
import { z } from 'zod'
import { createCommand } from '../commands/create.ts'
import { genCommand } from '../commands/gen.ts'
import { initCommand } from '../commands/init.ts'
import { testCommand } from '../commands/test.ts'
import { env } from '../env.ts'

// Export all MCP-related types from here
export type FastMCPSessionAuth = Record<string, unknown> | undefined
export type MCPContext = Context<FastMCPSessionAuth>
export type MCPSession = FastMCPSession<FastMCPSessionAuth>

// MCP message conversion types and functions
type SamplingRequest = Parameters<FastMCPSession['requestSampling']>[0]
type McpMessage = SamplingRequest['messages'][0]

// Convert llm-exe messages to FastMCP format
export const convertMessagesToMcp = (messages: IChatMessages): McpMessage[] => {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: {
      type: 'text',
      text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    },
  }))
}

export const server = new FastMCP({
  name: 'cynthia-mcp',
  version: env.VERSION as `${number}.${number}.${number}`,
})

// Store the real session that has requestSampling
let activeSession: MCPSession | null = null

server.on('connect', (event) => {
  console.error('Client connected')
  activeSession = event.session
})

server.on('disconnect', (_event) => {
  console.error('Client disconnected')
  activeSession = null
})

server.addTool({
  name: 'create',
  description: 'Create new test file with boilerplate',
  parameters: z.object({
    filename: z.string().describe('Name of the test file to create'),
  }),
  execute: async (args, _context) => {
    try {
      await createCommand([args.filename])
      return `Successfully created test file: ${args.filename}`
    } catch (error) {
      throw new Error(`Create command failed: ${(error as Error).message}`)
    }
  },
})

server.addTool({
  name: 'gen',
  description: 'Generate code from test file using AI',
  parameters: z.object({
    filepath: z.string().describe('Path to the test file to generate code for'),
  }),
  execute: async (args, _context) => {
    try {
      await genCommand([args.filepath], activeSession)
      return `Successfully generated code for: ${args.filepath}`
    } catch (error) {
      throw new Error(`Generate command failed: ${(error as Error).message}`)
    }
  },
})
server.addTool({
  name: 'init',
  description: 'Initialize Cynthia project (.cynthia dir + config)',
  execute: async (_args, _context) => {
    try {
      await initCommand()
      return 'Successfully initialized Cynthia project'
    } catch (error) {
      throw new Error(`Init command failed: ${(error as Error).message}`)
    }
  },
})

server.addTool({
  name: 'test',
  description: 'Run tests for a specific file',
  parameters: z.object({
    filepath: z.string().describe('Path to the test file to run'),
  }),
  execute: async (args, _context) => {
    try {
      await testCommand([args.filepath])
      return `Successfully ran tests for: ${args.filepath}`
    } catch (error) {
      throw new Error(`Test command failed: ${(error as Error).message}`)
    }
  },
})

server.addTool({
  name: 'get-project-info',
  description: 'Get information about the current Cynthia project',
  execute: async (_args, _context) => {
    const info = {
      name: 'cynthia',
      description: 'A code synthesis command line tool that brings structure to AI-powered development',
      version: env.VERSION,
    }
    return JSON.stringify(info, null, 2)
  },
})

server.addPrompt({
  name: 'generate-test',
  description: 'Generate a test for a given function',
  arguments: [{
    name: 'functionName',
    description: 'Name of the function to test',
    required: true,
  }, {
    name: 'functionCode',
    description: 'The function code to generate tests for',
    required: true,
  }],
  load: async (args) => {
    return `Generate a comprehensive test suite for the function "${args.functionName}". The function code is:

\`\`\`typescript
${args.functionCode}
\`\`\`

Please include:
1. Basic functionality tests
2. Edge case tests
3. Error handling tests
4. Use Deno's testing framework with describe/it blocks`
  },
})

// TODO: Add a command for mcp and cli tool both to automatically create a test file
// based on a description of the function

server.start({ transportType: 'httpStream' })
console.error(`Started Cynthia MCP server v${env.VERSION}`)
