# About

This package contains the Typescript SDK for the zkEVM Order Book. It is used to interact with the zkEVM Order Book API and provides a number of methods for placing, fulfilling and cancelling listings. The SDK is initialized with a configuration object that specifies the target environment and other necessary parameters.

[Read more about the Orderbook package in our docs here](https://docs.immutable.com/products/zkevm/orderbook/)

# Table of Contents

- [Usage](#usage)
- [Installation](#installation)
  - [Individual Package Installation](#individual-package-installation)
  - [SDK Installation](#sdk-installation)
    - [Conditional Exports](#conditional-exports)
    - [Direct Imports](#direct-imports)

# Usage

Initializing the SDK can be achieved by specifying the target environment in the constructor:

```typescript
import { Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/config';

const orderbook = new Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
})
```

See the [Orderbook docs](https://docs.immutable.com/docs/products/orderbook/overview) for usage guidance.

# Installation

## Individual Package Installation

To install this package, run the following command:

```sh
npm add @imtbl/orderbook
# or
pnpm add @imtbl/orderbook
# or
yarn add @imtbl/orderbook
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/orderbook` import path like so:

```ts
import { Orderbook } from '@imtbl/sdk/orderbook';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { orderbook } from '@imtbl/sdk';

const { Orderbook } = orderbook;
```

However this method will result in a larger bundle size as the entire `@imtbl/orderbook` package will be included in your bundle.
