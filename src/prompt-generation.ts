import { readPersonalizationInstructions } from './personalization.ts'
import type { Expectation, Suite } from './types.ts'

export const generateSystemPrompt = (personalInstructions: string[] = []) => {
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

  if (personalInstructions.length > 0) {
    const personalSection = [
      'Additional personalization instructions:',
      ...personalInstructions,
    ]

    return [...coreInstructions, ...personalSection].join('\n')
  }

  return coreInstructions.join('\n')
}

const format = (operator: string) => (inputStr: string, value: unknown) => {
  return `  I expect the function, with the arguments \`${inputStr.slice(1, -1)}\`, ${operator} \`${JSON.stringify(value)}\``
}

const EXPECTATION_FORMATTERS = {
  'toBe': format('to be'),
  'toMatchObject': format('to match the object'),
  'not.toBe': format('not to be'),
  'not.toMatchObject': format('not to match the object'),
} as const

const formatExpectation = (expectation: Expectation) => {
  const inputStr = JSON.stringify(expectation.input)

  const key = Object.keys(expectation)
    .find((k) => k in EXPECTATION_FORMATTERS) as keyof typeof EXPECTATION_FORMATTERS

  if (!key) {
    console.error(`Invalid expectation: no valid matcher found in ${JSON.stringify(expectation)}`)
    return ''
  }

  return EXPECTATION_FORMATTERS[key](inputStr, expectation[key])
}

export const generateUserPrompt = (suites: Suite[]) => {
  const formattedSuites = suites.map((suite) => {
    const formattedTests = suite.tests.map((test) => {
      const formattedExpectations = test.expects
        .map(formatExpectation)
        .filter(Boolean)
        .join('\n  ')

      return `  This function ${test.name}:\n  ${formattedExpectations}`
    })

    const testsString = formattedTests.join('\n')
    return `Description: "${suite.name}":\n${testsString}`
  })

  return formattedSuites.join('\n')
}

export const generatePrompts = async (suites: Suite[], cwd?: string) => {
  const personalInstructions = await readPersonalizationInstructions(cwd)

  if (personalInstructions.length > 0) {
    console.log('Using personalization instructions from .vscode/instructions/cynthia.instructions.md')
  }

  return {
    systemPrompt: generateSystemPrompt(personalInstructions),
    userPrompt: generateUserPrompt(suites),
    personalInstructions,
  }
}
