import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import vercel from "@astrojs/vercel/serverless";
import escapeStringRegexp from "escape-string-regexp";
import mdx from "@astrojs/mdx";

import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Transformer } from "unified";
import SCHEMA from "@luxass/projectrc/json-schema";

export interface ReplaceOptions {
  replacements: Record<string, string>
}

export function replace(
  options?: Readonly<ReplaceOptions> | null | undefined,
): Transformer<Root> {
  const replacements = options?.replacements || {};
  const attachPrefix = (str: string) => `%${str}`;

  // Removes prefix from the start of the string.
  const stripPrefix = (str: string) => str.replace(/^%/, "");

  // RegExp to find any replacement keys.
  const regexp = RegExp(
    `(${Object.keys(replacements)
      .map((key) => escapeStringRegexp(attachPrefix(key)))
      .join("|")})`,
    "g",
  );

  const replacer = (_match: any, name: string) =>
    replacements[stripPrefix(name)];

  const transformer: Transformer<Root> = (tree) => {
    visit(tree, ["text", "html", "code", "inlineCode", "link"], (node) => {
      if (node.type === "link") {
        const processedText = node.url.replace(regexp, replacer);
        node.url = processedText;
      } else {
        // @ts-expect-error - `value` is not defined..
        const processedText = node.value.replace(regexp, replacer);
        // @ts-expect-error - `value` is not defined..
        node.value = processedText;
      }
    });
  };

  return transformer;
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    mdx(),
  ],
  compressHTML: false,
  markdown: {
    shikiConfig: {
      experimentalThemes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
    remarkPlugins: [
      [
        replace,
        {
          replacements: {
            SCHEMA: JSON.stringify(SCHEMA, null, 2),
          },
        },
      ],
    ],
  },
  output: "server",
  adapter: vercel(),
});
