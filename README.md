# roundup

[![skills.sh](https://skills.sh/b/ascension/roundup)](https://skills.sh/ascension/roundup)

**Rules for keeping your garden weed free.**

Opinionated Oxlint rules (and a git path check) that keep agent plans and design specs out of source.

Roundup is meant to be **vendored**, not treated as a fixed npm dependency. Copy the rules into your repository, read them, and change the weed globs to match your team's beds. Community forks are welcome.

Inspired by [anti-slop](https://github.com/dmmulroy/anti-slop)'s packaging — Oxlint JS plugins you own — with a gardening metaphor instead of code-taste rules.

## Why two tools?

Oxlint walks JavaScript and TypeScript. Most agent plans are Markdown. So roundup ships:

1. **Oxlint rules** — catch weed paths when they are linted (a `.ts` under `plans/`, or an import of `./PLAN.md`).
2. **`roundup-check`** — `git ls-files` against weed globs and fail CI if tracked plan/spec docs exist.

Use both. The path check is what stops `plans/next.md` from landing in `main`.

## Non-goals

- Does **not** ban Jest/Vitest `*.spec.ts` / `*.spec.js` test files.
- Does **not** replace code review or `.gitignore` for agent scratch dirs.
- Bare `**/specs/**` test trees of `.ts` files are left alone; markdown `*.spec.md` / design-spec folders are weeds.

## Default weed patterns

- `**/plans/**`, `**/plan/**`
- `**/design-specs/**`, `**/design-spec/**`, `**/agent-plans/**`
- `PLAN.md`, `plan.md`, `IMPLEMENTATION_PLAN.md`, `SPEC.md`, `AGENTS_PLAN.md`
- `*-plan.md`, `*.plan.md`, `*-spec.md`, `*.spec.md`

Override with rule options or `--pattern` / `--allow` on the CLI.

## Install with an agent skill

```bash
npx skills add ascension/roundup --skill install-roundup
```

Then ask your coding agent to install roundup in the current repository.

## Manual local installation

Copy `src/` into the target repository, for example at `tools/oxlint/roundup/`. Install matching exact versions of `oxlint` and `@oxlint/plugins`.

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".cursor/**",
    ".gemini/**",
    "tools/oxlint/roundup/**",
  ],
  jsPlugins: [
    { name: "roundup", specifier: "./tools/oxlint/roundup/index.ts" },
  ],
  rules: {
    "roundup/no-weed-path": "error",
    "roundup/no-weed-import": "error",
  },
});
```

### CI path check

```bash
pnpm exec tsx tools/oxlint/roundup/check-paths.ts
```

Or after vendoring the bin wiring:

```bash
pnpm roundup:paths
```

Only **git-tracked** files are checked by default. Local untracked scratch stays quiet unless you pass `--include-untracked`.

## Rules

- `no-weed-path` — reports when the linted file's path matches a weed glob.
- `no-weed-import` — reports relative/`require`/`import()` sources that point at weed paths.

Both accept `{ patterns?: string[]; allowPatterns?: string[] }`.

## Development

Requires **Node.js ≥ 22.18** (Oxlint RuleTester / TS config).

Use the Node.js version pinned in `.nvmrc` for local development.

```bash
nvm install
nvm use
pnpm install
pnpm check
```

## License

MIT
