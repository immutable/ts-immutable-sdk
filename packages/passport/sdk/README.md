# Overview
The SDK for the Immutable Passport TypeScript SDK.

## What is Passport?
Passport is a blockchain-based identity and wallet system that caters to the needs of Web3 games. It offers a persistent identity that accompanies users across Web3 games, ensuring a consistent configuration across all applications.

Passport also comes equipped with a non-custodial wallet as a default option for each user, ensuring a transaction experience comparable to web2 standards.

## What prerequisites do I need to contribute?
In order to effectively develop and test the Passport SDK, it is recommended you have the following installed:
1. A modern JavaScript IDE or text editor, such as WebStorm or Visual Studio Code.
2. Node.js. The SDK has been tested on versions 14.x and 16.x, however later versions may work too. If you need to downgrade, use [NVM](https://github.com/nvm-sh/nvm).
3. [Yarn](https://www.npmjs.com/package/yarn).

## How do I contribute?
Before contributing, please make sure you have read and understood the instructions in the `README` file at the root of the repository. Once you have done this and made your change, ensure you have also done the following:
1. Manually tested your changes to check they're functioning as expected (see the "Testing locally" section below).
2. Updated any relevant test files to reflect your changes.
3. Ensured all automated tests are passing - you can confirm this by running `yarn workspace @imtbl/passport test`
4. Ensured all changes are linter compliant - you can confirm this by running `yarn workspace @imtbl/passport lint`
5. Ensured all changes are TypeScript compliant - you can confirm this by runnning `yarn workspace @imtbl/passport typecheck`

## Testing locally
There are two primary ways to test the Passport SDK locally: installing it to a local project, or using the `sdk-sample-app` project provided as part of this repository.

### Using the sample app
The quickest and easiest way to test changes to the Passport SDK is using the `sdk-sample-app`, located next to this project. For details on how to install and run the sample app, please refer to the README in the project directory.

### Installing to a local project
If you need to test changes to the Passport SDK in the specific context of your own application, or if the changes are otherwise not possible to test within the limited capability of the sample app, you can do so using your package manager with these instructions:
1. Build the full SDK. You can do this with `yarn workspace @imtbl/sdk build`
2. Remove the existing version of the `ts-immutable-sdk` from your dependencies with `yarn remove @imtbl/sdk` or `npm uninstall @imtbl/sdk`
3. Install a local version of the Immutable Typescript SDK. You can do this from your project by running `yarn install /path/to/ts-immutable-sdk/sdk`, or `npm i /path/to/ts-immutable-sdk/sdk`. 