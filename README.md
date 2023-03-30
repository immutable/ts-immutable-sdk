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

This repository consumes Jest as a unit-testing framework, and is configured at the root level.

### Running tests

To test this SDK locally, you can run the following commands from the ROOT directory:

```sh
# Install dependencies
yarn

# Runs ALL tests
yarn test
```

This will run ALL test suites in the repository, mimicking what our CI workflow does.

To run tests specific to a module, you can run one of the following commands, as defined in the root [`package.json`](package.json#L18):

```sh
yarn test:passport # Runs ALL tests within src/modules/passport
yarn test:dev-auth # Runs ALL tests within src/modules/dev-auth
yarn test:checkout # Runs ALL tests within src/modules/checkout
yarn test:apis # Runs ALL tests within src/modules/apis
yarn test:provider # Runs ALL tests within src/modules/provider
```

You can also extend these commands, by using Jest syntax such as regex or to target specific tests to run:

```sh
yarn test:checkout -t "this is a test name"
```

Please note that few directories are intentionally ignored for testing, such as sample apps, due to a conflict of multiple technologies.

### Writing tests

We are currently not enforcing a preference for testing practices. It is completely up to your team (i.e. module) to decide how you wish to structure your tests within the modules.

Currently, few modules in this repository have their own `package.json` configs. The root [`package.json`](package.json) is the entry point for this SDK and for all CI testing purposes. Therefore, if you wish to write tests, please consider that the root `yarn test` command must pick it up, and that the root Jest [`jest.config.ts`](jest.config.ts) configuration applies.
