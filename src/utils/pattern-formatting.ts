import { sentenceCase } from 'npm:change-case'
import { detectPattern } from './pattern-detection.ts'

const formatValue = (value: unknown): string => {
  return Deno.inspect(value, {
    colors: false,
    compact: true,
  })
}

const equality = (args: unknown[]) => {
  return `Assert that ${formatValue(args[0])} equals ${formatValue(args[1])}`
}

const negation = (args: unknown[]) => {
  return `Assert that ${formatValue(args[0])} does not equal ${formatValue(args[1])}`
}

const throwing = (args: unknown[]) => {
  const message = args[2] || 'an error'
  return `Assert that function throws "${message}"`
}

const existence = (args: unknown[]) => {
  return `Assert that ${formatValue(args[0])} exists`
}

const comparison = (args: unknown[], functionName: string) => {
  const operator = functionName.toLowerCase().includes('greater') ? 'greater than' : 'less than'
  return `Assert that ${formatValue(args[0])} is ${operator} ${formatValue(args[1])}`
}

const boolean = (args: unknown[], functionName: string) => {
  const state = functionName.toLowerCase().includes('false') ? 'false' : 'true'
  return `Assert that ${formatValue(args[0])} is ${state}`
}

const contains = (args: unknown[]) => {
  return `Assert that ${formatValue(args[0])} contains ${formatValue(args[1])}`
}

const type = (args: unknown[]) => {
  return `Assert that ${formatValue(args[0])} is type ${formatValue(args[1])}`
}

const generic = (args: unknown[], functionName: string) => {
  const englishName = sentenceCase(functionName)
  const argStr = args.map((arg) => typeof arg === 'function' ? '[Function]' : formatValue(arg)).join(' ')
  return `${englishName} ${argStr}`
}

export const patterns = {
  equality,
  negation,
  throwing,
  existence,
  comparison,
  boolean,
  contains,
  type,
  generic,
} as const

const isValidPatternKey = (key: string): key is keyof typeof patterns => {
  return key in patterns
}

export const formatPattern = (functionName: string, args: unknown[]) => {
  const patternType = detectPattern(functionName)

  if (isValidPatternKey(patternType)) {
    const pattern = patterns[patternType]
    return pattern(args, functionName)
  }

  throw new Error(`Unknown pattern: ${patternType}`)
}
