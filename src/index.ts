import { eslintCompatPlugin } from "@oxlint/plugins";

import { noWeedImportRule } from "./rules/no-weed-import.ts";
import { noWeedPathRule } from "./rules/no-weed-path.ts";

/** Opinionated Oxlint rules for keeping your garden weed free. */
const roundupPlugin = eslintCompatPlugin({
  meta: { name: "roundup" },
  rules: {
    "no-weed-path": noWeedPathRule,
    "no-weed-import": noWeedImportRule,
  },
});

export default roundupPlugin;
