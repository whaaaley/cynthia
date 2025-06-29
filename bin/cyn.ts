#!/usr/bin/env -S deno run --allow-all

import { main } from '../src/cli.ts'

if (import.meta.main) {
  await main(Deno.args)
}
