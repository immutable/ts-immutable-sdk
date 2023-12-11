# Passport Sample Application

The Passport sample application is a simple NextJS web app that provides a basic UI for many of the features in the Passport SDK.

## Running
To start the application, follow these steps:

1. Ensure you have all relevant tools installed. These include:
    a. `Node.js`. Versions 14 and 16 are officially supported, and while other versions may work, we cannot provide assistance for any errors encountered using them. If you need to manage different versions of Node, consider [nvm](https://github.com/nvm-sh/nvm).
    b. `yarn`. If you have already installed Node, you can install yarn with `npm install --global yarn`.
2. Ensure you have no other processes running on port 3000. This is the default port, and the only local address our authentication is configured to permit callbacks to, so you will not be able to authenticate on any other ports.
3. Run the following commands:
```bash
# Install deps
yarn workspace @imtbl/passport-sdk-sample-app install

# Build the passport SDK and run the sample app
yarn workspace @imtbl/passport build && yarn workspace @imtbl/passport-sdk-sample-app dev
```
Once this is complete, you can open [http://localhost:3000](http://localhost:3000) in your browser to visit and interact with the app. Changes made to the sample app and rebuilds of the Passport SDK will automatically trigger a refresh, so you do not need to restart for these to take effect.

## Usage

### IMX workflows
For all IMX workflows, you are required to log in with Passport before you can interact. You can do this with the dedicated `Login` button in the `Passport Methods` group, or be prompted when you first click the `Connect` button in the `IMX Workflow` group. if this is your first time setting up Passport, you will need to click the `Register User` button before interacting with any of the other workflows.

### ZkEvm workflows
All ZkEvm workflows except `eth_requestAccounts` and `eth_sendTransaction` do not require you to be logged in and can be executed without having a connected Passport wallet. Specifically for `eth_sendTransaction` however, you must call `eth_requestAccounts` first. 
Some function calls, such as `eth_gasPrice` and `eth_getBalance` will return a value prefixed by `0x` - these are in hexidecimal format and must be converted to base 10 if you are looking for the actual number.

### Logging out
The sample app will keep authentication tokens in local storage and attempt to silently re-authenticate you if they are expired. If you wish to clear your authentication token in order to change accounts or environments, you can use the `Logout` button under `Passport Methods`.