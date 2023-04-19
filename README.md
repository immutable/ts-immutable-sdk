<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---
![Build Status](https://github.com/immutable/ts-immutable-sdk/actions/workflows/build-lint-typecheck-test.yml/badge.svg)

# Immutable TypeScript SDK

Table of contents

- [Immutable TypeScript SDK](#immutable-typescript-sdk)
  - [How to guides](#how-to-guides)
    - [Adding your project](#adding-your-project)
    - [Link packages to each other](#link-packages-to-each-other)
    - [Buiding](#buiding)
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
    - [Versioning \& Changelog](#versioning--changelog)

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

### Buiding

From a root level, if you want to build the dependencies of the core SDK and other dependencies, have a look at the `build` script at the root `package.json`.

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

# Runs ALL tests
yarn test
```

Or,

##### **Run test suites specific to a package**

To run test suites specific to a package, you will require to change directory to a package, and run `yarn test` there:

```sh
cd packages/passport && yarn test
cd packages/checkout && yarn test
cd packages/internal/toolkit && yarn test
cd packages/provider && yarn test
cd packages/starkex && yarn test
```

You can also extend these commands, by using Jest syntax such as regex or to target specific tests to run:

```sh
cd packages/passport && yarn test -t "this is a test name within passport testing suite"
```

#### Writing tests

We are currently not enforcing a preference for testing practices. It is completely up to your team to decide how you test your package.

The root [`package.json`](package.json) is the entry point for all CI testing purposes. Therefore, if you wish to write tests for an existing or new package, please ensure that a `"test"` script exists in the associated `package.json` file so that it is picked up by the [`root "test" command.`](package.json#L19)

### Versioning & Changelog
