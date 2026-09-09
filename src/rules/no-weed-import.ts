import { defineRule } from "@oxlint/plugins";

import { isWeedImportSource, resolveWeedOptions } from "../shared/weed-paths.ts";

/** Ban imports that pull agent plans / design-spec weeds into runtime source. */
export const noWeedImportRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing from plan/spec weed paths. Keep the garden free of agent scratch docs.",
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
      weedImport:
        "Importing weed `{{source}}`. Do not pull plans or design specs into source modules.",
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") return;
        const source = node.source.value;
        const options = resolveWeedOptions(context.options[0]);
        if (!isWeedImportSource(source, options)) return;
        context.report({ node: node.source, messageId: "weedImport", data: { source } });
      },
      ExportAllDeclaration(node) {
        if (!node.source) return;
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") return;
        const source = node.source.value;
        const options = resolveWeedOptions(context.options[0]);
        if (!isWeedImportSource(source, options)) return;
        context.report({ node: node.source, messageId: "weedImport", data: { source } });
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return;
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") return;
        const source = node.source.value;
        const options = resolveWeedOptions(context.options[0]);
        if (!isWeedImportSource(source, options)) return;
        context.report({ node: node.source, messageId: "weedImport", data: { source } });
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "require") return;
        const [first] = node.arguments;
        if (!first || first.type !== "Literal" || typeof first.value !== "string") return;
        const source = first.value;
        const options = resolveWeedOptions(context.options[0]);
        if (!isWeedImportSource(source, options)) return;
        context.report({ node: first, messageId: "weedImport", data: { source } });
      },
      ImportExpression(node) {
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") return;
        const source = node.source.value;
        const options = resolveWeedOptions(context.options[0]);
        if (!isWeedImportSource(source, options)) return;
        context.report({ node: node.source, messageId: "weedImport", data: { source } });
      },
    };
  },
});
