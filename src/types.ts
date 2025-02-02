export type Expectation = {
  input: unknown[]

  toBe?: unknown
  toMatchObject?: unknown

  'not.toBe'?: unknown
  'not.toMatchObject'?: unknown
}

export type Test = {
  name: string
  expects: Expectation[]
}

export type Suite = {
  name: string
  tests: Test[]
}

export type TestState = {
  suites: Suite[]
}
