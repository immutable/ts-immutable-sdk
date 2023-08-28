import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { SecondaryFee, uniswapTokenToTokenInfo } from 'lib';
import { ethers } from 'ethers';
import { ERC20__factory } from 'contracts/types';
import { formatUnits } from 'ethers/lib/utils';
import { Exchange } from './exchange';
import {
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_PERIPHERY_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_GAS_PRICE,
  TEST_FEE_RECIPIENT,
  TEST_SECONDARY_FEE_ADDRESS,
  decodeMulticallExactOutputSingleWithFees,
  decodeMulticallExactOutputSingleWithoutFees,
  TEST_MAX_FEE_BASIS_POINTS,
  decodeMulticallExactOutputWithFees,
  expectToBeDefined,
  decodePathForExactOutput,
  makeAddr,
  formatAmount,
  formatEther,
  USDC_TEST_TOKEN,
  newAmountFromString,
  expectInstanceOf,
  WETH_TEST_TOKEN,
} from './test/utils';

jest.mock('@ethersproject/providers');
jest.mock('@ethersproject/contracts');
jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  // eslint-disable-next-line arrow-body-style
  getERC20Decimals: async (address: string) => {
    return address === USDC_TEST_TOKEN.address ? USDC_TEST_TOKEN.decimals : 18;
  },
}));

const APPROVED_AMOUNT = BigNumber.from('0'); // No existing approval
const APPROVE_GAS_ESTIMATE = BigNumber.from('100000');

/**
 * Tests for getUnsignedSwapTxFromAmountOut are limited in scope compared to getUnsignedSwapTxFromAmountIn.
 * This is because the underlying logic is the same, and the tests for getUnsignedSwapTxFromAmountIn are more
 * comprehensive.
 * We therefore only test the happy path here to make sure the tokenIn and tokenOut are correctly set.
 */
describe('getUnsignedSwapTxFromAmountOut', () => {
  beforeAll(() => {
    (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT),
        estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
        paused: jest.fn().mockResolvedValue(false),
      }),
    );

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
      () => ({
        getFeeData: async () => ({
          maxFeePerGas: null,
          gasPrice: TEST_GAS_PRICE,
        }),
      }),
    ) as unknown as JsonRpcProvider;
  });

  describe('Swap with single pool with fees', () => {
    it('generates valid swap calldata', async () => {
      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];

      const params = setupSwapTxTest();

      const findOptimalRouteMock = mockRouterImplementation(params);

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap, quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
        3, // 3% Slippage
      );

      expectToBeDefined(swap.transaction.data);

      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('104.03'); // userQuoteRes.amountInMaximum = swap.amountInMaximum

      // The maxAmountIn is the amount out + fees + slippage
      const ourQuoteReqAmountOut = findOptimalRouteMock.mock.calls[0][0];
      expect(formatAmount(ourQuoteReqAmountOut)).toEqual('1000.0'); // ourQuoteReq.amountOut = userQuoteReq.amountOut

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactOutputSingleWithFees(data);
      expectInstanceOf(BigNumber, swapParams.amountInMaximum);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(formatEther(swapParams.amountOut)).toBe('1000.0'); // amount out (1,000)
      expect(formatUnits(swapParams.amountInMaximum, USDC_TEST_TOKEN.decimals)).toBe('104.03'); // max amount in
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('uses the amount with slippage and fees for the approval amount', async () => {
      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];

      const params = setupSwapTxTest();
      const erc20ContractInterface = ERC20__factory.createInterface();

      mockRouterImplementation(params);

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { approval, quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
        3, // 3% Slippage
      );

      expectToBeDefined(approval?.transaction.data);

      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', approval.transaction.data);
      const approvalAmount = decodedResults[1].toString();

      expect(formatUnits(approvalAmount, USDC_TEST_TOKEN.decimals)).toEqual('104.03');
      expect(approval.transaction.to).toEqual(params.inputToken);
      expect(approval.transaction.from).toEqual(params.fromAddress);
      expect(approval.transaction.value).toEqual(0); // we do not want to send any ETH
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('104.03');
    });

    it('uses the secondary fee address as the spender for approving', async () => {
      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];

      const params = setupSwapTxTest();
      const erc20ContractInterface = ERC20__factory.createInterface();

      mockRouterImplementation(params);

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { approval } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      expectToBeDefined(approval?.transaction.data);

      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', approval.transaction.data);
      const spenderAddress: string = decodedResults[0].toString();

      expect(spenderAddress).toEqual(TEST_SECONDARY_FEE_ADDRESS);
    });

    it('returns valid swap quote', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { recipient: makeAddr('recipienta'), basisPoints: 200 }, // 2% fee
        { recipient: makeAddr('recipientb'), basisPoints: 400 }, // 4% fee
      ];

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      const tokenIn = { ...uniswapTokenToTokenInfo(USDC_TEST_TOKEN), name: undefined, symbol: undefined };

      expect(quote.fees).toEqual([
        {
          recipient: makeAddr('recipienta'),
          basisPoints: 200,
          amount: newAmountFromString('2', tokenIn),
        },
        {
          recipient: makeAddr('recipientb'),
          basisPoints: 400,
          amount: newAmountFromString('4', tokenIn),
        },
      ]);
    });
  });

  describe('Swap with single pool without fees and default slippage tolerance', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(data);
      expectInstanceOf(BigNumber, swapParams.amountInMaximum);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(formatEther(swapParams.amountOut)).toBe('1000.0'); // 1,000 amount out
      expect(formatUnits(swapParams.amountInMaximum, USDC_TEST_TOKEN.decimals)).toBe('100.1'); // 100.1 max amount in includes slippage
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid swap quote', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      expect(quote.amount.token.address).toEqual(params.inputToken);
      expect(quote.slippage).toBe(0.1);
      expect(formatAmount(quote.amount)).toEqual('100.0');
      expect(quote.amountWithMaxSlippage.token.address).toEqual(
        params.inputToken,
      );
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual(
        '100.1', // (includes slippage)
      );
    });

    it('uses the swap router address as the spender for approving', async () => {
      const params = setupSwapTxTest();
      const erc20ContractInterface = ERC20__factory.createInterface();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { approval } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      expectToBeDefined(approval?.transaction.data);

      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', approval.transaction.data);
      const spenderAddress: string = decodedResults[0].toString();

      expect(spenderAddress).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
    });
  });

  describe('Swap with multiple pools and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest({ multiPoolSwap: true });
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: TEST_MAX_FEE_BASIS_POINTS },
      ];

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('1000', WETH_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams, secondaryFeeParams } = decodeMulticallExactOutputWithFees(data);
      expectInstanceOf(BigNumber, swapParams.amountInMaximum);

      expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].basisPoints.toString()).toBe(TEST_MAX_FEE_BASIS_POINTS.toString());

      const decodedPath = decodePathForExactOutput(swapParams.path.toString());

      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0 amount of the native token

      expect(ethers.utils.getAddress(decodedPath.inputToken)).toBe(params.inputToken);
      expect(ethers.utils.getAddress(decodedPath.intermediaryToken)).toBe(params.intermediaryToken);
      expect(ethers.utils.getAddress(decodedPath.outputToken)).toBe(params.outputToken);

      expect(decodedPath.firstPoolFee.toString()).toBe('10000');
      expect(decodedPath.secondPoolFee.toString()).toBe('10000');

      expect(swapParams.recipient).toBe(params.fromAddress); // recipient of swap
      expect(formatUnits(swapParams.amountInMaximum, USDC_TEST_TOKEN.decimals)).toBe('110.11'); // (includes fees and slippage)
      expect(formatEther(swapParams.amountOut)).toBe('1000.0');
    });
  });
});
