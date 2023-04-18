import { describe, it } from '@jest/globals';
import { FeeAmount, Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core';
import { getQuotesForRoutes } from '../lib/getQuotesForRoutes';
import { ethers, providers } from 'ethers';
import { MULTICALL_ADDRESS_CREATE2 } from '../constants';
import { IMX_TEST_CHAIN, WETH_TEST_CHAIN } from '../utils/testUtils';
import { Multicall__factory, QuoterV2__factory } from '../contracts/types';
import { MockProvider } from 'utils/mockProvider';
import { defaultAbiCoder } from '@ethersproject/abi';
describe('getQuotesForRoutes', () => {
  describe('with one quote', () => {
    it.only('returns the only quote', async () => {
      const amountOut = ethers.utils.parseEther('1000');
      const types = [
        'uint256', // amountOut/amountIn
        'uint160', // sqrtPrice after
        'uint32', // ticks crossed
        'uint256', // gasEstimate
      ];

      const encoded = ethers.utils.defaultAbiCoder.encode(types, [
        amountOut,
        '100',
        '1',
        '100000',
      ]);

      const mockReturnData = {
        returnData: [
          {
            returnData: encoded,
          },
        ],
      };

      let dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter, as long as the length is correct.
      const pool0 = new Pool(
        WETH_TEST_CHAIN,
        IMX_TEST_CHAIN,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick
      );
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));

      const iface = Multicall__factory.createInterface();
      // const returnData = defaultAbiCoder.encode(
      //   ['address', 'address', 'uint24'],
      //   [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '3000']
      // );

      const returnData =
        QuoterV2__factory.createInterface().encodeFunctionResult('');

      const provider = new MockProvider();
      provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        'multicall((address,uint256,bytes)[])',
        iface.encodeFunctionResult('multicall', [
          ethers.BigNumber.from(42),
          [
            [true, 2, returnData],
            [true, 4, returnData],
          ],
        ])
      );

      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const amount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
        WETH_TEST_CHAIN,
        '123123'
      );
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT
      );
      expect(amountOutReceived.length).toBe(1);
      expect(amountOutReceived[0].quoteAmount.toString()).toBe(
        amountOut.toString()
      );
    });
  });

  describe('with multiple quotes', () => {
    it('returns all quotes', async () => {
      const amountOut1 = ethers.utils.parseEther('1000');
      const amountOut2 = ethers.utils.parseEther('2000');
      const types = [
        'uint256', // amountOut/amountIn
        'uint160', // sqrtPrice after
        'uint32', // ticks crossed
        'uint256', // gasEstimate
      ];

      const encoded1 = ethers.utils.defaultAbiCoder.encode(types, [
        amountOut1,
        '100',
        '1',
        '100000',
      ]);
      const encoded2 = ethers.utils.defaultAbiCoder.encode(types, [
        amountOut2,
        '100',
        '1',
        '100000',
      ]);

      const mockReturnData = {
        returnData: [
          {
            returnData: encoded1,
          },
          {
            returnData: encoded2,
          },
        ],
      };

      let dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter, as long as the length is correct.
      const pool0 = new Pool(
        WETH_TEST_CHAIN,
        IMX_TEST_CHAIN,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick
      );
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));

      const provider = new MockProvider();
      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const amount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
        WETH_TEST_CHAIN,
        '123123'
      );
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT
      );
      expect(amountOutReceived.length).toBe(2);
      expect(amountOutReceived[0].quoteAmount.toString()).toBe(
        amountOut1.toString()
      );
      expect(amountOutReceived[1].quoteAmount.toString()).toBe(
        amountOut2.toString()
      );
    });
  });
});
