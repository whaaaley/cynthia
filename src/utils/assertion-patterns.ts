// Last updated: June 29, 2025
// https://jsr.io/@std/assert

type AssertionPatterns = {
  [key: string]: {
    argIndex: number
    template: string
    description: string
  }
}

export const assertionPatterns: AssertionPatterns = {
  // Equality assertions
  'assertEquals': {
    argIndex: 0,
    template: 'should equal',
    description: 'Make an assertion that actual and expected are equal, deeply. If not deeply equal, then throw.',
  },
  'assertStrictEquals': {
    argIndex: 0,
    template: 'should strictly equal',
    description: 'Make an assertion that actual and expected are strictly equal, using Object.is for equality comparison. If not, then throw.',
  },
  'equal': {
    argIndex: 0,
    template: 'should equal',
    description: 'Deep equality comparison used in assertions.',
  },
  'assertNotEquals': {
    argIndex: 0,
    template: 'should not equal',
    description: 'Make an assertion that actual and expected are not equal, deeply. If not then throw.',
  },
  'assertNotStrictEquals': {
    argIndex: 0,
    template: 'should not strictly equal',
    description: 'Make an assertion that actual and expected are not strictly equal, using Object.is for equality comparison. If the values are strictly equal then throw.',
  },

  // Numeric comparisons
  'assertGreater': {
    argIndex: 0,
    template: 'should be greater than',
    description: 'Make an assertion that actual is greater than expected. If not then throw.',
  },
  'assertGreaterOrEqual': {
    argIndex: 0,
    template: 'should be greater than or equal to',
    description: 'Make an assertion that actual is greater than or equal to expected. If not then throw.',
  },
  'assertLess': {
    argIndex: 0,
    template: 'should be less than',
    description: 'Make an assertion that actual is less than expected. If not then throw.',
  },
  'assertLessOrEqual': {
    argIndex: 0,
    template: 'should be less than or equal to',
    description: 'Make an assertion that actual is less than or equal to expected. If not then throw.',
  },
  'assertAlmostEquals': {
    argIndex: 0,
    template: 'should approximately equal',
    description:
      'Make an assertion that actual and expected are almost equal numbers through a given tolerance. It can be used to take into account IEEE-754 double-precision floating-point representation limitations. If the values are not almost equal then throw.',
  },

  // String and pattern matching
  'assertMatch': {
    argIndex: 0,
    template: 'should match pattern',
    description: 'Make an assertion that actual match RegExp expected. If not then throw.',
  },
  'assertNotMatch': {
    argIndex: 0,
    template: 'should not match pattern',
    description: 'Make an assertion that actual not match RegExp expected. If match then throw.',
  },
  'assertStringIncludes': {
    argIndex: 0,
    template: 'should include',
    description: 'Make an assertion that actual includes expected. If not then throw.',
  },

  // Array and object operations
  'assertArrayIncludes': {
    argIndex: 0,
    template: 'should include',
    description: 'Make an assertion that actual includes the expected values. If not then an error will be thrown.',
  },
  'assertObjectMatch': {
    argIndex: 0,
    template: 'should match object',
    description: 'Make an assertion that expected object is a subset of actual object, deeply. If not, then throw a diff of the objects, with mismatching properties highlighted.',
  },

  // Type checking
  'assertInstanceOf': {
    argIndex: 0,
    template: 'should be instance of',
    description: 'Make an assertion that obj is an instance of type. If not then throw.',
  },
  'assertNotInstanceOf': {
    argIndex: 0,
    template: 'should not be instance of',
    description: 'Make an assertion that obj is not an instance of type. If so, then throw.',
  },

  // Truthiness and existence
  'assert': {
    argIndex: -1,
    template: 'should be truthy',
    description: 'Make an assertion, error will be thrown if expr does not have truthy value.',
  },
  'assertFalse': {
    argIndex: -1,
    template: 'should be falsy',
    description: 'Make an assertion, error will be thrown if expr have truthy value.',
  },
  'assertExists': {
    argIndex: -1,
    template: 'should exist',
    description: 'Make an assertion that actual is not null or undefined. If not then throw.',
  },

  // Error handling
  'assertThrows': {
    argIndex: 0,
    template: 'should throw',
    description: 'Executes a function, expecting it to throw. If it does not, then it throws.',
  },
  'assertRejects': {
    argIndex: 0,
    template: 'should reject with',
    description: 'Executes a function which returns a promise, expecting it to reject.',
  },
  'assertIsError': {
    argIndex: 0,
    template: 'should be error of type',
    description: 'Make an assertion that error is an Error. If not then an error will be thrown. An error class and a string that should be included in the error message can also be asserted.',
  },

  // Control flow
  'fail': {
    argIndex: -1,
    template: 'should fail',
    description: 'Forcefully throws a failed assertion.',
  },
  'unimplemented': {
    argIndex: -1,
    template: 'should be unimplemented',
    description: 'Use this to stub out methods that will throw when invoked.',
  },
  'unreachable': {
    argIndex: -1,
    template: 'should be unreachable',
    description: 'Use this to assert unreachable code.',
  },
} as const
