<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Welcome to Immutable Unified TypeScript SDK</h1>
</div>

## Documentation

[Typescript SDK Official Starting guide](https://docs.immutable.com/sdk-docs/ts-immutable-sdk/overview/)

Checkout our API references for more information.
- [Immutable X API Reference](https://docs.immutable.com/x/reference)
- [Immutable zkEVM API Reference](https://docs.immutable.com/zkevm/api/reference)

## Installation

```sh
npm install @imtbl/sdk
# or
yarn add @imtbl/sdk
```
## Disclaimer for Alpha Releases

Please note that alpha releases are still in development and may contain bugs or breaking changes. Please do not use these versions as we do not intend to support them.

## Changelog

### [0.29.0] - 13-11-2023

#### Changed (breaking)

##### The `connectImx` method no longer registers users on Immutable X

This method was previously responsible for automatically [registering a user](https://docs.immutable.com/docs/x/how-to-register-users/)
the first time they connect to Immutable X.

###### Before

```ts
const passport = new Passport(...);
const provider = await passport.connectImx();
```

###### After

Passport now allows you to manage the registration process yourself through the `isRegisteredOffchain` and
`registerOffchain` functions.

This gives you the advantage of potentially displaying a custom UI informing the user that they’re being registered,
as opposed to the previous experience where the user was waiting until the `connectImx` step completed all the steps.

```ts
const passport = new Passport(...);
const provider = await passport.connectImx();

if (!await provider.isRegisteredOffchain()) {
  // Potentially inform the user the user that are about to be
  // registered on Immutable X
  await provider.registerOffchain();
}

// The user's wallet is registered, they are now ready to use Immutable X
const response = await provider.transfer(...);
```

##### Passport is now a client-side only module

This change is only relevant if you are using server-side rendering (SSR).

Passport has a dependency on browser-specific primitives, such as the `window` object, and therefore is intended to be
used in a client-side environment only.

Depending on your framework, you may need to update how you were instantiating the Passport instance to ensure
this happens on the client.

### [0.28.2] - 30-10-2023

#### Added

We have added a new `login` method that allows you to authenticate users without necessarily instantiating their wallets.

##### Before

Previously, you had to authenticate users as follows:

```ts
const passport = new Passport(...);
const provider = await passport.connectImx();
```

The `connectImx` function performed the following tasks under the hood:

- Completed the OIDC authentication flow to log the user in
- Instantiated their wallet based on their identity
- Registered the user on the Immutable X ecosystem

Although this simple API was simple and convenient, we have decided to decouple it into explicit methods based on customer feedback to provide you with more flexibility.

##### After

From now on, you can authenticate users as follows:

```ts
const passport = new Passport(...);
const user = await passport.login();
```

The login method only authenticates the user. This allows you to separate the authentication process from wallet
instantiation and the registration step, giving you greater control and flexibility in managing user
authentication within your application.

This is especially useful if your application only uses Passport for authentication and does not leverage
the wallet component.

However, if you want to instantiate the wallet, you can do so as follows:

```ts
const passport = new Passport(...);
const user = await passport.login(); // Optional

const provider = await passport.connectImx();
```

Depending on your application, you may decide to only log in the user when they click on “Sign in with Passport”
using `login`, and instantiate the wallet using `connectImx` in the background, ensuring a seamless
and user-friendly experience.

Note that the `connectImx` method will attempt to log the user in automatically if you haven’t explicitly called login
before connecting to Immutable X.

The following code will have the same outcome as the snippet above, but it's important to note that the `Promise`
returned by `connectImx` will not resolve until the user has successfully logged in and their wallet has been
instantiated, potentially leading to a less streamlined user experience.

```ts
const passport = new Passport(...);
const provider = await passport.connectImx();
```

Find more information about authenticating users in the [Passport Login documentation](https://docs.immutable.com/docs/x/passport/identity/login#1-trigger-the-login-process).

#### Deprecated

Following the introduction of the `login` method, we have deprecated the `connectImxSilent` method.

This method was previously used for [rehydrating the session of previously authenticated users](https://docs.immutable.com/docs/x/passport/identity/login/#3-maintaining-the-login-status)
on page reloads.

##### Before

```ts
// On page load, attempt to re-authenticate the user without propting them to
// sign in based on their cached session and initialise the wallet.
const provider = await passport.connectImxSilent();

if (!provider) {
  // The user session couldn't be recovered. The user will have to explicitly
  // sign in again by clicking a button that trigger passport.connectImx()
}
```

##### After
```ts
// On page load, attempt to re-authenticate the user without propting them to
// sign in based on their cached session.
const user = await passport.login({ useCachedSession: true });
if (user) {
  // The user session is still valid, we can now initialise the wallet
  const provider = await passport.connectImx();
}
```
