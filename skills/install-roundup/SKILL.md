---
name: install-roundup
description: >-
  Use when installing or configuring roundup (Oxlint rules that keep agent plans
  and design specs out of source) in a repository.
---

# Install roundup

Roundup keeps the garden weed free: vendored Oxlint rules plus a git path check so agent plans/specs do not get committed.

## Steps

1. Copy this repository's `src/` into the target repo at `tools/oxlint/roundup/` (real directory, not a dangling symlink).
2. If the repo already uses Oxlint, install `@oxlint/plugins` at the **same exact version** as `oxlint`. Otherwise install current matching versions of both.
3. Merge into `oxlint.config.ts` (or `.oxlintrc.json`):
   - `jsPlugins`: `{ name: "roundup", specifier: "./tools/oxlint/roundup/index.ts" }`
   - rules: `roundup/no-weed-path` and `roundup/no-weed-import` at `"error"`
   - `ignorePatterns`: agent dirs (`.cursor/**`, `.claude/**`, …) and `tools/oxlint/roundup/**`
4. Add a CI / `pnpm check` step: `tsx tools/oxlint/roundup/check-paths.ts` (tracked files only).
5. Run Oxlint and the path check; fix or gitignore any reported weeds.

## Do not

- Ban `*.spec.ts` test files — roundup targets plan/design-spec docs, not test suites.
- Publish secrets or force-replace a customized vendored tree on update.
