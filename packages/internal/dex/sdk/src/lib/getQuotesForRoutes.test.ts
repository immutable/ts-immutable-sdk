/* eslint-disable max-len */
import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { TradeType } from '@uniswap/sdk-core';
import { formatEther, parseEther, AbiCoder } from 'ethers';
import { ProviderCallError } from '../errors';
import { getQuotesForRoutes, parseQuoteResult, Provider } from './getQuotesForRoutes';
import {
  FUN_TEST_TOKEN,
  IMX_TEST_TOKEN,
  TEST_QUOTER_ADDRESS,
  USDC_TEST_TOKEN,
  USDT_TEST_TOKEN,
  WETH_TEST_TOKEN,
  formatAmount,
  newAmountFromString,
} from '../test/utils';
import { erc20ToUniswapToken, newAmount, quoteReturnMapping } from './utils';

const UNISWAP_IMX = erc20ToUniswapToken(IMX_TEST_TOKEN);
const UNISWAP_FUN = erc20ToUniswapToken(FUN_TEST_TOKEN);
const UNISWAP_USDT = erc20ToUniswapToken(USDT_TEST_TOKEN);
const UNISWAP_USDC = erc20ToUniswapToken(USDC_TEST_TOKEN);
const UNISWAP_WETH = erc20ToUniswapToken(WETH_TEST_TOKEN);

const types = [
  'uint256', // amountOut/amountIn
  'uint160', // sqrtPrice after
  'uint32', // ticks crossed
  'uint256', // gasEstimate
];

const buildProvider = (send: jest.Mock): Provider => ({ send });

const returnTypes = quoteReturnMapping['0xcdca1753'];

const buildResult = ({
  amountOut,
  sqrtPriceX96AfterList,
  initializedTicksCrossedList,
  gasEstimate,
}: {
  amountOut: bigint,
  sqrtPriceX96AfterList: bigint[],
  initializedTicksCrossedList: bigint[],
  gasEstimate: bigint
}) => AbiCoder.defaultAbiCoder().decode(
  returnTypes,
  AbiCoder.defaultAbiCoder().encode(returnTypes, [
    amountOut,
    sqrtPriceX96AfterList,
    initializedTicksCrossedList,
    gasEstimate,
  ]),
);

describe('getQuotesForRoutes', () => {
  describe('parseQuoteResult', () => {
    it('detects a high price impact for a multi-pool route', () => {
      const funUsdtPool = new Pool(UNISWAP_FUN, UNISWAP_USDT, FeeAmount.LOWEST, '28632999097454925582774', '205850654607274164', -296681);
      const usdtUsdcPool = new Pool(UNISWAP_USDT, UNISWAP_USDC, FeeAmount.LOWEST, '79218947437379829182319841397', '615083188613638', -3);
      const usdcWethPool = new Pool(UNISWAP_USDC, UNISWAP_WETH, FeeAmount.LOWEST, '4136724696665609466361418', '8867304981303', -197214);
      const route = new Route([funUsdtPool, usdtUsdcPool, usdcWethPool], UNISWAP_FUN, UNISWAP_WETH);

      const amount = newAmountFromString('5654.4', FUN_TEST_TOKEN);
      const decodedQuoteResult = buildResult({
        amountOut: 40732407119585286n,
        sqrtPriceX96AfterList: [28351578844822416415875n, 79218853285550387257966700430n, 1799577836807645269467520725n],
        initializedTicksCrossedList: [0n, 0n, 53n],
        gasEstimate: 5910178n,
      });

      const quoteResult = parseQuoteResult(decodedQuoteResult, route, amount, TradeType.EXACT_INPUT);
      expect(quoteResult.amountOut.value).toEqual(40732407119585286n);
      expect(quoteResult.amountIn.value).toEqual(amount.value);
      expect(quoteResult.gasEstimate).toEqual(5910178n);
      expect(quoteResult.priceImpact.toSignificant(10)).toEqual('-84.96747014');
    });
  });
  describe('getQuotesForRoutes', () => {
    const pool = new Pool(
      UNISWAP_WETH,
      UNISWAP_IMX,
      FeeAmount.HIGH,
      TickMath.getSqrtRatioAtTick(100),
      1000,
      100,
    );

    const route = new Route([pool], UNISWAP_WETH, UNISWAP_IMX);
    it('makes an eth_call against the provider', async () => {
      const expectedAmountOut = parseEther('1000');
      const expectedGasEstimate = '100000';

      const returnData = AbiCoder.defaultAbiCoder().encode(types, [
        expectedAmountOut,
        '100',
        '1',
        expectedGasEstimate,
      ]);

      const provider = buildProvider(jest.fn().mockResolvedValueOnce(returnData));

      const quoteResults = await getQuotesForRoutes(
        provider,
        TEST_QUOTER_ADDRESS,
        [route],
        newAmountFromString('1', WETH_TEST_TOKEN),
        TradeType.EXACT_INPUT,
        'latest',
      );

      expect(quoteResults).toHaveLength(1);
      expect(provider.send).toHaveBeenCalledWith('eth_call', [{
      // eslint-disable-next-line max-len
        data: '0xc6a5026a0000000000000000000000004f062a3eaec3730560ab89b5ce5ac0ab2c5517ae00000000000000000000000072958b06abdf2701ace6ceb3ce0b8b1ce11e08510000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000',
        to: '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5',
      }, 'latest']);
    });

    describe('when all calls in the batch fail', () => {
      it('returns no quote results', async () => {
        const provider = buildProvider(
          jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
        );

        const amount = newAmount(BigInt('123123'), WETH_TEST_TOKEN);

        const quoteResults = await getQuotesForRoutes(
          provider,
          TEST_QUOTER_ADDRESS,
          [route],
          amount,
          TradeType.EXACT_INPUT,
          'latest',
        );
        expect(quoteResults).toHaveLength(0);
      });
    });

    describe('when one call of two in the batch fail', () => {
      it('returns one quote results', async () => {
        const expectedAmountOut = parseEther('1000');
        const expectedGasEstimate = '100000';

        const returnData = AbiCoder.defaultAbiCoder().encode(types, [
          expectedAmountOut,
          '100',
          '1',
          expectedGasEstimate,
        ]);

        const provider = buildProvider(
          jest.fn()
            .mockRejectedValueOnce(new ProviderCallError('an rpc error message'))
            .mockResolvedValueOnce(returnData),
        );

        const amount = newAmount(BigInt('123123'), WETH_TEST_TOKEN);

        const quoteResults = await getQuotesForRoutes(
          provider,
          TEST_QUOTER_ADDRESS,
          [route, route],
          amount,
          TradeType.EXACT_INPUT,
          'latest',
        );
        expect(quoteResults).toHaveLength(1);
      });
    });

    describe('with one quote', () => {
      it('returns the only quote', async () => {
        const expectedAmountOut = parseEther('1000');
        const expectedGasEstimate = '100000';

        const returnData = AbiCoder.defaultAbiCoder().encode(types, [
          expectedAmountOut,
          '100',
          '1',
          expectedGasEstimate,
        ]);

        const provider = buildProvider(
          jest.fn().mockResolvedValue(returnData),
        );

        const amount = newAmount(BigInt('123123'), WETH_TEST_TOKEN);
        const amountOutReceived = await getQuotesForRoutes(
          provider,
          TEST_QUOTER_ADDRESS,
          [route],
          amount,
          TradeType.EXACT_INPUT,
          'latest',
        );
        expect(amountOutReceived.length).toEqual(1);
        expect(formatAmount(amountOutReceived[0].amountOut)).toEqual(formatEther(expectedAmountOut));
        expect(formatAmount(amountOutReceived[0].amountIn)).toEqual('0.000000000000123123');
        expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate);
      });
    });

    describe('with multiple quotes', () => {
      it('returns all quotes', async () => {
        const expectedAmountOut1 = parseEther('1000');
        const expectedAmountOut2 = parseEther('2000');
        const expectedGasEstimate1 = '100000';
        const expectedGasEstimate2 = '200000';

        const returnData1 = AbiCoder.defaultAbiCoder().encode(types, [
          expectedAmountOut1,
          '100',
          '1',
          expectedGasEstimate1,
        ]);
        const returnData2 = AbiCoder.defaultAbiCoder().encode(types, [
          expectedAmountOut2,
          '100',
          '1',
          expectedGasEstimate2,
        ]);

        const provider = buildProvider(
          jest.fn().mockResolvedValueOnce(returnData1).mockResolvedValueOnce(returnData2),
        );

        const amount = newAmount(BigInt('123123'), WETH_TEST_TOKEN);
        const amountOutReceived = await getQuotesForRoutes(
          provider,
          TEST_QUOTER_ADDRESS,
          [route, route],
          amount,
          TradeType.EXACT_INPUT,
          'latest',
        );
        expect(amountOutReceived.length).toBe(2);
        expect(formatAmount(amountOutReceived[0].amountOut)).toBe(
          formatEther(expectedAmountOut1),
        );
        expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate1);
        expect(formatAmount(amountOutReceived[1].amountOut)).toBe(
          formatEther(expectedAmountOut2),
        );
        expect(amountOutReceived[1].gasEstimate.toString()).toEqual(expectedGasEstimate2);
      });
    });
  });
});
