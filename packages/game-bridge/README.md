# Game Bridge

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Quick Start Guide

All commands below need to be run in the context of the `game-bridge` package where this README is located. Read more about context [here](../../README.md#context).

Building the Game Bridge for Unity and Unreal:

```bash
yarn build
```

Note: The above build will bundle the index files in the following locations (relative to this README):
- Unity: `./dist/unity/index.html`
- Unreal: `./dist/unreal/index.js`, `./dist/unreal/index.js.map`

#### Building for Production / Release

During the build step for game-gridge, placeholder SDK version strings are replaced with the actual SDK version strings. To ensure the correct version strings are packaged, as opposed to the local commit hash, which could be different than the latest release tag, the following process should be followed:

1. Make/push changes to game bridge

2. Merge to `main`

3. Release new version of the SDK (using the `Publish to NPM` workflow)
   - This creates a new GitHub tag / release

4. Fetch tags and pull latest changes locally after release workflow completes:
   - `git pull origin main`
   - `git fetch --tags`

5. Switch to the latest tag that was released:
   - `git checkout tags/<tag-name>`

6. Manually build game bridge with steps above

7. Copy the built files to the correct location in the Game SDKs

Game bridge should now have the correct latest version when packaged into the Game SDKs.

Linting:

```bash
yarn lint
```

### About

The Game Bridge package enables interaction between the Typescript SDK and Unity and Unreal SDKs. It does this by wrapping around the required SDK packages and generating an (index.js & index.js.map)/index.html file that can be imported into the Unreal and Unity SDKs, respectively.

[Read more about how the game-bridge works here](https://immutable.atlassian.net/wiki/spaces/GSK/pages/2307129395/Game+SDK+Overview)

[Read more about the game-bridge package here](../../README.md#game-bridge)