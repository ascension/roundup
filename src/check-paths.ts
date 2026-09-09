#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  DEFAULT_WEED_PATTERNS,
  isWeedPath,
  type WeedPathOptions,
} from "./shared/weed-paths.ts";

export type CheckPathsArgs = {
  cwd?: string;
  includeUntracked?: boolean;
  patterns?: string[];
  allowPatterns?: string[];
};

export function listGitFiles(cwd: string, includeUntracked: boolean): string[] {
  const args = includeUntracked
    ? ["ls-files", "-c", "-o", "--exclude-standard"]
    : ["ls-files", "-c"];
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || "git ls-files failed";
    throw new Error(stderr);
  }
  return (result.stdout ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function findWeedPaths(
  files: readonly string[],
  options: WeedPathOptions = {},
): string[] {
  return files.filter((file) => isWeedPath(file, options)).sort();
}

export function checkPaths(args: CheckPathsArgs = {}): {
  weeds: string[];
  checked: number;
} {
  const cwd = args.cwd ?? process.cwd();
  const files = listGitFiles(cwd, args.includeUntracked ?? false);
  const options: WeedPathOptions = {
    patterns: args.patterns ?? [...DEFAULT_WEED_PATTERNS],
    allowPatterns: args.allowPatterns,
  };
  return { weeds: findWeedPaths(files, options), checked: files.length };
}

function parseArgs(argv: string[]): CheckPathsArgs & { help?: boolean } {
  const out: CheckPathsArgs & { help?: boolean } = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--include-untracked") {
      out.includeUntracked = true;
      continue;
    }
    if (arg === "--cwd") {
      out.cwd = argv[++i];
      continue;
    }
    if (arg === "--pattern") {
      out.patterns ??= [];
      out.patterns.push(argv[++i]!);
      continue;
    }
    if (arg === "--allow") {
      out.allowPatterns ??= [];
      out.allowPatterns.push(argv[++i]!);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function main(): void {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    process.stdout.write(`roundup-check — fail if git-tracked plan/spec weeds exist

Usage:
  pnpm roundup:paths [--include-untracked] [--cwd DIR] [--pattern GLOB]... [--allow GLOB]...

By default only git-tracked files are checked (git ls-files).
`);
    process.exit(0);
  }

  try {
    const { weeds, checked } = checkPaths(parsed);
    if (weeds.length === 0) {
      process.stdout.write(`roundup: ${checked} paths checked, garden is clear\n`);
      process.exit(0);
    }
    process.stderr.write(
      `roundup: found ${weeds.length} weed path(s) in ${checked} tracked file(s):\n`,
    );
    for (const weed of weeds) {
      process.stderr.write(`  - ${weed}\n`);
    }
    process.stderr.write(
      "Pull these plans/specs out of source (or gitignore / allowlist intentionally).\n",
    );
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`roundup: ${message}\n`);
    process.exit(2);
  }
}

const entry = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === entry) {
  main();
}
