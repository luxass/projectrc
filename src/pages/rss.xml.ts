import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getProjects } from '~/lib/projects'

export async function GET({ site }: APIContext) {
  const projects = await getProjects()

  if (!projects) {
    return Response.json({
      error: `no repositories found`,
    }, {
      status: 404,
    })
  }

  return rss({
    title: 'luxass\'s projects',
    description: 'projects for luxass',
    site: site?.toString() || 'https://projectrc.luxass.dev',
    items: projects.filter(({ isContributor }) => !isContributor)
      .map(({ name, url, pushedAt, description }) => ({
        title: name,
        description,
        link: url,
        pubDate: pushedAt,
      })),
    stylesheet: '/rss/styles.xsl',
  })
}
