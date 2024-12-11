# About

The Minting Backend SDK package offers backend code to integrate with the Immutable Minting API via a set of functions and utilities for various purposes, such as minting assets, querying minting data, and managing minting transactions. This is an alternative to the API URL based approach. 

[Read more about the Minting Backend package here](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api).

# Table of Contents

- [Installation](#installation)
  - [Individual Package Installation](#individual-package-installation)
  - [SDK Installation](#sdk-installation)
    - [Conditional Exports](#conditional-exports)
    - [Direct Imports](#direct-imports)

# Installation

## Individual Package Installation

To install this package, run the following command:

```sh
npm add @imtbl/minting-backend
# or
yarn add @imtbl/minting-backend
# or
pnpm add @imtbl/minting-backend
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/minting_backend` import path like so:

```ts
import { MintingBackendModule } from '@imtbl/sdk/minting_backend';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { mintingBackend } from '@imtbl/sdk';

const { MintingBackendModule } = mintingBackend;
```

However this method will result in a larger bundle size as the entire `@imtbl/minting-backend` package will be included in your bundle.