# About

The Webhook package consists of a utility function, `handle`, that can be used to work with Immutable webhooks. The `handle` function is used to verify and process incoming webhook requests from Immutable services, such as the Immutable Marketplace. It provides a simple and easy-to-use interface for handling webhooks.

[Read more about the Webhooks in our docs here](https://docs.immutable.com/products/zkEVM/blockchain-data/webhooks).

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
npm add @imtbl/webhook
# or
yarn add @imtbl/webhook
# or
pnpm add @imtbl/webhook
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/webhook` import path like so:

```ts
import { handle } from '@imtbl/sdk/webhook';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { webhook } from '@imtbl/sdk';

const { handle } = webhook;
```

However this method will result in a larger bundle size as the entire `@imtbl/webhook` package will be included in your bundle.