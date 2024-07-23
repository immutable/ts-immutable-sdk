## Contribution Guidelines

Important information on how to create examples, pull them through to the docs site and ensure they are covered by tests in the CI CD pipeline.

## Create a New Example

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

create a `.env` file in the root of the example.

add environment variables to the `.env` file and populate any API keys and secrets e.g.

```
NEXT_PUBLIC_PUBLISHABLE_KEY="ABC"
NEXT_PUBLIC_CLIENT_ID="XYZ"
```

note: variables must be prefixed with `NEXT_PUBLIC_` to be piped into the browser env.

start the project with hot reloading

```
yarn next
```

check `http://localhost:3000/` in the browser to confirm it compiled and ran

delete the contents of `src/app/globals.css`    

delete the any unused imports in `src/app/page.tsx`

delete the contents of the return statement in `src/app/page.tsx` and replace with `<></>`

create a home page for your example app with links to all the examples in `src/app/page.tsx`

e.g. `examples/passport/wallets-with-nextjs/src/app/page.tsx`

create a route for each example using the naming convention `<feature>-with-<library>` e.g. `wallets-with-etherjs`

start building your examplesin the `page.tsx` in each of your example's route folders

e.g. `examples/passport/wallets-with-nextjs/src/app/connect-with-etherjs/page.tsx`


## Creating Code Snippets

In your examples find the parts of the code you want to use as code snippets and wrap them in the `#doc` and `#enddoc` comments while providing a unique label.

Labels only have to be unique in the file, but they should be verbose so it makes it easy to know what they are e.g. 

e.g. `<product>-<feature>-<framework>-<example>-<library>-<tag>

```
// #doc passport-wallets-nextjs-connect-eip1193-create
const passportProvider = passportInstance.connectEvm()
// #enddoc passport-wallets-nextjs-connect-eip1193-create
```

## Using Code Snippets in the Docs site

It's very simple, you just add a code block with the reference to the file and tag you want to pull in e.g.

```js reference=examples/passport/wallets-with-nextjs/src/app/connect-with-etherjs/page.tsx#passport-wallets-nextjs-connect-etherjs-create title="Connect Passport to Immutable zkEVM and create the Provider"
```

## Comments

All examples should be heavily commented and the comments should make sense in the context the snippet is appearing in the docs site.

## Tests

All examples should be covered by e2e tests to ensure they successfully do the action the code sample is showing in the docs site.
