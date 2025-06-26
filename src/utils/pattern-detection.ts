export const patternKeywords = {
  negation: ['not', 'false'],
  throwing: ['throw'],
  equality: ['equal', 'tobe', 'match'],
  existence: ['exist', 'defined', 'null', 'undefined'],
  comparison: ['greater', 'less'],
  boolean: ['true', 'truthy', 'falsy'],
  contains: ['contain', 'include'],
  type: ['instanceof'],
} as const

export const detectPattern = (functionName: string) => {
  const fn = functionName.toLowerCase()

  for (const [pattern, keywords] of Object.entries(patternKeywords)) {
    if (keywords.some((keyword) => fn.includes(keyword))) {
      return pattern
    }
  }

  return 'generic'
}
