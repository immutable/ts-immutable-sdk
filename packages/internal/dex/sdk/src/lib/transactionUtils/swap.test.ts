/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { BigNumber } from 'ethers';
import { SecondaryFee } from 'lib';
import { TIMX_IMMUTABLE_TESTNET } from 'constants/tokens/immutable-testnet';
import { Token } from '@uniswap/sdk-core';
import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { getSwap } from './swap';

const getRoute = () => {
  const tokenIn = new Token(
    1,
    '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    18,
  );
  const tokenOut = new Token(
    1,
    '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
    18,
  );
  const arbitraryTick = 100;
  const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
  return new Route(
    [
      new Pool(
        tokenIn,
        tokenOut,
        FeeAmount.MEDIUM,
        sqrtPriceAtTick,
        2,
        arbitraryTick,
      ),
    ],
    tokenIn,
    tokenOut,
  );
};

describe('swap', () => {
  it('xxx', () => {
    const nativeToken = TIMX_IMMUTABLE_TESTNET;
    const tokenIn = new Token(
      1,
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      18,
    );
    const tokenOut = new Token(
      1,
      '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
      18,
    );
    const route = getRoute();
    const routeAndQuote = {
      trade: {
        amountIn: BigNumber.from(1),
        tokenIn,
        tokenOut,
        amountOut: BigNumber.from(1),
        route,
        tradeType: 0,
        gasEstimate: BigNumber.from(1),
      },
    };
    const fromAddress = '0x340bC2c77514ede2a23Fd4F42F411A8e351d8eE6';
    const slippagePercent = 0;
    const deadline = 0;
    const peripheryRouterAddress = '0xebbf4C07a63986204C37cc5A188AaBF53564C583';
    const secondaryFeeAddress = '0x5b9ECF76D86D4bCb376A1B642c784cd0bD290537';
    const gasPrice = BigNumber.from(0);
    const secondaryFees: SecondaryFee[] = [
      {
        feeRecipient: '0x340bC2c77514ede2a23Fd4F42F411A8e351d8eE6',
        feeBasisPoints: 1,
      },
    ];

    const swap = getSwap(
      nativeToken,
      routeAndQuote,
      fromAddress,
      slippagePercent,
      deadline,
      peripheryRouterAddress,
      secondaryFeeAddress,
      gasPrice,
      secondaryFees,
    );
    expect(swap).toMatchInlineSnapshot(`
      {
        "gasFeeEstimate": {
          "token": {
            "address": "0x0000000000000000000000000000000000001010",
            "chainId": 13372,
            "decimals": 18,
            "name": "Immutable Testnet Token",
            "symbol": "tIMX",
          },
          "value": {
            "hex": "0x00",
            "type": "BigNumber",
          },
        },
        "transaction": {
          "data": "0x5ae401dc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000164742ac94400000000000000000000000000000000000000000000000000000000000001000000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000340bc2c77514ede2a23fd4f42f411a8e351d8ee60000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000340bc2c77514ede2a23fd4f42f411a8e351d8ee6000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000",
          "from": "0x340bC2c77514ede2a23Fd4F42F411A8e351d8eE6",
          "to": "0x5b9ECF76D86D4bCb376A1B642c784cd0bD290537",
          "value": "0x00",
        },
      }
    `);
  });
});
