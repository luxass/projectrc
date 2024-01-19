import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";

interface Options {
  repoUrl: string
}

export function rewriteUrls(options: Options): Plugin<any[], Root> {
  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "link", (node) => {
      if (!node?.url) {
        throw new Error("missing url");
      }

      if (node.url.startsWith("http")) {
        return;
      }

      node.url = new URL(node.url, `${options.repoUrl}/blob/main/`).toString();
    });
  };
  return function attacher() {
    return transformer;
  };
}
