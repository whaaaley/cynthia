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
