## Getting Started

First, run the setup:

**Note**: There may be some errors in the terminal, that's ok! You can ignore these.

```bash
yarn setup
```

Second, create a file called `.env.local` in the `sdk-sample-app` directory. Put the following variables in, set as their respective contract addresses:

```bash
NEXT_PUBLIC_MULTICALL_CONTRACT_DEV=
NEXT_PUBLIC_CORE_FACTORY_DEV=
NEXT_PUBLIC_QUOTER_V2_DEV=
NEXT_PUBLIC_PERIPHERY_ROUTER_DEV=
NEXT_PUBLIC_MIGRATOR_DEV=
NEXT_PUBLIC_NONFUNGIBLE_POSITION_MANAGER_DEV=
NEXT_PUBLIC_TICK_LENS_DEV=
NEXT_PUBLIC_COMMON_ROUTING_FUN=
NEXT_PUBLIC_COMMON_ROUTING_USDC=
NEXT_PUBLIC_COMMON_ROUTING_WETH=
```

Then also add the RPC URL and the chain ID:

```bash
NEXT_PUBLIC_RPC_URL_DEV=
NEXT_PUBLIC_CHAIN_ID_DEV=
```

Finally, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/components/Example.tsx`. The page auto-updates as you edit the file.
