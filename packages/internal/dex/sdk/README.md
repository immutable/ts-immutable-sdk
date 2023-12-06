# Immutable DEX SDK

Internal package that provides functionality around quoting and execution of swaps.

## Usage

```ts
const configuration = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
};

const exchange = new Exchange(configuration);

const { approval, quote, swap } = exchange.getUnsignedSwapTxFromAmountIn(
  fromAddress,
  tokenInAddress,
  tokenOutAddress,
  inputAmount,
);
```