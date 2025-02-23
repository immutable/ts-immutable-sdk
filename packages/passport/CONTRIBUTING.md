# Passport

## Table of Contents

- [Quick Start Guide](#quick-start-guide)
- [Sample App Usage](#sample-app-usage)
  - [IMX workflows](#imx-workflows)
  - [ZkEvm workflows](#zkevm-workflows)
  - [Logging out](#logging-out)

### Quick Start Guide

All commands below need to be run in the context of the `passport` package in the `./sdk` folder unless specified otherwise. Read more about context [here](../../README.md#context).

Running the Passport SDK Sample App with the Passport SDK supporting hot reloading:

```bash
# Context: passport-sdk-sample-app in ./sdk-sample-app
pnpm dev-with-sdk
```

### Sample App Usage

#### IMX workflows

For all IMX workflows, you are required to log in with Passport before you can interact. You can do this with the dedicated `Login` button in the `Passport Methods` group, or be prompted when you first click the `Connect` button in the `IMX Workflow` group. if this is your first time setting up Passport, you will need to click the `Register User` button before interacting with any of the other workflows.

#### ZkEvm workflows

All ZkEvm workflows except `eth_requestAccounts` and `eth_sendTransaction` do not require you to be logged in and can be executed without having a connected Passport wallet. Specifically for `eth_sendTransaction` however, you must call `eth_requestAccounts` first.
Some function calls, such as `eth_gasPrice` and `eth_getBalance` will return a value prefixed by `0x` - these are in hexidecimal format and must be converted to base 10 if you are looking for the actual number.

#### Logging out

The sample app will keep authentication tokens in local storage and attempt to silently re-authenticate you if they are expired. If you wish to clear your authentication token in order to change accounts or environments, you can use the `Logout` button under `Passport Methods`.
