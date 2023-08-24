<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Immutable TypeScript SDK

Table of contents

- [Immutable TypeScript SDK](#immutable-typescript-sdk)
  - [How to guides](#how-to-guides)
    - [Adding your project](#adding-your-project)
    - [Link packages to each other](#link-packages-to-each-other)
    - [Generate OpenAPI clients](#generate-openapi-clients)
    - [Building](#building)
    - [Linting](#linting)
      - [ESLint Tooling](#eslint-tooling)
      - [Exclude Lists](#exclude-lists)
      - [Progressive Linting](#progressive-linting)
      - [Adding Linting Rules](#adding-linting-rules)
      - [How to Lint Your Existing Code](#how-to-lint-your-existing-code)
      - [Lint Your Module Code](#lint-your-module-code)
      - [Linting pre-commit Workflow](#linting-pre-commit-workflow)
      - [Linting CI Workflow](#linting-ci-workflow)
    - [Testing](#testing)
      - [Running tests](#running-tests)
        - [**Run ALL test suites (mimicking what our CI workflow does)**](#run-all-test-suites-mimicking-what-our-ci-workflow-does)
        - [**Run test suites specific to a package**](#run-test-suites-specific-to-a-package)
      - [Writing tests](#writing-tests)
    - [Documentation](#documentation)
      - [Writing documentation](#writing-documentation)
      - [Generate SDK Reference Documentation](#generate-sdk-reference-documentation)
    - [Releasing](#releasing)
      - [Dry Run](#dry-run)
      - [Versioning](#versioning)
      - [Alpha Versioning](#alpha-versioning)
      - [Updated SDK Reference Documentation](#updated-sdk-reference-documentation)
      - [Changelog](#changelog)
  - [Disclaimer for Alpha Releases](#disclaimer-for-alpha-releases)

## How to guides

### Adding your project

1. Add the project as a package within the `packages` folder. If it's internal (i.e. we don't intend to export the package out from the root level), then you can add it within the `packages/internal` folder.
2. Add the package folder to the list of `workspaces` in the `packages.json` (at the root level).
3. Run `yarn` again for workspaces to register the new project, and map internals.
4. If your project is intended to be exported at the SDK root level (i.e. not internal):
5. Add your project to the list of `devDependencies` of the root project
6. Add a new file in the `sdk/src` folder, importing all your exports from project, and re-export them.
7. Add this file to the `rollup.config.js` file for this to be built.
8. You'll need to add this to the `exports` of the `package.json` of the SDK too.

Please name your project as `@imtbl/PROJECT_NAME`. Please also mark your project as `private: true` in your package.json, as we don't intend to publish your package.

### Link packages to each other

Say you want to link `@imtbl/a` to `@imtbl/b`:

1. If the local version of `imtbl/a` is `0.0.0`, then add `@imtbl/a` to the `package.json` with version `0.0.0`.
2. Then run `yarn` at the project root.
3. Then run `yarn wsrun -p @imtbl/b --recursive --stages build` at the project root. This will all the dependencies, and then build your project `b`.

As long as both these packages are workspaces (in the root `package.json`), yarn will link them all internally.

### Generate OpenAPI clients

The OpenAPI specs for the following

1. [IMX APIs](https://docs.x.immutable.com/reference). The OpenAPI spec is retrieved from [here](https://api.x.immutable.com/openapi) and also saved in the repo.
1. [zkEVM APIS](https://imx-openapiv3-mr-dev.s3.us-east-2.amazonaws.com/openapi.json). The OpenAPI spec is retrieved from [here](https://imx-openapiv3-mr-dev.s3.us-east-2.amazonaws.com/openapi.json) and also saved in the repo.

are used to auto-generate the API Clients. See the internal package `generated-clients` which contains the API Clients.

In order to regenerate these clients with updated spec files, follow the steps below

1. Navigate to generated-clients package folder:

    ```sh
    cd packages/internal/generated-clients
    ```

1. To re-generate the API client for IMX APIs, run:

    ```make
    make generate-imx-openapi
    ```

1. To re-generate the API client for zkEVM APIs, run:

    ```make
    make generate-mr-openapi
    ```

1. Run existing smoke tests, just run:
  
    ```sh
    yarn test
    ```

1. If all good, commit the code and create PR, get review from the code-owners of the corresponding APIs.

### Building

From a root level, if you want to build the dependencies of the core SDK and other dependencies, have a look at the `build` script at the root `package.json`.

The build script takes a while and builds 3 bundle types: ES Modules, Browser and CommonJS

You can choose to build a specific bundle type using `build:cjs`, `build:esm` or `build:browser`

If your package isn't part of the dependency tree for the main SDK, then you might need to manually build your project using:

```sh
yarn wsrun -p @imtbl/your_project --recursive --stages build
```

### Linting

#### ESLint Tooling

Steps to configure VS Code to use ESLint as a formatter

1.  Install the ESLint extension
1.  Open the settings tab
1.  Click the `Open Settings (JSON) in the top right corner
1.  Add this property and value to the JSON file:

```json
"eslint.format.enable": true
```

VS Code should now start highlighting any linting errors in the code editor.

#### Exclude Lists

If you wish to ignore any files or folders from linting you can either:

- Add the glob folder pattern to the .eslintignore file under the put module specific ignore paths here section. See the ESLint docs on ESLint config for more info: "Ignore Files - ESLint - Pluggable JavaScript Linter"

- Add ESLint ignore comments to your code to ignore specific rules or ignore whole line or files with the appropriate comments. See the ESLint docs on disabling rules for more info: "Configure Rules - ESLint - Pluggable JavaScript Linter"

#### Progressive Linting

Due to the repo already having an existing codebase, a progressive linting approach has been taken. The means the following:

1. Only staged files will be linted on commit.
1. Files that have any part of the file added or updated will mean the whole file will be linted.
1. You will need to fix all linting errors in any file you have changed before being allowed to commit that file!
1. The linter in the GitHub workflow will also only check changed or new files rather than linting the entire codebase.
1. It will be the responsibility of the module owners to lint the code in their respective module folders.
1. Folders named sample-app will be ignored by the linter.
1. If your module includes a sample app, ensure it goes into a folder called sample-app. This is because the linter is not setup for linting front-end code like React.

#### Adding Linting Rules

Don’t...this will be configured by the Developer Experience team.

#### How to Lint Your Existing Code

To manually lint a folder use the lint:path script and pass the path to the folder you want to lint. For example: `yarn lint:path src/modules/apis`

To lint fix your code simply add the --fix argument: `yarn lint:path src/modules/apis --fix`

#### Lint Your Module Code

To lint all the code in your module, use the yarn lint:path command above.
The linter has been configured to ignore any folders called sample-app !!

#### Linting pre-commit Workflow

The repository has been setup with a pre-commit hook that will lint any files that have been staged. This will prevent pushing any unlinted files to GitHub.

You will need to fix any linting issues locally before being allowed to commit anything. You can either fix the linting issues manually or use the lint:path command with the --fix argument and specify the path to the files you want to lint fix.

#### Linting CI Workflow

Since the existing codebase already contains unlinted code, the GitHub workflow to lint is configured to only lint files in the PR that have been added or changed.

This is to prevent unlinted code in the rest of the codebase preventing PR’s from merging.

### Testing

This repository uses Jest as the default unit-testing framework, and is configured independently at each package directory. Due to the build system, you have the flexibility within each package to test appropriately.

#### Running tests

To test this SDK locally, you can:

##### **Run ALL test suites (mimicking what our CI workflow does)**

```sh
# Install dependencies
yarn

# Build
yarn build

# Runs all tests, but skip the ones that require a VPN
yarn test

# Run all tests, including the ones that require a VPN
yarn test:vpn
```

Or,

##### **Run test suites specific to a package**

To run test suites specific to a package, you will require to change directory to a package, and run `yarn test` there:

```sh
cd packages/passport && yarn test
cd packages/checkout && yarn test
cd packages/internal/toolkit && yarn test
cd packages/provider && yarn test
cd packages/immutablex_client && yarn test
```

You can also extend these commands, by using Jest syntax such as regex or to target specific tests to run:

```sh
cd packages/passport && yarn test -t "this is a test name within passport testing suite"
```

#### Writing tests

We are currently not enforcing a preference for testing practices. It is completely up to your team to decide how you test your package.

The root [`package.json`](package.json) is the entry point for all CI testing purposes. Therefore, if you wish to write tests for an existing or new package, please ensure that a `"test"` script exists in the associated `package.json` file so that it is picked up by the [`root "test" command.`](package.json#L19)

### Documentation

Documentation is automatically generated from [TSDoc](https://tsdoc.org/) style comments.

#### Writing documentation

This repository uses [TypeDoc](https://typedoc.org/) to convert TSDoc comments into the SDK reference docs you see [here](https://docs.immutable.com/docs/zkEVM/sdks/typescript)

A good rule of thumb is to ensure anything that is exported has TSDoc comments created for it. The best way to get a feel for how TSDoc works is to play with it [here](https://microsoft.github.io/tsdoc/)

At a minimum, aim to have `@param`, `@returns`, `@throws` and `@description` for functions. If the function is quite complex, provide an `@example` too, like [this](https://github.com/immutable/ts-immutable-sdk/blob/2336b6f050627fe9ba3eabf0d0efdb296c04fc9d/packages/internal/bridge/sdk/src/tokenBridge.ts#L77-L105)

#### Generate SDK Reference Documentation

From a clean checkout, run:

```sh
yarn
yarn build
yarn docs:build
```

To view the docs locally, run: `yarn docs:serve`

### Releasing

To release a new version of the SDK, you can use the `Publish to NPM` [GitHub Action](https://github.com/immutable/ts-immutable-sdk/actions/workflows/publish.yaml). This will publish the SDK to NPM, and also create a new GitHub release/tag.

To use this action, you will need to:
  - Go to the [GitHub Actions Workflow](https://github.com/immutable/ts-immutable-sdk/actions/workflows/publish.yaml) page for this repo
  - Click on the `Run workflow` button
  - Select the branch you want to release from (usually `main`)
    - `alpha` releases can be done from any branch, but `release`s must be done from `main`
  - Select the `Release Type` (either `alpha`, or `release`)
  - Select the `Upgrade Type` (either `none`, `patch`, `minor`, or `major`)
    - See [Versioning](#versioning) for more information on this
  - Click the green `Run workflow` button

#### Dry Run

You can optionally do a dry run by checking the `Dry run` checkbox. This will run the workflow, but not publish the SDK to NPM, or create a new GitHub release/tag. This is useful to see what the workflow will tag the next release version as, before actually releasing it.

#### Versioning

> [!IMPORTANT]
> While the SDK are on `0.X` releases, interface or breaking changes should bump the minor version, whilst non-breaking changes should bump the patch version.

When releasing a new version of the SDK, you will need to specify the `Upgrade Type` (either `none`, `patch`, `minor`, or `major`). This will determine what the next version of the SDK will be based off the existing [tags in the repo](https://github.com/immutable/ts-immutable-sdk/tags).

The `Publish to NPM` workflow will update the version in the top level `package.json` and push it back to the `main` branch.

Selecting `Release Type` of `release` and an `Upgrade Type` other than `none` will bump the chosen version of the SDK. Note, if the previous version is an `alpha` version, the next version will be based off the alpha version.

For example, given the latest tag of `0.8.0-alpha` and selecting patch as the `Upgrade Type`: `0.8.0-alpha` -> `0.9.0`

#### Updated SDK Reference Documentation

> [!NOTE]
> To have a package documented, the package must have a `typedoc.json` file in the root of the package. See [passport](./packages/passport/sdk/typedoc.json) for an example. And the package must be listed in the root level `typedoc.json` file.

When the `Publish to NPM` workflow successfully runs, it will trigger the `Publish SDK Reference Docs` GitHub Action. This will build the SDK reference documentation, similar to the steps in [Generate SDK Reference Documentation](#generate-sdk-reference-documentation), and push the changes to the `imx-docs` repo and create a PR for you to review.

The PR will add the user that initated the `Publish to NPM` workflow as a reviewer, so you can review the changes and merge the PR.

Look for a PR with the title `Release SDK reference docs vX.X.X` in the [imx-docs repo](https://github.com/immutable/imx-docs/pulls)

Note, the docs will only be updated if the `Publish to NPM` workflow is run with a `Release Type` of `release`.

#### Changelog

Add your changes to the [CHANGELOG.md](CHANGELOG.md) file under the `[Unreleased]` section under the appropriate subheading:

- `### [Added]` - for new features
- `### [Changed]` - for changes in existing functionality
- `### [Deprecated]` - for soon-to-be removed features
- `### [Removed]` - for now removed features
- `### [Fixed]` - for any bug fixes
- `### [Security]` - in case of vulnerabilities

The `[Unreleased]` title will be updated by the `Publish to NPM` workflow to the next version number and pushed back to the `main` branch.

## Disclaimer for Alpha Releases

Please note that alpha releases are still in development and may contain bugs or breaking changes. Please do not use these versions as we do not intend to support them.
