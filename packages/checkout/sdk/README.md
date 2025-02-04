# About

The Checkout SDK folder provides both functions and user interfaces for interacting with various wallets and L2 networks. It provides all the tools to enable transaction ready gamers including on ramping, dex swaps, bridging and more.

[Read more about the Checkout SDK in our docs here](https://docs.immutable.com/products/zkevm/checkout/).

# Table of Contents

- [Usage](#usage)
- [Installation](#installation)
  - [Individual Package Installation](#individual-package-installation)
  - [SDK Installation](#sdk-installation)
    - [Conditional Exports](#conditional-exports)
    - [Direct Imports](#direct-imports)

# Usage

You can find example usages of this package in the examples set up [here](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout)

# Installation

## Individual Package Installation

To install this package, run the following command:

```sh
npm add @imtbl/checkout-sdk
# or
yarn add @imtbl/checkout-sdk
# or
pnpm add @imtbl/checkout-sdk
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/checkout` import path like so:

```ts
import { Checkout } from '@imtbl/sdk/checkout';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { checkout } from '@imtbl/sdk';

const { Checkout } = checkout;
```

However this method will result in a larger bundle size as the entire `@imtbl/checkout-sdk` package will be included in your bundle.