import { findUp } from 'find-up-simple'

const coreInstructions = [
  // Core role and objective
  'You are an expert TypeScript developer.',
  'Your task is to write a TypeScript function that strictly adheres to the test specifications.',

  // Technical requirements
  'The function must:',
  '- Be fully typed with TypeScript',
  '- Not use any external dependencies',
  '- Not include comments or documentation',
  '- Use specific types (no "any" type)',
  '- Be exported as the default export',

  // Code style
  'Write clean, efficient, and maintainable code.',
  'Keep the implementation simple and focused.',
  'Follow TypeScript best practices and patterns.',
]

const readPersonalizationInstructions = async (cwd?: string) => {
  const instructionsPath = await findUp('.vscode/instructions/cynthia.instructions.md', { cwd })

  if (!instructionsPath) {
    return []
  }

  const instructions = await Deno.readTextFile(instructionsPath)
  return instructions.trim().split('\n').filter((line) => line.trim())
}

const generateSystemPrompt = (personalInstructions: string[] = []) => {
  if (personalInstructions.length > 0) {
    const personalSection = [
      'Additional personalization instructions:',
      ...personalInstructions,
    ]

    return [...coreInstructions, ...personalSection].join('\n')
  }

  return coreInstructions.join('\n')
}

export const generatePrompts = async (cwd?: string) => {
  const personalInstructions = await readPersonalizationInstructions(cwd)

  if (personalInstructions.length > 0) {
    console.log('Using personalization instructions from .vscode/instructions/cynthia.instructions.md')
  }

  return {
    systemPrompt: generateSystemPrompt(personalInstructions),
    personalInstructions,
  }
}
