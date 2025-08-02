# Agents Configuration

## Commands
`deno task dev`: start CLI | `deno task build`: compile | `deno task install`: install globally
`deno task test`: all tests | `deno test --allow-all <file>`: single test file
`deno fmt && deno lint`: format & lint | `deno check src/cli.ts`: type check

## Code Style
- 2 spaces, trailing commas, no semicolons, single quotes, width 240
- `type` not `interface`, arrow functions, avoid `as`, runtime checks
- JSR imports (`jsr:@std/testing/bdd`), Deno syntax, Zod schemas
- BDD tests: `describe`/`it` with `testFn`, TDD style
- Composition > inheritance, functional patterns, minimal config
- `return await` for promises, `try/catch` for system errors
- `console.error()` + return for CLI validation

## Rules
- No post-task summaries (reply "Done.")
- Use `git mv` for file moves, combine similar commands
- Use `grep`/`find`/`ls` for searching, not manual editing
- Load env vars: `env $(cat .env)` prefix if commands fail
