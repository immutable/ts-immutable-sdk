# Checkout SDK Widgets Auto Updating Testing

This test covers autoupdating of the Checkout SDK's Widgets.
See https://immutable.atlassian.net/wiki/spaces/PR/pages/2796814550/Checkout+Widgets+Auto-Updating+Docs

## Getting Started

Install your dependencies:

```bash
yarn install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub

## Running locally

```bash
yarn dev
```

## E2E Testing

There are tests covering the auto updating of the Checkout Widget.

Build the app:

```bash
yarn build
```

Run tests with latest compatible remote bundle of the widgets:

```bash
yarn test:remotewidgets
```

To run these tests using a local bundle of the widgets, first build the entire Checkout SDK from the root of `ts-immutable-sdk`:

```bash
yarn build
```

Copy over the created widgets bundle to use for testing:

```bash
yarn workspace @examples/sdk-load-widgets-with-nextjs prepare:widgets
```

Run tests against the local bundle:

```bash
yarn test
```

### Validating Widget Breaking Changes

We can inject a Checkout Widgets Version Config into the app to validate auto updating.

```bash
INTERCEPT_CHECKOUT_VERSION_CONFIG=1.58.0 yarn workspace @examples/sdk-load-widgets-with-nextjs test
```