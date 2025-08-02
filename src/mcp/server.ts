import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const server = new McpServer({
  name: "cynthia-mcp",
  version: "0.1.0",
})

// Add a basic tool for testing
server.tool(
  "ping",
  "A simple ping tool to test connectivity",
  {
    message: z.string().optional().describe("Optional message to echo back"),
  },
  async ({ message }) => ({
    content: [
      {
        type: "text",
        text: message ? `Pong: ${message}` : "Pong!",
      },
    ],
  })
)

// Add a tool to get project info
server.tool(
  "get-project-info",
  "Get information about the current Cynthia project",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          name: "cynthia",
          description: "A code synthesis command line tool that brings structure to AI-powered development",
          version: "0.0.9",
        }, null, 2),
      },
    ],
  })
)

// Add a resource for project templates
server.resource(
  "templates",
  "templates://*",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: `Template resource: ${uri.pathname}`,
      },
    ],
  })
)

// Add a prompt for code generation
server.prompt(
  "generate-test",
  "Generate a test for a given function",
  {
    functionName: z.string().describe("Name of the function to test"),
    functionCode: z.string().describe("The function code to generate tests for"),
  },
  async ({ functionName, functionCode }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Generate a comprehensive test suite for the function "${functionName}". The function code is:\n\n\`\`\`typescript\n${functionCode}\n\`\`\`\n\nPlease include:\n1. Basic functionality tests\n2. Edge case tests\n3. Error handling tests\n4. Use Deno's testing framework with describe/it blocks`,
        },
      },
    ],
  })
)

const transport = new StdioServerTransport()
await server.connect(transport)
