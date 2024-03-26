# Immutable DEX SDK

Internal package that provides functionality around quoting and execution of swaps.

## Usage

### Initialize the exchange

```ts
const configuration = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
};

const exchange = new Exchange(configuration);
```

### Get a quote and transactions for an Exact Input swap.

```ts

const { approval, quote, swap } = exchange.getUnsignedSwapTxFromAmountIn(
  recipientAddress,
  tokenInAddress,
  tokenOutAddress,
  requestedAmountIn,
);
```

### Get a quote and transactions for an Exact Output swap.

```ts

const { approval, quote, swap } = exchange.getUnsignedSwapTxFromAmountOut(
  recipientAddress,
  tokenInAddress,
  tokenOutAddress,
  requestedAmountOut,
);
```

The returned values are:

- `approval`: The approval transaction that needs to be signed and sent to the blockchain before the swap transaction.
- `quote`: The quote information that details the swap.
- `swap`: The swap transaction that needs to be signed and sent to the blockchain after the approval transaction.
