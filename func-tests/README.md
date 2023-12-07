# func-tests

Functional tests using Cucumber and Gherkin

## Prerequisites

1. Open the repository root folder in VS Code
2. Install dependencies: `yarn` (husky needs `node_modules` at the repo root to run)
3. Build the SDK: `yarn build`
4. cd into `func-tests`
5. Install dependencies: `yarn` (this also configures husky)

## Running the tests

1. Copy the .env.dev file to .env (CI runs against sandbox)
2. Run the tests: `yarn test`

**Note:** Certain tests are skipped on CI because of the time they take to run. To run only these, use `yarn test:ci`

## Filtering tests

By default, all tests that do not have the `@skip` tag are run. In other words, the tag filter is set to `not @skip`. You can see this in the [.env.sandbox](.env.sandbox) file.

You can change the tag filter on the command line: `TAGS="<tag-expression>" yarn test`, or more permanently, by editing your .env file directly.

Examples of `<tag-expression>`:

* `@registration` - only run tests with the `@registration` tag
* `not @registration` - run all tests except those with the `@registration` tag

**Tip:** To focus on a single test, add the `@only` tag to the relevant scenario, and set the tag expression to match.