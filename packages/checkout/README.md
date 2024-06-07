# Checkout

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Checkout SDK Quick Start Guide](#checkout-sdk-quick-start-guide)
- [Widgets Library Quick Start Guide](#widgets-library-quick-start-guide)
  - [Widgets Development Locally](#widgets-development-locally)
- [Project structure](#project-structure)

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Checkout SDK Quick Start Guide

All commands below need to be run in the context of the `checkout-sdk` package unless specified otherwise. Read more about context [here](../../../README.md#context).

Running in `dev` mode using the `immutable-devnet` network:

```bash
yarn start:dev
```

Running in `sandbox`/`production` mode using the `immutable-testnet`/`mainnet` network based on the environment value set for the `SANDBOX_CONFIGURATION` config object in the `sdk.ts` file:

```bash
yarn start
```

Running the Checkout SDK Sample App with the Checkout SDK supporting hot reloading:

```bash
# Run the Checkout SDK first
# Context: checkout-sdk
yarn start

# Run the Checkout SDK Sample App in a new terminal
# Context: checkout-sdk-sample-app
yarn start
```

Building to the `dist` directory for `dev` environment:

```bash
yarn build:dev
```

Building to the `dist` directory for `sandbox`/`production` environment:

```bash
yarn build
```

Running all jest tests:

```bash
yarn test
```

Running changed tests on save in watch mode:

```bash
yarn test:watch
```

Linting:

```bash
yarn lint
```

Linting and attempting to auto-fix issues:

```bash
yarn lint:fix
```

Typechecking:

```bash
yarn typecheck
```

Generate Typescript API documentation (viewable in the newly generated docs folder at [packages/checkout/sdk/docs/README.md](/packages/checkout//sdk/docs/README.md)):

```bash
yarn docs
```

### Widgets Library Quick Start Guide

All commands below need to be run in the context of the `checkout-widgets` package unless specified otherwise. Read more about context [here](../../../README.md#context).

Running in `dev` mode (widgets-lib depends upon checkout-sdk):

```bash
# Run the Checkout SDK first
# Context: checkout-sdk
yarn start:dev

# Run the Widgets Library in a new terminal
# Context: checkout-widgets
yarn start
```

Running the Widgets Sample App with the Widgets Library supporting hot reloading:

```bash
# Run the above two commands first
# ...

# Run the Widgets Sample App in a new terminal
# Context: checkout-widgets-sample-app
yarn start
```

**Read more about running locally [here](#widgets-development-locally).**

Building the Widgets Library to the `dist` directory:

```bash
yarn build
```

Building the Widgets Library and outputting a bundle visualizer:

```bash
yarn build:analyze
```

Running all jest tests:

```bash
yarn test
```

Running changed jest tests on save in watch mode:

```bash
yarn test:watch
```

Running cypress tests headless:

```bash
yarn test:cypress
```

Running cypress tests:

```bash
yarn test:cypress:open
```

Linting:

```bash
yarn lint
```

Linting and attempting to auto-fix issues:

```bash
yarn lint:fix
```

Typechecking:

```bash
yarn typecheck
```

#### Widgets Development Locally

When you develop locally, the widgets-sample-app installs and imports the widgets as an es module. `import { WidgetsFactory} from '@imtbl/checkout-widgets'` This helps local development with hot reloading. (it takes a lot longer to rebuild and minify a browser bundle).

In production however, the widgets-lib package is built as a browser bundle and is dynamically included in the DOM when you call `await checkout.widgets()`.

To test this setup locally and force the widgets bundle to be loaded from `localhost` you will need to run

```
cd sdk
yarn start:local
```

```
cd widgets-lib
yarn build:local
```

```
cd widgets-sample-app
yarn start
```

You will then need to make sure that you replace your creation of a `new WidgetsFactory()` with a call to `await checkout.widgets()` within the sample app. This will pull in the built widgets.js bundle dynamically, but from your local filesystem.

In a production release, this script is loaded from a CDN. We are currently using `https://cdn.jsdelivr.net/npm/@imtbl/sdk/dist/browser/checkout/widgets.js`

### Project structure

```
─ checkout
      │
      ├── sdk - Checkout SDK
      │
      ├── sdk-sample-app - Sample app where the Checkout SDK is consumed
      │
      ├── widgets-lib - Checkout widgets
      │
      ├── widgets-sample-app - Sample app where the Checkout Widgets are consumed
      │
      └── README.md
```

[Read more about the Checkout SDK here](../../README.md#checkout)