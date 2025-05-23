# Immutable DEX sample application

This sample app demonstrates retrieving a swap transaction, displaying swap details to the user and executing the swap transaction using the Metamask browser extension.

## Getting Started

Create a file called `.env.local` in the `sdk-sample-app` directory. Add the following environment variables:

- Contracts:

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

- RPC URL and Chain ID:

```bash
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=
```

Run the development server:

```bash
pnpm dev # this also watches & builds changes in @imtbl/dex package.
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/components/Example.tsx`. The page auto-updates as you edit the file.
