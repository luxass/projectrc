# projectrc

> This is a monorepo containing the following projects:
> - [@luxass/projectrc](./packages/projectrc)
> - [website](./www)

## 💻 Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run development build using `pnpm dev`


## Development

You will need to create a `.env` file in the root folder, to make the both the website and tests work.

The GitHub Token should only have the `public_repo` scope. You can create one [here](https://github.com/settings/personal-access-tokens/new).
```env
GITHUB_TOKEN=<YOUR TOKEN>
```


## 📄 License

Published under [MIT License](./LICENSE).
