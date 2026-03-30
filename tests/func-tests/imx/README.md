# func-tests

Functional tests using Cucumber and Gherkin

## Prerequisites

1. Open the repository root folder in VS Code
2. Install dependencies: `pnpm` (husky needs `node_modules` at the repo root to run)
3. Build the SDK: `pnpm build`

## Running the tests

1. Copy the .env.example file to .env and fill in the values (Immutable teams can use these: [sandbox](https://start.1password.com/open/i?a=CAJRPPG6M5BATGL7DATCR564CM&v=hn6z3wqnqrmqybiw43itbshigq&i=ojwubt5jhmzfjlwcu3fdsybgby&h=imtbl.1password.com) and [dev](https://start.1password.com/open/i?a=CAJRPPG6M5BATGL7DATCR564CM&v=hn6z3wqnqrmqybiw43itbshigq&i=abhpqgjt53ordt7fbe3ky3pr4m&h=imtbl.1password.com))
2. Run the tests: `pnpm test`

**Note:** Certain tests are skipped on CI because of the time they take to run. To run only these, use `pnpm test:ci`

## Filtering tests

By default, all tests that do not have the `@skip` tag are run. In other words, the tag filter is set to `not @skip`. 

You can change the tag filter on the command line: `TAGS="<tag-expression>" pnpm test`, or more permanently, by editing your .env file directly.

Examples of `<tag-expression>`:

* `@registration` - only run tests with the `@registration` tag
* `not @registration` - run all tests except those with the `@registration` tag

**Tip:** To focus on a single test, add the `@only` tag to the relevant scenario, and set the tag expression to match.

## Tests that take long

Please add the `@slow` tag to any tests that take longer than a few minutes to run. These tests will be skipped on CI.