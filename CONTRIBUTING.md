# Contribution Guides

## Table of Contents

- [Setting Up Your Environment](#setting-up-your-environment)
- [Development Workflow](#development-workflow)
- [Linting](#linting)
- [Testing](#testing)
- [Documentation](#documentation)
  - [Writing documentation](#writing-documentation)
  - [Generate SDK Reference Documentation](#generate-sdk-reference-documentation)
- [Creating Pull Requests](#creating-pull-requests)
  - [Title](#title)
  - [Description](#description)

## Setting Up Your Environment

1. **Clone the repository:**

    ```sh
    git clone https://github.com/immutable/ts-immutable-sdk.git
    cd ts-immutable-sdk
    ```

2. **Install dependencies:**

    We use `pnpm` as our package manager. Install it if you haven't already: https://pnpm.io/installation

    Then, install the project dependencies:

    ```sh
    pnpm install
    ```

3. **Build the project:**

    To build the entire SDK, run the following in the root of the monorepo:

    ```sh
    pnpm build
    ```

## Development Workflow

1. **Create a new branch:**

    ```sh
    git checkout -b my-branch-name
    ```

2. **Dev Mode:**

    To run the SDK in dev mode, run the following in the root of the monorepo:

    ```sh
    pnpm dev
    ```

    This will watch for changes in the SDK and rebuild the SDK when changes are made.

3. **Test your changes:**

    Refer to the [Testing](#testing) section below for more information on how to run tests.

4. **Commit and push your changes:**

    Commit your changes using the conventional commit format of `type(scope): message`. For example:

    ```sh
    git commit -m "feat(passport): my new feature"
    git push origin my-branch-name
    ```

5. **Create a pull request:**

    Create a pull request from your branch to the `main` branch. Make sure to follow the [Creating Pull Requests](#creating-pull-requests) section below.

## Linting

Linting ensures code consistency and follows best practices. We use ESLint for linting.

The repository has a pre-commit hook that will lint any files that have been staged using `lint-staged`. This will prevent pushing any unlinted files to GitHub. You can also manually lint your code using the commands set up below.

You can either lint the entire project or a specific package. To lint all SDK packages that are affected by any changes made, run the following in the root of the monorepo:

```sh
pnpm lint
```

To lint a specific package, run the following in the root of the monorepo:

```sh
pnpm --filter=<package-name> lint
```

## Testing

This repository uses Jest as the default unit-testing framework, and it is configured independently for each package. The root package.json is the entry point for all CI testing purposes. Therefore, if you wish to write tests for an existing or new workspace, please ensure that a "test" script exists in the associated package.json file for that package so that it is picked up by the root "test" command.

To test all SDK packages that are affected by any changes made, run the following in the root of the monorepo:

```sh
pnpm test
```

To test a specific package, run the following in the root of the monorepo:

```sh
pnpm --filter=<package-name> test
```

## Documentation

This repository uses [TypeDoc](https://typedoc.org/) to convert TSDoc comments into the SDK reference docs you see [here](https://docs.immutable.com/docs/zkEVM/sdks/typescript) when a PR is merged into the main branch

### Writing documentation

A good rule of thumb is to ensure anything that is exported has TSDoc comments created for it. The best way to get a feel for how TSDoc works is to play with it [here](https://microsoft.github.io/tsdoc/)

At a minimum, aim to have `@param`, `@returns`, `@throws` and `@description` for functions. If the function is quite complex, provide an `@example` too, like [the getFee function here](https://github.com/immutable/ts-immutable-sdk/blob/c922db8a58b976d5e4eb327b0eb4038f558f6c96/packages/internal/bridge/sdk/src/tokenBridge.ts#L87)

### Generate SDK Reference Documentation

From a clean checkout, run the following to generate the docs:

```sh
pnpm install
pnpm build
pnpm docs:build
```

To view the docs locally, run: 
```sh
pnpm docs:serve
```

## Creating Pull Requests

### Title

To ensure all releases and changes make sense to people who use and contribute to this SDK, the conventional commit style naming for PR titles is enforced, using the conventional commit format of `type(scope): message`. These are used to populate the changelog automatically on releases. 

### Description

When creating PR descriptions, start it with a section on one-line Customer Impact, followed by a section on the changes that have happened. You can pick all that apply in the list of types of changes below.
* `Added` for new features.
* `Changed` for changes in existing functionality.
* `Deprecated` for soon-to-be removed features.
* `Removed` for now removed features.
* `Fixed` for any bug fixes.
* `Security` in case of vulnerabilities.