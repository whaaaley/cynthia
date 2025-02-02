# Cynthia

A proof of concept code synthesis command line tool.

## Roadmap

- [ ] Benchmarks and performance thresholds
- [ ] Rollbacks
- [ ] Status command
- [ ] Add more models + DeepSeek R1 by default
- [ ] Add Go language support
- [ ] Personalization
- [ ] Prompt user to generate initial tests

## Why?

If you're going to have an LLM write your project, you should at least do it in a constrained environment.

Using Cynthia is like writing unit tests... but without implementing anything to test. Your "tests" both generate code that satisfies the test suite and verify the generated code works.

## How do generations work?

Just like database migrations!

1. Create a `.cynthia` dir, or do this yourself with `mkdir -p`

```sh
cyn init
```

1. Create a `.cyn.ts` file: (cyn - pronounced "sin" /sɪn/)

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

Ensure that you have your `OPEN_API_KEY` in your environment. The model is `gpt-4o-mini` and it's currently not configurable.

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

## Installation

Complete transparency here; I don't know how to develop command line tools in Deno yet. But you can get this working by cloning the repo and running `deno task link`. This will create a symlink from `cyn.sh` to `~/.deno/bin/cyn`. Then you
should be able to use all `cyn` commands anywhere.

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
