import { z } from "zod";

export const GITHUB_EVENTS_SCHEMA = z.array(
  z
    .object({
      id: z.string(),
      type: z.union([z.string(), z.null()]),
      actor: z
        .object({
          id: z.number().int(),
          login: z.string(),
          display_login: z.string().optional(),
          gravatar_id: z.union([z.string(), z.null()]),
          url: z.string().url(),
          avatar_url: z.string().url(),
        })
        .describe("Actor"),
      repo: z.object({
        id: z.number().int(),
        name: z.string(),
        url: z.string().url(),
      }),
      org: z
        .object({
          id: z.number().int(),
          login: z.string(),
          display_login: z.string().optional(),
          gravatar_id: z.union([z.string(), z.null()]),
          url: z.string().url(),
          avatar_url: z.string().url(),
        })
        .describe("Actor")
        .optional(),
      payload: z.object({
        action: z.string().optional(),
        issue: z
          .object({
            id: z.number().int(),
            node_id: z.string(),
            url: z
              .string()
              .url()
              .describe("URL for the issue"),
            repository_url: z.string().url(),
            labels_url: z.string(),
            comments_url: z.string().url(),
            events_url: z.string().url(),
            html_url: z.string().url(),
            number: z
              .number()
              .int()
              .describe(
                "Number uniquely identifying the issue within its repository",
              ),
            state: z
              .string()
              .describe("State of the issue; either 'open' or 'closed'"),
            state_reason: z
              .union([
                z
                  .enum([
                    "completed",
                    "reopened",
                    "not_planned",
                  ]),
                z.null(),
              ])
              .describe("The reason for the current state")
              .optional(),
            title: z.string().describe("Title of the issue"),
            body: z
              .union([
                z.string().describe("Contents of the issue"),
                z.null().describe("Contents of the issue"),
              ])
              .describe("Contents of the issue")
              .optional(),
            user: z.union([
              z.null(),
              z
                .object({
                  name: z.union([z.string(), z.null()]).optional(),
                  email: z.union([z.string(), z.null()]).optional(),
                  login: z.string(),
                  id: z.number().int(),
                  node_id: z.string(),
                  avatar_url: z.string().url(),
                  gravatar_id: z.union([z.string(), z.null()]),
                  url: z.string().url(),
                  html_url: z.string().url(),
                  followers_url: z.string().url(),
                  following_url: z.string(),
                  gists_url: z.string(),
                  starred_url: z.string(),
                  subscriptions_url: z.string().url(),
                  organizations_url: z.string().url(),
                  repos_url: z.string().url(),
                  events_url: z.string(),
                  received_events_url: z.string().url(),
                  type: z.string(),
                  site_admin: z.boolean(),
                  starred_at: z.string().optional(),
                })
                .describe("A GitHub user."),
            ]),
            labels: z
              .array(
                z.any().superRefine((x, ctx) => {
                  const schemas = [
                    z.string(),
                    z.object({
                      id: z
                        .number()
                        .int()
                        .optional(),
                      node_id: z.string().optional(),
                      url: z
                        .string()
                        .url()
                        .optional(),
                      name: z.string().optional(),
                      description: z.union([z.string(), z.null()]).optional(),
                      color: z.union([z.string(), z.null()]).optional(),
                      default: z.boolean().optional(),
                    }),
                  ];
                  const errors = schemas.reduce(
                    (errors: z.ZodError[], schema) =>
                      ((result) =>
                        "error" in result ? [...errors, result.error] : errors)(
                        schema.safeParse(x),
                      ),
                    [],
                  );
                  if (schemas.length - errors.length !== 1) {
                    ctx.addIssue({
                      path: ctx.path,
                      code: "invalid_union",
                      unionErrors: errors,
                      message: "Invalid input: Should pass single schema",
                    });
                  }
                }),
              )
              .describe(
                "Labels to associate with this issue; pass one or more label names to replace the set of labels on this issue; send an empty array to clear all labels from the issue; note that the labels are silently dropped for users without push access to the repository",
              ),
            assignee: z.union([
              z.null(),
              z
                .object({
                  name: z.union([z.string(), z.null()]).optional(),
                  email: z.union([z.string(), z.null()]).optional(),
                  login: z.string(),
                  id: z.number().int(),
                  node_id: z.string(),
                  avatar_url: z.string().url(),
                  gravatar_id: z.union([z.string(), z.null()]),
                  url: z.string().url(),
                  html_url: z.string().url(),
                  followers_url: z.string().url(),
                  following_url: z.string(),
                  gists_url: z.string(),
                  starred_url: z.string(),
                  subscriptions_url: z.string().url(),
                  organizations_url: z.string().url(),
                  repos_url: z.string().url(),
                  events_url: z.string(),
                  received_events_url: z.string().url(),
                  type: z.string(),
                  site_admin: z.boolean(),
                  starred_at: z.string().optional(),
                })
                .describe("A GitHub user."),
            ]),
            assignees: z
              .union([
                z.array(
                  z
                    .object({
                      name: z.union([z.string(), z.null()]).optional(),
                      email: z.union([z.string(), z.null()]).optional(),
                      login: z.string(),
                      id: z.number().int(),
                      node_id: z.string(),
                      avatar_url: z.string().url(),
                      gravatar_id: z.union([z.string(), z.null()]),
                      url: z.string().url(),
                      html_url: z.string().url(),
                      followers_url: z.string().url(),
                      following_url: z.string(),
                      gists_url: z.string(),
                      starred_url: z.string(),
                      subscriptions_url: z.string().url(),
                      organizations_url: z.string().url(),
                      repos_url: z.string().url(),
                      events_url: z.string(),
                      received_events_url: z.string().url(),
                      type: z.string(),
                      site_admin: z.boolean(),
                      starred_at: z.string().optional(),
                    })
                    .describe("A GitHub user."),
                ),
                z.null(),
              ])
              .optional(),
            milestone: z.union([
              z.null(),
              z
                .object({
                  url: z.string().url(),
                  html_url: z.string().url(),
                  labels_url: z.string().url(),
                  id: z.number().int(),
                  node_id: z.string(),
                  number: z
                    .number()
                    .int()
                    .describe("The number of the milestone."),
                  state: z
                    .enum(["open", "closed"])
                    .describe("The state of the milestone."),
                  title: z.string().describe("The title of the milestone."),
                  description: z.union([z.string(), z.null()]),
                  creator: z.union([
                    z.null(),
                    z
                      .object({
                        name: z.union([z.string(), z.null()]).optional(),
                        email: z.union([z.string(), z.null()]).optional(),
                        login: z.string(),
                        id: z.number().int(),
                        node_id: z.string(),
                        avatar_url: z.string().url(),
                        gravatar_id: z.union([z.string(), z.null()]),
                        url: z.string().url(),
                        html_url: z.string().url(),
                        followers_url: z.string().url(),
                        following_url: z.string(),
                        gists_url: z.string(),
                        starred_url: z.string(),
                        subscriptions_url: z.string().url(),
                        organizations_url: z.string().url(),
                        repos_url: z.string().url(),
                        events_url: z.string(),
                        received_events_url: z.string().url(),
                        type: z.string(),
                        site_admin: z.boolean(),
                        starred_at: z.string().optional(),
                      })
                      .describe("A GitHub user."),
                  ]),
                  open_issues: z.number().int(),
                  closed_issues: z.number().int(),
                  created_at: z.string(),
                  updated_at: z.string(),
                  closed_at: z.union([z.string(), z.null()]),
                  due_on: z.union([z.string(), z.null()]),
                })
                .describe("A collection of related issues and pull requests."),
            ]),
            locked: z.boolean(),
            active_lock_reason: z.union([z.string(), z.null()]).optional(),
            comments: z.number().int(),
            pull_request: z
              .object({
                merged_at: z.union([z.string(), z.null()]).optional(),
                diff_url: z.union([z.string().url(), z.null()]),
                html_url: z.union([z.string().url(), z.null()]),
                patch_url: z.union([z.string().url(), z.null()]),
                url: z.union([z.string().url(), z.null()]),
              })
              .optional(),
            closed_at: z.union([z.string(), z.null()]),
            created_at: z.string(),
            updated_at: z.string(),
            draft: z.boolean().optional(),
            closed_by: z
              .union([
                z.null(),
                z
                  .object({
                    name: z.union([z.string(), z.null()]).optional(),
                    email: z.union([z.string(), z.null()]).optional(),
                    login: z.string(),
                    id: z.number().int(),
                    node_id: z.string(),
                    avatar_url: z.string().url(),
                    gravatar_id: z.union([z.string(), z.null()]),
                    url: z.string().url(),
                    html_url: z.string().url(),
                    followers_url: z.string().url(),
                    following_url: z.string(),
                    gists_url: z.string(),
                    starred_url: z.string(),
                    subscriptions_url: z.string().url(),
                    organizations_url: z.string().url(),
                    repos_url: z.string().url(),
                    events_url: z.string(),
                    received_events_url: z.string().url(),
                    type: z.string(),
                    site_admin: z.boolean(),
                    starred_at: z.string().optional(),
                  })
                  .describe("A GitHub user."),
              ])
              .optional(),
            body_html: z.string().optional(),
            body_text: z.string().optional(),
            timeline_url: z
              .string()
              .url()
              .optional(),
            repository: z
              .object({
                id: z
                  .number()
                  .int()
                  .describe("Unique identifier of the repository"),
                node_id: z.string(),
                name: z.string().describe("The name of the repository."),
                full_name: z.string(),
                license: z.union([
                  z.null(),
                  z
                    .object({
                      key: z.string(),
                      name: z.string(),
                      url: z.union([z.string().url(), z.null()]),
                      spdx_id: z.union([z.string(), z.null()]),
                      node_id: z.string(),
                      html_url: z
                        .string()
                        .url()
                        .optional(),
                    })
                    .describe("License Simple"),
                ]),
                organization: z
                  .union([
                    z.null(),
                    z
                      .object({
                        name: z.union([z.string(), z.null()]).optional(),
                        email: z.union([z.string(), z.null()]).optional(),
                        login: z.string(),
                        id: z.number().int(),
                        node_id: z.string(),
                        avatar_url: z.string().url(),
                        gravatar_id: z.union([z.string(), z.null()]),
                        url: z.string().url(),
                        html_url: z.string().url(),
                        followers_url: z.string().url(),
                        following_url: z.string(),
                        gists_url: z.string(),
                        starred_url: z.string(),
                        subscriptions_url: z.string().url(),
                        organizations_url: z.string().url(),
                        repos_url: z.string().url(),
                        events_url: z.string(),
                        received_events_url: z.string().url(),
                        type: z.string(),
                        site_admin: z.boolean(),
                        starred_at: z.string().optional(),
                      })
                      .describe("A GitHub user."),
                  ])
                  .optional(),
                forks: z.number().int(),
                permissions: z
                  .object({
                    admin: z.boolean(),
                    pull: z.boolean(),
                    triage: z.boolean().optional(),
                    push: z.boolean(),
                    maintain: z.boolean().optional(),
                  })
                  .optional(),
                owner: z
                  .object({
                    name: z.union([z.string(), z.null()]).optional(),
                    email: z.union([z.string(), z.null()]).optional(),
                    login: z.string(),
                    id: z.number().int(),
                    node_id: z.string(),
                    avatar_url: z.string().url(),
                    gravatar_id: z.union([z.string(), z.null()]),
                    url: z.string().url(),
                    html_url: z.string().url(),
                    followers_url: z.string().url(),
                    following_url: z.string(),
                    gists_url: z.string(),
                    starred_url: z.string(),
                    subscriptions_url: z.string().url(),
                    organizations_url: z.string().url(),
                    repos_url: z.string().url(),
                    events_url: z.string(),
                    received_events_url: z.string().url(),
                    type: z.string(),
                    site_admin: z.boolean(),
                    starred_at: z.string().optional(),
                  })
                  .describe("A GitHub user."),
                private: z
                  .boolean()
                  .describe("Whether the repository is private or public."),
                html_url: z.string().url(),
                description: z.union([z.string(), z.null()]),
                fork: z.boolean(),
                url: z.string().url(),
                archive_url: z.string(),
                assignees_url: z.string(),
                blobs_url: z.string(),
                branches_url: z.string(),
                collaborators_url: z.string(),
                comments_url: z.string(),
                commits_url: z.string(),
                compare_url: z.string(),
                contents_url: z.string(),
                contributors_url: z.string().url(),
                deployments_url: z.string().url(),
                downloads_url: z.string().url(),
                events_url: z.string().url(),
                forks_url: z.string().url(),
                git_commits_url: z.string(),
                git_refs_url: z.string(),
                git_tags_url: z.string(),
                git_url: z.string(),
                issue_comment_url: z.string(),
                issue_events_url: z.string(),
                issues_url: z.string(),
                keys_url: z.string(),
                labels_url: z.string(),
                languages_url: z.string().url(),
                merges_url: z.string().url(),
                milestones_url: z.string(),
                notifications_url: z.string(),
                pulls_url: z.string(),
                releases_url: z.string(),
                ssh_url: z.string(),
                stargazers_url: z.string().url(),
                statuses_url: z.string(),
                subscribers_url: z.string().url(),
                subscription_url: z.string().url(),
                tags_url: z.string().url(),
                teams_url: z.string().url(),
                trees_url: z.string(),
                clone_url: z.string(),
                mirror_url: z.union([z.string().url(), z.null()]),
                hooks_url: z.string().url(),
                svn_url: z.string().url(),
                homepage: z.union([z.string().url(), z.null()]),
                language: z.union([z.string(), z.null()]),
                forks_count: z.number().int(),
                stargazers_count: z.number().int(),
                watchers_count: z.number().int(),
                size: z
                  .number()
                  .int()
                  .describe(
                    "The size of the repository, in kilobytes. Size is calculated hourly. When a repository is initially created, the size is 0.",
                  ),
                default_branch: z
                  .string()
                  .describe("The default branch of the repository."),
                open_issues_count: z.number().int(),
                is_template: z
                  .boolean()
                  .describe(
                    "Whether this repository acts as a template that can be used to generate new repositories.",
                  )
                  .optional(),
                topics: z.array(z.string()).optional(),
                has_issues: z.boolean().describe("Whether issues are enabled."),
                has_projects: z
                  .boolean()
                  .describe("Whether projects are enabled."),
                has_wiki: z.boolean().describe("Whether the wiki is enabled."),
                has_pages: z.boolean(),
                has_downloads: z
                  .boolean()
                  .describe("Whether downloads are enabled."),
                has_discussions: z
                  .boolean()
                  .describe("Whether discussions are enabled.")
                  .optional(),
                archived: z
                  .boolean()
                  .describe("Whether the repository is archived."),
                disabled: z
                  .boolean()
                  .describe("Returns whether or not this repository disabled."),
                visibility: z
                  .string()
                  .describe(
                    "The repository visibility: public, private, or internal.",
                  )
                  .optional(),
                pushed_at: z.union([z.string(), z.null()]),
                created_at: z.union([z.string(), z.null()]),
                updated_at: z.union([z.string(), z.null()]),
                allow_rebase_merge: z
                  .boolean()
                  .describe("Whether to allow rebase merges for pull requests.")
                  .optional(),
                template_repository: z
                  .union([
                    z.object({
                      id: z
                        .number()
                        .int()
                        .optional(),
                      node_id: z.string().optional(),
                      name: z.string().optional(),
                      full_name: z.string().optional(),
                      owner: z
                        .object({
                          login: z.string().optional(),
                          id: z
                            .number()
                            .int()
                            .optional(),
                          node_id: z.string().optional(),
                          avatar_url: z.string().optional(),
                          gravatar_id: z.string().optional(),
                          url: z.string().optional(),
                          html_url: z.string().optional(),
                          followers_url: z.string().optional(),
                          following_url: z.string().optional(),
                          gists_url: z.string().optional(),
                          starred_url: z.string().optional(),
                          subscriptions_url: z.string().optional(),
                          organizations_url: z.string().optional(),
                          repos_url: z.string().optional(),
                          events_url: z.string().optional(),
                          received_events_url: z.string().optional(),
                          type: z.string().optional(),
                          site_admin: z.boolean().optional(),
                        })
                        .optional(),
                      private: z.boolean().optional(),
                      html_url: z.string().optional(),
                      description: z.string().optional(),
                      fork: z.boolean().optional(),
                      url: z.string().optional(),
                      archive_url: z.string().optional(),
                      assignees_url: z.string().optional(),
                      blobs_url: z.string().optional(),
                      branches_url: z.string().optional(),
                      collaborators_url: z.string().optional(),
                      comments_url: z.string().optional(),
                      commits_url: z.string().optional(),
                      compare_url: z.string().optional(),
                      contents_url: z.string().optional(),
                      contributors_url: z.string().optional(),
                      deployments_url: z.string().optional(),
                      downloads_url: z.string().optional(),
                      events_url: z.string().optional(),
                      forks_url: z.string().optional(),
                      git_commits_url: z.string().optional(),
                      git_refs_url: z.string().optional(),
                      git_tags_url: z.string().optional(),
                      git_url: z.string().optional(),
                      issue_comment_url: z.string().optional(),
                      issue_events_url: z.string().optional(),
                      issues_url: z.string().optional(),
                      keys_url: z.string().optional(),
                      labels_url: z.string().optional(),
                      languages_url: z.string().optional(),
                      merges_url: z.string().optional(),
                      milestones_url: z.string().optional(),
                      notifications_url: z.string().optional(),
                      pulls_url: z.string().optional(),
                      releases_url: z.string().optional(),
                      ssh_url: z.string().optional(),
                      stargazers_url: z.string().optional(),
                      statuses_url: z.string().optional(),
                      subscribers_url: z.string().optional(),
                      subscription_url: z.string().optional(),
                      tags_url: z.string().optional(),
                      teams_url: z.string().optional(),
                      trees_url: z.string().optional(),
                      clone_url: z.string().optional(),
                      mirror_url: z.string().optional(),
                      hooks_url: z.string().optional(),
                      svn_url: z.string().optional(),
                      homepage: z.string().optional(),
                      language: z.string().optional(),
                      forks_count: z
                        .number()
                        .int()
                        .optional(),
                      stargazers_count: z
                        .number()
                        .int()
                        .optional(),
                      watchers_count: z
                        .number()
                        .int()
                        .optional(),
                      size: z
                        .number()
                        .int()
                        .optional(),
                      default_branch: z.string().optional(),
                      open_issues_count: z
                        .number()
                        .int()
                        .optional(),
                      is_template: z.boolean().optional(),
                      topics: z.array(z.string()).optional(),
                      has_issues: z.boolean().optional(),
                      has_projects: z.boolean().optional(),
                      has_wiki: z.boolean().optional(),
                      has_pages: z.boolean().optional(),
                      has_downloads: z.boolean().optional(),
                      archived: z.boolean().optional(),
                      disabled: z.boolean().optional(),
                      visibility: z.string().optional(),
                      pushed_at: z.string().optional(),
                      created_at: z.string().optional(),
                      updated_at: z.string().optional(),
                      permissions: z
                        .object({
                          admin: z.boolean().optional(),
                          maintain: z.boolean().optional(),
                          push: z.boolean().optional(),
                          triage: z.boolean().optional(),
                          pull: z.boolean().optional(),
                        })
                        .optional(),
                      allow_rebase_merge: z.boolean().optional(),
                      temp_clone_token: z.string().optional(),
                      allow_squash_merge: z.boolean().optional(),
                      allow_auto_merge: z.boolean().optional(),
                      delete_branch_on_merge: z.boolean().optional(),
                      allow_update_branch: z.boolean().optional(),
                      use_squash_pr_title_as_default: z.boolean().optional(),
                      squash_merge_commit_title: z
                        .enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"])
                        .describe(
                          "The default value for a squash merge commit title:\n\n- `PR_TITLE` - default to the pull request's title.\n- `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull request's title (when more than one commit).",
                        )
                        .optional(),
                      squash_merge_commit_message: z
                        .enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"])
                        .describe(
                          "The default value for a squash merge commit message:\n\n- `PR_BODY` - default to the pull request's body.\n- `COMMIT_MESSAGES` - default to the branch's commit messages.\n- `BLANK` - default to a blank commit message.",
                        )
                        .optional(),
                      merge_commit_title: z
                        .enum(["PR_TITLE", "MERGE_MESSAGE"])
                        .describe(
                          "The default value for a merge commit title.\n\n- `PR_TITLE` - default to the pull request's title.\n- `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull request #123 from branch-name).",
                        )
                        .optional(),
                      merge_commit_message: z
                        .enum(["PR_BODY", "PR_TITLE", "BLANK"])
                        .describe(
                          "The default value for a merge commit message.\n\n- `PR_TITLE` - default to the pull request's title.\n- `PR_BODY` - default to the pull request's body.\n- `BLANK` - default to a blank commit message.",
                        )
                        .optional(),
                      allow_merge_commit: z.boolean().optional(),
                      subscribers_count: z
                        .number()
                        .int()
                        .optional(),
                      network_count: z
                        .number()
                        .int()
                        .optional(),
                    }),
                    z.null(),
                  ])
                  .optional(),
                temp_clone_token: z.string().optional(),
                allow_squash_merge: z
                  .boolean()
                  .describe("Whether to allow squash merges for pull requests.")
                  .optional(),
                allow_auto_merge: z
                  .boolean()
                  .describe(
                    "Whether to allow Auto-merge to be used on pull requests.",
                  )
                  .optional(),
                delete_branch_on_merge: z
                  .boolean()
                  .describe(
                    "Whether to delete head branches when pull requests are merged",
                  )
                  .optional(),
                allow_update_branch: z
                  .boolean()
                  .describe(
                    "Whether or not a pull request head branch that is behind its base branch can always be updated even if it is not required to be up to date before merging.",
                  )
                  .optional(),
                use_squash_pr_title_as_default: z
                  .boolean()
                  .describe(
                    "Whether a squash merge commit can use the pull request title as default. **This property has been deprecated. Please use `squash_merge_commit_title` instead.",
                  )
                  .optional(),
                squash_merge_commit_title: z
                  .enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"])
                  .describe(
                    "The default value for a squash merge commit title:\n\n- `PR_TITLE` - default to the pull request's title.\n- `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull request's title (when more than one commit).",
                  )
                  .optional(),
                squash_merge_commit_message: z
                  .enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"])
                  .describe(
                    "The default value for a squash merge commit message:\n\n- `PR_BODY` - default to the pull request's body.\n- `COMMIT_MESSAGES` - default to the branch's commit messages.\n- `BLANK` - default to a blank commit message.",
                  )
                  .optional(),
                merge_commit_title: z
                  .enum(["PR_TITLE", "MERGE_MESSAGE"])
                  .describe(
                    "The default value for a merge commit title.\n\n- `PR_TITLE` - default to the pull request's title.\n- `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull request #123 from branch-name).",
                  )
                  .optional(),
                merge_commit_message: z
                  .enum(["PR_BODY", "PR_TITLE", "BLANK"])
                  .describe(
                    "The default value for a merge commit message.\n\n- `PR_TITLE` - default to the pull request's title.\n- `PR_BODY` - default to the pull request's body.\n- `BLANK` - default to a blank commit message.",
                  )
                  .optional(),
                allow_merge_commit: z
                  .boolean()
                  .describe("Whether to allow merge commits for pull requests.")
                  .optional(),
                allow_forking: z
                  .boolean()
                  .describe("Whether to allow forking this repo")
                  .optional(),
                web_commit_signoff_required: z
                  .boolean()
                  .describe(
                    "Whether to require contributors to sign off on web-based commits",
                  )
                  .optional(),
                subscribers_count: z
                  .number()
                  .int()
                  .optional(),
                network_count: z
                  .number()
                  .int()
                  .optional(),
                open_issues: z.number().int(),
                watchers: z.number().int(),
                master_branch: z.string().optional(),
                starred_at: z.string().optional(),
                anonymous_access_enabled: z
                  .boolean()
                  .describe(
                    "Whether anonymous git access is enabled for this repository",
                  )
                  .optional(),
              })
              .describe("A repository on GitHub.")
              .optional(),
            performed_via_github_app: z
              .union([
                z.null(),
                z
                  .object({
                    id: z
                      .number()
                      .int()
                      .describe("Unique identifier of the GitHub app"),
                    slug: z
                      .string()
                      .describe("The slug name of the GitHub app")
                      .optional(),
                    node_id: z.string(),
                    owner: z.union([
                      z.null(),
                      z
                        .object({
                          name: z.union([z.string(), z.null()]).optional(),
                          email: z.union([z.string(), z.null()]).optional(),
                          login: z.string(),
                          id: z.number().int(),
                          node_id: z.string(),
                          avatar_url: z.string().url(),
                          gravatar_id: z.union([z.string(), z.null()]),
                          url: z.string().url(),
                          html_url: z.string().url(),
                          followers_url: z.string().url(),
                          following_url: z.string(),
                          gists_url: z.string(),
                          starred_url: z.string(),
                          subscriptions_url: z.string().url(),
                          organizations_url: z.string().url(),
                          repos_url: z.string().url(),
                          events_url: z.string(),
                          received_events_url: z.string().url(),
                          type: z.string(),
                          site_admin: z.boolean(),
                          starred_at: z.string().optional(),
                        })
                        .describe("A GitHub user."),
                    ]),
                    name: z.string().describe("The name of the GitHub app"),
                    description: z.union([z.string(), z.null()]),
                    external_url: z.string().url(),
                    html_url: z.string().url(),
                    created_at: z.string(),
                    updated_at: z.string(),
                    permissions: z
                      .object({
                        issues: z.string().optional(),
                        checks: z.string().optional(),
                        metadata: z.string().optional(),
                        contents: z.string().optional(),
                        deployments: z.string().optional(),
                      })
                      .catchall(z.string())
                      .describe("The set of permissions for the GitHub app"),
                    events: z
                      .array(z.string())
                      .describe("The list of events for the GitHub app"),
                    installations_count: z
                      .number()
                      .int()
                      .describe(
                        "The number of installations associated with the GitHub app",
                      )
                      .optional(),
                    client_id: z.string().optional(),
                    client_secret: z.string().optional(),
                    webhook_secret: z.union([z.string(), z.null()]).optional(),
                    pem: z.string().optional(),
                  })
                  .describe(
                    "GitHub apps are a new way to extend GitHub. They can be installed directly on organizations and user accounts and granted access to specific repositories. They come with granular permissions and built-in webhooks. GitHub apps are first class actors within GitHub.",
                  ),
              ])
              .optional(),
            author_association: z
              .enum([
                "COLLABORATOR",
                "CONTRIBUTOR",
                "FIRST_TIMER",
                "FIRST_TIME_CONTRIBUTOR",
                "MANNEQUIN",
                "MEMBER",
                "NONE",
                "OWNER",
              ])
              .describe("How the author is associated with the repository."),
            reactions: z
              .object({
                "url": z.string().url(),
                "total_count": z.number().int(),
                "+1": z.number().int(),
                "-1": z.number().int(),
                "laugh": z.number().int(),
                "confused": z.number().int(),
                "heart": z.number().int(),
                "hooray": z.number().int(),
                "eyes": z.number().int(),
                "rocket": z.number().int(),
              })
              .optional(),
          })
          .describe(
            "Issues are a great way to keep track of tasks, enhancements, and bugs for your projects.",
          )
          .optional(),
        comment: z
          .object({
            id: z
              .number()
              .int()
              .describe("Unique identifier of the issue comment"),
            node_id: z.string(),
            url: z
              .string()
              .url()
              .describe("URL for the issue comment"),
            body: z
              .string()
              .describe("Contents of the issue comment")
              .optional(),
            body_text: z.string().optional(),
            body_html: z.string().optional(),
            html_url: z.string().url(),
            user: z.union([
              z.null(),
              z
                .object({
                  name: z.union([z.string(), z.null()]).optional(),
                  email: z.union([z.string(), z.null()]).optional(),
                  login: z.string(),
                  id: z.number().int(),
                  node_id: z.string(),
                  avatar_url: z.string().url(),
                  gravatar_id: z.union([z.string(), z.null()]),
                  url: z.string().url(),
                  html_url: z.string().url(),
                  followers_url: z.string().url(),
                  following_url: z.string(),
                  gists_url: z.string(),
                  starred_url: z.string(),
                  subscriptions_url: z.string().url(),
                  organizations_url: z.string().url(),
                  repos_url: z.string().url(),
                  events_url: z.string(),
                  received_events_url: z.string().url(),
                  type: z.string(),
                  site_admin: z.boolean(),
                  starred_at: z.string().optional(),
                })
                .describe("A GitHub user."),
            ]),
            created_at: z.string(),
            updated_at: z.string(),
            issue_url: z.string().url(),
            author_association: z
              .enum([
                "COLLABORATOR",
                "CONTRIBUTOR",
                "FIRST_TIMER",
                "FIRST_TIME_CONTRIBUTOR",
                "MANNEQUIN",
                "MEMBER",
                "NONE",
                "OWNER",
              ])
              .describe("How the author is associated with the repository."),
            performed_via_github_app: z
              .union([
                z.null(),
                z
                  .object({
                    id: z
                      .number()
                      .int()
                      .describe("Unique identifier of the GitHub app"),
                    slug: z
                      .string()
                      .describe("The slug name of the GitHub app")
                      .optional(),
                    node_id: z.string(),
                    owner: z.union([
                      z.null(),
                      z
                        .object({
                          name: z.union([z.string(), z.null()]).optional(),
                          email: z.union([z.string(), z.null()]).optional(),
                          login: z.string(),
                          id: z.number().int(),
                          node_id: z.string(),
                          avatar_url: z.string().url(),
                          gravatar_id: z.union([z.string(), z.null()]),
                          url: z.string().url(),
                          html_url: z.string().url(),
                          followers_url: z.string().url(),
                          following_url: z.string(),
                          gists_url: z.string(),
                          starred_url: z.string(),
                          subscriptions_url: z.string().url(),
                          organizations_url: z.string().url(),
                          repos_url: z.string().url(),
                          events_url: z.string(),
                          received_events_url: z.string().url(),
                          type: z.string(),
                          site_admin: z.boolean(),
                          starred_at: z.string().optional(),
                        })
                        .describe("A GitHub user."),
                    ]),
                    name: z.string().describe("The name of the GitHub app"),
                    description: z.union([z.string(), z.null()]),
                    external_url: z.string().url(),
                    html_url: z.string().url(),
                    created_at: z.string(),
                    updated_at: z.string(),
                    permissions: z
                      .object({
                        issues: z.string().optional(),
                        checks: z.string().optional(),
                        metadata: z.string().optional(),
                        contents: z.string().optional(),
                        deployments: z.string().optional(),
                      })
                      .catchall(z.string())
                      .describe("The set of permissions for the GitHub app"),
                    events: z
                      .array(z.string())
                      .describe("The list of events for the GitHub app"),
                    installations_count: z
                      .number()
                      .int()
                      .describe(
                        "The number of installations associated with the GitHub app",
                      )
                      .optional(),
                    client_id: z.string().optional(),
                    client_secret: z.string().optional(),
                    webhook_secret: z.union([z.string(), z.null()]).optional(),
                    pem: z.string().optional(),
                  })
                  .describe(
                    "GitHub apps are a new way to extend GitHub. They can be installed directly on organizations and user accounts and granted access to specific repositories. They come with granular permissions and built-in webhooks. GitHub apps are first class actors within GitHub.",
                  ),
              ])
              .optional(),
            reactions: z
              .object({
                "url": z.string().url(),
                "total_count": z.number().int(),
                "+1": z.number().int(),
                "-1": z.number().int(),
                "laugh": z.number().int(),
                "confused": z.number().int(),
                "heart": z.number().int(),
                "hooray": z.number().int(),
                "eyes": z.number().int(),
                "rocket": z.number().int(),
              })
              .optional(),
          })
          .describe(
            "Comments provide a way for people to collaborate on an issue.",
          )
          .optional(),
        pages: z
          .array(
            z.object({
              page_name: z.string().optional(),
              title: z.string().optional(),
              summary: z.union([z.string(), z.null()]).optional(),
              action: z.string().optional(),
              sha: z.string().optional(),
              html_url: z.string().optional(),
            }),
          )
          .optional(),
      }),
      public: z.boolean(),
      created_at: z.union([z.string(), z.null()]),
    })
    .describe("Event"),
);
