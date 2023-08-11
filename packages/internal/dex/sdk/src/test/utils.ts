import {
  Currency,
  CurrencyAmount,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import JSBI from 'jsbi';
import { Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { SecondaryFee__factory } from 'contracts/types';
import { IV3SwapRouter } from 'contracts/types/SecondaryFee';
import {
  QuoteTradeInfo,
  Router,
  RoutingContracts,
  SecondaryFee,
  toBigNumber,
} from '../lib';

export const TEST_GAS_PRICE = ethers.BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei
export const TEST_TRANSACTION_GAS_USAGE = ethers.BigNumber.from('200000'); // 200,000 gas units

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
    firstPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(88, 94)}`, 16)),
    outputToken: `0x${path.substring(94, 134)}`,
  };
}

export function decodePathForExactOutput(path: string) {
  return {
    outputToken: path.substring(0, 42),
    firstPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(88, 94)}`, 16)),
    inputToken: `0x${path.substring(94, 134)}`,
  };
}

type SecondaryFeeFunctionName = 'exactInputSingleWithServiceFee' |
'exactOutputSingleWithServiceFee' |
'exactInputWithServiceFee' |
'exactOutputWithServiceFee';

type SwapRouterFunctionName = 'exactInputSingle' | 'exactOutputSingle';

function decodeSecondaryFeeCall(calldata: ethers.utils.BytesLike, functionName: SecondaryFeeFunctionName) {
  const iface = SecondaryFee__factory.createInterface();
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

  return iface.decodeFunctionData(
    functionName,
    topLevelParams.data[0],
  );
}

function decodeSwapRouterCall(calldata: ethers.utils.BytesLike, functionName: SwapRouterFunctionName) {
  const iface = SwapRouter.INTERFACE;
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

  return iface.decodeFunctionData(
    functionName,
    topLevelParams.data[0],
  );
}

export function decodeMulticallExactInputWithFees(data: ethers.utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactInputWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    feeRecipient: x[0],
    feeBasisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactInputParamsStruct = {
    path: decodedParams[1][0],
    recipient: decodedParams[1][1],
    amountIn: decodedParams[1][2],
    amountOutMinimum: decodedParams[1][3],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactOutputWithFees(data: ethers.utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactOutputWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    feeRecipient: x[0],
    feeBasisPoints: x[1],
  }));

  const swapParams: IV3SwapRouter.ExactOutputParamsStruct = {
    path: decodedParams[1][0],
    recipient: decodedParams[1][1],
    amountOut: decodedParams[1][2],
    amountInMaximum: decodedParams[1][3],
  };

  return { secondaryFeeParams, swapParams };
}

export function decodeMulticallExactInputSingleWithFees(data: ethers.utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactInputSingleWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    feeRecipient: x[0],
    feeBasisPoints: x[1],
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

export function decodeMulticallExactOutputSingleWithFees(data: ethers.utils.BytesLike) {
  const decodedParams = decodeSecondaryFeeCall(data, 'exactOutputSingleWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = decodedParams[0].map((x: [string, number]) => ({
    feeRecipient: x[0],
    feeBasisPoints: x[1],
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

export function decodeMulticallExactInputSingleWithoutFees(data: ethers.utils.BytesLike) {
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

export function decodeMulticallExactOutputSingleWithoutFees(data: ethers.utils.BytesLike) {
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

export function setupSwapTxTest(multiPoolSwap: boolean = false): SwapTest {
  const fromAddress = TEST_FROM_ADDRESS;

  const arbitraryTick = 100;
  const arbitraryLiquidity = 10;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

  const tokenIn: Token = new Token(TEST_CHAIN_ID, IMX_TEST_TOKEN.address, 18);
  const intermediaryToken: Token = new Token(TEST_CHAIN_ID, FUN_TEST_TOKEN.address, 18);
  const tokenOut: Token = new Token(TEST_CHAIN_ID, WETH_TEST_TOKEN.address, 18);

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

export function mockRouterImplementation(params: MockParams) {
  const exchangeRate = params.exchangeRate ?? 10;
  const findOptimalRoute = jest.fn((
    amountSpecified: CurrencyAmount<Currency>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otherCurrency: Currency,
    tradeType: TradeType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    secondaryFees: SecondaryFee[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    maxHops: number,
  ) => {
    const tokenIn: Token = new Token(params.chainId, params.inputToken, 18);
    const tokenOut: Token = new Token(
      params.chainId,
      params.outputToken,
      18,
    );

    const route = new Route(
      params.pools,
      tokenIn,
      tokenOut,
    );

    const amountIn = tradeType === TradeType.EXACT_INPUT
      ? toBigNumber(amountSpecified) : toBigNumber(amountSpecified).div(exchangeRate);

    const amountOut = tradeType === TradeType.EXACT_INPUT
      ? toBigNumber(amountSpecified).mul(exchangeRate) : toBigNumber(amountSpecified);

    const trade: QuoteTradeInfo = {
      route,
      amountIn,
      tokenIn,
      amountOut,
      tokenOut,
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

export function expectInstanceOf <T>(className: { new(...args: any[]): T }, x: unknown): asserts x is T {
  expect(x).toBeInstanceOf(className);
}

/**
 * Takes an arbitrary string and turns it into a valid ethereum address
 * @param str Arbitrary string to create the address from
 */
export function makeAddr(str: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str)).slice(0, 42);
}
