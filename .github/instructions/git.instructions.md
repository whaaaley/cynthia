Rule: Use conventional commit format: `<type>[optional scope]: <description>`
Reason: Enables automated tooling and clear communication

Rule: Keep subject under 50 characters, use present tense imperative, capitalize first word, no trailing punctuation
Reason: Readable in git log and matches git's own conventions

Rule: Use `feat:` for new features, `fix:` for bug fixes, `docs:` for documentation, `refactor:` for code restructuring, `test:` for testing, `chore:` for maintenance
Reason: Core types for semantic versioning and clear categorization

Rule: Add `!` after type or `BREAKING CHANGE:` in footer for breaking changes
Reason: Signals major version bumps in semantic versioning

Rule: Make atomic commits - one logical change per commit
Reason: Easier to review, revert, and understand history

Rule: Use body to explain what and why, not how
Reason: Code shows how, commit message explains motivation

Rule: Avoid adding automated tool attribution, metadata, or AI assistant co-authors (opencode, copilot, windsurf, cursor) in commit messages
Reason: Keep commit history clean and focused on human contributors

Rule: Only use basic local git commands: add, commit, status, log, and reset --soft. No remote operations or branching.
Reason: Keep git usage minimal and safe for basic version control

Rule: Never commit without first asking for explicit confirmation
Reason: Prevents accidental commits and ensures user control over version history
