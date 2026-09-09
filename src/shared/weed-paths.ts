import path from "node:path";

/** Default globs for agent plan / design-spec weeds. Does not match `*.spec.ts` tests. */
export const DEFAULT_WEED_PATTERNS: readonly string[] = [
  "**/plans/**",
  "**/plan/**",
  "**/design-specs/**",
  "**/design-spec/**",
  "**/agent-plans/**",
  "**/AGENTS_PLAN.md",
  "**/PLAN.md",
  "**/plan.md",
  "**/IMPLEMENTATION_PLAN.md",
  "**/SPEC.md",
  "**/*-plan.md",
  "**/*.plan.md",
  "**/*-spec.md",
  "**/*.spec.md",
];

export type WeedPathOptions = {
  patterns?: string[];
  allowPatterns?: string[];
};

function normalizeSlashes(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

/** Turn a simple `**` / `*` glob into a anchored RegExp over slash-normalized paths. */
export function globToRegExp(glob: string): RegExp {
  const normalized = normalizeSlashes(glob).replace(/^\.\//, "");
  let source = "^";
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]!;
    if (ch === "*" && normalized[i + 1] === "*") {
      const next = normalized[i + 2];
      if (next === "/") {
        source += "(?:.*/)?";
        i += 2;
      } else {
        source += ".*";
        i += 1;
      }
      continue;
    }
    if (ch === "*") {
      source += "[^/]*";
      continue;
    }
    if (ch === "?") {
      source += "[^/]";
      continue;
    }
    if ("\\.|^$+()[]{}|".includes(ch)) {
      source += `\\${ch}`;
      continue;
    }
    source += ch;
  }
  source += "$";
  return new RegExp(source, "i");
}

export function matchesAnyGlob(filePath: string, patterns: readonly string[]): boolean {
  const candidates = pathVariants(filePath);
  return patterns.some((pattern) => {
    const re = globToRegExp(pattern);
    return candidates.some((candidate) => re.test(candidate));
  });
}

/** Absolute, relative, and basename variants so globs can match in RuleTester and CI. */
export function pathVariants(filePath: string): string[] {
  const normalized = normalizeSlashes(filePath);
  const base = path.posix.basename(normalized);
  const out = new Set<string>([normalized, base]);
  if (normalized.startsWith("/")) {
    out.add(normalized.slice(1));
  }
  // Drop drive letters on Windows-style absolute paths already slash-normalized.
  const withoutDrive = normalized.replace(/^[A-Za-z]:/, "");
  if (withoutDrive !== normalized) {
    out.add(withoutDrive.replace(/^\//, ""));
  }
  return [...out];
}

export function isWeedPath(filePath: string, options: WeedPathOptions = {}): boolean {
  const patterns = options.patterns ?? DEFAULT_WEED_PATTERNS;
  const allowPatterns = options.allowPatterns ?? [];
  if (allowPatterns.length > 0 && matchesAnyGlob(filePath, allowPatterns)) {
    return false;
  }
  return matchesAnyGlob(filePath, patterns);
}

/** True when an import/require source string points at a weed path. */
export function isWeedImportSource(source: string, options: WeedPathOptions = {}): boolean {
  const trimmed = source.trim();
  if (trimmed.length === 0) return false;
  // Only relative or absolute path-like sources; bare package names are not weeds.
  if (!(trimmed.startsWith(".") || trimmed.startsWith("/") || trimmed.startsWith("file:"))) {
    return false;
  }
  const withoutQuery = trimmed.replace(/^file:\/\//, "").split("?")[0] ?? trimmed;
  return isWeedPath(withoutQuery, options);
}

export function resolveWeedOptions(raw: unknown): WeedPathOptions {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  const patterns = Array.isArray(record.patterns)
    ? record.patterns.filter((value): value is string => typeof value === "string")
    : undefined;
  const allowPatterns = Array.isArray(record.allowPatterns)
    ? record.allowPatterns.filter((value): value is string => typeof value === "string")
    : undefined;
  return { patterns, allowPatterns };
}
