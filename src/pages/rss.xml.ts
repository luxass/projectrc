import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import sanitizeHtml from "sanitize-html"
import MarkdownIt from "markdown-it"

const parser = new MarkdownIt()

export async function GET({ site }: APIContext) {
  const posts: any[] = []
  return rss({
    title: "luxass's projects",
    description: "projects for luxass",
    site: site?.toString() || "https://projectrc.luxass.dev",
    items: posts.map(({ body, slug, data: { title, description, date: pubDate } }) => ({
      title,
      description,
      pubDate,
      link: `/posts/${slug}`,
      content: sanitizeHtml(parser.render(body)),
    })),
    stylesheet: "/rss/styles.xsl",
  })
}
