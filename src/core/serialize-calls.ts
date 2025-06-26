import { capitalCase } from 'change-case'
import { formatPattern } from './pattern-formatting.ts'

type CapturedCall = {
  function: string
  args: unknown[]
}

export const serializeCalls = (capturedCalls: CapturedCall[]) => {
  const lines: string[] = []

  for (const call of capturedCalls) {
    const capitalizedFn = capitalCase(call.function)

    if (call.function === 'describe') {
      lines.push(`${capitalizedFn} ${call.args[0]}:`)
    } else if (call.function === 'it') {
      lines.push(`  ${capitalizedFn} ${call.args[0]}:`)
    } else {
      const formattedAssertion = formatPattern(call.function, call.args)
      lines.push(`    ${formattedAssertion}`)
    }
  }

  return lines.join('\n')
}
