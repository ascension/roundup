import { defineRule } from "@oxlint/plugins";

import { isWeedPath, resolveWeedOptions } from "../shared/weed-paths.ts";

/** Ban linted files whose path looks like an agent plan or design-spec weed. */
export const noWeedPathRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow source files under plan/spec weed paths. Keep agent plans and design specs out of the garden.",
    },
    schema: [
      {
        type: "object",
        properties: {
          patterns: { type: "array", items: { type: "string" } },
          allowPatterns: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      weedPath:
        "Weed path `{{path}}`. Agent plans and design specs do not belong in source — pull them or gitignore them.",
    },
  },
  createOnce(context) {
    return {
      Program(node) {
        const options = resolveWeedOptions(context.options[0]);
        const filePath = context.filename;
        if (!isWeedPath(filePath, options)) return;
        context.report({
          node,
          messageId: "weedPath",
          data: { path: filePath },
        });
      },
    };
  },
});
