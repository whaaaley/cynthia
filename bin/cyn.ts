#!/usr/bin/env -S deno run --allow-all

// Cynthia CLI Binary Entry Point
//
// This file serves as the executable entry point for the Cynthia CLI tool.
// It handles both global installations (via `deno install`) and direct execution.

import { main } from '../src/cli.ts'

if (import.meta.main) {
  await main(Deno.args)
}
