# Cynthia

A code synthesis command line tool that brings structure to AI-powered development.

## Table of Contents

- [Roadmap](#roadmap)
- [Why?](#why)
- [How do generations work?](#how-do-generations-work)
- [Configuration](#configuration)
- [Personalization](#personalization)
- [Installation](#installation)
- [FAQ](#faq)
- [Warning from the Author](#warning-from-the-author)

## Roadmap

- [ ] Benchmarks and performance thresholds
- [ ] Add more models + DeepSeek R1 by default (Use Unified AI SDK)
- [ ] Add a journal feature similar to drizzle-journal (status, history, rollbacks)

## Why?

If you're going to use AI to write code, you need to test thoroughly.

Cynthia is test-driven development with AI. You write unit tests first, then let AI implement the solution. Your tests both specify exactly what you want and automatically verify that the generated code works correctly.

## How do generations work?

Just like database migrations!

1. Initialize your project:

```sh
cyn init
```

This creates a `cynthia.config.ts` file with default settings and a `.cynthia` directory.

2. Create a test file:

```sh
cyn create phone-number-formatter
```

This creates `phone-number-formatter.test.ts` in the current directory with a starter template and `phone-number-formatter.ts` as a placeholder implementation file.

3. Write your synthetic function using BDD-style tests:

```ts
// @ts-nocheck: imports generated code that may not exist yet
/* eslint-disable */

import * as assert from 'jsr:@std/assert'
import * as bdd from 'jsr:@std/testing/bdd'
import { cynthia } from 'jsr:@cynthia/cynthia'
import testFn from './phone-number-formatter.ts'

const { assertEquals, describe, it, serializeTest } = cynthia({ assert, bdd })

describe('Phone number formatter', () => {
  it('should format 10-digit numbers', () => {
    const result = testFn('1234567890')
    assertEquals(result, '(123) 456-7890')
  })

  it('should handle numbers with dashes', () => {
    const result = testFn('123-456-7890')
    assertEquals(result, '(123) 456-7890')
  })

  it('should handle numbers with spaces', () => {
    const result = testFn('123 456 7890')
    assertEquals(result, '(123) 456-7890')
  })
})

export default serializeTest()
```

4. Generate your synthetic function:

Ensure that you have your `OPENAI_API_KEY` in your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys). The default model is `gpt-4o-mini` but this can be configured (see [Configuration](#configuration) section).

```sh
cyn gen phone-number-formatter.test.ts
```

Wait while your function is generated and tested. On success, you'll get:

- `phone-number-formatter.ts` next to your test file
- `1738397981482-phone-number-formatter.gen.ts` in your `.cynthia` directory
- `1738397981482-phone-number-formatter.prompt.txt` in your `.cynthia` directory

The `.gen.ts` file contains the LLM output while the `.ts` file is just an export of the `.gen.ts` file's default export, allowing easy rollbacks when you forget test cases or the LLM gets creative. The `.prompt.txt` file contains the exact
prompt sent to the LLM for debugging purposes.

5. Use your generated code:

```ts
import formatPhoneNumber from './phone-number-formatter.ts'

console.log(formatPhoneNumber('1234567890'))
// => '(123) 456-7890'
```

## Configuration

Cynthia can be configured using a `cynthia.config.ts` file in your project root.

### Configuration Options

#### OpenAI Settings

- `model`: OpenAI model to use (default: 'gpt-4o-mini')
- `temperature`: Controls randomness (0.0-2.0, default: 0)
- `maxTokens`: Optional token limit for responses
- `seed`: Seed for deterministic responses (default: timestamp, override for reproducibility)

#### Generation Settings

- `maxRetries`: Number of agentic retries when tests fail (default: 3)

#### Testing Settings

- `runTestsAfterGeneration`: Automatically run tests after generation (default: true)

#### CLI Settings

- `confirmGenerations`: Prompt for confirmation before generating (default: false)

## Personalization

Customize code generation with personalized instructions.

### Setup

```sh
mkdir -p .vscode/instructions
touch .vscode/instructions/cynthia.instructions.md
```

Add instructions, one per line:

```
Use functional programming patterns
Use descriptive variable names
Prefer map, filter, reduce over loops
Use type guards for runtime checks
Use switch for multiple conditions
```

### Behavior

Cynthia searches for `.vscode/instructions/cynthia.instructions.md` by walking up the directory tree from the current working directory. Instructions are added to the code generation prompt. Works from any subdirectory.

## Installation

### Option 1: Global Installation (Recommended)

Install Cynthia globally using Deno:

```bash
# Install from JSR
deno install --global --allow-all jsr:@cynthia/cynthia

# Or install from source
git clone https://github.com/whaaaley/cynthia.git
cd cynthia
deno task install
```

### Option 2: Local Development

Clone the repository and install locally:

```bash
git clone https://github.com/whaaaley/cynthia.git
cd cynthia
deno task install
```

### Option 3: Add as Library Dependency

Use Cynthia's core functions in your project:

```bash
# Add to Deno project
deno add jsr:@cynthia/cynthia
```

## FAQ

### Help! I can't get my tests to pass!

Cynthia uses an agentic retry system - it will automatically try multiple times to generate code that satisfies your tests.

If it can't, you might need to refine your test cases or break down complex requirements into smaller, clearer tests.

### What if I write an impossible test?

Cynthia will attempt to solve it multiple times before giving up gracefully. The system is designed to handle edge cases and provide clear feedback about what went wrong.

### How to contribute

We welcome contributions! The project is actively evolving with clear architecture for extending functionality.

### How do I know if Cynthia is right for me?

![img](flow-chart.png)

### Should I actually use this?

Cynthia provides a structured approach to AI-assisted development. It's particularly useful for:

- Rapid prototyping with clear requirements
- Test-driven development workflows
- Projects where you want AI assistance but with proper guardrails

## Important Considerations

While AI-assisted development can be incredibly productive, it's important to understand what you're building. Cynthia encourages good practices by requiring you to write comprehensive tests first, but you should still:

- Understand the problem you're trying to solve
- Review and understand the generated code
- Add additional test cases as you discover edge cases
- Use this as a tool to enhance your development workflow, not replace your understanding

Cynthia aims to bring structure and testing discipline to AI-powered development. By requiring test-first development, you'll end up with better specifications and more reliable code.
