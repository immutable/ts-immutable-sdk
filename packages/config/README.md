# About

The Config package exposes a configuration class and some utilities to create a configuration object. This object contains information used for the SDK setup by consumers. It ensures that all modules and packages within the SDK can access the necessary configuration settings in a consistent and reliable manner, as well as providing customers with a simple way to configure the SDK for their specific environment.

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
npm add @imtbl/config
# or
yarn add @imtbl/config
# or
pnpm add @imtbl/config
```

## SDK Installation

This package is also included within the [`@imtbl/sdk` NPM package](https://www.npmjs.com/package/@imtbl/sdk) and can be re-exported directly from there.

### Conditional Exports

If your environment supports conditional exports, you can import the contents of this package directly from the `@imtbl/sdk` package using the `@imtbl/sdk/config` import path like so:

```ts
import { Environment } from '@imtbl/sdk/config';
```

This is the recommended way of consuming this package, as it allows for better tree-shaking and smaller bundle sizes.

### Direct Imports

If your environment does not support conditional exports, you will need to import the contents of this package directly from the `@imtbl/sdk` package like so:

```ts
import { config } from '@imtbl/sdk';

const { Environment } = config;
```

However this method will result in a larger bundle size as the entire `@imtbl/config` package will be included in your bundle.