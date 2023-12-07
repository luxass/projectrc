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
import { createProjectRCResolver } from "@luxass/projectrc";

const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);

// check if a repository exists
const exists = await projectRCResolver.exists("luxass", "projectrc");

// get the repository's ProjectRC file
const projectRCFile = await projectRCResolver.config("luxass", "projectrc");

// get the repository
const repository = await projectRCResolver.repository("luxass", "projectrc");

// get the repository's readme
const readme = await projectRCResolver.readme("luxass", "projectrc");

// resolve the projectrc file
const projectRC = await projectRCResolver.resolve("luxass", "projectrc");
```

## 📄 License

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@luxass/projectrc?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/@luxass/projectrc
[npm-downloads-src]: https://img.shields.io/npm/dm/@luxass/projectrc?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/@luxass/projectrc
