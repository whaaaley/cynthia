# Cynthia

A proof of concept code synthesis command line tool. The CLI command is `cyn` (pronounced "sin" /sɪn/).

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
- [ ] Rollbacks
- [ ] Status command
- [ ] Add more models + DeepSeek R1 by default (Use Unified AI SDK)
- [ ] Cucumber/Gherkin support
- [ ] Prompt user to generate initial tests
- [ ] Add generation retries (agentic)
- [ ] Add a journal feature similar to drizzle-journal

## Why?

If you're going to have an LLM write your project, you should at least do it in a constrained environment.

Using Cynthia is like writing unit tests... but without implementing anything to test. Your "tests" both generate code that satisfies the test suite and verify the generated code works.

## How do generations work?

Just like database migrations!

1. Initialize your project:

```sh
cyn init
```

This creates a `cynthia.config.ts` file with default settings and a `.cynthia` directory.

1. Create a `.cyn.ts` file:

```sh
cyn create apple-bottom-jeans
```

This creates `apple-bottom-jeans.cyn.ts` in the CWD with a starter template.

1. Write your synthetic function using BDD-style tests.

What does this function do? No idea! That's Cynthia's job.*

```ts
import { createTestSuites, runTestSuites } from 'cynthia'
import testFn from './hello-world.ts' // This will be generated for you later, you still need to import it though

const t = createTestSuites()

t.describe('Fruit Tests', () => {
  t.it('should identify an apple as a fruit', () => {
    const input = ['apple']
    t.expect(input).toBe('fruit')
  })

  t.it('should not identify a carrot as a fruit', () => {
    const input = ['carrot']
    t.expect(input).not.toBe('fruit')
  })

  t.it('should match fruit object properties', () => {
    const input = { name: 'apple', type: 'fruit', color: 'red' }
    t.expect(input).toMatchObject({
      type: 'fruit',
      color: 'red',
    })
  })

  t.it('should not match vegetable object properties', () => {
    const input = { name: 'apple', type: 'fruit', color: 'red' }
    t.expect(input).not.toMatchObject({
      type: 'vegetable',
      color: 'orange',
    })
  })
})

runTestSuites(t.getState(), testFn)

export default t.getState()
```

1. Generate your synthetic function.

Ensure that you have your `OPENAI_API_KEY` in your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys). The default model is `gpt-4o-mini` but this can be configured (see [Configuration](#configuration) section).

```sh
cyn gen apple-bottom-jeans.cyn.ts
```

Wait while your function is generated and tested. On success, you'll get:

- `apple-bottom-jeans.ts` next to your `.cyn.ts` file
- `1738397981482-apple-bottom-jeans.gen.ts` in your `.cynthia` directory

The `.gen.ts` file contains the LLM output while the `.ts` file is just an export of the `.gen.ts` file's default export, allowing easy rollbacks when you forget test cases or the LLM gets creative.

1. ~~Pray~~ Use your synthetic code.*

```ts
import appleBottomJeans from './apple-bottom-jeans.ts'

console.log(appleBottomJeans(['apple']))
// => 'fruit'
```

## Configuration

Cynthia can be configured using a `cynthia.config.ts` file in your project root.

### Configuration Options

#### OpenAI Settings

- `model`: OpenAI model to use (default: 'gpt-4o-mini')
- `temperature`: Controls randomness (0.0-2.0, default: 0.1)
- `maxTokens`: Optional token limit for responses

#### Generation Settings

- `maxRetries`: Number of generation retries on failure (default: 3)

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
# Install from JSR (when published)
deno install --global --allow-all jsr:cynthia

# Or install from source
deno task install
```

### Option 2: Local Development

Clone the repository and install locally:

```bash
git clone https://github.com/youruser/cynthia.git
cd cynthia
deno task install
```

### Option 3: Add as Library Dependency

Use Cynthia's core functions in your project:

```bash
# Add to Deno project
deno add jsr:cynthia

# Add to Node.js project
npm install cynthia
```

## FAQ

### Help! I can't get my tests to pass!

You and me both.

### What if I write an impossible test?

All hope is lost.*

### How to contribute

Feel free.

### How do I know if Cynthia is right for me?*

![img](flow-chart.png)

### Should I actually use this?

Probably not.*

## Warning from the Author*

While there are merits to using AI for debugging, you should never rely purely on unit tests for code generation. When the code breaks, and it _will_ break, if you don't understand how the code works you won't know what test cases to add or
update to fix the broken generation. Additionally, if you don't even know what you want, neither will the system.

Using LLMs to write code is extremely fragile. I created this project as an attempt to bring some sanity and structure back into the world for all you LLM ~~sinners~~ _developers_ out there. We both know you're not going to stop using LLMs
any time soon. Now, if you use Cynthia, you have at least _some_ unit tests.
