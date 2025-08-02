import { findUp } from 'find-up-simple'

export type TestFailure = {
  type: 'assertion' | 'syntax' | 'runtime' | 'timeout'
  message: string
  expected?: string
  actual?: string
}

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

const readCynthiaInstructions = async (cwd?: string) => {
  const instructionsPath = await findUp('.github/cynthia-instructions.md', { cwd })

  if (!instructionsPath) {
    return []
  }

  const instructions = await Deno.readTextFile(instructionsPath)
  return instructions.trim().split('\n').filter((line) => line.trim())
}

const createSystemPrompt = (cynthiaInstructions: string[] = []) => {
  if (cynthiaInstructions.length > 0) {
    const personalSection = [
      'Additional personalization instructions:',
      ...cynthiaInstructions,
    ]

    return [...coreInstructions, ...personalSection].join('\n')
  }

  return coreInstructions.join('\n')
}

const formatFailureMessage = (failure: TestFailure): string => {
  const { type, message, expected, actual } = failure
  let failureText = `- ${type}: ${message}`

  if (expected && actual) {
    failureText += `\n  Expected: ${expected}\n  Actual: ${actual}`
  }

  return failureText
}

export const createRefinementPrompt = (originalPrompt: string, failures: TestFailure[], previousCode?: string): string => {
  const failurePrompt = [
    'Previous attempt failed with errors:',
    failures.map(formatFailureMessage).join('\n'),
  ].join('\n')

  return [
    originalPrompt,
    failurePrompt,
    previousCode && ['Previous code:', previousCode].join('\n'),
    'Please fix these issues and try again.',
  ].filter(Boolean).join('\n\n')
}

export const createPrompts = async (cwd?: string) => {
  const cynthiaInstructions = await readCynthiaInstructions(cwd)

  if (cynthiaInstructions.length > 0) {
    console.log('Using personalization instructions from .github/cynthia-instructions.md')
  }

  return {
    systemPrompt: createSystemPrompt(cynthiaInstructions),
    cynthiaInstructions,
  }
}
