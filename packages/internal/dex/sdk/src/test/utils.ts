import { Token, TradeType } from '@uniswap/sdk-core';
import { BigNumber, BigNumberish, utils } from 'ethers';
import JSBI from 'jsbi';
import { Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { SecondaryFee__factory } from 'contracts/types';
import { IV3SwapRouter } from 'contracts/types/SecondaryFee';
import { PromiseOrValue } from 'contracts/types/common';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import {
  Amount,
  newAmount,
  Router,
  RoutingContracts,
  SecondaryFee,
  TokenInfo,
  tokenInfoToUniswapToken,
} from '../lib';

export const TEST_GAS_PRICE = BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei
export const TEST_TRANSACTION_GAS_USAGE = BigNumber.from('200000'); // 200,000 gas units

export const TEST_CHAIN_ID = 999;
export const TEST_RPC_URL = 'https://0.net';

export const TEST_FROM_ADDRESS = '0x94fC2BcA2E71e26D874d7E937d89ce2c9113af6e';
export const TEST_FEE_RECIPIENT = '0xe3ece548F1DD4B1536Eb6eE188fE35350bc1dd16';

export const TEST_MAX_FEE_BASIS_POINTS = 1000; // 10%

export const TEST_MULTICALL_ADDRESS = '0x66d0aB680ACEe44308edA2062b910405CC51A190';
export const TEST_V3_CORE_FACTORY_ADDRESS = '0x23490b262829ACDAD3EF40e555F23d77D1B69e4e';
export const TEST_QUOTER_ADDRESS = '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5';
export const TEST_PERIPHERY_ROUTER_ADDRESS = '0x615FFbea2af24C55d737dD4264895A56624Da072';
export const TEST_V3_MIGRATOR_ADDRESSES = '0x0Df0d2d5Cf4739C0b579C33Fdb3d8B04Bee85729';
export const TEST_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x446c78D97b1E78bC35864FC49AcE1f7404F163F6';
export const TEST_TICK_LENS_ADDRESSES = '0x3aC4F8094b21A6c5945453007d9c52B7e15340c0';
export const TEST_SECONDARY_FEE_ADDRESS = '0x8dBE1f0900C5e92ad87A54521902a33ba1598C51';

export const TEST_ROUTING_CONTRACTS: RoutingContracts = {
  factoryAddress: TEST_V3_CORE_FACTORY_ADDRESS,
  quoterAddress: TEST_QUOTER_ADDRESS,
  peripheryRouterAddress: TEST_PERIPHERY_ROUTER_ADDRESS,
  secondaryFeeAddress: TEST_SECONDARY_FEE_ADDRESS,
  multicallAddress: TEST_MULTICALL_ADDRESS,
};

export const IMX_TEST_TOKEN = new Token(
  TEST_CHAIN_ID,
  '0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851',
  18,
  'IMX',
  'Immutable X',
);

export const WETH_TEST_TOKEN = new Token(
  TEST_CHAIN_ID,
  '0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE',
  18,
  'WETH',
  'Wrapped Ether',
);

export const USDC_TEST_TOKEN = new Token(
  TEST_CHAIN_ID,
  '0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC',
  6,
  'USDC',
  'USD Coin',
);

export const FUN_TEST_TOKEN = new Token(
  TEST_CHAIN_ID,
  '0xCc7bb2D219A0FC08033E130629C2B854b7bA9195',
  18,
  'FUN',
  'The Fungibles Token',
);

export const TEST_IMMUTABLE_CONFIGURATION: ImmutableConfiguration = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const TEST_DEX_CONFIGURATION = {
  baseConfig: TEST_IMMUTABLE_CONFIGURATION,
  chainId: TEST_CHAIN_ID,
  overrides: {
    rpcURL: TEST_RPC_URL,
    exchangeContracts: {
      multicall: TEST_MULTICALL_ADDRESS,
      coreFactory: TEST_V3_CORE_FACTORY_ADDRESS,
      quoterV2: TEST_QUOTER_ADDRESS,
      peripheryRouter: TEST_PERIPHERY_ROUTER_ADDRESS,
      secondaryFee: TEST_SECONDARY_FEE_ADDRESS,
    },
    commonRoutingTokens: [],
    nativeToken: {
      chainId: IMX_TEST_TOKEN.chainId,
      address: IMX_TEST_TOKEN.address,
      decimals: IMX_TEST_TOKEN.decimals,
      symbol: IMX_TEST_TOKEN.symbol,
      name: IMX_TEST_TOKEN.name,
    },
  },
};

export type SwapTest = {
  fromAddress: string;

  chainId: number;

  pools: Pool[],

  arbitraryTick: number;
  arbitraryLiquidity: number;
  sqrtPriceAtTick: JSBI;

  inputToken: string;
  outputToken: string;
  intermediaryToken: string | undefined;
};

// uniqBy returns the unique items in an array using the given comparator
export function uniqBy<K, T extends string | number>(
  array: K[],
  comparator: (arg: K) => T,
): K[] {
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
    firstPoolFee: BigNumber.from(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: BigNumber.from(parseInt(`0x${path.substring(88, 94)}`, 16)),
    outputToken: `0x${path.substring(94, 134)}`,
  };
}

export function decodePathForExactOutput(path: string) {
  return {
    outputToken: path.substring(0, 42),
    firstPoolFee: BigNumber.from(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: BigNumber.from(parseInt(`0x${path.substring(88, 94)}`, 16)),
    inputToken: `0x${path.substring(94, 134)}`,
  };
}

type SecondaryFeeFunctionName = 'exactInputSingleWithSecondaryFee' |
'exactOutputSingleWithSecondaryFee' |
'exactInputWithSecondaryFee' |
'exactOutputWithSecondaryFee';

type SwapRouterFunctionName = 'exactInputSingle' | 'exactOutputSingle';

function decodeSecondaryFeeCall(calldata: utils.BytesLike, functionName: SecondaryFeeFunctionName) {
  const iface = SecondaryFee__factory.createInterface();
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);
  const data = topLevelParams.data[0];
  if (typeof data !== 'string') throw new Error();

  return iface.decodeFunctionData(functionName, data);
}

function decodeSwapRouterCall(calldata: utils.BytesLike, functionName: SwapRouterFunctionName) {
  const iface = SwapRouter.INTERFACE;
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);
  const data = topLevelParams.data[0];
  if (typeof data !== 'string') throw new Error();

  return iface.decodeFunctionData(functionName, data);
}

export function decodeMulticallExactInputWithFees(data: utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactInputWithSecondaryFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactInputParamsStruct = {
    path: decodedParams[1][0],
    recipient: decodedParams[1][1],
    amountIn: decodedParams[1][2],
    amountOutMinimum: decodedParams[1][3],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactOutputWithFees(data: utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactOutputWithSecondaryFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactOutputParamsStruct = {
    path: decodedParams[1][0],
    recipient: decodedParams[1][1],
    amountOut: decodedParams[1][2],
    amountInMaximum: decodedParams[1][3],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactInputSingleWithFees(data: utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactInputSingleWithSecondaryFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactInputSingleParamsStruct = {
    tokenIn: decodedParams[1][0],
    tokenOut: decodedParams[1][1],
    fee: decodedParams[1][2],
    recipient: decodedParams[1][3],
    amountIn: decodedParams[1][4],
    amountOutMinimum: decodedParams[1][5],
    sqrtPriceLimitX96: decodedParams[1][6],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactOutputSingleWithFees(data: utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactOutputSingleWithSecondaryFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    recipient: x[0],
    basisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactOutputSingleParamsStruct = {
    tokenIn: decodedParams[1][0],
    tokenOut: decodedParams[1][1],
    fee: decodedParams[1][2],
    recipient: decodedParams[1][3],
    amountOut: decodedParams[1][4],
    amountInMaximum: decodedParams[1][5],
    sqrtPriceLimitX96: decodedParams[1][6],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactInputSingleWithoutFees(data: utils.BytesLike) {
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

export function decodeMulticallExactOutputSingleWithoutFees(data: utils.BytesLike) {
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

export function setupSwapTxTest(params?: { multiPoolSwap?: boolean }): SwapTest {
  const multiPoolSwap = params?.multiPoolSwap ?? false;
  const fromAddress = TEST_FROM_ADDRESS;

  const arbitraryTick = 100;
  const arbitraryLiquidity = 10;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

  const tokenIn = tokenInfoToUniswapToken(USDC_TEST_TOKEN);
  const intermediaryToken = tokenInfoToUniswapToken(FUN_TEST_TOKEN);
  const tokenOut = tokenInfoToUniswapToken(WETH_TEST_TOKEN);

  const fee = 10000;

  let pools: Pool[] = [];
  if (multiPoolSwap) {
    pools = [
      new Pool(
        tokenIn,
        intermediaryToken,
        fee,
        sqrtPriceAtTick,
        arbitraryLiquidity,
        arbitraryTick,
      ),
      new Pool(
        intermediaryToken,
        tokenOut,
        fee,
        sqrtPriceAtTick,
        arbitraryLiquidity,
        arbitraryTick,
      ),
    ];
  } else {
    pools = [
      new Pool(
        tokenIn,
        tokenOut,
        fee,
        sqrtPriceAtTick,
        arbitraryLiquidity,
        arbitraryTick,
      ),
    ];
  }

  return {
    fromAddress,
    chainId: TEST_CHAIN_ID,

    pools,

    arbitraryTick,
    arbitraryLiquidity,
    sqrtPriceAtTick,

    inputToken: tokenIn.address,
    intermediaryToken: multiPoolSwap ? intermediaryToken.address : undefined,
    outputToken: tokenOut.address,
  };
}

type MockParams = {
  chainId: number;
  inputToken: string;
  outputToken: string;
  pools: Pool[];
  exchangeRate?: number;
};

export const howMuchAmountOut = (amountIn: Amount, tokenOut: TokenInfo, exchangeRate: number) => {
  let amountOut = amountIn.value.mul(exchangeRate); // 10 * 10^18

  if (amountIn.token.decimals > tokenOut.decimals) {
    amountOut = amountOut.div(BigNumber.from(10).pow(amountIn.token.decimals - tokenOut.decimals)); // 10^(18-6) = 10^12
  }

  if (amountIn.token.decimals < tokenOut.decimals) {
    amountOut = amountOut.mul(BigNumber.from(10).pow(tokenOut.decimals - amountIn.token.decimals)); // 10^(18-6) = 10^12
  }

  return newAmount(amountOut, tokenOut);
};

export const howMuchAmountIn = (amountOut: Amount, tokenIn: TokenInfo, exchangeRate: number) => {
  let amountIn = amountOut.value.div(exchangeRate); // 1 * 10^6

  if (tokenIn.decimals > amountOut.token.decimals) {
    amountIn = amountIn.mul(BigNumber.from(10).pow(tokenIn.decimals - amountOut.token.decimals)); // 10^(18-6) = 10^12
  }

  if (tokenIn.decimals < amountOut.token.decimals) {
    amountIn = amountIn.div(BigNumber.from(10).pow(amountOut.token.decimals - tokenIn.decimals)); // 10^(18-6) = 10^12
  }

  return newAmount(amountIn, tokenIn);
};

export function mockRouterImplementation(params: MockParams) {
  const exchangeRate = params.exchangeRate ?? 10; // 1 TokenIn = 10 TokenOut
  const findOptimalRoute = jest.fn((
    amountSpecified: Amount,
    otherToken: TokenInfo,
    tradeType: TradeType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    secondaryFees: SecondaryFee[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    maxHops: number,
  ) => {
    const tokenIn = tradeType === TradeType.EXACT_INPUT ? amountSpecified.token : otherToken;
    const tokenOut = tradeType === TradeType.EXACT_OUTPUT ? amountSpecified.token : otherToken;

    const route = new Route(
      params.pools,
      tokenInfoToUniswapToken(tokenIn),
      tokenInfoToUniswapToken(tokenOut),
    );

    const amountIn = tradeType === TradeType.EXACT_INPUT
      ? amountSpecified : howMuchAmountIn(amountSpecified, tokenIn, exchangeRate);

    const amountOut = tradeType === TradeType.EXACT_INPUT
      ? howMuchAmountOut(amountSpecified, tokenOut, exchangeRate) : amountSpecified;

    const trade: QuoteResult = {
      route,
      amountIn,
      amountOut,
      tradeType,
      gasEstimate: TEST_TRANSACTION_GAS_USAGE,
    };

    return trade;
  });

  (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
    routingContracts: TEST_ROUTING_CONTRACTS,
    findOptimalRoute,
  }));

  return findOptimalRoute;
}

// expectToBeDefined ensures that a variable is not null or undefined, while
// also narrowing its type.
export function expectToBeDefined <T>(x: T): asserts x is NonNullable<T> {
  expect(x).toBeDefined();
  expect(x).not.toBeNull();
}

// expectInstanceOf ensurance that a variable is an instance of a class, while
// also narrowing its type.
export function expectInstanceOf <T>(className: { new(...args: any[]): T }, x: unknown): asserts x is T {
  expect(x).toBeInstanceOf(className);
}

/**
 * Takes an arbitrary string and turns it into a valid ethereum address
 * @param str Arbitrary string to create the address from
 */
export function makeAddr(str: string): string {
  return utils.keccak256(utils.toUtf8Bytes(str)).slice(0, 42);
}

export function formatAmount(amount: Amount): string {
  return utils.formatUnits(amount.value, amount.token.decimals);
}

export function formatTokenAmount(amount: BigNumberish, token: TokenInfo): string {
  return utils.formatUnits(amount, token.decimals);
}

export function formatEther(bn: PromiseOrValue<BigNumberish>): string {
  if (BigNumber.isBigNumber(bn) || typeof bn === 'string') {
    return utils.formatEther(bn);
  }
  throw new Error('formatEther: bn is not a BigNumber');
}

export function newAmountFromString(amount: string, token: TokenInfo): Amount {
  const bn = utils.parseUnits(amount, token.decimals);
  return newAmount(bn, token);
}
