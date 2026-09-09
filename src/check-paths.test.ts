import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { checkPaths, findWeedPaths } from "./check-paths.ts";

assert.deepEqual(
  findWeedPaths(["src/a.ts", "plans/x.md", "src/a.spec.ts", "auth.spec.md"]),
  ["auth.spec.md", "plans/x.md"],
);

const root = mkdtempSync(path.join(tmpdir(), "roundup-"));
spawnSync("git", ["init"], { cwd: root, encoding: "utf8" });
spawnSync("git", ["config", "user.email", "roundup@example.com"], { cwd: root });
spawnSync("git", ["config", "user.name", "roundup"], { cwd: root });
mkdirSync(path.join(root, "src"), { recursive: true });
mkdirSync(path.join(root, "plans"), { recursive: true });
writeFileSync(path.join(root, "src", "ok.ts"), "export {};\n");
writeFileSync(path.join(root, "plans", "weed.md"), "# plan\n");
spawnSync("git", ["add", "."], { cwd: root });
spawnSync("git", ["commit", "-m", "init"], { cwd: root });

const dirty = checkPaths({ cwd: root });
assert.equal(dirty.weeds.length, 1);
assert.equal(dirty.weeds[0], "plans/weed.md");

spawnSync("git", ["rm", "-f", "plans/weed.md"], { cwd: root });
spawnSync("git", ["commit", "-m", "clear"], { cwd: root });
const clean = checkPaths({ cwd: root });
assert.deepEqual(clean.weeds, []);

console.log("check-paths.test.ts: ok");
