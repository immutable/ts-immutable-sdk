import { Contract, getAddress, JsonRpcProvider, Interface } from 'ethers';
// eslint-disable-next-line max-len
import swapRouterContract from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/ISwapRouter02.sol/ISwapRouter02.json';
// eslint-disable-next-line max-len
import paymentsExtendedContract from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/IPeripheryPaymentsWithFeeExtended.sol/IPeripheryPaymentsWithFeeExtended.json';
import { ERC20__factory, WIMX__factory } from './contracts/types';
import { newAmount } from './lib/utils';
import { AVERAGE_SECONDARY_FEE_EXTRA_GAS } from './constants';
import { SecondaryFee } from './types';
import { Exchange } from './exchange';
import {
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_FEE_RECIPIENT,
  TEST_SWAP_PROXY_ADDRESS,
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
  WETH_TEST_TOKEN,
  formatTokenAmount,
  createPool,
  nativeTokenService,
  FUN_TEST_TOKEN,
  TEST_FROM_ADDRESS,
  WIMX_TEST_TOKEN,
  expectToBeString,
  refundETHFunctionSignature,
  NATIVE_TEST_TOKEN,
  buildBlock,
  TEST_BASE_FEE,
  TEST_MAX_PRIORITY_FEE_PER_GAS,
  TEST_TRANSACTION_GAS_USAGE,
  TEST_GAS_PRICE,
} from './test/utils';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
  JsonRpcProvider: jest.fn(),
}));
jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  // eslint-disable-next-line arrow-body-style
  getTokenDecimals: async (address: string) => {
    return address === USDC_TEST_TOKEN.address ? USDC_TEST_TOKEN.decimals : 18;
  },
}));

const APPROVED_AMOUNT = BigInt('0'); // No existing approval
const APPROVE_GAS_ESTIMATE = BigInt('100000');

/**
 * Tests for getUnsignedSwapTxFromAmountOut are limited in scope compared to getUnsignedSwapTxFromAmountIn.
 * This is because the underlying logic is the same, and the tests for getUnsignedSwapTxFromAmountIn are more
 * comprehensive.
 */
describe('getUnsignedSwapTxFromAmountOut', () => {
  beforeAll(() => {
    (Contract as unknown as jest.Mock).mockImplementation(() => ({
      allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT),
      approve: { estimateGas: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
      paused: jest.fn().mockResolvedValue(false),
    }));

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
      getBlock: async () => buildBlock({ baseFeePerGas: BigInt(TEST_BASE_FEE) }),
      send: jest.fn().mockImplementation(async (method) => {
        switch (method) {
          case 'eth_maxPriorityFeePerGas':
            return BigInt(TEST_MAX_PRIORITY_FEE_PER_GAS); // 10 gwei
          default:
            throw new Error('Method not implemented');
        }
      }),
    })) as unknown as JsonRpcProvider;
  });

  describe('Wrapping native asset', () => {
    it('should wrap the amount in the transaction', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.nativeToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountOut.value,
      );

      expectToBeDefined(swap.transaction.value);
      expect(swap.transaction.value).toEqual(amountOut.value);
    });

    it('should send a call to deposit', async () => {
      const wimxInterface = WIMX__factory.createInterface();
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.nativeToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountOut.value,
      );

      expectToBeDefined(swap.transaction.data);
      // As long as decoding with deposit() succeeds, we know that the call is to deposit()
      const decoded = wimxInterface.decodeFunctionData('deposit()', swap.transaction.data);
      expect(decoded).toEqual([]);
    });

    it('should have no approval', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.nativeToken);
      const { approval } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountOut.value,
      );

      expect(approval).toBeNull();
    });

    it('should return a quote with the input amount', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.nativeToken);
      const { quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountOut.value,
      );

      expect(quote.amount.token.address).toEqual('native');
      expect(quote.amount.token.chainId).toEqual(nativeTokenService.nativeToken.chainId);
      expect(quote.amount.token.decimals).toEqual(nativeTokenService.nativeToken.decimals);
      expect(quote.amount.value).toEqual(amountOut.value);
    });
  });

  describe('Unwrapping native asset', () => {
    it('should unwrap the amount in the transaction', async () => {
      const wimxInterface = WIMX__factory.createInterface();
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.wrappedToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountOut.value,
      );

      expect(swap.transaction.value).toBeUndefined();
      expectToBeDefined(swap.transaction.data);
      const decoded = wimxInterface.decodeFunctionData('withdraw(uint256)', swap.transaction.data);
      expect(decoded.toString()).toEqual([amountOut.value].toString());
    });

    it('should have no approval if already approved', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmount(BigInt(APPROVED_AMOUNT), nativeTokenService.wrappedToken);
      const { approval } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountOut.value,
      );

      expect(approval).toBeNull();
    });

    it('should return a quote with the input amount', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountOut = newAmountFromString('1', nativeTokenService.wrappedToken);
      const { quote } = await exchange.getUnsignedSwapTxFromAmountOut(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountOut.value,
      );

      expect(quote.amount.token.address).toEqual(nativeTokenService.wrappedToken.address);
      expect(quote.amount.token.chainId).toEqual(nativeTokenService.wrappedToken.chainId);
      expect(quote.amount.token.decimals).toEqual(nativeTokenService.wrappedToken.decimals);
      expect(quote.amount.value).toEqual(amountOut.value);
    });
  });

  describe('Swap with single pool with secondary fees', () => {
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
      expect(typeof swapParams.amountInMaximum).toBe('bigint');

      expect(swapParams.tokenIn).toBe(params.inputToken);
      expect(swapParams.tokenOut).toBe(params.outputToken);
      expect(swapParams.fee).toBe(BigInt(10000));
      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(swap.transaction.to).toBe(TEST_SWAP_PROXY_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00'); // // expect 0 native tokens to be transferred
      expect(formatEther(swapParams.amountOut)).toBe('1000.0');
      expect(formatTokenAmount(swapParams.amountInMaximum, USDC_TEST_TOKEN)).toBe('104.03'); // amount with slippage and fees applied
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');

      expect(
        swap.gasFeeEstimate?.value.toString(),
      ).toBe(((TEST_TRANSACTION_GAS_USAGE + BigInt(AVERAGE_SECONDARY_FEE_EXTRA_GAS)) * TEST_GAS_PRICE).toString());
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

      expect(formatTokenAmount(approvalAmount, USDC_TEST_TOKEN)).toEqual('104.03');
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

      expect(spenderAddress).toEqual(TEST_SWAP_PROXY_ADDRESS);
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

      const tokenIn = { ...USDC_TEST_TOKEN, name: undefined, symbol: undefined };

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
      expect(typeof swapParams.amountInMaximum).toBe('bigint');

      expect(swapParams.tokenIn).toBe(params.inputToken);
      expect(swapParams.tokenOut).toBe(params.outputToken);
      expect(swapParams.fee).toBe(BigInt(10000));
      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(swap.transaction.to).toBe(TEST_ROUTER_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00'); // // expect 0 native tokens to be transferred
      expect(formatEther(swapParams.amountOut)).toBe('1000.0');
      expect(formatTokenAmount(swapParams.amountInMaximum, USDC_TEST_TOKEN)).toBe('100.1'); // includes slippage
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');
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
      expect(quote.amountWithMaxSlippage.token.address).toEqual(params.inputToken);
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual(
        '100.1', // includes slippage
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

      expect(spenderAddress).toEqual(TEST_ROUTER_ADDRESS);
    });

    describe('when the input token is native', () => {
      it('should use the quoted amount with slippage applied as the value of the transaction', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 1000 FUN for X amount of native token where the exchange rate is 1 token-in : 10 token-out
        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          'native',
          FUN_TEST_TOKEN.address,
          newAmountFromString('1000', FUN_TEST_TOKEN).value,
          3, // 3 % slippage
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);
        const data = swap.transaction.data.toString();

        const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(data);
        expect(typeof swapParams.amountInMaximum).toBe('bigint');

        expect(swap.transaction.to).toBe(TEST_ROUTER_ADDRESS);
        expect(swap.transaction.from).toBe(TEST_FROM_ADDRESS);
        expect(BigInt(swap.transaction.value).toString()).toBe('103000000000000000000'); // expect that the value is the maximum amount in (quoted amount with slippage applied)

        expect(swapParams.tokenIn).toBe(WIMX_TEST_TOKEN.address);
        expect(swapParams.tokenOut).toBe(FUN_TEST_TOKEN.address);
        expect(swapParams.fee).toBe(BigInt(10000));
        expect(swapParams.recipient).toBe(TEST_FROM_ADDRESS); // the recipient should be the sender
        expect(formatEther(swapParams.amountOut)).toBe('1000.0'); // expect that the amount out is the user-specified amount
        expect(formatTokenAmount(swapParams.amountInMaximum, WIMX_TEST_TOKEN)).toBe('103.0'); // should include slippage
        expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');
      });

      it('should include a call to refundETH as the final step of the multicall calldata', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const swapRouterInterface = new Interface(swapRouterContract.abi);
        const paymentsInterface = new Interface(paymentsExtendedContract.abi);
        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 1000 FUN for X amount of native token where the exchange rate is 1 token-in : 10 token-out
        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          'native',
          FUN_TEST_TOKEN.address,
          newAmountFromString('1000', FUN_TEST_TOKEN).value,
          3, // 3 % slippage
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);
        const calldata = swap.transaction.data.toString();

        const topLevelParams = swapRouterInterface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

        expect(topLevelParams.data.length).toBe(2); // expect that there are two calls in the multicall
        const swapTransactionCalldata = topLevelParams.data[0];
        const refundETHTransactionCalldata = topLevelParams.data[1];

        expectToBeString(swapTransactionCalldata);
        expectToBeString(refundETHTransactionCalldata);

        const decodedRefundEthTx = paymentsInterface.decodeFunctionData('refundETH', refundETHTransactionCalldata);

        expect(topLevelParams.data[1]).toEqual(refundETHFunctionSignature);
        expect(decodedRefundEthTx.length).toEqual(0); // expect that the refundETH call has no parameters
      });
    });

    describe('when the output token is native', () => {
      it('should not include any amount as the value of the transaction', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          FUN_TEST_TOKEN.address,
          'native',
          newAmountFromString('100', NATIVE_TEST_TOKEN).value,
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);
        const data = swap.transaction.data.toString();

        const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(data);
        expect(typeof swapParams.amountOut).toBe('bigint');

        expect(swapParams.tokenIn).toBe(FUN_TEST_TOKEN.address); // should be the token-in
        expect(swapParams.tokenOut).toBe(WIMX_TEST_TOKEN.address); // should be the wrapped native token
        expect(swap.transaction.value).toBe('0x00'); // should not have a value
      });

      it('should include a call to unwrapWETH9 as the final method call of the calldata', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const swapRouterInterface = new Interface(swapRouterContract.abi);
        const paymentsInterface = new Interface(paymentsExtendedContract.abi);
        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          FUN_TEST_TOKEN.address,
          'native',
          newAmountFromString('100', NATIVE_TEST_TOKEN).value,
          3, // 3 % slippage
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);
        const calldata = swap.transaction.data.toString();

        const topLevelParams = swapRouterInterface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

        expect(topLevelParams.data.length).toBe(2); // expect that there are two calls in the multicall
        const swapFunctionCalldata = topLevelParams.data[0];
        const unwrapWETHFunctionCalldata = topLevelParams.data[1];

        expectToBeString(swapFunctionCalldata);
        expectToBeString(unwrapWETHFunctionCalldata);

        // Get the first 4 bytes of the swap and unwrap function calldata to get the function selector
        const swapFunctionFragment = swapRouterInterface.getFunction(swapFunctionCalldata.slice(0, 10));
        const unwrapFunctionFragment = paymentsInterface.getFunction(unwrapWETHFunctionCalldata.slice(0, 10));

        expect(swapFunctionFragment?.name).toEqual('exactOutputSingle');
        expect(unwrapFunctionFragment?.name).toEqual('unwrapWETH9');
      });

      it('should specify the Router contract as the recipient of the swap function call', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          FUN_TEST_TOKEN.address,
          'native',
          newAmountFromString('100', NATIVE_TEST_TOKEN).value,
          3, // 3 % slippage
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);

        const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(swap.transaction.data);

        expect(swapParams.recipient).toEqual(TEST_ROUTER_ADDRESS);
      });

      it('should specify the quoted amount with slippage applied in the unwrapWETH9 function calldata', async () => {
        mockRouterImplementation({
          pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
        });

        const swapRouterInterface = new Interface(swapRouterContract.abi);
        const paymentsInterface = new Interface(paymentsExtendedContract.abi);
        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
        const { swap } = await exchange.getUnsignedSwapTxFromAmountOut(
          TEST_FROM_ADDRESS,
          FUN_TEST_TOKEN.address,
          'native',
          newAmountFromString('100', NATIVE_TEST_TOKEN).value,
          10, // 10 % slippage for easier test math
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);
        const calldata = swap.transaction.data.toString();

        const topLevelParams = swapRouterInterface.decodeFunctionData('multicall(uint256,bytes[])', calldata);

        expect(topLevelParams.data.length).toBe(2); // expect that there are two calls in the multicall
        const swapFunctionCalldata = topLevelParams.data[0];
        const unwrapWETHFunctionCalldata = topLevelParams.data[1];

        expectToBeString(swapFunctionCalldata);
        expectToBeString(unwrapWETHFunctionCalldata);

        const decodedUnwrapWETH9FunctionData = paymentsInterface.decodeFunctionData(
          'unwrapWETH9(uint256)',
          unwrapWETHFunctionCalldata,
        );

        expect(formatEther(decodedUnwrapWETH9FunctionData.toString())).toEqual('100.0'); // expect the user-specified amount
      });
    });
  });

  describe('Swap with multiple pools and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest({ multiPoolSwap: true });
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [{ recipient: TEST_FEE_RECIPIENT, basisPoints: TEST_MAX_FEE_BASIS_POINTS }];

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
      expect(typeof swapParams.amountInMaximum).toBe('bigint');

      expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].basisPoints.toString()).toBe(TEST_MAX_FEE_BASIS_POINTS.toString());

      const decodedPath = decodePathForExactOutput(swapParams.path.toString());

      expect(swap.transaction.to).toBe(TEST_SWAP_PROXY_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00'); // expect 0 native tokens to be transferred

      expect(getAddress(decodedPath.inputToken)).toBe(params.inputToken);
      expect(getAddress(decodedPath.intermediaryToken)).toBe(params.intermediaryToken);
      expect(getAddress(decodedPath.outputToken)).toBe(params.outputToken);

      expect(decodedPath.firstPoolFee.toString()).toBe('10000');
      expect(decodedPath.secondPoolFee.toString()).toBe('10000');

      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(formatTokenAmount(swapParams.amountInMaximum, USDC_TEST_TOKEN)).toBe('110.11'); // includes fees and slippage
      expect(formatEther(swapParams.amountOut)).toBe('1000.0');
    });
  });
});
