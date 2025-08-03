import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

// MCP client wrapper using official SDK
export class MCPTestClient {
  private client: Client
  private transport: StreamableHTTPClientTransport

  constructor(baseUrl: string) {
    this.transport = new StreamableHTTPClientTransport(new URL(baseUrl))
    this.client = new Client({
      name: 'cynthia-test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    })
  }

  async connect() {
    await this.client.connect(this.transport)
  }

  async disconnect() {
    await this.client.close()
  }

  async callTool(name: string, arguments_: Record<string, unknown>) {
    const result = await this.client.callTool({ name, arguments: arguments_ })
    const content = result.content as Array<{ type: string; text?: string }> | undefined
    return content?.[0]?.text || ''
  }

  async getTools() {
    const result = await this.client.listTools()
    return result
  }
}
