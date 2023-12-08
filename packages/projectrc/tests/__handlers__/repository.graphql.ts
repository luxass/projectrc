import type { GraphQLHandler } from "msw";
import { HttpResponse, graphql } from "msw";
import { buildSchema, graphql as executeGraphQL } from "graphql";

const schema = buildSchema(`#graphql
  scalar URI
  scalar Date
  scalar DateTime

  type LanguageConnection {
    edges: [LanguageEdge]
    nodes: [Language]
    pageInfo: PageInfo!
    totalCount: Int!
    totalSize: Int!
  }

  type Language {
    color: String
    id: ID!
    name: String!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }

  type LanguageEdge {
    cursor: String!
    node: Language!
    size: Int!
  }

  input LanguageOrder {
    direction: OrderDirection!
    field: LanguageOrderField!
  }

  enum OrderDirection {
    ASC
    DESC
  }

  enum LanguageOrderField {
    SIZE
  }

  type Ref {
    name: String!
  }

  type Repository  {
    id: ID!
    name: String!
    homepageUrl: URI
    isFork: Boolean!
    isPrivate: Boolean!
    nameWithOwner: String!
    description: String
    pushedAt: DateTime
    url: URI!
    defaultBranchRef: Ref
    languages(
      after: String
      before: String
      first: Int
      last: Int
      orderBy: LanguageOrder
    ): LanguageConnection
  }

  type Query {
    repository(
      followRenames: Boolean = true
      name: String!
      owner: String!
    ): Repository
  }
`);

const github = graphql.link("https://api.github.com/graphql");

export const repositoryGraphQLHandler = github.operation(
  async ({ query, variables, request }) => {
    const authorizationHeader = request.headers.get("Authorization");

    if (
      !authorizationHeader
      || authorizationHeader.slice(6).trim() !== "TEST"
    ) {
      return HttpResponse.json(
        {
          message: "Bad credentials",
          data: null,
          errors: null,
        },
        {
          status: 401,
        },
      );
    }

    const { errors, data } = await executeGraphQL({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        repository: ({ owner, name }) => {
          const repo = GitHubMockedData.get(`${owner}/${name}`);

          if (!repo) {
            return null;
          }

          return repo.data;
        },
      },
    });

    return HttpResponse.json({
      data,
      errors,
    });
  },
) satisfies GraphQLHandler;
