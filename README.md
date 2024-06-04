<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Welcome to Immutable Unified TypeScript SDK
This Unified SDK aims to enhance user experience, reduce complexity, and streamline development by offering a cohesive development environment.

The need for a Unified SDK arises from the challenges developers face when managing multiple SDKs, such as fragmented development experiences, increased complexity, slower project setup times, and resource overhead.

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
- [Packages](#packages)
  - [Blockchain Data](#blockchain-data)
  - [Checkout](#checkout)
  - [Config](#config)
  - [Game Bridge](#game-bridge)
  - [Internal](#internal)
  - [Minting Backend](#minting-backend)
  - [Orderbook](#orderbook)
  - [Passport](#passport)
  - [Webhook](#webhook)
  - [X-Client](#x-client)
  - [X-Provider](#x-provider)
- [Contribution Guides](#contribution-guides)
- [Samples](#samples)

# Getting Started

The Unified SDK is a monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package.

To get started with the SDK, you need to install the dependencies and build the project. You can then work with the packages included in the SDK, such as running them in development mode, running tests, building, and linting.

Although the steps defined below are general, each package may have additional commands or require different setup steps. For more specific instructions on working with a package, refer to the README file in the package directory.

## Installation

To get started with the SDK, you need to install the dependencies and build the project:

```bash
yarn
yarn build
```

## Working With Packages

### Context

To run commands in a specific package, you have two options. You can either run the command from any directory of the monorepo and specify the package name, or you can navigate to the package directory and run the command from there. Both options allow you to run yarn commands within the context of a specific package.

For example, to run the `start` command for the `checkout` package, you can either run the following command from any directory of the monorepo:

```bash
yarn workspace @immutable/sdk-checkout start
```

Or you can navigate to the `packages/checkout` directory and run the following command:

```bash
cd packages/checkout/sdk
yarn start
```

Most packages in the workspace have their own README file that provides specific instructions for working with that package. In the sections below are some general commands that you can use in each package. 

NOTE: Some packages may have additional commands or require different setup steps, for example in a certain package the development mode may be started with `yarn start:dev` instead of `yarn start`, or `yarn dev`. For the steps below we will be assuming defaults.

### Development Mode

Development mode allows you to run a package in a local development environment. This is useful for testing changes and new features before deploying them to production. Any changes made will be reflected in real-time on save, so you can see the effects of your changes immediately. These are propogated in real time to the sample app, if it is running, for that SDK too.

Development mode for sdk packages will tend to use rollup and its watch mode to rebuild the package on file changes. This build output, stored in the dist folder of the sdk package, is what is exposed to any other packages that depend on it, including the sample app.

To run a package in development mode, you can use the following command in the context of that package:

```bash
# Context: Specified package
yarn start
```

Some packages also come with a sample app that you can run in development mode. To run the sample app, you first need to run the SDK it depends on in development mode, and then run the sample app development mode in a seperate terminal. For example, to run the `checkout` sample app, you can use the following commands:

```bash
yarn workspace @immutable/sdk-checkout start

# Or from the root of the monorepo
cd packages/checkout/sdk
yarn start
```

Then, in a separate terminal:

```bash
yarn workspace @immutable/sdk-checkout-sample-app start

# Or from the root of the monorepo
cd packages/checkout/sample-app
yarn start
```

### Running Tests

Tests within packages are generally run using Jest. Some packages, such as the Widgets in the Checkout directly, may use another tool such as Cypress. 

To run all for a package, you can use the following command in the context of that package:

```bash
# Context: Specified package
yarn test
```

To run tests in watch mode, rerunning tests on saved file changes, you can use the following command:

```bash
# Context: Specified package
yarn test:watch
```

The root of the repo also has test scripts setup to run for all packages. You can run all tests for all packages using the following command within the context of the whole monorepo:

```bash
# Context: Root of monorepo
yarn test
```

### Building

Building SDK packages is generally done using Rollup, although certain packages may however have a more specialized build tool/process. This will bundle the package code into a single file that can be imported by other packages or applications. The build output is stored in the `dist` folder of the package. These build outputs also include typescript declaration files to provide typings to SDK consumers.

To build a package, you can use the following command in the context of that package:

```bash
# Context: Specified package
yarn build
```

The root of the repo also has build scripts setup to run for all packages. You can build all packages using the following command within the context of the whole monorepo:

```bash
# Context: Root of monorepo
yarn build
```

### Linting

Linting is done using ESLint throughout the monorepo. This ensures that code is consistent and follows best practices based on the configuration set in the root `.eslintrc` file. Linting is run as part of the CI pipeline and as a pre-commit hook, but you can also run it manually. Each package tends to have a lint script that checks for issues, with another that attempts to fix them.

Most packages use similar commands for their linting.

To check for linting issues, you can use the following command in the context of that package:

```bash
# Context: Specified package
yarn lint
```

To attempt to fix linting issues, you can use the following command in the context of that package:

```bash
# Context: Specified package
yarn lint:fix
```

The root of the repo also has lint scripts setup to run for all packages. You can lint all packages using the following command within the context of the whole monorepo:

```bash
# Context: Root of monorepo
yarn lint
```

### Installing to a local project

If you need to test changes to any SDK package in the specific context of your own application, or if the changes are otherwise not possible to test within the limited capability of the sample apps provided, you can do so using your package manager with these instructions:

1. Build the full SDK. You can do this with `yarn workspace @imtbl/sdk build`
2. Remove the existing version of the `ts-immutable-sdk` from the dependencies of your own application with `yarn remove @imtbl/sdk` or `npm uninstall @imtbl/sdk`
3. Install a local version of the Immutable Typescript SDK using a path to the SDK relative to where the command is being run from. You can do this from your project by running `yarn install /path/to/ts-immutable-sdk/sdk`, or `npm i /path/to/ts-immutable-sdk/sdk`.

This will allow you to emulate an external consumer of the SDK, and test your changes in the context of your own application, using a local version of the SDK that you can modify and test as needed.

# Technical Architecture
The Unified SDK is designed as a Yarn Workspace monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package.

All code for each module is contained within its respective package, which allows for easy maintenance and updates. The root-level package serves as a single entry point to access all modules included in the Unified SDK.

To ensure compatibility with different platforms or devices, we externalize all third-party dependencies used by each module. This allows us to only bundle our code without including third-party dependencies which can get bundled by Node for customers who have their own build process.

We also use bundling techniques to optimize code delivery and reduce load times for customers who intend to use the SDK directly in the browser. By bundling up all code into a single file, we can minimize network requests and improve overall user experience.

Overall, this technical architecture provides a scalable solution that enables us to add new modules easily while maintaining high stability across multiple platforms.

# Packages

The Unified SDK is a monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package that serves as a single entry point to access all modules included in the Unified SDK for external consumers.

The following is a list of packages included in the Unified SDK:

### Blockchain Data

The Blockchain Data SDK provides a set of wrapper functions for interacting with the Immutable Blockhain Data APIs. It provides a simple and easy-to-use interface for querying blockchain data, such as assets, orders, and trades. 

The Blockchain Data SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

More information can be found in the README file in the Blockchain Data SDK folder [here](/packages//blockchain-data//sdk//README.md).

### Checkout

The Checkout SDK folder provides both functions and user interfaces for interacting with various wallets and L2 networks. It provides all the tools to enable transaction ready gamers including on ramping, dex swaps, bridging and more.

The folder contains the Checkout SDK package and the Widgets Library package. The Checkout SDK package provides the core functionality for interacting with wallets and L2 networks, while the Widgets Library package provides a set of pre-built UI components that can be used to build a custom checkout experience.

The Checkout SDK package is built using TypeScript and Rollup, while the Widgets Library package is built using TypeScript and React. The Checkout SDK and Widgets Library packages are exposed to the SDK package that is published to NPM.

Sample apps are also included in the Checkout SDK folder to demonstrate how to use the SDK and Widgets Library packages. These sample apps can be run in development mode to test changes and new features before deploying them to production.

More information can be found in the README file in the Checkout SDK folder [here](/packages//checkout//README.md).

### Config

The Config package exposes a configuration class and some utilities to create a configuration object. This object contains information used for the SDK setup by consumers. It ensures that all modules and packages within the SDK can access the necessary configuration settings in a consistent and reliable manner, as well as providing customers with a simple way to configure the SDK for their specific environment.

The Config package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

### Game Bridge

The Game Bridge SDK package allows the Game SDKs (Unity and Unreal) to communicate with the TypeScript SDK. The Game SDKs are used to build games that interact with the Immutable platform. This enables communication between the Game and Typescript SDKs, allowing the Game SDKs to leverage the existing TypeScript SDK.

The TS SDK and game-bridge are bundled into an index file (HTML for Unity, JS for Unreal), which is how the Game SDKs use them.

More information can be found in the README file in the Game Bridge folder [here](/packages//game-bridge//README.md).

### Internal

The Internal folder contains packages that are used internally by the SDK and are not intended for external use. These packages provide internal utilities and functions that are used by other packages within the SDK. 

All internal packages are built using TypeScript and Rollup. The packages are not exposed to the SDK package, and therefore are not accessible to external consumers. 

### Minting Backend

The Minting Backend SDK package offers backend code to integrate with the Immutable Minting API via a set of functions and utilities for various purposes, such as minting assets, querying minting data, and managing minting transactions. This is an alternative to the API URL based approach.

The Minting Backend SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

More information can be found in the README file in the Minting Backend folder [here](/packages//minting-backend//sdk//README.md).

### Orderbook

The Orderbook SDK package provides a set of functions and utilities for interacting with the Immutable zkEVM Orderbook. It offers a simple and easy-to-use interface for querying orderbook data, such as orders and trades. 

The Orderbook SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

More information can be found in the README file in the Orderbook folder [here](/packages//orderbook//README.md).

### Passport

The Passport SDK folder contains both the Passport SDK package, as well as the Passport Sample App. The Passport SDK package provides a set of functions and user interfaces for interacting with Immutable Passport, a blockchain-based identity and wallet system.

The Passport SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

A sample app is also included in the Passport SDK folder to demonstrate how to use the Passport SDK package and for testing purposes. The sample app can be run in development mode to test changes and new features before deploying them to production.

More information for the Passport SDK can be found in the README file in the Passport SDK folder [here](/packages//passport//sdk//README.md).

More information for the Passport Sample App can be found in the README file in the Passport Sample App folder [here](/packages//passport//sdk-sample-app//README.md).

### Webhook

The Webhook package consists of a utility function, `handle`, that can be used to work with Immutable webhooks. The `handle` function is used to verify and process incoming webhook requests from Immutable services, such as the Immutable Marketplace. It provides a simple and easy-to-use interface for handling webhooks.

The Webhook package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

More information can be found in the README file in the Webhook folder [here](/packages//webhook//sdk//README.md).

### X-Client

The X-Client SDK package provides a set of functions and utilities for interacting with the ImmutableX StarkEx-based Layer 2 blockchain. It provides an `IMXClient` that is used for this purpose. 

The X-Client SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

### X-Provider

The X-Provider SDK package provides methods that implement the signable actions with IMX only. 

The X-Provider SDK package is built using TypeScript and Rollup. The package is exposed to the SDK package that is published to NPM.

More information can be found in the README file in the X-Provider folder [here](/packages//x-provider//README.md).

# Contribution Guides
See [CONTRIBUTING.md](https://github.com/immutable/ts-immutable-sdk/blob/main/CONTRIBUTING.md)

Internal maintainers' guide is available at Immutable's wiki `UnifiedSDK Internal Development Guide`
- In the .github/CODEOWNERS file add your github team to the corresponding subfolder that your team will be responsible for.
- [Example from GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#example-of-a-codeowners-file)

# Samples

The SDK also provides multiple sample frontend/backend applications in the root `samples` directory. These samples are meant to demonstrate how to use the SDK in a real-world application for external users and provide a base for building custom applications. Each sample has its own README file that provides additional information surrounding that sample app. 