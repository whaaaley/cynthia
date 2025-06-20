---
applyTo: '**'
---

Use console.error() + return for CLI command validation errors instead of throwing.

Use try/catch for system errors like file operations and imports.

CLI tools should provide clean error messages for user mistakes, not stack traces.

Avoid type assertions at all costs - use proper typing and runtime checks instead.
