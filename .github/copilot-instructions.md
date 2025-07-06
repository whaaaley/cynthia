---
applyTo: '**'
---

Always use `type` instead of `interface` when defining TypeScript types.

Always use arrow functions instead of function declarations or function expressions.

Always run TypeScript type checking after creating or modifying code to ensure no type errors.

Use console.error() + return for CLI command validation errors instead of throwing.

Use try/catch for system errors like file operations and imports.

CLI tools should provide clean error messages for user mistakes, not stack traces.

Avoid type assertions at all costs - use proper typing and runtime checks instead.

Use line comments (//) instead of block comments (/* */) for consistency.

Use truthy checks (if (!variable)) consistently instead of mixing with type checks.

Use array.join() for multiline strings instead of string concatenation.

Keep function parameters on one line unless they exceed line width limits.

Define callback functions as const arrow functions before passing to other functions instead of inline.

Empty early returns must have a comment explaining why the function is exiting.

This is Cynthia, a test-driven AI code synthesis tool that uses llm-exe for LLM integration.

We use Deno as the runtime environment, not Node.js, so when suggesting commands or imports, use Deno-compatible syntax.

We use JSR (jsr:@) for package imports, not npm packages where possible.

We follow test-driven development - tests are written first, then code is generated to satisfy the tests.

All test files use the Deno testing framework with BDD-style describe/it blocks from `jsr:@std/testing/bdd`.

The function under test must always be called `testFn` and results must be assigned to variables for prompt generation to work correctly.

We use Zod for all schema validation and type generation.

All LLM interactions go through llm-exe for provider abstraction and consistency.

Config is kept minimal and user-focused - complex implementation details are handled internally.

Parser selection is done automatically based on LLM provider - users don't configure parsers.

Always prefer composition over inheritance and functional programming patterns where appropriate.
