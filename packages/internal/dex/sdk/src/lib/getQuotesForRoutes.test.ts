import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { Token, TradeType } from '@uniswap/sdk-core';
import {
  BigNumber, Contract, providers, utils,
} from 'ethers';
import { ProviderCallError } from 'errors';
import { getQuotesForRoutes } from './getQuotesForRoutes';
import {
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_QUOTER_ADDRESS,
  TEST_RPC_URL,
  WETH_TEST_TOKEN,
  formatAmount,
  WIMX_TEST_TOKEN,
} from '../test/utils';
import { Multicall__factory } from '../contracts/types';
import { erc20ToUniswapToken, newAmount } from './utils';

jest.mock('@ethersproject/contracts');

const UNISWAP_WIMX = erc20ToUniswapToken(WIMX_TEST_TOKEN);
const UNISWAP_WETH = erc20ToUniswapToken(WETH_TEST_TOKEN);

const types = [
  'uint256', // amountOut/amountIn
  'uint160', // sqrtPrice after
  'uint32', // ticks crossed
  'uint256', // gasEstimate
];

describe('getQuotesForRoutes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedMulticallContract: jest.Mock;

  describe('when multicall fails', () => {
    it('should throw ProviderCallError', async () => {
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
        },
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        UNISWAP_WETH,
        UNISWAP_WIMX,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], UNISWAP_WETH, UNISWAP_WIMX));
      dummyRoutes.push(new Route([pool0], UNISWAP_WETH, UNISWAP_WIMX));

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);

      await expect(getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      )).rejects.toThrow(new ProviderCallError('failed multicall: an rpc error message'));
    });
  });

  describe('with one quote', () => {
    it('returns the only quote', async () => {
      const expectedAmountOut = utils.parseEther('1000');
      const expectedGasEstimate = '100000';

      const encoded = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut,
        '100',
        '1',
        expectedGasEstimate,
      ]);

      const mockReturnData = {
        returnData: [
          {
            returnData: encoded,
          },
        ],
      };

      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockResolvedValueOnce(mockReturnData),
        },
      }));

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        UNISWAP_WETH,
        UNISWAP_WIMX,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], UNISWAP_WETH, UNISWAP_WIMX));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      );
      expect(amountOutReceived.length).toEqual(1);
      expect(formatAmount(amountOutReceived[0].amountOut)).toEqual(utils.formatEther(expectedAmountOut));
      expect(formatAmount(amountOutReceived[0].amountIn)).toEqual('0.000000000000123123');
      expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate);
    });
  });

  describe('with multiple quotes', () => {
    it('returns all quotes', async () => {
      const expectedAmountOut1 = utils.parseEther('1000');
      const expectedAmountOut2 = utils.parseEther('2000');
      const expectedGasEstimate1 = '100000';
      const expectedGasEstimate2 = '200000';

      const encoded1 = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut1,
        '100',
        '1',
        expectedGasEstimate1,
      ]);
      const encoded2 = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut2,
        '100',
        '1',
        expectedGasEstimate2,
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

      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockResolvedValueOnce(mockReturnData),
        },
      }));

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        UNISWAP_WETH,
        UNISWAP_WIMX,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], UNISWAP_WETH, UNISWAP_WIMX));
      dummyRoutes.push(new Route([pool0], UNISWAP_WETH, UNISWAP_WIMX));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      );
      expect(amountOutReceived.length).toBe(2);
      expect(formatAmount(amountOutReceived[0].amountOut)).toBe(
        utils.formatEther(expectedAmountOut1),
      );
      expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate1);
      expect(formatAmount(amountOutReceived[1].amountOut)).toBe(
        utils.formatEther(expectedAmountOut2),
      );
      expect(amountOutReceived[1].gasEstimate.toString()).toEqual(expectedGasEstimate2);
    });
  });
});
