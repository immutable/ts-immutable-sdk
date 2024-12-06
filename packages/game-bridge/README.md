# Game Bridge

### Pre-requisites

Install dependencies for the workspace

```bash
pnpm install
```

### Quick Start Guide

All commands below need to be run in the context of the `game-bridge` package where this README is located. Read more about context [here](../../README.md#context).

Building the Game Bridge for Unity and Unreal:

```bash
# at root
pnpm nx run @imtbl/game-bridge:build
```

Note: The above build will bundle the index files in the following locations (relative to this README):

- Unity: `./dist/unity/index.html`
- Unreal: `./dist/unreal/index.js`, `./dist/unreal/index.js.map`

### Building for Production / Release

During the build step for game-gridge, placeholder SDK version strings are replaced with the actual SDK version strings. To ensure the correct version strings are packaged, as opposed to the local commit hash, which could be different than the latest release tag, the following process should be followed:

1. Make/push changes to game bridge

2. Merge to `main`

3. Release new version of the SDK (using the `Publish to NPM` workflow)

   - This creates a new GitHub tag / release

4. Once the new version of the TS SDK has been released, use the [Build Game Bridge](https://github.com/immutable/ts-immutable-sdk/actions/workflows/build-game-bridge.yaml) workflow to build the game bridge with the latest version of the SDK and create a PR in the Game SDK repos.

   - Use the `Run workflow` button on the workflow page to trigger the workflow
   - In the `TS SDK version tag` input field, enter the latest tag that was released
   - Currently the workflow only supports building the game bridge for Unity, so the Unreal SDK will need to be built manually

5. When the workflow completes, you should see the PR here: https://github.com/immutable/unity-immutable-sdk/pulls

   - The workflow also saves the build artifacts which you can download from the workflow run page and manually copy them too.
   - Running the workflow with `Dry run` set to `true` will not create a PR, but will still save the build artifacts

6. Approve and merge the PR in the Game SDK repo

Game bridge should now have the correct latest version when packaged into the Game SDKs.

### Linting:

```bash
pnpm lint
```

### About

The Game Bridge package enables interaction between the Typescript SDK and Unity and Unreal SDKs. It does this by wrapping around the required SDK packages and generating an (index.js & index.js.map)/index.html file that can be imported into the Unreal and Unity SDKs, respectively.

[Read more about how the game-bridge works here](https://immutable.atlassian.net/wiki/spaces/GSK/pages/2307129395/Game+SDK+Overview)

[Read more about the game-bridge package here](../../README.md#game-bridge)
