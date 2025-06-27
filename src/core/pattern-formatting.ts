import { sentenceCase } from 'change-case'
import { detectPattern } from './pattern-detection.ts'

const formatValue = (value: unknown): string => {
  return Deno.inspect(value, {
    colors: false,
    compact: true,
  })
}

const equality = (args: unknown[]) => {
  return `Assert that the result equals ${formatValue(args[1])}`
}

const negation = (args: unknown[]) => {
  return `Assert that the result does not equal ${formatValue(args[1])}`
}

const throwing = (args: unknown[]) => {
  const message = args[2] || 'an error'
  return `Assert that the function should throw ${message}`
}

const existence = () => {
  return `Assert that the result exists`
}

const comparison = (args: unknown[], functionName: string) => {
  const operator = functionName.toLowerCase().includes('greater') ? 'greater than' : 'less than'
  return `Assert that the result is ${operator} ${formatValue(args[1])}`
}

const boolean = (_args: unknown[], functionName: string) => {
  const state = functionName.toLowerCase().includes('false') ? 'false' : 'true'
  return `Assert that the result is ${state}`
}

const contains = (args: unknown[]) => {
  return `Assert that the result contains ${formatValue(args[1])}`
}

const type = (args: unknown[]) => {
  return `Assert that the result is type ${formatValue(args[1])}`
}

const generic = (args: unknown[], functionName: string) => {
  const englishName = sentenceCase(functionName)
  const argStr = args.map((arg) => typeof arg === 'function' ? '[Function]' : formatValue(arg)).join(' ')
  return `Assert that the result ${englishName.toLowerCase()} ${argStr}`
}

const patterns = {
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
