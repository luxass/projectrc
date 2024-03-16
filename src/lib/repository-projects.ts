import { z } from 'zod'
import ignore from 'ignore'
import { minimatch } from 'minimatch'
import { SITE_URL } from './utils'
import { resolveConfig } from './config'
import { getPackage } from './pkg'
import { getRepository } from './repository'
import type { ResolvedProject } from './types'

const GITHUB_TREE_SCHEMA = z.array(
  z.object({
    // according to the GitHub API docs, this is optional..
    // https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28#get-a-tree
    path: z.string(),
    mode: z.string().optional(),
    type: z.string().optional(),
    sha: z.string().optional(),
    size: z.number().int().optional(),
    url: z.string().optional(),
  }),
)

export type ProjectResult = ResolvedProject[] | {
  error: ErrorKey
}

export type ErrorKey = 'NO_CONFIG_FOUND' | 'REPOSITORY_NOT_FOUND' | 'REPOSITORY_IGNORED'

export const ERROR_MAP: Record<ErrorKey, string> = {
  NO_CONFIG_FOUND: 'repository has no config',
  REPOSITORY_NOT_FOUND: 'repository not found',
  REPOSITORY_IGNORED: 'repository is ignored',
}

export async function getRepositoryProjects(owner: string, repositoryName: string): Promise<ProjectResult> {
  const resolvedConfig = await resolveConfig(owner, repositoryName)

  if (!resolvedConfig) {
    return {
      error: 'NO_CONFIG_FOUND',
    }
  }

  const repository = await getRepository(owner, repositoryName)

  if (!repository) {
    return {
      error: 'REPOSITORY_NOT_FOUND',
    }
  }

  const config = resolvedConfig.content

  if (config.ignore) {
    return {
      error: 'REPOSITORY_IGNORED',
    }
  }

  const projects: ResolvedProject[] = []

  if (config.workspace && config.workspace.enabled) {
    const rootPkg = await getPackage(owner, repositoryName)

    if (!rootPkg) {
      throw new Error('no package.json found in root of repository')
    }

    if (!rootPkg.workspaces) {
      throw new Error('projectrc: workspace is enabled, but no workspaces were found in package.json')
    }

    const workspaces = rootPkg.workspaces

    const filesResult = await fetch(
      `https://api.github.com/repos/${owner}/${repositoryName}/git/trees/main?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    ).then((res) => res.json())

    if (!filesResult || typeof filesResult !== 'object') {
      throw new Error(
        'projectrc: workspace is enabled, but no files were found.\nPlease add files to your repository.',
      )
    }

    if (!('truncated' in filesResult) || filesResult.truncated) {
      throw new Error(
        'projectrc: workspace is enabled, but the file tree is too large.\nWe are not currently supporting this.',
      )
    }

    if (!('tree' in filesResult) || !Array.isArray(filesResult.tree) || !filesResult.tree.length) {
      throw new Error(
        'projectrc: workspace is enabled, but no files were found.\nPlease add files to your repository.',
      )
    }

    const files = await GITHUB_TREE_SCHEMA.parseAsync(filesResult.tree)

    const filePaths = files.map((file) => file.path)
    const _ignore = ignore().add(config.workspace?.ignores || [])

    const matchedFilePaths = filePaths.filter(
      (filePath) => workspaces.some((pattern) => minimatch(filePath, pattern)) && !_ignore.ignores(filePath),
    )

    const results = await Promise.all(
      matchedFilePaths.map(async (filePath) => {
        const pkg = await getPackage(owner, repositoryName, filePath)

        if (!pkg) {
          throw new Error(`no package.json found in ${filePath}`)
        }

        if (!pkg.name) {
          throw new Error(`no name found in package.json in ${filePath}`)
        }

        return {
          name: pkg.name,
          path: filePath,
          private: pkg.private || false,
        }
      }),
    )

    const overrides = config.workspace?.overrides || []

    for (const pkg of results) {
      const override = overrides.find((override) => override.name === pkg.name)

      // if package is inside a folder that you want to include everytime (like `packages/*`),
      // but still want to ignore a specific package.
      if (override && override.ignore) {
        continue
      }

      const project: ResolvedProject = {
        name: pkg.name,
        title: config.title || repository.name,
        description: override?.description || config.description || repository.description || undefined,
        keywords: override?.keywords || config.keywords || undefined,
        image: override?.image || config.image || undefined,
        ignore: override?.ignore || config.ignore || false,
        deprecated: override?.deprecated || config.deprecated,
        stars: repository.stargazerCount || undefined,
        priority: override?.priority || config.priority || 0,
      }

      if (override?.website ?? config.website) {
        let website

        if (override?.website && typeof override.website === 'string') {
          website = override.website
        } else if (config.website && typeof config.website === 'string') {
          website = config.website
        } else {
          website = repository.homepageUrl || null
        }

        project.website = website
      }

      let readme = override?.readme || config.readme

      if (readme) {
        if (typeof readme === 'boolean') {
          readme = `/${pkg.path}/README.md`
        }

        project.readme = `${SITE_URL}/api/resolve/${owner}/${repositoryName}/readme${readme}`
      }

      if (config.npm) {
        let npm = config.npm
        if (typeof npm === 'boolean') {
          npm = {
            enabled: true,
            downloads: true,
          }
        }

        if (npm.enabled) {
          if (npm.name) {
            project.npm = {
              name: npm.name,
              url: `https://www.npmjs.com/package/${npm.name}`,
            }
          } else {
            const pkgObj = await getPackage(owner, repositoryName, pkg.path)

            if (!pkgObj.name) {
              throw new Error('no name found in package.json')
            }

            project.npm = {
              name: pkgObj.name,
              url: `https://www.npmjs.com/package/${pkgObj.name}`,
            }

            if (npm.downloads && project.npm.name) {
              const result = await fetch(`https://api.npmjs.org/downloads/point/last-month/${project.npm.name}`).then(
                (res) => res.json(),
              )

              if (
                !result
                || typeof result !== 'object'
                || !('downloads' in result)
                || typeof result.downloads !== 'number'
              ) {
                console.warn(
                    `npm downloads is enabled, but no \`downloads\` field was found in the npm API response.\nPlease try again later.`,
                )
              }

              project.npm.downloads = result.downloads
            }
          }
        }
      }

      if (override?.version || config.version) {
        const latestReleaseResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repositoryName}/releases/latest`,
        )
        const pkgObj = await getPackage(owner, repositoryName, pkg.path)

        if (!latestReleaseResponse.ok && !pkgObj.version) {
          throw new Error('could not find latest release on github and no version was found in package.json')
        }

        if (!latestReleaseResponse.ok && pkgObj.version) {
          console.warn('no latest release found on github')
          const npmResult = await fetch(`https://registry.npmjs.org/${pkgObj.name}`).then((res) => res.json())

          if (!npmResult || typeof npmResult !== 'object') {
            throw new Error('version is enabled, but no npm API response was found.\nPlease try again later.')
          }

          const test = z.object({
            'dist-tags': z.object({
              latest: z.string(),
            }),
          })

          const npm = await test.parseAsync(npmResult)

          const latestVersion = npm['dist-tags'].latest

          project.version = latestVersion || pkgObj.version
        } else {
          const result = await latestReleaseResponse.json()

          if (!result || typeof result !== 'object' || !('tag_name' in result) || typeof result.tag_name !== 'string') {
            throw new Error(
              'version is enabled, but no `tag_name` field was found in the GitHub API response.\nPlease try again later.',
            )
          }
        }
      }

      projects.push(project)
    }
  } else {
    const project: ResolvedProject = {
      name: repository.name,
      title: config.title || repository.name,
      description: config.description || repository.description || undefined,
      keywords: config.keywords || undefined,
      image: config.image || undefined,
      ignore: config.ignore || false,
      readme: config.readme
        ? `${SITE_URL}/api/resolve/${owner}/${repositoryName}/readme${
            typeof config.readme === 'string' ? `/${config.readme}` : ''
          }`
        : undefined,
      website: typeof config.website === 'boolean' ? repository.homepageUrl : config.website,
      deprecated: config.deprecated,
      stars: repository.stargazerCount || undefined,
      priority: config.priority || 0,
    }

    if (config.npm) {
      let npm = config.npm
      if (typeof npm === 'boolean') {
        npm = {
          enabled: true,
          downloads: true,
        }
      }

      if (npm.enabled) {
        if (npm.name) {
          project.npm = {
            name: npm.name,
            url: `https://www.npmjs.com/package/${npm.name}`,
          }
        } else {
          const pkg = await getPackage(owner, repositoryName)

          if (!pkg.name) {
            throw new Error('no name found in package.json')
          }

          project.npm = {
            name: pkg.name,
            url: `https://www.npmjs.com/package/${pkg.name}`,
          }

          if (npm.downloads && project.npm.name) {
            const result = await fetch(`https://api.npmjs.org/downloads/point/last-month/${project.npm.name}`).then(
              (res) => res.json(),
            )

            if (
              !result
              || typeof result !== 'object'
              || !('downloads' in result)
              || typeof result.downloads !== 'number'
            ) {
              console.warn(
                `npm downloads is enabled, but no \`downloads\` field was found in the npm API response.\nPlease try again later.`,
              )
            }

            project.npm.downloads = result.downloads
          }
        }
      }
    }

    if (config.version) {
      const latestReleaseResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repositoryName}/releases/latest`,
      )
      const pkg = await getPackage(owner, repositoryName)

      if (!latestReleaseResponse.ok && !pkg.version) {
        throw new Error('could not find latest release on github and no version was found in package.json')
      }

      if (!latestReleaseResponse.ok && pkg.version) {
        console.warn('no latest release found on github')
        const npmResult = await fetch(`https://registry.npmjs.org/${pkg.name}`).then((res) => res.json())

        if (!npmResult || typeof npmResult !== 'object') {
          throw new Error('version is enabled, but no npm API response was found.\nPlease try again later.')
        }

        const test = z.object({
          'dist-tags': z.object({
            latest: z.string(),
          }),
        })

        const npm = await test.parseAsync(npmResult)

        const latestVersion = npm['dist-tags'].latest

        project.version = latestVersion || pkg.version
      } else {
        const result = await latestReleaseResponse.json()

        if (!result || typeof result !== 'object' || !('tag_name' in result) || typeof result.tag_name !== 'string') {
          throw new Error(
            'version is enabled, but no `tag_name` field was found in the GitHub API response.\nPlease try again later.',
          )
        }
      }
    }

    projects.push(project)
  }

  return projects
}
