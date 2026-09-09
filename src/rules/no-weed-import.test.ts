import { RuleTester } from "oxlint/plugins-dev";

import { noWeedImportRule } from "./no-weed-import.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "weedImport" };

tester.run("roundup/no-weed-import", noWeedImportRule, {
  valid: [
    { code: 'import { x } from "./lib/x.ts";\n', filename: "src/a.ts" },
    { code: 'import lodash from "lodash";\n', filename: "src/a.ts" },
    { code: 'export { x } from "../utils.ts";\n', filename: "src/a.ts" },
    { code: 'const x = require("./lib/x.ts");\n', filename: "src/a.ts" },
  ],
  invalid: [
    {
      code: 'import plan from "../plans/todo.md";\n',
      filename: "src/a.ts",
      errors: [error],
    },
    {
      code: 'export * from "./PLAN.md";\n',
      filename: "src/a.ts",
      errors: [error],
    },
    {
      code: 'const plan = require("./agent-plans/x.ts");\n',
      filename: "src/a.ts",
      errors: [error],
    },
    {
      code: 'const plan = await import("./design-spec/note.md");\n',
      filename: "src/a.ts",
      errors: [error],
    },
  ],
});
