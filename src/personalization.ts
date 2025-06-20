import { findUp } from 'find-up-simple'

export const readPersonalizationInstructions = async (cwd?: string) => {
  const instructionsPath = await findUp('.vscode/instructions/cynthia.instructions.md', { cwd })

  if (!instructionsPath) {
    return []
  }

  const instructions = await Deno.readTextFile(instructionsPath)
  return instructions.trim().split('\n').filter((line) => line.trim())
}
