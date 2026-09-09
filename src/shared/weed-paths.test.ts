import assert from "node:assert/strict";

import {
  DEFAULT_WEED_PATTERNS,
  isWeedImportSource,
  isWeedPath,
  matchesAnyGlob,
} from "./weed-paths.ts";

assert.equal(isWeedPath("src/plans/next.md"), true);
assert.equal(isWeedPath("/repo/plans/foo.ts"), true);
assert.equal(isWeedPath("docs/plan/outline.md"), true);
assert.equal(isWeedPath("design-specs/api.md"), true);
assert.equal(isWeedPath("PLAN.md"), true);
assert.equal(isWeedPath("feature-plan.md"), true);
assert.equal(isWeedPath("auth.spec.md"), true);
assert.equal(isWeedPath("src/foo.spec.ts"), false);
assert.equal(isWeedPath("src/foo.test.ts"), false);
assert.equal(isWeedPath("src/components/Button.tsx"), false);
assert.equal(isWeedPath("specs/unit/foo.ts"), false);
assert.equal(
  isWeedPath("src/plans/keep.ts", { allowPatterns: ["**/plans/keep.ts"] }),
  false,
);

assert.equal(isWeedImportSource("../plans/todo.md"), true);
assert.equal(isWeedImportSource("./PLAN.md"), true);
assert.equal(isWeedImportSource("lodash"), false);
assert.equal(isWeedImportSource("@scope/pkg"), false);

assert.equal(matchesAnyGlob("a/b/c", ["**/b/**"]), true);
assert.ok(DEFAULT_WEED_PATTERNS.length > 0);

console.log("weed-paths.test.ts: ok");
