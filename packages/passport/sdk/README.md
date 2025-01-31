# About

Immutable Passport is a blockchain-based identity and wallet system that caters to the needs of Web3 games. It offers a persistent identity that accompanies users across Web3 games, ensuring a consistent configuration across all applications.

Passport also comes equipped with a non-custodial wallet as a default option for each user, ensuring a transaction experience comparable to web2 standards.

[Read more about Immutable Passport in our docs here](https://docs.immutable.com/products/zkEVM/passport).

# Table of Contents

- [Usage](#usage)
- [Installation](#installation)
  - [Individual Package Installation](#individual-package-installation)
  - [SDK Installation](#sdk-installation)
    - [Conditional Exports](#conditional-exports)
    - [Direct Imports](#direct-imports)

# Usage

You can find example usages of this package in the examples set up [here](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport)

# Installation

## Individual Package Installation

To install this package, run the following command:

```sh
npm add @imtbl/passport
# or
yarn add @imtbl/passport
# or
pnpm add @imtbl/passport
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/passport` import path like so:

```ts
import { Passport } from '@imtbl/sdk/passport';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { passport } from '@imtbl/sdk';

const { Passport } = passport;
```

However this method will result in a larger bundle size as the entire `@imtbl/passport` package will be included in your bundle.