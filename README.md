<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Welcome to the Immutable TypeScript SDK
This Typescript SDK aims to enhance user experience, reduce complexity, and streamline development by offering a cohesive development environment.

The need for a Typescript SDK arises from the challenges developers face when managing multiple SDKs, such as fragmented development experiences, increased complexity, slower project setup times, and resource overhead.

[Public facing README shipped with each SDK release is here](https://github.com/immutable/ts-immutable-sdk/blob/main/sdk/README.md)

# Table of Contents

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Working With Packages](#working-with-packages)
    - [Context](#context)
    - [Development Mode](#development-mode)
    - [Running Tests](#running-tests)
    - [Building](#building)
    - [Linting](#linting)
    - [Installing to a local project](#installing-to-a-local-project)
- [Technical Architecture](#technical-architecture)
- [Contribution Guides](#contribution-guides)
- [Examples](#examples)

# Getting Started

The Typescript SDK is a monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package. Note that this monorepo also contains an `examples` folder that provides examples of the SDK in use for different use cases.

To get started with the SDK, you need to install the dependencies and build the project. You can then work with the packages included in the SDK, such as running them in development mode, running tests, building, and linting.

Although the steps defined below are general, each package may have additional commands or require different setup steps. In that case, the package will have a `CONTRIBUTING.md` file within its folder that provides specific instructions for working with that package.

Pnpm is the package manager used in this monorepo. If you do not have pnpm installed, you can install it by following the instructions [here](https://pnpm.io/installation).

## Installation

To get started with the SDK, you need to install the dependencies and build the project:

```bash
pnpm
pnpm build
```

## Working With Packages

### Context

To run commands in a specific package, you have two options. You can either run the command from any directory of the monorepo and specify the package name, or you can navigate to the package directory and run the command from there. Both options allow you to run pnpm commands within the context of a specific package.

For example, to run the `build` command for the `checkout-sdk` package located at `/packages/checkout/sdk`, you can either run the following command from any directory of the monorepo:

```bash
pnpm --filter @imtbl/checkout-sdk build
```

Or you can navigate to the `/packages/checkout/sdk` directory by running the following commands from the root of the repo:

```bash
cd packages/checkout/sdk
pnpm build
```

In the sections below are some general commands that you can use in each package. 

### Development watch mode

Build a package and start watch mode for all packages:

```bash
# Context: Root of monorepo
pnpm dev
```

### Running Tests

Tests within packages are run using jest.

Run all jest tests in watch mode for all packages

```bash
# Context: Root of monorepo
pnpm dev:test
```

### Building

Building SDK packages is done using TSUP, although certain packages may have a more specialized build tool/process. This will bundle the package code into a single file that can be imported by other packages or applications. The build output is stored in the `dist` folder of the package. These build outputs also include typescript declaration files to provide typings to SDK consumers.

To build a package, you can use the following command in the context of that package:

```bash
# Context: Specified package
pnpm build
```

The root of the repo also has build scripts setup to run for all SDK packages. You can build all SDK packages using the following command within the context of the whole monorepo:

```bash
# Context: Root of monorepo
pnpm build
```

### Linting

Linting is done using ESLint throughout the monorepo. This ensures that code is consistent and follows best practices based on the configuration set in the root `.eslintrc` file. Linting is run as part of the CI pipeline and as a pre-commit hook, but you can also run it manually. Each package tends to have a lint script that checks for issues, with another that attempts to fix them.

All packages use the same `pnpm lint` command for their linting.

The root of the repo also has lint scripts setup to run for all SDK packages. You can lint all SDK packages using the following command within the context of the whole monorepo:

```bash
# Context: Root of monorepo
pnpm lint
```

### Installing to a local project

If you need to test changes to any SDK package in the specific context of your own application, or if the changes are otherwise not possible to test within the limited capability of the sample apps provided, you can do so using your package manager with these instructions:

1. Build the full SDK. You can do this with `pnpm build` in the root of the repo
2. Run `pnpm prepare:sdk` in the root of the monorepo to pack all the SDK packages for installation externally.
3. In your external local project, such as a separate nextjs app, install the SDK using the `file:` protocol as the version pointing to the sdk tarball file, for eg `"@imtbl/sdk": "file:../ts-immutable-sdk/imtbl-sdk-0.0.0.tgz",`

This will allow you to emulate an external consumer of the SDK, and test your changes in the context of your own application, using a local version of the SDK that you can modify and test as needed.

# Technical Architecture
The Typescript SDK is designed as a Pnpm Workspace monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package.

All code for each module is contained within its respective package, which allows for easy maintenance and updates. The root-level package serves as a single entry point to access all modules included in the Typescript SDK.

To ensure compatibility with different platforms or devices, we externalize all third-party dependencies used by each module. This allows us to only bundle our code without including third-party dependencies which can get bundled by Node for customers who have their own build process.

We also use bundling techniques to optimize code delivery and reduce load times for customers who intend to use the SDK directly in the browser. By bundling up all code into a single file, we can minimize network requests and improve overall user experience.

Overall, this technical architecture provides a scalable solution that enables us to add new modules easily while maintaining high stability across multiple platforms.

# Contribution Guides
See [CONTRIBUTING.md](https://github.com/immutable/ts-immutable-sdk/blob/main/CONTRIBUTING.md)

Internal maintainers' guide is available at Immutable's wiki [Typescript SDK Internal Development Guide here](https://immutable.atlassian.net/wiki/spaces/PPS/pages/2333477584/Typescript+SDK+Internal+Development+Guide+-+ts-immutable-sdk)
- In the .github/CODEOWNERS file add your github team to the corresponding subfolder that your team will be responsible for.
- [Example from GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#example-of-a-codeowners-file)

# Examples

The Typescript SDK also provides multiple sample frontend/backend applications in the root `examples` directory. These examples are meant to demonstrate how to use the SDK in a real-world application for external users and provide a base for building custom applications. Each sample has its own README file that provides additional information surrounding that example app. 
