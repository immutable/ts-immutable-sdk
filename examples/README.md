## Contribution Guidelines

Important information on how to create examples, pull them through to the docs site and ensure they are covered by tests in the CI CD pipeline.


## Example Scope

When creating an example app it should contain only examples about one particular feature to prevent overloading the example. If there are multiple ways to use the feature then it is okay to include those in one sample app.

For example;

the app in `examples/passport/wallets-connect-with-nextjs` show how to connect passport in the nextjs framework. It contains a default route that has links to each of the examples. Inside there are three routes, one for each way to connect (EIP-1193, EtherJS and Wagmi). These are okay to be part of one sample app since they show how to use one feature but using 3 different libraries.

If you want to show a different feature e.g signing with passport, you should create a new example app. Even though it also requires passport to connect you should not add the signing example to the connect example app.

## Folder structure

Each product should have its own folder inside examples, and the examples for that product should be flatly arranged inside that folder, do not nest the examples deeper than this.

Each example app folder inside the product folder be named as `<feature>-with-<framework>`

Then if your example has multiple routes because there are multiple ways to use that feature e.g. you need to show how to use the feature using multiple libraries, then you should name your routes `<feature>-with<library>`.

eg.

```
examples
├── passport
│   ├── wallets-connect-with-nextjs
│   │   └── src
│   │       └── app
│   │           ├── page.tsx
│   │           ├── connect-with-eip1193
│   │           ├── connect-with-etherjs
│   │           └── connect-with-wagmi
│   └── wallets-signing-with-nextjs
│   │   └── src
│   │       └── app
│   │           ├── page.tsx
│   │           ├── sign-with-eip712
│   │           └── sign-with-erc191
│   └── ...
├── checkout
│   └── ...
```

If you need to create a new example follow the steps below;

## Creating a New Example

create the nextjs project

```
cd examples/<product>
yarn dlx create-next-app@latest
```

use the default options
```
✔ What is your project named? <feature>-with-<framework> e.g. wallets-with-nextjs
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias (@/*)? No
```

install dependencies

```
yarn install
```

install `@imtbl/sdk` and any other dependencies your example needs e.g.

```
yarn add @imtbl/sdk
yarn add @ethersproject/providers@^5.7.2
```

create a `.env.example` file in the root of the example. This will be committed to git so don't fill in the values

add a template for any environment variables you need to the `.env.example` file e.g.

```
NEXT_PUBLIC_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLIENT_ID=
```

copy the `.env.example` file to `.env` in the root of the example. The `.env` file should be automatically ignored by git.

populate any API keys and secrets e.g.

```
NEXT_PUBLIC_PUBLISHABLE_KEY="ABC"
NEXT_PUBLIC_CLIENT_ID="XYZ"
```

note: variables must be prefixed with `NEXT_PUBLIC_` to be piped into the browser env.

Update the readme with any instructions required to run the app, and include what required env variables there are with any instructions on what to populate there.

```
## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub
```

start the project with hot reloading

```
yarn dev
```

check `http://localhost:3000/` in the browser to confirm it compiled and ran

delete the contents of `src/app/globals.css`    

delete the any unused imports in `src/app/page.tsx`

delete the contents of the return statement in `src/app/page.tsx` and replace with `<></>`

update the title and description in `src/app/layout.tsx` to match the examples in your app e.g.

```
export const metadata: Metadata = {
  title: "Passport Wallets Connect",
  description: "Examples of how to connect wallets to Passport with NextJS",
};
```

create a home page for your example app with links to all the examples in `src/app/page.tsx`

e.g. `examples/passport/wallets-connect-with-nextjs/src/app/page.tsx`

create a route for each example using the naming convention `<feature>-with-<library>` e.g. `wallets-with-etherjs`

start building your examplesin the `page.tsx` in each of your example's route folders

e.g. `examples/passport/wallets-connect-with-nextjs/src/app/connect-with-etherjs/page.tsx`


## Creating Code Snippets

In your examples find the parts of the code you want to use as code snippets and wrap them in the `#doc` and `#enddoc` comments while providing a unique label.

Labels only have to be unique in the file, but they should be verbose so it makes it easy to know what they are e.g. 

e.g. `<product>-<feature>-<framework>-<example>-<library>-<tag>`

```
// #doc passport-wallets-nextjs-connect-eip1193-create
const passportProvider = passportInstance.connectEvm()
// #enddoc passport-wallets-nextjs-connect-eip1193-create
```

## Using Code Snippets in the Docs site

It's very simple, you just add a code block with the reference to the file you want to display e.g.

````
```js reference=examples/passport/wallets-connect-with-nextjs/src/app/connect-with-etherjs/page.tsx title="Connect Passport to Immutable zkEVM and create the Provider"
```
````

Or if you only want to display part of the file, add the `#` label of the snippet you want to display e.g.

````
```js reference=examples/passport/wallets-connect-with-nextjs/src/app/connect-with-etherjs/page.tsx#passport-wallets-nextjs-connect-etherjs-create title="Connect Passport to Immutable zkEVM and create the Provider"
```
````

All snippets should have a title, usually this can just be the file name the snippet comes from. Don't be shy adding extra context before or after the snippet explaining any key points which are necessary.

## Development process

Since the docs site by default is pulling the code examples from the main branch of `ts-immutable-sdk` they will not be available until they are merged. To get around this and view the snippets in the docs site before you merge the example to main you can point the docs site to use the branch you are working on in the sdk repo while you work on them.

Create a branch for your example in `ts-immutable-sdk` repo and a branch for your code snippets in `docs` repo.

Create your example in your `ts-immutable-sdk` branch and push it up to GitHub.

In your `docs` branch modify the file `/src/remark/import-code.mjs`

Update the `BRANCH` constant from `main` to your branch name e.g.

```
const BRANCH = 'DVR-193-passport-signing-example';
```

Now your docs branch will be pulling the code examples from your branch in `ts-immutable-sdk` and you can use them locally in your `docs` branch to make sure they make sense in the page.

Once you're happy with your examples, make the PR for your `ts-immutable-sdk` and get it merged into main. 

Then change the `BRANCH` constant back to `main` in the `/src/remark/import-code.mjs` file.

Now your examples are merged they will appear locally in your `docs` branch from main on `ts-immutable-sdk` and you can make any other updates you need to give the code examples context in the docs site.

Create your PR for your `docs` branch and get it merged into main. 

### WARNING

Do **NOT** merge your `docs` branch to main without pointing the code import back to the main branch on `ts-immutable-sdk` or it will break things when the branch is deleted and new code examples merged to main will not show in the docs site.


## Comments

All examples should be heavily commented and the comments should make sense in the context the snippet is appearing in the docs site.

## Tests

All examples need to lint and build without failing. If you have lint issues, run `yarn lint --fix` from the root of your example to fix and/or see the problems.

All examples should be covered by basic e2e tests to ensure they at least render the examples. Ideally they would also have e2e tests that prove the functionality that you're trying to show works. Depending on what you're doing in the examples, it may be difficult to e2e test certain things e.g. logging in with Passport. For this reason, testing of functionality with e2e testing is recommended if practical, but not required.

Install `@playwright/test` as a dev dependency for the e2e tests.

```
yarn add -D @playwright/test
```

Create a `playwright.config.ts` file in the root of the example app and add this configuration;

```
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },

    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],

  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Create a `tests` directory in the root of the example app and start adding tests.

Example of the base level of testing required can be found in `/examples/passport/wallets-signing-with-nextjs/tests/base.spec.ts`

Add the test runner to the scripts in your package.json

```
"test": "playwright install --with-deps && playwright test"
```

Run your tests with `yarn test`
