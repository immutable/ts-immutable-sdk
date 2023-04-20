import {
  Percent,
  Token,
  Fraction,
  TradeType,
  Currency,
} from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { hexDataSlice } from 'ethers/lib/utils';
import JSBI from 'jsbi';
import { Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { Router, TradeInfo } from '../lib';

export const testChainId: number = 1;

export const TEST_CHAIN_ID = 999;
export const TEST_RPC_URL = 'https://0.net';

export const TEST_FROM_ADDRESS = '0x94fC2BcA2E71e26D874d7E937d89ce2c9113af6e';

export const IMX_TEST_CHAIN = new Token(
  TEST_CHAIN_ID,
  '0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851',
  18,
  'IMX',
  'Immutable X'
);

export const WETH_TEST_CHAIN = new Token(
  TEST_CHAIN_ID,
  '0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE',
  18,
  'WETH',
  'Wrapped Ether'
);

export const USDC_TEST_CHAIN = new Token(
  TEST_CHAIN_ID,
  '0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC',
  6,
  'USDC',
  'USD Coin'
);

export const FUN_TEST_CHAIN = new Token(
  TEST_CHAIN_ID,
  '0xCc7bb2D219A0FC08033E130629C2B854b7bA9195',
  18,
  'FUN',
  'The Fungibles Token'
);

const exactInputOutputSingleParamTypes = [
  'address',
  'address',
  'uint24',
  'address',
  'uint256',
  'uint256',
  'uint160',
];

type ExactInputOutputSingleParams = {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  firstAmount: ethers.BigNumber;
  secondAmount: ethers.BigNumber;
  sqrtPriceLimitX96: ethers.BigNumber;
};

export function decodeMulticallData(data: ethers.utils.BytesLike): {
  topLevelParams: ethers.utils.Result;
  functionCallParams: ExactInputOutputSingleParams;
} {
  data = hexDataSlice(data, 4);

  const decodedTopLevelParams = ethers.utils.defaultAbiCoder.decode(
    ['uint256', 'bytes[]'],
    data
  );
  const calldata = decodedTopLevelParams[1][0];
  const calldataParams = hexDataSlice(calldata, 4);
  const decodedFunctionCallParams = ethers.utils.defaultAbiCoder.decode(
    exactInputOutputSingleParamTypes,
    calldataParams
  );

  const params: ExactInputOutputSingleParams = {
    tokenIn: decodedFunctionCallParams[0],
    tokenOut: decodedFunctionCallParams[1],
    fee: decodedFunctionCallParams[2],
    recipient: decodedFunctionCallParams[3],
    firstAmount: decodedFunctionCallParams[4],
    secondAmount: decodedFunctionCallParams[5],
    sqrtPriceLimitX96: decodedFunctionCallParams[6],
  };

  return { topLevelParams: decodedTopLevelParams, functionCallParams: params };
}

export function getMinimumAmountOut(
  slippageTolerance: Percent,
  amountOut: ethers.BigNumber
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
  amountIn: ethers.BigNumber
): ethers.BigNumber {
  const amountInJsbi = JSBI.BigInt(amountIn.toString());
  // (1 + slippagePercent) * amount
  const slippageAdjustedAmountIn = new Fraction(JSBI.BigInt(1))
    .add(slippageTolerance)
    .multiply(amountInJsbi).quotient;
  return ethers.BigNumber.from(slippageAdjustedAmountIn.toString());
}

export type SwapTest = {
  fromAddress: string;
  chainID: number;

  arbitraryTick: number;
  arbitraryLiquidity: number;
  sqrtPriceAtTick: JSBI;

  inputToken: string;
  outputToken: string;
  amountIn: ethers.BigNumberish;
  amountOut: ethers.BigNumberish;
  minAmountOut: ethers.BigNumberish;
  maxAmountIn: ethers.BigNumberish;
};

export function setupSwapTxTest(slippage: Percent): SwapTest {
  const fromAddress = TEST_FROM_ADDRESS;

  const arbitraryTick = 100;
  const arbitraryLiquidity = 10;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

  const inputToken = IMX_TEST_CHAIN.address;
  const outputToken = WETH_TEST_CHAIN.address;
  const amountIn = ethers.utils.parseEther('0.0000123');
  const amountOut = ethers.utils.parseEther('10000');

  const minAmountOut = getMinimumAmountOut(slippage, amountOut);
  const maxAmountIn = getMaximumAmountIn(slippage, amountIn);

  return {
    fromAddress: fromAddress,
    chainID: TEST_CHAIN_ID,

    arbitraryTick: arbitraryTick,
    arbitraryLiquidity: arbitraryLiquidity,
    sqrtPriceAtTick: sqrtPriceAtTick,

    inputToken: inputToken,
    outputToken: outputToken,
    amountIn: amountIn,
    amountOut: amountOut,
    minAmountOut: minAmountOut,
    maxAmountIn: maxAmountIn,
  };
}

export function mockRouterImplementation(
  params: SwapTest,
  tradeType: TradeType
) {
  (Router as unknown as jest.Mock).mockImplementationOnce(() => {
    return {
      findOptimalRoute: () => {
        const tokenIn: Token = new Token(params.chainID, params.inputToken, 18);
        const tokenOut: Token = new Token(
          params.chainID,
          params.outputToken,
          18
        );
        const fee = 10000;
        const pools: Pool[] = [
          new Pool(
            tokenIn,
            tokenOut,
            fee,
            params.sqrtPriceAtTick,
            params.arbitraryLiquidity,
            params.arbitraryTick
          ),
        ];
        const route: Route<Currency, Currency> = new Route(
          pools,
          tokenIn,
          tokenOut
        );

        const trade: TradeInfo = {
          route: route,
          amountIn: ethers.BigNumber.from(params.amountIn),
          tokenIn: tokenIn,
          amountOut: ethers.BigNumber.from(params.amountOut),
          tokenOut: tokenOut,
          tradeType: tradeType,
        };
        return {
          success: true,
          trade: trade,
        };
      },
    };
  });
}
