import { RuleTester } from "oxlint/plugins-dev";

import { noWeedPathRule } from "./no-weed-path.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "weedPath" };

tester.run("roundup/no-weed-path", noWeedPathRule, {
  valid: [
    { code: "export const ok = 1;\n", filename: "src/lib/ok.ts" },
    { code: "export const ok = 1;\n", filename: "src/foo.spec.ts" },
    { code: "export const ok = 1;\n", filename: "specs/unit/math.ts" },
  ],
  invalid: [
    {
      code: "export const plan = true;\n",
      filename: "plans/next-steps.ts",
      errors: [error],
    },
    {
      code: "export {};\n",
      filename: "/repo/design-specs/api.ts",
      errors: [error],
    },
    {
      code: "export {};\n",
      filename: "docs/plan/outline.ts",
      errors: [error],
    },
  ],
});
