---
applyTo: '**'
---

Use console.error() + return for CLI command validation errors instead of throwing.

Use try/catch for system errors like file operations and imports.

CLI tools should provide clean error messages for user mistakes, not stack traces.

Avoid type assertions at all costs - use proper typing and runtime checks instead.

Use line comments (//) instead of block comments (/* */) for consistency.

Use truthy checks (if (!variable)) consistently instead of mixing with type checks.

Use array.join() for multiline strings instead of string concatenation.

In try/catch blocks, use 'e' as error parameter name and pass 'e' directly to console.error() as second parameter.

Keep function parameters on one line unless they exceed line width limits.

Define callback functions as const arrow functions before passing to other functions instead of inline.

Empty early returns must have a comment explaining why the function is exiting.
