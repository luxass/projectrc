# projectrc

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

You should not use this package, it is probably only useful for me.

## 📦 Installation

```sh
npm install @luxass/projectrc
```

## 📚 Usage

```ts
import { getREADME, getRepository, repositoryExists, resolveConfig, resolveProjectRC } from "@luxass/projectrc";

// check if a repository exists
const exists = await repositoryExists({
  owner: "luxass",
  repo: "projectrc",
  githubToken: process.env.GITHUB_TOKEN
});

// get the repository's ProjectRC file
const projectRCFile = await resolveConfig({
  owner: "luxass",
  repo: "projectrc"
});

// get the repository
const repository = await getRepository({
  owner: "luxass",
  repo: "projectrc",
  githubToken: process.env.GITHUB_TOKEN
});

// get the repository's readme
const readme = await getREADME({
  owner: "luxass",
  repo: "projectrc",
  githubToken: process.env.GITHUB_TOKEN
});

// resolve the projectrc file
const projectRC = await resolveProjectRC({
  owner: "luxass",
  repo: "projectrc",
  githubToken: process.env.GITHUB_TOKEN
});
```

## 📄 License

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@luxass/projectrc?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/@luxass/projectrc
[npm-downloads-src]: https://img.shields.io/npm/dm/@luxass/projectrc?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/@luxass/projectrc
