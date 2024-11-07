import { TradeType } from '@uniswap/sdk-core';
import { Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { BigNumberish, BytesLike, formatUnits, keccak256, parseUnits, Result, toUtf8Bytes } from 'ethers';
import { QuoteResult } from '../lib/getQuotesForRoutes';
import { NativeTokenService } from '../lib/nativeTokenService';
import { ExchangeModuleConfiguration, SecondaryFee, CoinAmount, Coin, ERC20, Native, Amount } from '../types';
import { ImmutableSwapProxy__factory } from '../contracts/types';
import { IV3SwapRouter } from '../contracts/types/ImmutableSwapProxy';
import { erc20ToUniswapToken, newAmount, Router, RoutingContracts } from '../lib';
import swapRouterContract from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/ISwapRouter02.sol/ISwapRouter02.json'
import { Interface, formatEther as eFormatEther } from 'ethers';

export const TEST_BASE_FEE = BigInt('49'); // 49 wei
export const TEST_MAX_PRIORITY_FEE_PER_GAS = BigInt('10000000000'); // 10 gwei
export const TEST_GAS_PRICE = BigInt('10000000098'); // TEST_MAX_PRIORITY_FEE_PER_GAS + 2 * TEST_BASE_FEE
export const TEST_TRANSACTION_GAS_USAGE = BigInt('200000'); // 200,000 gas units

export const TEST_CHAIN_ID = 999;
export const TEST_RPC_URL = 'https://0.net';

export const TEST_FROM_ADDRESS = '0x94fC2BcA2E71e26D874d7E937d89ce2c9113af6e';
export const TEST_FEE_RECIPIENT = '0xe3ece548F1DD4B1536Eb6eE188fE35350bc1dd16';

export const TEST_MAX_FEE_BASIS_POINTS = 1000; // 10%

// Contracts
export const TEST_MULTICALL_ADDRESS = '0x66d0aB680ACEe44308edA2062b910405CC51A190';
export const TEST_V3_CORE_FACTORY_ADDRESS = '0x23490b262829ACDAD3EF40e555F23d77D1B69e4e';
export const TEST_QUOTER_ADDRESS = '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5';
export const TEST_ROUTER_ADDRESS = '0x615FFbea2af24C55d737dD4264895A56624Da072';
export const TEST_V3_MIGRATOR_ADDRESSES = '0x0Df0d2d5Cf4739C0b579C33Fdb3d8B04Bee85729';
export const TEST_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x446c78D97b1E78bC35864FC49AcE1f7404F163F6';
export const TEST_TICK_LENS_ADDRESSES = '0x3aC4F8094b21A6c5945453007d9c52B7e15340c0';
export const TEST_SWAP_PROXY_ADDRESS = '0x8dBE1f0900C5e92ad87A54521902a33ba1598C51';

export const TEST_ROUTING_CONTRACTS: RoutingContracts = {
  coreFactory: TEST_V3_CORE_FACTORY_ADDRESS,
  quoter: TEST_QUOTER_ADDRESS,
  multicall: TEST_MULTICALL_ADDRESS,
};

export const IMX_TEST_TOKEN: ERC20 = {
  chainId: TEST_CHAIN_ID,
  address: '0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851',
  decimals: 18,
  symbol: 'IMX',
  name: 'Immutable X',
  type: 'erc20',
};

export const WIMX_TEST_TOKEN: ERC20 = {
  chainId: TEST_CHAIN_ID,
  address: '0xAf7cf5D4Af0BFAa85d384d42b8D410762Ccbce69',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable X',
  type: 'erc20',
};

export const WETH_TEST_TOKEN: ERC20 = {
  chainId: TEST_CHAIN_ID,
  address: '0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE',
  decimals: 18,
  symbol: 'WETH',
  name: 'Wrapped Ether',
  type: 'erc20',
};

export const USDC_TEST_TOKEN: ERC20 = {
  chainId: TEST_CHAIN_ID,
  address: '0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC',
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
  type: 'erc20',
};

export const FUN_TEST_TOKEN: ERC20 = {
  chainId: TEST_CHAIN_ID,
  address: '0xCc7bb2D219A0FC08033E130629C2B854b7bA9195',
  decimals: 18,
  symbol: 'FUN',
  name: 'The Fungibles Token',
  type: 'erc20',
};

export const NATIVE_TEST_TOKEN: Native = {
  chainId: TEST_CHAIN_ID,
  decimals: 18,
  symbol: 'IMX',
  name: 'Native Immutable X',
  type: 'native',
};

export const nativeTokenService = new NativeTokenService(NATIVE_TEST_TOKEN, WIMX_TEST_TOKEN);

export const TEST_IMMUTABLE_CONFIGURATION: ImmutableConfiguration = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const TEST_DEX_CONFIGURATION: ExchangeModuleConfiguration = {
  baseConfig: TEST_IMMUTABLE_CONFIGURATION,
  chainId: TEST_CHAIN_ID,
  overrides: {
    rpcURL: TEST_RPC_URL,
    exchangeContracts: {
      multicall: TEST_MULTICALL_ADDRESS,
      coreFactory: TEST_V3_CORE_FACTORY_ADDRESS,
      quoter: TEST_QUOTER_ADDRESS,
      swapRouter: TEST_ROUTER_ADDRESS,
      immutableSwapProxy: TEST_SWAP_PROXY_ADDRESS,
    },
    commonRoutingTokens: [],
    nativeToken: NATIVE_TEST_TOKEN,
    wrappedNativeToken: WIMX_TEST_TOKEN,
  },
};

export const refundETHFunctionSignature = '0x12210e8a';

export type PromiseOrValue<T> = T | Promise<T>;

export type SwapTest = {
  fromAddress: string;
  pools: Pool[];
  inputToken: string;
  outputToken: string;
  intermediaryToken: string | undefined;
};

// uniqBy returns the unique items in an array using the given comparator
export function uniqBy<K, T extends string | number>(array: K[], comparator: (arg: K) => T): K[] {
  const uniqArr: Partial<Record<T, K>> = {};

  for (let i = 0; i < array.length; i++) {
    const firstCompare = comparator(array[i]);

    uniqArr[firstCompare] = array[i];
  }

  return Object.values(uniqArr);
}

export function decodePathForExactInput(path: string) {
  return {
    inputToken: path.substring(0, 42),
    firstPoolFee: BigInt(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: BigInt(parseInt(`0x${path.substring(88, 94)}`, 16)),
    outputToken: `0x${path.substring(94, 134)}`,
  };
}

export function decodePathForExactOutput(path: string) {
  return {
    outputToken: path.substring(0, 42),
    firstPoolFee: BigInt(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: BigInt(parseInt(`0x${path.substring(88, 94)}`, 16)),
    inputToken: `0x${path.substring(94, 134)}`,
  };
}

type SecondaryFeeFunctionName =
  | 'exactInputSingleWithSecondaryFee'
  | 'exactOutputSingleWithSecondaryFee'
  | 'exactInputWithSecondaryFee'
  | 'exactOutputWithSecondaryFee'
  | 'unwrapNativeToken';

type SwapRouterFunctionName = 'exactInputSingle' | 'exactOutputSingle' | 'exactInput' | 'exactOutput';

function decodeSecondaryFeeCall(
  calldata: BytesLike,
  ...functionNames: SecondaryFeeFunctionName[]
): { deadline: bigint; functionData: Record<string, Result> } {
  const iface = ImmutableSwapProxy__factory.createInterface();
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

  const functionData: Record<string, Result> = {};

  functionNames.forEach((functionName, i) => {
    if (topLevelParams.data.length <= i) return;
    const data = topLevelParams.data[i];
    if (typeof data === 'string') {
      functionData[functionName] = iface.decodeFunctionData(functionName, data);
    } else {
      functionData[functionName] = [] as any;
    }
  });

  return { deadline: topLevelParams.deadline, functionData };
}

function decodeSwapRouterCall(calldata: BytesLike, functionName: SwapRouterFunctionName) {
  const iface = new Interface(swapRouterContract.abi);
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);
  const data = topLevelParams.data[0];
  if (typeof data !== 'string') throw new Error();

  return iface.decodeFunctionData(functionName, data);
}

export function decodeMulticallExactInputWithFees(data: BytesLike) {
  const {
    functionData: { exactInputWithSecondaryFee, unwrapNativeToken },
    deadline,
  } = decodeSecondaryFeeCall(data, 'exactInputWithSecondaryFee', 'unwrapNativeToken');

  const secondaryFeeParams: SecondaryFee[] = exactInputWithSecondaryFee[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactInputParamsStruct = {
    path: exactInputWithSecondaryFee[1][0],
    recipient: exactInputWithSecondaryFee[1][1],
    amountIn: exactInputWithSecondaryFee[1][2],
    amountOutMinimum: exactInputWithSecondaryFee[1][3],
  };

  return { secondaryFeeParams, swapParams, unwrapTokenParams: unwrapNativeToken, deadline };
}

export function decodeMulticallExactInputWithoutFees(data: BytesLike) {
  const decodedParams = decodeSwapRouterCall(data, 'exactInput');

  const swapParams: IV3SwapRouter.ExactInputParamsStruct = {
    path: decodedParams[0][0],
    recipient: decodedParams[0][1],
    amountIn: decodedParams[0][2],
    amountOutMinimum: decodedParams[0][3],
  };

  return { swapParams };
}

export function decodeMulticallExactOutputWithFees(data: BytesLike) {
  const {
    functionData: { exactOutputWithSecondaryFee, unwrapNativeToken },
    deadline,
  } = decodeSecondaryFeeCall(
    data,
    'exactOutputWithSecondaryFee',
    'unwrapNativeToken',
  );

  const secondaryFeeParams: SecondaryFee[] = exactOutputWithSecondaryFee[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactOutputParamsStruct = {
    path: exactOutputWithSecondaryFee[1][0],
    recipient: exactOutputWithSecondaryFee[1][1],
    amountOut: exactOutputWithSecondaryFee[1][2],
    amountInMaximum: exactOutputWithSecondaryFee[1][3],
  };

  return { secondaryFeeParams, swapParams, unwrapTokenParams: unwrapNativeToken, deadline };
}

export function decodeMulticallExactInputSingleWithFees(data: BytesLike) {
  const {
    functionData: { exactInputSingleWithSecondaryFee, unwrapNativeToken },
    deadline,
  } = decodeSecondaryFeeCall(
    data,
    'exactInputSingleWithSecondaryFee',
    'unwrapNativeToken',
  );

  const secondaryFeeParams: SecondaryFee[] = exactInputSingleWithSecondaryFee[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactInputSingleParamsStruct = {
    tokenIn: exactInputSingleWithSecondaryFee[1][0],
    tokenOut: exactInputSingleWithSecondaryFee[1][1],
    fee: exactInputSingleWithSecondaryFee[1][2],
    recipient: exactInputSingleWithSecondaryFee[1][3],
    amountIn: exactInputSingleWithSecondaryFee[1][4],
    amountOutMinimum: exactInputSingleWithSecondaryFee[1][5],
    sqrtPriceLimitX96: exactInputSingleWithSecondaryFee[1][6],
  };

  return { secondaryFeeParams, swapParams, unwrapTokenParams: unwrapNativeToken, deadline };
}

export function decodeMulticallExactOutputSingleWithFees(data: BytesLike) {
  const {
    functionData: { exactOutputSingleWithSecondaryFee, unwrapNativeToken },
    deadline,
  } = decodeSecondaryFeeCall(
    data,
    'exactOutputSingleWithSecondaryFee',
    'unwrapNativeToken',
  );

  const secondaryFeeParams: SecondaryFee[] = exactOutputSingleWithSecondaryFee[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactOutputSingleParamsStruct = {
    tokenIn: exactOutputSingleWithSecondaryFee[1][0],
    tokenOut: exactOutputSingleWithSecondaryFee[1][1],
    fee: exactOutputSingleWithSecondaryFee[1][2],
    recipient: exactOutputSingleWithSecondaryFee[1][3],
    amountOut: exactOutputSingleWithSecondaryFee[1][4],
    amountInMaximum: exactOutputSingleWithSecondaryFee[1][5],
    sqrtPriceLimitX96: exactOutputSingleWithSecondaryFee[1][6],
  };

  return { secondaryFeeParams, swapParams, unwrapTokenParams: unwrapNativeToken, deadline };
}

export function decodeMulticallExactInputSingleWithoutFees(data: BytesLike) {
  const decodedParams = decodeSwapRouterCall(data, 'exactInputSingle');

  const swapParams: IV3SwapRouter.ExactInputSingleParamsStruct = {
    tokenIn: decodedParams[0][0],
    tokenOut: decodedParams[0][1],
    fee: decodedParams[0][2],
    recipient: decodedParams[0][3],
    amountIn: decodedParams[0][4],
    amountOutMinimum: decodedParams[0][5],
    sqrtPriceLimitX96: decodedParams[0][6],
  };

  return { swapParams };
}

export function decodeMulticallExactOutputSingleWithoutFees(data: BytesLike) {
  const decodedParams = decodeSwapRouterCall(data, 'exactOutputSingle');

  const swapParams: IV3SwapRouter.ExactOutputSingleParamsStruct = {
    tokenIn: decodedParams[0][0],
    tokenOut: decodedParams[0][1],
    fee: decodedParams[0][2],
    recipient: decodedParams[0][3],
    amountOut: decodedParams[0][4],
    amountInMaximum: decodedParams[0][5],
    sqrtPriceLimitX96: decodedParams[0][6],
  };

  return { swapParams };
}

export function createPool(tokenIn: ERC20, tokenOut: ERC20) {
  const arbitraryTick = 100;
  const arbitraryLiquidity = 10;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
  const fee = 10000;

  return new Pool(
    erc20ToUniswapToken(tokenIn),
    erc20ToUniswapToken(tokenOut),
    fee,
    sqrtPriceAtTick,
    arbitraryLiquidity,
    arbitraryTick,
  );
}

export function setupSwapTxTest(params?: { multiPoolSwap?: boolean }): SwapTest {
  const multiPoolSwap = params?.multiPoolSwap ?? false;
  const fromAddress = TEST_FROM_ADDRESS;

  const tokenIn = USDC_TEST_TOKEN;
  const intermediaryToken = FUN_TEST_TOKEN;
  const tokenOut = WETH_TEST_TOKEN;

  let pools: Pool[] = [];
  if (multiPoolSwap) {
    pools = [createPool(tokenIn, intermediaryToken), createPool(intermediaryToken, tokenOut)];
  } else {
    pools = [createPool(tokenIn, tokenOut)];
  }

  return {
    fromAddress,
    pools,
    inputToken: tokenIn.address,
    intermediaryToken: multiPoolSwap ? intermediaryToken.address : undefined,
    outputToken: tokenOut.address,
  };
}

type MockParams = {
  pools: Pool[];
  exchangeRate?: number;
};

export const amountOutFromAmountIn = (amountIn: CoinAmount<ERC20>, tokenOut: ERC20, exchangeRate: number) => {
  let amountOut = amountIn.value * BigInt(exchangeRate); // 10 * 10^18

  if (amountIn.token.decimals > tokenOut.decimals) {
    amountOut /= BigInt(10) ** BigInt(amountIn.token.decimals - tokenOut.decimals); // 10^(18-6) = 10^12
  }

  if (amountIn.token.decimals < tokenOut.decimals) {
    amountOut *= (BigInt(10) ** BigInt(tokenOut.decimals - amountIn.token.decimals)); // 10^(18-6) = 10^12
  }

  return newAmount(amountOut, tokenOut);
};

export const amountInFromAmountOut = (amountOut: CoinAmount<ERC20>, tokenIn: ERC20, exchangeRate: number) => {
  let amountIn = amountOut.value / BigInt(exchangeRate); // 1 * 10^6

  if (tokenIn.decimals > amountOut.token.decimals) {
    amountIn *= (BigInt(10) ** BigInt(tokenIn.decimals - amountOut.token.decimals)); // 10^(18-6) = 10^12
  }

  if (tokenIn.decimals < amountOut.token.decimals) {
    amountIn /= BigInt(10) ** BigInt(amountOut.token.decimals - tokenIn.decimals); // 10^(18-6) = 10^12
  }

  return newAmount(amountIn, tokenIn);
};

export function mockRouterImplementation(params: MockParams) {
  const exchangeRate = params.exchangeRate ?? 10; // 1 TokenIn = 10 TokenOut
  const findOptimalRoute = jest.fn(
    (
      amountSpecified: CoinAmount<ERC20>,
      otherToken: ERC20,
      tradeType: TradeType,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      secondaryFees: SecondaryFee[],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      maxHops: number,
    ) => {
      const tokenIn = tradeType === TradeType.EXACT_INPUT ? amountSpecified.token : otherToken;
      const tokenOut = tradeType === TradeType.EXACT_OUTPUT ? amountSpecified.token : otherToken;

      const route = new Route(params.pools, erc20ToUniswapToken(tokenIn), erc20ToUniswapToken(tokenOut));

      const amountIn =
        tradeType === TradeType.EXACT_INPUT
          ? amountSpecified
          : amountInFromAmountOut(amountSpecified, tokenIn, exchangeRate);

      const amountOut =
        tradeType === TradeType.EXACT_INPUT
          ? amountOutFromAmountIn(amountSpecified, tokenOut, exchangeRate)
          : amountSpecified;

      const trade: QuoteResult = {
        route,
        amountIn,
        amountOut,
        tradeType,
        gasEstimate: TEST_TRANSACTION_GAS_USAGE,
      };

      return trade;
    },
  );

  (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
    routingContracts: TEST_ROUTING_CONTRACTS,
    findOptimalRoute,
  }));

  return findOptimalRoute;
}

// expectToBeDefined ensures that a variable is not null or undefined, while
// also narrowing its type.
export function expectToBeDefined<T>(x: T): asserts x is NonNullable<T> {
  expect(x).toBeDefined();
  expect(x).not.toBeNull();
}

// expectToBeDefined ensures that x is a string, while
// also narrowing its type.
export function expectToBeString(x: unknown): asserts x is string {
  expect(typeof x).toBe('string');
}

export function expectERC20(token: Coin, expectedAddress?: string): asserts token is ERC20 {
  expect(token.type).toBe('erc20');
  if (expectedAddress) expect((token as ERC20).address).toBe(expectedAddress);
}

export function expectNative(token: Coin): asserts token is Native {
  expect(token.type).toBe('native');
}

/**
 * Takes an arbitrary string and turns it into a valid ethereum address
 * @param str Arbitrary string to create the address from
 */
export function makeAddr(str: string): string {
  return keccak256(toUtf8Bytes(str)).slice(0, 42);
}

export function formatAmount(amount: CoinAmount<Coin> | Amount): string {
  return formatUnits(amount.value, amount.token.decimals);
}

export function formatTokenAmount(amount: BigNumberish, token: ERC20): string {
  return formatUnits(amount, token.decimals);
}

export function formatEther(bn: PromiseOrValue<BigNumberish>): string {
  if (typeof bn === 'bigint' || typeof bn === 'string') {
    return eFormatEther(bn);
  }
  throw new Error('formatEther: bn is not a BigNumber');
}

export function newAmountFromString<T extends Coin>(amount: string, token: T): CoinAmount<T> {
  const bn = parseUnits(amount, token.decimals);
  return newAmount(bn, token);
}

export const buildBlock = ({ baseFeePerGas }: { baseFeePerGas: bigint | null }) => ({
  baseFeePerGas,
  difficulty: BigInt(0),
  extraData: '',
  gasLimit: BigInt('0'),
  gasUsed: BigInt('0'),
  hash: '',
  miner: '',
  nonce: '',
  number: 0,
  parentHash: '',
  timestamp: 0,
  transactions: [],
});
