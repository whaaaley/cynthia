import { join } from '@std/path'

export class MCPTestServer {
  private process: Deno.ChildProcess | null = null
  private originalCwd: string = ''
  public testDir: string = ''

  async start() {
    // Store original directory
    this.originalCwd = Deno.cwd()

    // Create test directory
    this.testDir = join(this.originalCwd, 'test-mcp-workspace')
    try {
      await Deno.mkdir(this.testDir, { recursive: true })
    } catch {
      // Directory might already exist
    }
    Deno.chdir(this.testDir)

    // Start the MCP server process
    this.process = new Deno.Command('deno', {
      args: ['run', '--allow-all', '../src/mcp/server.ts'],
      stdout: 'inherit', // No streams to close
      stderr: 'inherit',
    }).spawn()

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  async stop() {
    if (this.process) {
      this.process.kill('SIGTERM')
      await this.process.status
      this.process = null
    }

    // Restore original directory
    Deno.chdir(this.originalCwd)

    // Clean up test directory
    await Deno.remove(this.testDir, { recursive: true })
  }
}
