# About

The X-Provider SDK package provides methods that implement the signable actions with IMX only. 

[Read more about the IMX Provider in our docs here](https://docs.immutable.com/x/passport/imx-provider).

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
npm add @imtbl/x-provider
# or
yarn add @imtbl/x-provider
# or
pnpm add @imtbl/x-provider
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/x` import path like so:

```ts
import { GenericIMXProvider } from '@imtbl/sdk/x';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { x } from '@imtbl/sdk';

const { GenericIMXProvider } = x;
```

However this method will result in a larger bundle size as the entire `@imtbl/x-provider` package will be included in your bundle.