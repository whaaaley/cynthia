export const runDenoTests = async (testFilePath: string) => {
  const process = new Deno.Command('deno', { args: ['test', '-A', testFilePath] })
  const output = await process.output()

  if (output.stdout.length > 0) await Deno.stdout.write(output.stdout)
  if (output.stderr.length > 0) await Deno.stderr.write(output.stderr)

  return output.code
}
