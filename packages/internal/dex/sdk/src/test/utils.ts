import {
  Currency,
  Fraction,
  Percent,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import JSBI from 'jsbi';
import { Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { slippageToFraction } from 'lib/transactionUtils/slippage';
import { SecondaryFee__factory } from 'contracts/types';
import {
  QuoteTradeInfo,
  Router,
  SecondaryFee,
} from '../lib';

export const TEST_GAS_PRICE = ethers.BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei
export const TEST_TRANSACTION_GAS_USAGE = ethers.BigNumber.from('200000'); // 200,000 gas units

export const TEST_CHAIN_ID = 999;
export const TEST_RPC_URL = 'https://0.net';

export const TEST_FROM_ADDRESS = '0x94fC2BcA2E71e26D874d7E937d89ce2c9113af6e';
export const TEST_FEE_RECIPIENT = '0xe3ece548F1DD4B1536Eb6eE188fE35350bc1dd16';

export const TEST_MAX_FEE_BASIS_POINTS = 1000;

export const TEST_MULTICALL_ADDRESS = '0x66d0aB680ACEe44308edA2062b910405CC51A190';
export const TEST_V3_CORE_FACTORY_ADDRESS = '0x23490b262829ACDAD3EF40e555F23d77D1B69e4e';
export const TEST_QUOTER_ADDRESS = '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5';
export const TEST_PERIPHERY_ROUTER_ADDRESS = '0x615FFbea2af24C55d737dD4264895A56624Da072';
export const TEST_V3_MIGRATOR_ADDRESSES = '0x0Df0d2d5Cf4739C0b579C33Fdb3d8B04Bee85729';
export const TEST_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x446c78D97b1E78bC35864FC49AcE1f7404F163F6';
export const TEST_TICK_LENS_ADDRESSES = '0x3aC4F8094b21A6c5945453007d9c52B7e15340c0';
export const TEST_SECONDARY_FEE_ADDRESS = '0x8dBE1f0900C5e92ad87A54521902a33ba1598C51';

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
  amountIn: ethers.BigNumberish;
  amountOut: ethers.BigNumberish;
  minAmountOut: ethers.BigNumberish;
  maxAmountIn: ethers.BigNumberish;
};

type ExactInputOutputSingleParams = {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  firstAmount: ethers.BigNumber;
  secondAmount: ethers.BigNumber;
  sqrtPriceLimitX96: ethers.BigNumber;
};

type ExactInputOutputParams = {
  path: string;
  recipient: string;
  amountIn: ethers.BigNumber;
  amountOut: ethers.BigNumber;
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

export function decodePath(path: string) {
  return {
    inputToken: path.substring(0, 42),
    firstPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(42, 48)}`, 16)),
    intermediaryToken: `0x${path.substring(48, 88)}`,
    secondPoolFee: ethers.BigNumber.from(parseInt(`0x${path.substring(88, 94)}`, 16)),
    outputToken: `0x${path.substring(94, 134)}`,
  };
}

type SecondaryFeeFunctionName = 'exactInputSingleWithServiceFee' |
'exactOutputSingleWithServiceFee' |
'exactInputWithServiceFee' |
'exactOutputWithServiceFee';

type SwapRouterFunctionName = 'exactInputSingle';

function decodeSecondaryFeeCall(calldata: ethers.utils.BytesLike, functionName: SecondaryFeeFunctionName) {
  const iface = SecondaryFee__factory.createInterface();
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

  const decodedParams = iface.decodeFunctionData(
    functionName,
    topLevelParams.data[0],
  );

  return { topLevelParams, decodedParams };
}

function decodeSwapRouterCall(calldata: ethers.utils.BytesLike, functionName: SwapRouterFunctionName) {
  const iface = SwapRouter.INTERFACE;
  const topLevelParams = iface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

  const decodedParams = iface.decodeFunctionData(
    functionName,
    topLevelParams.data[0],
  );

  return { topLevelParams, decodedParams };
}

export function decodeMulticallExactInputOutputWithFees(data: ethers.utils.BytesLike) {
  const { topLevelParams, decodedParams } = decodeSecondaryFeeCall(data, 'exactInputWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = [];

  for (let i = 0; i < decodedParams[0].length; i++) {
    secondaryFeeParams.push({
      feeRecipient: decodedParams[0][i][0],
      feeBasisPoints: decodedParams[0][i][1],
    });
  }

  const multiPoolSwapParams: ExactInputOutputParams = {
    path: decodedParams[1][0],
    recipient: decodedParams[1][1],
    amountIn: decodedParams[1][2],
    amountOut: decodedParams[1][3],
  };

  return { topLevelParams, secondaryFeeParams, swapParams: multiPoolSwapParams };
}

export function decodeMulticallExactInputOutputSingleWithFees(data: ethers.utils.BytesLike) {
  const { topLevelParams, decodedParams } = decodeSecondaryFeeCall(data, 'exactInputSingleWithServiceFee');

  const secondaryFeeParams: SecondaryFee[] = [];

  for (let i = 0; i < decodedParams[0].length; i++) {
    secondaryFeeParams.push({
      feeRecipient: decodedParams[0][i][0],
      feeBasisPoints: decodedParams[0][i][1],
    });
  }

  const singlePoolSwapParams: ExactInputOutputSingleParams = {
    tokenIn: decodedParams[1][0],
    tokenOut: decodedParams[1][1],
    fee: decodedParams[1][2],
    recipient: decodedParams[1][3],
    firstAmount: decodedParams[1][4],
    secondAmount: decodedParams[1][5],
    sqrtPriceLimitX96: decodedParams[1][6],
  };

  return { topLevelParams, secondaryFeeParams, swapParams: singlePoolSwapParams };
}

export function decodeMulticallExactInputOutputSingleWithoutFees(data: ethers.utils.BytesLike) {
  const { topLevelParams, decodedParams } = decodeSwapRouterCall(data, 'exactInputSingle');

  const swapParams: ExactInputOutputSingleParams = {
    tokenIn: decodedParams[0][0],
    tokenOut: decodedParams[0][1],
    fee: decodedParams[0][2],
    recipient: decodedParams[0][3],
    firstAmount: decodedParams[0][4],
    secondAmount: decodedParams[0][5],
    sqrtPriceLimitX96: decodedParams[0][6],
  };

  return { topLevelParams, swapParams };
}

export function decodeMulticallExactInputOutputWithoutFees(data: ethers.utils.BytesLike) {
  const { topLevelParams, decodedParams } = decodeSecondaryFeeCall(data, 'exactInputWithServiceFee');

  const swapParams: ExactInputOutputParams = {
    path: decodedParams[0],
    recipient: decodedParams[1],
    amountIn: decodedParams[5],
    amountOut: decodedParams[6],
  };

  return { topLevelParams, swapParams };
}

export function getMinimumAmountOut(
  slippageTolerance: Percent,
  amountOut: ethers.BigNumber,
): ethers.BigNumber {
  const amountOutJsbi = JSBI.BigInt(amountOut.toString());
  // amountOut / (1 + slippagePercentage)
  const slippageAdjustedAmountOut = new Fraction(JSBI.BigInt(1))
    .add(slippageTolerance)
    .invert()
    .multiply(amountOutJsbi).quotient;
  return ethers.BigNumber.from(slippageAdjustedAmountOut.toString());
}

export function getMaximumAmountIn(
  slippageTolerance: Percent,
  amountIn: ethers.BigNumber,
): ethers.BigNumber {
  const amountInJsbi = JSBI.BigInt(amountIn.toString());
  // (1 + slippagePercent) * amount
  const slippageAdjustedAmountIn = new Fraction(JSBI.BigInt(1))
    .add(slippageTolerance)
    .multiply(amountInJsbi).quotient;
  return ethers.BigNumber.from(slippageAdjustedAmountIn.toString());
}

export function setupSwapTxTest(slippage: number, multiPoolSwap: boolean = false): SwapTest {
  const slippageFraction = slippageToFraction(slippage);
  const fromAddress = TEST_FROM_ADDRESS;

  const arbitraryTick = 100;
  const arbitraryLiquidity = 10;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

  const tokenIn: Token = new Token(TEST_CHAIN_ID, IMX_TEST_TOKEN.address, 18);
  const intermediaryToken: Token = new Token(TEST_CHAIN_ID, FUN_TEST_TOKEN.address, 18);
  const tokenOut: Token = new Token(TEST_CHAIN_ID, WETH_TEST_TOKEN.address, 18);

  const amountIn = ethers.utils.parseEther('0.0000123');
  const amountOut = ethers.utils.parseEther('10000');

  const minAmountOut = getMinimumAmountOut(slippageFraction, amountOut);
  const maxAmountIn = getMaximumAmountIn(slippageFraction, amountIn);

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
    amountIn,
    amountOut,
    minAmountOut,
    maxAmountIn,
  };
}

export function mockRouterImplementation(
  params: SwapTest,
  tradeType: TradeType,
) {
  (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
    routingContracts: {
      peripheryRouterAddress: TEST_PERIPHERY_ROUTER_ADDRESS,
      secondaryFeeAddress: TEST_SECONDARY_FEE_ADDRESS,
    },
    findOptimalRoute: () => {
      const tokenIn: Token = new Token(params.chainId, params.inputToken, 18);
      const tokenOut: Token = new Token(
        params.chainId,
        params.outputToken,
        18,
      );

      const route: Route<Currency, Currency> = new Route(
        params.pools,
        tokenIn,
        tokenOut,
      );

      const trade: QuoteTradeInfo = {
        route,
        amountIn: ethers.BigNumber.from(params.amountIn),
        tokenIn,
        amountOut: ethers.BigNumber.from(params.amountOut),
        tokenOut,
        tradeType,
        gasEstimate: TEST_TRANSACTION_GAS_USAGE,
      };

      return {
        trade,
      };
    },
  }));
}
