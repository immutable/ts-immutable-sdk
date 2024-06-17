# Passport

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Quick Start Guide](#quick-start-guide)
- [About](#about)
- [Sample App Usage](#sample-app-usage)
  - [IMX workflows](#imx-workflows)
  - [ZkEvm workflows](#zkevm-workflows)
  - [Logging out](#logging-out)

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Quick Start Guide

All commands below need to be run in the context of the `passport` package in the `./sdk` folder unless specified otherwise. Read more about context [here](../../README.md#context).

Running in `dev` mode:

```bash
yarn dev
```

Running the Passport SDK Sample App with the Passport SDK supporting hot reloading:

```bash
# Run the Passport SDK first
# Context: passport in ./sdk
yarn dev

# Run the Passport SDK Sample App in a new terminal
# Context: passport-sdk-sample-app in ./sdk-sample-app
yarn dev

# Alternatively, you can run both commands in one terminal via the below
yarn workspace @imtbl/passport-sdk-sample-app dev & yarn workspace @imtbl/passport dev
```

Building to the `./sdk/dist` directory:

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

Typechecking:

```bash
yarn typecheck
```

### About 

Passport is a blockchain-based identity and wallet system that caters to the needs of Web3 games. It offers a persistent identity that accompanies users across Web3 games, ensuring a consistent configuration across all applications.

Passport also comes equipped with a non-custodial wallet as a default option for each user, ensuring a transaction experience comparable to web2 standards.

The Passport sample application is a simple NextJS web app that provides a basic UI for many of the features in the Passport SDK. It can also be used to locally test any changes to the SDK. 

[Read more about the Passport SDK here](../../README.md#passport)

### Sample App Usage

#### IMX workflows
For all IMX workflows, you are required to log in with Passport before you can interact. You can do this with the dedicated `Login` button in the `Passport Methods` group, or be prompted when you first click the `Connect` button in the `IMX Workflow` group. if this is your first time setting up Passport, you will need to click the `Register User` button before interacting with any of the other workflows.

#### ZkEvm workflows
All ZkEvm workflows except `eth_requestAccounts` and `eth_sendTransaction` do not require you to be logged in and can be executed without having a connected Passport wallet. Specifically for `eth_sendTransaction` however, you must call `eth_requestAccounts` first. 
Some function calls, such as `eth_gasPrice` and `eth_getBalance` will return a value prefixed by `0x` - these are in hexidecimal format and must be converted to base 10 if you are looking for the actual number.

#### Logging out
The sample app will keep authentication tokens in local storage and attempt to silently re-authenticate you if they are expired. If you wish to clear your authentication token in order to change accounts or environments, you can use the `Logout` button under `Passport Methods`.