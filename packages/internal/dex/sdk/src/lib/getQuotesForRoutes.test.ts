import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { TradeType } from '@uniswap/sdk-core';
import { BigNumber, utils } from 'ethers';
import { ProviderCallError } from 'errors';
import { getQuotesForRoutes } from './getQuotesForRoutes';
import {
  IMX_TEST_TOKEN,
  TEST_QUOTER_ADDRESS,
  WETH_TEST_TOKEN,
  formatAmount,
  newAmountFromString,
} from '../test/utils';
import { erc20ToUniswapToken, newAmount } from './utils';
import { Multicall } from './multicall';

const UNISWAP_IMX = erc20ToUniswapToken(IMX_TEST_TOKEN);
const UNISWAP_WETH = erc20ToUniswapToken(WETH_TEST_TOKEN);

const pool = new Pool(
  UNISWAP_WETH,
  UNISWAP_IMX,
  FeeAmount.HIGH,
  TickMath.getSqrtRatioAtTick(100),
  1000,
  100,
);

const route = new Route([pool], UNISWAP_WETH, UNISWAP_IMX);

const types = [
  'uint256', // amountOut/amountIn
  'uint160', // sqrtPrice after
  'uint32', // ticks crossed
  'uint256', // gasEstimate
];

const buildMulticallContract = (multicall: jest.Mock): Multicall => ({ callStatic: { multicall } });

describe('getQuotesForRoutes', () => {
  it('uses a suitable gas limit', async () => {
    const expectedAmountOut = utils.parseEther('1000');
    const expectedGasEstimate = '100000';

    const returnData = utils.defaultAbiCoder.encode(types, [
      expectedAmountOut,
      '100',
      '1',
      expectedGasEstimate,
    ]);

    const multicallContract = buildMulticallContract(
      jest.fn().mockResolvedValue({
        returnData: [
          {
            returnData,
          },
        ],
      }),
    );

    const quoteResults = await getQuotesForRoutes(
      multicallContract,
      TEST_QUOTER_ADDRESS,
      [route],
      newAmountFromString('1', WETH_TEST_TOKEN),
      TradeType.EXACT_INPUT,
    );

    expect(quoteResults).toHaveLength(1);
    expect(multicallContract.callStatic.multicall).toHaveBeenCalledWith([{
      // eslint-disable-next-line max-len
      callData: expect.any(String),
      gasLimit: 2000000,
      target: TEST_QUOTER_ADDRESS,
    }]);
  });

  describe('when multicall fails', () => {
    it('should throw ProviderCallError', async () => {
      const mockedMulticallContract = buildMulticallContract(
        jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
      );

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);

      await expect(getQuotesForRoutes(
        mockedMulticallContract,
        TEST_QUOTER_ADDRESS,
        [route],
        amount,
        TradeType.EXACT_INPUT,
      )).rejects.toThrow(new ProviderCallError('failed multicall: an rpc error message'));
    });
  });

  describe('with one quote', () => {
    it('returns the only quote', async () => {
      const expectedAmountOut = utils.parseEther('1000');
      const expectedGasEstimate = '100000';

      const returnData = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut,
        '100',
        '1',
        expectedGasEstimate,
      ]);

      const multicallContract = buildMulticallContract(
        jest.fn().mockResolvedValue({
          returnData: [
            {
              returnData,
            },
          ],
        }),
      );

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        [route],
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

      const returnData1 = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut1,
        '100',
        '1',
        expectedGasEstimate1,
      ]);
      const returnData2 = utils.defaultAbiCoder.encode(types, [
        expectedAmountOut2,
        '100',
        '1',
        expectedGasEstimate2,
      ]);

      const multicallContract = buildMulticallContract(
        jest.fn().mockResolvedValueOnce({
          returnData: [
            {
              returnData: returnData1,
            },
            {
              returnData: returnData2,
            },
          ],
        }),
      );

      const amount = newAmount(BigNumber.from('123123'), WETH_TEST_TOKEN);
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        [route, route],
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
