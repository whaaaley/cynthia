import OpenAI from '@openai/openai'
import { zodResponseFormat } from '@openai/openai/helpers/zod'
import { z } from 'zod'
import { readPersonalizationInstructions } from './personalization.ts'
import type { Expectation, Suite } from './types.ts'

const systemPrompt = (personalInstructions: string[] = []) => {
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

const format = (operator: string) => {
  return (inputStr: string, value: unknown): string => {
    return `  I expect the function, with the arguments \`${inputStr.slice(1, -1)}\`, ${operator} \`${JSON.stringify(value)}\``
  }
}

const EXPECTATION_FORMATTERS = {
  'toBe': format('to be'),
  'toMatchObject': format('to match the object'),
  'not.toBe': format('not to be'),
  'not.toMatchObject': format('not to match the object'),
} as const

const formatExpectation = (expectation: Expectation): string => {
  const inputStr = JSON.stringify(expectation.input)

  const key = Object.keys(expectation)
    .find((k) => k in EXPECTATION_FORMATTERS) as keyof typeof EXPECTATION_FORMATTERS

  if (!key) {
    throw new Error(`Invalid expectation: no valid matcher found in ${JSON.stringify(expectation)}`)
  }

  return EXPECTATION_FORMATTERS[key](inputStr, expectation[key])
}

const userPrompt = (suites: Suite[]): string => {
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

const codeBlockSchema = z.object({
  name: z.string(),
  language: z.literal('typescript'),
  type: z.literal('function'),
  dependencies: z.literal('none'),
  code: z.string(), // Todo: .startsWith('export default').endsWith('}'),
})

const responseSchema = zodResponseFormat(
  codeBlockSchema,
  'typescript_function',
)

export const synthesize = async (suites: Suite[], cwd?: string) => {
  const client = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  console.log('Synthesizing TypeScript from test suites...')

  // Read personalization instructions
  const personalInstructions = await readPersonalizationInstructions(cwd)
  if (personalInstructions.length > 0) {
    console.log('Using personalization instructions from .vscode/instructions/cynthia.instructions.md')
  }

  const prompt = userPrompt(suites)
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt(personalInstructions) },
      { role: 'user', content: prompt },
    ],
    response_format: responseSchema,
    temperature: 0.1,
  })

  // Todo:
  // if (!result.code.startsWith('export default')) {
  //   throw new Error('Code must start with "export default"')
  // }

  // Todo:
  // if (!result.code.endsWith('}')) {
  //   throw new Error('Code must end with closing brace')
  // }

  const [choice] = response.choices
  const { content } = choice.message

  if (typeof content !== 'string') {
    throw new Error('Invalid response format')
  }

  return {
    code: JSON.parse(content).code ?? '',
    prompt,
  }
}
