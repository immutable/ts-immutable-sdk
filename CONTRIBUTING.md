# Contribution Guides

## Linting
If you are contributing to this SDK repository, linting rules will run to ensure code consistency. Here are a few things you might consider:
### How to Lint Your Existing Code

To manually lint a folder use the lint:path script and pass the path to the folder you want to lint. For example: `yarn lint:path src/modules/apis`

To lint fix your code simply add the --fix argument: `yarn lint:path src/modules/apis --fix`

### Lint Your Module Code

To lint all the code in your module, use the yarn lint:path command above.
The linter has been configured to ignore any folders called sample-app !!

### Linting pre-commit Workflow

The repository has been setup with a pre-commit hook that will lint any files that have been staged. This will prevent pushing any unlinted files to GitHub.

You will need to fix any linting issues locally before being allowed to commit anything. You can either fix the linting issues manually or use the lint:path command with the --fix argument and specify the path to the files you want to lint fix.

### Linting CI Workflow

Since the existing codebase already contains unlinted code, the GitHub workflow to lint is configured to only lint files in the PR that have been added or changed.

This is to prevent unlinted code in the rest of the codebase preventing PR’s from merging.

## Testing

This repository uses Jest as the default unit-testing framework, and is configured independently at each package directory. Due to the build system, you have the flexibility within each package to test appropriately.

### Running tests

To test this SDK locally, you can:

#### **Run ALL test suites (mimicking what our CI workflow does)**

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

#### **Run test suites specific to a package**

To run test suites specific to a package, you will require to change directory to a package, and run `yarn test` there:

```sh
cd packages/passport && yarn test
cd packages/checkout && yarn test
cd packages/internal/toolkit && yarn test
cd packages/x-provider && yarn test
cd packages/x-client && yarn test
```

You can also extend these commands, by using Jest syntax such as regex or to target specific tests to run:

```sh
cd packages/passport && yarn test -t "this is a test name within passport testing suite"
```

### Writing tests

The root [`package.json`](package.json) is the entry point for all CI testing purposes. Therefore, if you wish to write tests for an existing or new package, please ensure that a `"test"` script exists in the associated `package.json` file so that it is picked up by the [`root "test" command.`](package.json#L19)

## Documentation

Documentation is automatically generated from [TSDoc](https://tsdoc.org/) style comments after PR is successfully merged to main branch.

### Writing documentation

This repository uses [TypeDoc](https://typedoc.org/) to convert TSDoc comments into the SDK reference docs you see [here](https://docs.immutable.com/docs/zkEVM/sdks/typescript)

A good rule of thumb is to ensure anything that is exported has TSDoc comments created for it. The best way to get a feel for how TSDoc works is to play with it [here](https://microsoft.github.io/tsdoc/)

At a minimum, aim to have `@param`, `@returns`, `@throws` and `@description` for functions. If the function is quite complex, provide an `@example` too, like [this](https://github.com/immutable/ts-immutable-sdk/blob/c922db8a58b976d5e4eb327b0eb4038f558f6c96/packages/internal/bridge/sdk/src/tokenBridge.ts)

### Generate SDK Reference Documentation

From a clean checkout, run:

```sh
yarn
yarn build
yarn docs:build
```

To view the docs locally, run: `yarn docs:serve`

## Releasing
The Immutable team will take responsibility for releasing successful PRs contributed, including versioning decisions.

### PR titles
Publishing the SDK to NPM will create a new GitHub release with auto-generated release notes to communicate changes between releases. These auto-generated notes are a list of PR titles merged since the last release.
In an effort to help make the auto-generated notes useful to customers, please write meaningful PR titles. For example, `Fix bug` is not a meaningful title, but `Fix bug when user does X` is.

Please follow our check points provided in PR template.

### Changelog
To ensure all releases and changes make sense to people who use and contribute to this SDK, we strongly recommend the following rules for contributors:

When creating PRs, start it with a section on one-line Customer Impact, followed by a section on the changes that have happened. You can pick all that apply in the list of types of changes below.
* `Added` for new features.
* `Changed` for changes in existing functionality.
* `Deprecated` for soon-to-be removed features.
* `Removed` for now removed features.
* `Fixed` for any bug fixes.
* `Security` in case of vulnerabilities.
