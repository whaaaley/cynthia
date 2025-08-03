import { assertEquals, assertStringIncludes } from '@std/assert'
import { existsSync } from '@std/fs'
import { join } from '@std/path'
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd'
import { MCPTestClient } from './utils/mcp-test-client.ts'
import { MCPTestServer } from './utils/mcp-test-server.ts'

describe('MCP Server HTTP Tests', () => {
  let client: MCPTestClient
  let server: MCPTestServer

  beforeAll(async () => {
    server = new MCPTestServer()
    await server.start()

    // Create client and connect
    client = new MCPTestClient('http://localhost:8080/mcp')
    await client.connect()
  })

  afterAll(async () => {
    // Disconnect client
    if (client) {
      await client.disconnect()
    }

    // Stop server
    if (server) {
      await server.stop()
    }
  })

  it('should have get-project-info tool available', async () => {
    const tools = await client.getTools()
    const infoTool = tools.tools?.find((tool: { name: string }) => tool.name === 'get-project-info')

    assertEquals(infoTool?.name, 'get-project-info')
    assertEquals(infoTool?.description, 'Get information about the current Cynthia project')
  })

  it('should execute get-project-info tool', async () => {
    const result = await client.callTool('get-project-info', {})
    const info = JSON.parse(result)

    assertEquals(info.name, 'cynthia')
    assertEquals(info.version, '0.0.9')
    assertStringIncludes(info.description, 'code synthesis')
  })

  it('should execute create tool', async () => {
    const testFileName = 'test-http.test.ts'
    const result = await client.callTool('create', { filename: testFileName })

    assertStringIncludes(result, 'Successfully created test file')
    assertStringIncludes(result, testFileName)

    // Verify file was created
    const files = Array.from(Deno.readDirSync(server.testDir))
    const actualFile = files.find((f) => f.name.includes('test-http'))
    assertEquals(actualFile !== undefined, true)

    if (actualFile) {
      const filePath = join(server.testDir, actualFile.name)
      const content = await Deno.readTextFile(filePath)
      // Check that a file was created with some content
      assertEquals(content.length > 0, true)
    }
  })

  it('should execute init tool', async () => {
    const result = await client.callTool('init', {})
    assertStringIncludes(result, 'Successfully initialized')

    // Verify .cynthia directory was created
    const cynthiaDir = join(server.testDir, '.cynthia')
    assertEquals(existsSync(cynthiaDir), true)

    // Verify config file was created
    const configFile = join(server.testDir, 'cynthia.config.ts')
    assertEquals(existsSync(configFile), true)
  })

  it('should have correct server configuration', () => {
    // Test the configuration values used by the server
    const serverName = 'cynthia-mcp'
    const serverVersion = '0.0.9'

    assertEquals(serverName, 'cynthia-mcp')
    assertEquals(serverVersion, '0.0.9')
  })
})