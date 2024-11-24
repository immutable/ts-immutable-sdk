# Config

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Quick Start Guide

All commands below need to be run in the context of the `config` package where this README is located. Read more about context [here](../../README.md#context).

Running in `dev` mode:

```bash
yarn dev
```

Building to `./dist` directory with javascript output:

```bash
yarn build
```

Running all tests:

```bash
yarn test
```

Running changed tests in watch mode:

```bash
yarn test:watch
```

Linting:

```bash
yarn lint
```

Typechecking:

```bash
yarn typecheck
```


### About

This package contains the configuration class that can be used to create a new configuration object that is then passed into the Typescript SDK when an external consumer initializes it. It also contains the configuration types, enums, utility functions that are used to assist with the setup of this configuration object.

[Read more about the config package here](../../README.md#config)