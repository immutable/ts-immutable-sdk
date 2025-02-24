# Checkout

## Table of Contents

- [Checkout SDK Quick Start Guide](#checkout-sdk-quick-start-guide)
- [Widgets Library Quick Start Guide](#widgets-library-quick-start-guide)
  - [Widgets Development Locally](#widgets-development-locally)
- [Project structure](#project-structure)

### Checkout SDK Quick Start Guide

All commands below need to be run in the context of the `checkout-sdk` package in the `./sdk` folder unless specified otherwise. Read more about context [here](../../README.md#context).

Running in `dev` mode using the `immutable-devnet` network:

```bash
pnpm start:dev
```

Running in `sandbox`/`production` mode using the `immutable-testnet`/`mainnet` network based on the environment value set for the `SANDBOX_CONFIGURATION` config object in the `./sdk/src/sdk.ts` file (note the preferred way to run this command is to run `pnpm dev` in the root of the repo to run all packages in watch mode together):

```bash
pnpm start
```

Running the Checkout SDK Sample App with the Checkout SDK supporting hot reloading:

```bash
# Run the Checkout SDK first
# Context: checkout-sdk in ./sdk
pnpm start

# Run the Checkout SDK Sample App in a new terminal
# Context: checkout-sdk-sample-app in ./sdk-sample-app
pnpm start
```

Building to the `./sdk/dist` directory for `dev` environment:

```bash
pnpm build:dev
```

Building to the `./sdk/dist` directory for `sandbox`/`production` environment:

```bash
pnpm build
```

Generate Typescript API documentation (viewable in the newly generated docs folder at [./sdk/docs/README.md](./sdk/docs/README.md)):

```bash
pnpm docs
```

### Widgets Library Quick Start Guide

All commands below need to be run in the context of the `checkout-widgets` package in the `./widgets-lib` folder unless specified otherwise. Read more about context [here](../../README.md#context).

Running in `dev` mode (widgets-lib depends upon checkout-sdk):

```bash
# Run the Checkout SDK first
# Context: checkout-sdk in ./sdk
pnpm start:dev

# Run the Widgets Library in a new terminal
# Context: checkout-widgets in ./widgets-lib
pnpm start
```

Running the Widgets Sample App with the Widgets Library supporting hot reloading:

```bash
# Run the above two commands first
# ...

# Run the Widgets Sample App in a new terminal
# Context: checkout-widgets-sample-app in ./widgets-sample-app
pnpm start
```

**Read more about running locally below.**

#### Widgets Development Locally

When you develop locally, the widgets-sample-app installs and imports the widgets as an es module. `import { WidgetsFactory} from '@imtbl/checkout-widgets'` This helps local development with hot reloading. (it takes a lot longer to rebuild and minify a browser bundle).

In production however, the widgets-lib package is built as a browser bundle and is dynamically included in the DOM when you call `await checkout.widgets()`.

To test this setup locally and force the widgets bundle to be loaded from `localhost` you will need to run

```bash
# Run the Checkout SDK first in local dev mode
# Context: checkout-sdk in ./sdk
pnpm start:local
```

```bash
# Build the Widgets Library in a new terminal in local mode
# Context: checkout-widgets in ./widgets-lib
pnpm build:local
```

```bash
# Run the Widgets Sample App in a new terminal
# Context: checkout-widgets-sample-app in ./widgets-sample-app
pnpm start
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
      ├── widgets-lib - Commerce Widgets
      │
      ├── widgets-sample-app - Sample app where the Commerce Widgets are consumed
      │
      └── README.md
```

[Read more about the Checkout SDK here](../../README.md#checkout)