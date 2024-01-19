import { visit } from "unist-util-visit"
import type { Root } from "mdast"
import type { Plugin, Transformer } from "unified"

export function removeComments(): Plugin<any[], Root> {
  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "html", (node) => {
      if (node.value.startsWith("<!--")) {
        node.value = `{/*${node.value.replace("<!--", "").replace("-->", "")}*/}`
      }
    })
  }
  return function attacher() {
    return transformer
  }
}
