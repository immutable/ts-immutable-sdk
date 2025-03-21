# Checkout SDK Widgets Example App

This example app shows how to use the Commerce Widget, loaded from the Checkout SDK. It will cover scenarios including mounting, executing flows, and handling events.

**Example App implementation progress:**
- [x] Mounting Commerce Widget
- [ ] Executing different flows
- [ ] Events

## Getting Started

Install your dependencies:

```bash
pnpm install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub

## Running locally

```bash
pnpm dev
```

## E2E Testing

There are tests covering the auto updating of the Commerce Widget.

Build the app:

```bash
pnpm build
```

Run tests with remote bundle of the widgets:

```bash
pnpm test:remote
```