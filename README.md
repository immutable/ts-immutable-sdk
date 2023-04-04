<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Immutable TypeScript SDK

## Testing

This repository uses Jest as the default unit-testing framework, and is configured independently at each package directory. Due to the build system, you have the flexibility within each package to test appropriately.

### Running tests

To test this SDK locally, you can:

#### **Run ALL test suites (mimicking what our CI workflow does)**

```sh
# Install dependencies
yarn

# Runs ALL tests
yarn test
```

Or,

#### **Run test suites specific to a package**

To run test suites specific to a package, you will require to change directory to a package, and run `yarn test` there. You can also extend this command, by using Jest syntax such as regex or to target specific tests to run:

```sh
cd packages/passport && yarn test
cd packages/checkout && yarn test
cd packages/internal/toolkit && yarn test
cd packages/provider && yarn test
cd packages/starkex && yarn test
```

You can also extend these commands, by using Jest syntax such as regex or to target specific tests to run:

```sh
cd packages/passport && yarn test -t "this is a test name within passport testing suite"
```

### Writing tests

We are currently not enforcing a preference for testing practices. It is completely up to your team to decide how you test your package.

The root [`package.json`](package.json) is the entry point for all CI testing purposes. Therefore, if you wish to write tests for an existing or new package, please ensure that a `"test"` script exists in the associated `package.json` file so that it is picked up by the [`root "test" command.`](package.json#L19)
