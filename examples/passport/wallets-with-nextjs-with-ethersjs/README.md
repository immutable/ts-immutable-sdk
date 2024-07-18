This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Steps

create the nextjs project

```
cd examples/passport
npx create-next-app@latest
```

use the default options
```
✔ What is your project named?wallets-with-nextjs-with-ethersjs
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias (@/*)? No
```

create empty `yarn.lock` file in project folder

```
cd wallets-with-nextjs-with-ethersjs
touch yarn.lock
```

install dependencies

```
yarn install
```

install `@imtbl/sdk` and any other dependencies your example needs e.g.

```
yarn add @imtbl/sdk
yarn add ethers@^5.7.2
```

add the `next.config.mjs` file to your gitignore so you don't commit the environment variables.

add environment variables to the next.config.mjs file and populate any API keys and secrets e.g.

```
const nextConfig = {
    env: {
        PUBLISHABLE_KEY: "ABC",
        CLIENT_ID: "XYZ",
    }
};
```


start the project with hot reloading

```
yarn next
```

check `http://localhost:3000/` in the browser to confirm it compiled and ran

delete the contents of `app/globals.css`    

delete the any unused imports in `app/page.tsx`

delete the contents of the return statement in `app/page.tsx` and replace with `<></>`

start creating the example in `app/page.tsx`