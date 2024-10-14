# About

The Blockchain Data SDK provides a set of wrapper functions for interacting with the Immutable Blockchain Data APIs. It provides a simple and easy-to-use interface for querying blockchain data, such as assets, orders, and trades. 

[Read more about the Blockchain Data APIs in our docs here](https://docs.immutable.com/docs/zkEVM/products/blockchain-data).

# Table of Contents

- [Usage](#usage)
- [Installation](#installation)
  - [Individual Package Installation](#individual-package-installation)
  - [SDK Installation](#sdk-installation)
    - [Conditional Exports](#conditional-exports)
    - [Direct Imports](#direct-imports)

# Usage

You can find an example usage of this package in the example set up [here](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/blockchain-data)

# Installation

## Individual Package Installation

To install this package, run the following command:

```sh
npm add @imtbl/blockchain-data
# or
yarn add @imtbl/blockchain-data
# or
pnpm add @imtbl/blockchain-data
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/blockchain_data` import path like so:

```ts
import { APIError, BlockchainData } from '@imtbl/sdk/blockchain_data';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { blockchainData } from '@imtbl/sdk';

const { APIError, BlockchainData } = blockchainData;
```

However this method will result in a larger bundle size as the entire `@imtbl/blockchain-data` package will be included in your bundle.