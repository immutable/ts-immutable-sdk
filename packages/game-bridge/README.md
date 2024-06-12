# Game Bridge

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Quick Start Guide

All commands below need to be run in the context of the `game-bridge` package where this README is located. Read more about context [here](../../../README.md#context).

Building the Game Bridge for Unity and Unreal:

```bash
yarn build
```

Note: The above build will bundle the index files in the following locations (relative to this README):
- Unity: `./dist/unity/index.html`
- Unreal: `./dist/unreal/index.js`, `./dist/unreal/index.js.map`

Linting:

```bash
yarn lint
```

### About

The Game Bridge package enables interaction between the Typescript SDK and Unity and Unreal SDKs. It does this by wrapping around the required SDK packages and generating an (index.js & index.js.map)/index.html file that can be imported into the Unreal and Unity SDKs, respectively.

[Read more about how the game-bridge works here](https://immutable.atlassian.net/wiki/spaces/GSK/pages/2307129395/Game+SDK+Overview)

[Read more about the game-bridge package here](../../README.md#game-bridge)