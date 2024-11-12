import { Environment } from '@imtbl/config';
import { Contract, getAddress, JsonRpcProvider, ZeroAddress, Interface } from 'ethers';
// eslint-disable-next-line max-len
import swapRouterContract from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/ISwapRouter02.sol/ISwapRouter02.json';
// eslint-disable-next-line max-len
import { abi as PaymentsExtendedAbi } from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/IPeripheryPaymentsWithFeeExtended.sol/IPeripheryPaymentsWithFeeExtended.json';
import { InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError, NoRoutesAvailableError } from './errors';
import { ERC20__factory } from './contracts/types/factories/ERC20__factory';
import { SecondaryFee } from './types';
import { WIMX__factory } from './contracts/types';
import { Router, addAmount, newAmount } from './lib';
import { AVERAGE_SECONDARY_FEE_EXTRA_GAS, IMMUTABLE_TESTNET_CHAIN_ID } from './constants';
import { Exchange } from './exchange';
import {
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_GAS_PRICE,
  TEST_TRANSACTION_GAS_USAGE,
  TEST_FEE_RECIPIENT,
  TEST_MAX_FEE_BASIS_POINTS,
  TEST_SWAP_PROXY_ADDRESS,
  decodePathForExactInput,
  decodeMulticallExactInputSingleWithFees,
  decodeMulticallExactInputWithFees,
  decodeMulticallExactInputSingleWithoutFees,
  expectToBeDefined,
  formatAmount,
  formatEther,
  USDC_TEST_TOKEN,
  newAmountFromString,
  formatTokenAmount,
  WIMX_TEST_TOKEN,
  NATIVE_TEST_TOKEN,
  makeAddr,
  createPool,
  WETH_TEST_TOKEN,
  FUN_TEST_TOKEN,
  nativeTokenService,
  TEST_FROM_ADDRESS,
  expectToBeString,
  decodeMulticallExactInputWithoutFees,
  buildBlock,
  refundETHFunctionSignature,
  TEST_MAX_PRIORITY_FEE_PER_GAS,
  TEST_BASE_FEE,
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

const HIGHER_SLIPPAGE = 0.2;
const APPROVED_AMOUNT = newAmountFromString('1', USDC_TEST_TOKEN);
const APPROVE_GAS_ESTIMATE = BigInt('100000'); // gas units

describe('getUnsignedSwapTxFromAmountIn', () => {
  let erc20Contract: jest.Mock<any, any, any>;

  beforeAll(() => {
    erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
      allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT.value),
      estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
      paused: jest.fn().mockResolvedValue(false),
    }));

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(erc20Contract),
    })) as unknown as JsonRpcProvider;

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
      getBlock: async () => buildBlock({ baseFeePerGas: BigInt(TEST_BASE_FEE) }),
      send: jest.fn().mockImplementation(async (method) => {
        switch (method) {
          case 'eth_maxPriorityFeePerGas':
            return BigInt(TEST_MAX_PRIORITY_FEE_PER_GAS);
          default:
            throw new Error('Method not implemented');
        }
      }),
    })) as unknown as JsonRpcProvider;
  });

  describe('Wrapping native asset', () => {
    it('should wrap the amount in the transaction', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.nativeToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountIn.value,
      );

      expectToBeDefined(swap.transaction.value);
      expect(swap.transaction.value).toEqual(amountIn.value);
    });

    it('should send a call to deposit', async () => {
      const wimxInterface = WIMX__factory.createInterface();
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.nativeToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountIn.value,
      );

      expectToBeDefined(swap.transaction.data);
      // As long as decoding with deposit() succeeds, we know that the call is to deposit()
      const decoded = wimxInterface.decodeFunctionData('deposit()', swap.transaction.data);
      expect(decoded).toEqual([]);
    });

    it('should have no approval', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.nativeToken);
      const { approval } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountIn.value,
      );

      expect(approval).toBeNull();
    });

    it('should return a quote with the input amount', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.nativeToken);
      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        nativeTokenService.wrappedToken.address,
        amountIn.value,
      );

      expect(quote.amount.token.address).toEqual(nativeTokenService.wrappedToken.address);
      expect(quote.amount.token.chainId).toEqual(nativeTokenService.wrappedToken.chainId);
      expect(quote.amount.token.decimals).toEqual(nativeTokenService.wrappedToken.decimals);
      expect(quote.amount.value).toEqual(amountIn.value);
    });
  });

  describe('Unwrapping native asset', () => {
    it('should unwrap the amount in the transaction', async () => {
      const wimxInterface = WIMX__factory.createInterface();
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.wrappedToken);
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountIn.value,
      );

      expectToBeDefined(swap.transaction.data);
      const decoded = wimxInterface.decodeFunctionData('withdraw(uint256)', swap.transaction.data);
      expect(decoded.toString()).toEqual([amountIn.value].toString());
    });

    it('should have no approval if already approved', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmount(BigInt(APPROVED_AMOUNT.value), nativeTokenService.wrappedToken);
      const { approval } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountIn.value,
      );

      expect(approval).toBeNull();
    });

    it('should return a quote with the input amount', async () => {
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      const amountIn = newAmountFromString('1', nativeTokenService.wrappedToken);
      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        nativeTokenService.wrappedToken.address,
        'native',
        amountIn.value,
      );

      expect(quote.amount.token.address).toEqual('native');
      expect(quote.amount.token.chainId).toEqual(nativeTokenService.nativeToken.chainId);
      expect(quote.amount.token.decimals).toEqual(nativeTokenService.nativeToken.decimals);
      expect(quote.amount.value).toEqual(amountIn.value);
    });
  });

  describe('with the out-of-the-box minimal configuration', () => {
    it('refreshes the deadline for every call', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const firstResponse = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expectToBeDefined(firstResponse.swap.transaction.data);
      const { deadline: firstDeadline } = decodeMulticallExactInputSingleWithFees(firstResponse.swap.transaction.data);

      // wait one second to ensure the deadline is different
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      const secondResponse = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expectToBeDefined(secondResponse.swap.transaction.data);
      const { deadline: secondDeadline } = decodeMulticallExactInputSingleWithFees(
        secondResponse.swap.transaction.data,
      );

      expect(secondDeadline).toBeGreaterThan(firstDeadline);
    });

    it('uses the native IMX as the gas token', async () => {
      const tokenIn = { ...USDC_TEST_TOKEN, chainId: IMMUTABLE_TESTNET_CHAIN_ID };
      const tokenOut = { ...WETH_TEST_TOKEN, chainId: IMMUTABLE_TESTNET_CHAIN_ID };
      const amountIn = addAmount(APPROVED_AMOUNT, newAmountFromString('1', USDC_TEST_TOKEN)); // Will trigger approval

      mockRouterImplementation({ pools: [createPool(tokenIn, tokenOut)] });

      const exchange = new Exchange({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        chainId: IMMUTABLE_TESTNET_CHAIN_ID,
      });

      const result = await exchange.getUnsignedSwapTxFromAmountIn(
        makeAddr('fromAddress'),
        tokenIn.address,
        tokenOut.address,
        amountIn.value,
      );

      expectToBeDefined(result.swap.gasFeeEstimate);
      expectToBeDefined(result.approval?.gasFeeEstimate);
      expect(result.swap.gasFeeEstimate.token.address).toEqual('native');
      expect(result.approval.gasFeeEstimate.token.address).toEqual('native');
    });
  });

  describe('with a single pool without fees and default slippage tolerance', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(BigInt(10000)); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_ROUTER_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0'); // amount in
      expect(formatEther(swapParams.amountOutMinimum)).toBe('999.000999000999000999'); // min amount out (includes slippage)
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns the gas estimate for the swap', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expectToBeDefined(tx.swap.gasFeeEstimate);

      expect(tx.swap.gasFeeEstimate.value).toEqual(TEST_TRANSACTION_GAS_USAGE * TEST_GAS_PRICE);
      expect(tx.swap.gasFeeEstimate.token.chainId).toEqual(NATIVE_TEST_TOKEN.chainId);
      expect(tx.swap.gasFeeEstimate.token.address).toEqual('native'); // Default configuration is a native token for gas and not an ERC20
      expect(tx.swap.gasFeeEstimate.token.decimals).toEqual(NATIVE_TEST_TOKEN.decimals);
      expect(tx.swap.gasFeeEstimate.token.symbol).toEqual(NATIVE_TEST_TOKEN.symbol);
      expect(tx.swap.gasFeeEstimate.token.name).toEqual(NATIVE_TEST_TOKEN.name);
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expect(quote).not.toBe(undefined);
      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.1);
      expect(formatAmount(quote.amount)).toEqual('1000.0');
      expect(quote.amountWithMaxSlippage.token.address).toEqual(params.outputToken);
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('999.000999000999000999'); // includes slippage
    });
  });

  describe('with a single pool without fees and high slippage tolerance', () => {
    it('generates valid calldata', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
        HIGHER_SLIPPAGE,
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(BigInt(10000)); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_ROUTER_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0'); // amount in
      expect(formatEther(swapParams.amountOutMinimum)).toBe('998.003992015968063872'); // min amount out (includes 0.2% slippage)
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
        HIGHER_SLIPPAGE,
      );

      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.2);
      expect(formatAmount(quote.amount)).toEqual('1000.0');
      expect(quote.amountWithMaxSlippage.token.address).toEqual(params.outputToken);
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('998.003992015968063872'); // includes 0.2% slippage
    });
  });

  describe('with a single pool and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest();
      const findOptimalRouteMock = mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];
      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap, quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
        3, // 3% Slippage
      );

      expectToBeDefined(swap.transaction.data);

      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('961.165048543689320388'); // userQuoteRes.amountOutMinimum = swapReq.amountOutMinimum

      const ourQuoteReqAmountIn = findOptimalRouteMock.mock.calls[0][0];
      expect(formatAmount(ourQuoteReqAmountIn)).toEqual('99.0'); // ourQuoteReq.amountIn = the amount specified less the fee

      const data = swap.transaction.data.toString();

      const { swapParams, secondaryFeeParams } = decodeMulticallExactInputSingleWithFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].basisPoints.toString()).toBe('100');

      expect(swapParams.tokenIn).toBe(params.inputToken);
      expect(swapParams.tokenOut).toBe(params.outputToken);
      expect(swapParams.fee).toBe(BigInt(10000));
      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0'); // swap.amountIn = userQuoteReq.amountIn
      expect(formatEther(swapParams.amountOutMinimum)).toBe('961.165048543689320388'); // swap.amountOutMinimum = ourQuoteRes.amountOut - slippage
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');

      expect(swap.transaction.to).toBe(TEST_SWAP_PROXY_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00');
      expect(
        swap.gasFeeEstimate?.value.toString(),
      ).toBe(((TEST_TRANSACTION_GAS_USAGE + BigInt(AVERAGE_SECONDARY_FEE_EXTRA_GAS)) * TEST_GAS_PRICE).toString());
    });
  });

  describe('with a single pool and secondary fees and a native token in', () => {
    it('should include the user-specified amount as the value of the transaction', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];
      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        FUN_TEST_TOKEN.address,
        newAmountFromString('100', FUN_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);
      expectToBeDefined(swap.transaction.value);
      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(swapParams.tokenIn).toBe(WIMX_TEST_TOKEN.address); // should be the wrapped native token
      expect(swapParams.tokenOut).toBe(FUN_TEST_TOKEN.address);
      expect(swap.transaction.value).toBe('0x056bc75e2d63100000'); // should be a hex
      expect(formatTokenAmount(swapParams.amountIn, WIMX_TEST_TOKEN)).toBe('100.0'); // amount in
    });
  });

  describe('with a single pool and a native token in', () => {
    it('should include the user-specified amount as the value of the transaction', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        FUN_TEST_TOKEN.address,
        newAmountFromString('100', FUN_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);
      expectToBeDefined(swap.transaction.value);
      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(swapParams.tokenIn).toBe(WIMX_TEST_TOKEN.address); // should be the wrapped native token
      expect(swapParams.tokenOut).toBe(FUN_TEST_TOKEN.address);
      expect(swap.transaction.value).toBe('0x056bc75e2d63100000'); // should be a hex
      expect(formatTokenAmount(swapParams.amountIn, WIMX_TEST_TOKEN)).toBe('100.0'); // amount in
    });

    it('uses the wrapped token pool to get the quote', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const result = await new Exchange(TEST_DEX_CONFIGURATION).getUnsignedSwapTxFromAmountIn(
        makeAddr('fromAddress'),
        'native',
        FUN_TEST_TOKEN.address,
        BigInt(1),
      );

      expect(result.quote.amount.token.address).toEqual(FUN_TEST_TOKEN.address);
    });

    it('does not require approval', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const result = await new Exchange(TEST_DEX_CONFIGURATION).getUnsignedSwapTxFromAmountIn(
        makeAddr('fromAddress'),
        'native',
        FUN_TEST_TOKEN.address,
        BigInt(1),
      );

      expect(result.approval).toBeNull();
    });

    it('should include a call to refundETH as the final step of the multicall calldata', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const swapRouterInterface = new Interface(swapRouterContract.abi);
      const paymentsInterface = new Interface(PaymentsExtendedAbi);
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      // Sell 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
      // Route is WIMX > FUN
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        'native',
        FUN_TEST_TOKEN.address,
        newAmountFromString('100', nativeTokenService.nativeToken).value,
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

  describe('with a single pool and a native token out', () => {
    it('should not include any amount as the value of the transaction', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        FUN_TEST_TOKEN.address,
        'native',
        newAmountFromString('100', FUN_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);
      expectToBeDefined(swap.transaction.value);
      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);
      expect(typeof swapParams.amountIn).toBe('bigint');

      expect(swapParams.tokenIn).toBe(FUN_TEST_TOKEN.address); // should be the token-in
      expect(swapParams.tokenOut).toBe(WIMX_TEST_TOKEN.address); // should be the wrapped native token
      expect(swap.transaction.value).toBe('0x00'); // should not have a value
      expect(formatTokenAmount(swapParams.amountIn, WIMX_TEST_TOKEN)).toBe('100.0'); // amount in
    });

    it('should unwrap the quoted amount', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const result = await new Exchange(TEST_DEX_CONFIGURATION).getUnsignedSwapTxFromAmountIn(
        makeAddr('fromAddress'),
        FUN_TEST_TOKEN.address,
        'native',
        BigInt(1),
      );

      expect(result.quote.amount.token.address).toEqual('native');
      expect(result.quote.amount.token.chainId).toEqual(nativeTokenService.nativeToken.chainId);
      expect(result.quote.amount.token.decimals).toEqual(nativeTokenService.nativeToken.decimals);
    });

    it('should include a call to unwrapWETH9 as the final method call of the calldata', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const swapRouterInterface = new Interface(swapRouterContract.abi);
      const paymentsInterface = new Interface(PaymentsExtendedAbi);
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        FUN_TEST_TOKEN.address,
        'native',
        newAmountFromString('100', NATIVE_TEST_TOKEN).value,
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

      expect(swapFunctionFragment?.name).toEqual('exactInputSingle');
      expect(unwrapFunctionFragment?.name).toEqual('unwrapWETH9');
    });

    it('should specify the quoted amount with slippage applied in the unwrapWETH9 function calldata', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const swapRouterInterface = new Interface(swapRouterContract.abi);
      const paymentsInterface = new Interface(PaymentsExtendedAbi);
      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
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

      expect(formatEther(decodedUnwrapWETH9FunctionData.toString())).toEqual('909.090909090909090909'); // expect the quoted amount with slippage applied i.e. minimum amount out
    });

    it('should specify the Router contract as the recipient of the swap function call', async () => {
      mockRouterImplementation({
        pools: [createPool(nativeTokenService.wrappedToken, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        TEST_FROM_ADDRESS,
        FUN_TEST_TOKEN.address,
        'native',
        newAmountFromString('100', NATIVE_TEST_TOKEN).value,
        3, // 3 % slippage
      );

      expectToBeDefined(swap.transaction.data);
      expectToBeDefined(swap.transaction.value);

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(swap.transaction.data);

      expect(swapParams.recipient).toEqual(TEST_ROUTER_ADDRESS);
    });
  });

  describe('with multiple pools', () => {
    describe('with a native token in', () => {
      it('should include a call to refundETH as the final step of the multicall calldata', async () => {
        mockRouterImplementation({
          pools: [
            createPool(nativeTokenService.wrappedToken, USDC_TEST_TOKEN),
            createPool(USDC_TEST_TOKEN, FUN_TEST_TOKEN),
          ],
        });

        const swapRouterInterface = new Interface(swapRouterContract.abi);
        const paymentsInterface = new Interface(PaymentsExtendedAbi);
        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Sell 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
        // Route is WIMX > USDC > FUN
        const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
          TEST_FROM_ADDRESS,
          'native',
          FUN_TEST_TOKEN.address,
          newAmountFromString('100', nativeTokenService.nativeToken).value,
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

    describe('with a native token out', () => {
      it('should specify the Router contract as the recipient of the swap function call', async () => {
        mockRouterImplementation({
          pools: [
            createPool(USDC_TEST_TOKEN, FUN_TEST_TOKEN),
            createPool(nativeTokenService.wrappedToken, USDC_TEST_TOKEN),
          ],
        });

        const exchange = new Exchange(TEST_DEX_CONFIGURATION);

        // Buy 100 native tokens for X amount of FUN where the exchange rate is 1 token-in : 10 token-out
        // Route is FUN > USDC > WIMX
        const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
          TEST_FROM_ADDRESS,
          FUN_TEST_TOKEN.address,
          'native',
          newAmountFromString('100', NATIVE_TEST_TOKEN).value,
          3, // 3 % slippage
        );

        expectToBeDefined(swap.transaction.data);
        expectToBeDefined(swap.transaction.value);

        const { swapParams } = decodeMulticallExactInputWithoutFees(swap.transaction.data);

        expect(swapParams.recipient).toEqual(TEST_ROUTER_ADDRESS);
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

        const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
        );

        expectToBeDefined(swap.transaction.data);

        const data = swap.transaction.data.toString();

        const { swapParams, secondaryFeeParams } = decodeMulticallExactInputWithFees(data);
        expect(typeof swapParams.amountIn).toBe('bigint');

        expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
        expect(secondaryFeeParams[0].basisPoints.toString()).toBe(TEST_MAX_FEE_BASIS_POINTS.toString());

        const decodedPath = decodePathForExactInput(swapParams.path.toString());

        expect(swap.transaction.to).toBe(TEST_SWAP_PROXY_ADDRESS); // to address
        expect(swap.transaction.from).toBe(params.fromAddress); // from address
        expect(swap.transaction.value).toBe('0x00'); // refers to 0 amount of the native token

        expect(getAddress(decodedPath.inputToken)).toBe(params.inputToken);
        expect(getAddress(decodedPath.intermediaryToken)).toBe(params.intermediaryToken);
        expect(getAddress(decodedPath.outputToken)).toBe(params.outputToken);
        expect(decodedPath.firstPoolFee.toString()).toBe('10000');
        expect(decodedPath.secondPoolFee.toString()).toBe('10000');

        expect(swapParams.recipient).toBe(params.fromAddress); // recipient of swap
        expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0');
        expect(formatEther(swapParams.amountOutMinimum)).toBe('899.100899100899100899'); // includes slippage and fees
      });

      it('returns a quote', async () => {
        const params = setupSwapTxTest({ multiPoolSwap: true });
        mockRouterImplementation(params);

        const secondaryFees: SecondaryFee[] = [
          { recipient: TEST_FEE_RECIPIENT, basisPoints: TEST_MAX_FEE_BASIS_POINTS },
        ];

        const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

        const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
        );

        const tokenIn = { ...USDC_TEST_TOKEN, name: undefined, symbol: undefined };

        expect(quote.fees).toEqual([
          {
            recipient: TEST_FEE_RECIPIENT,
            basisPoints: TEST_MAX_FEE_BASIS_POINTS,
            amount: newAmountFromString('10', tokenIn),
          },
        ]);
      });
    });
  });

  describe('Swap with secondary fees and paused secondary fee contract', () => {
    it('should use the default router contract with no fees applied to the swap', async () => {
      erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT.value),
        estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
        paused: jest.fn().mockResolvedValue(true),
      }));

      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
      ];
      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap, quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        newAmountFromString('100', USDC_TEST_TOKEN).value,
      );

      expectToBeDefined(swap.transaction.data);

      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('999.000999000999000999'); // min amount out (includes slippage)
      expect(quote.fees.length).toBe(0); // expect no fees to be applied

      const data = swap.transaction.data.toString();
      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);

      expect(formatEther(swapParams.amountOutMinimum)).toBe(formatEther(quote.amountWithMaxSlippage.value));
      expect(swap.transaction.to).toBe(TEST_ROUTER_ADDRESS); // expect the default router contract to be used
    });

    describe('when the secondary fee contract is unpaused after a swap request', () => {
      it('should apply secondary fees to a subsequent swap request', async () => {
        erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
          allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT.value),
          estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
          paused: jest.fn().mockResolvedValue(true),
        }));

        const params = setupSwapTxTest();
        mockRouterImplementation(params);

        const secondaryFees: SecondaryFee[] = [
          { recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }, // 1% Fee
        ];
        const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

        await exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          3, // 3% Slippage
        );

        // Unpause the secondary fee contract
        erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
          allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT.value),
          estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
          paused: jest.fn().mockResolvedValue(false),
        }));

        const { swap, quote } = await exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          3, // 3% Slippage
        );

        expectToBeDefined(swap.transaction.data);

        expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('961.165048543689320388'); // min amount out (includes slippage)
        expect(quote.fees.length).toBe(1); // expect no fees to be applied

        const data = swap.transaction.data.toString();
        const { swapParams } = decodeMulticallExactInputSingleWithFees(data);

        expect(formatEther(swapParams.amountOutMinimum)).toBe(formatEther(quote.amountWithMaxSlippage.value));
        expect(swap.transaction.to).toBe(TEST_SWAP_PROXY_ADDRESS); // expect the secondary fee contract to be used
      });
    });
  });

  describe('When the swap transaction requires approval', () => {
    it('should include the unsigned approval transaction', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);
      const erc20ContractInterface = ERC20__factory.createInterface();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const amountIn = addAmount(APPROVED_AMOUNT, newAmountFromString('1', USDC_TEST_TOKEN));
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        amountIn.value,
      );

      expectToBeDefined(tx.approval?.transaction.data);

      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', tx.approval.transaction.data);
      expect(decodedResults[0]).toEqual(TEST_ROUTER_ADDRESS);
      // we have already approved 1000000000000000000 but this is not enough, so we expect to approve the full amount
      expect(decodedResults[1].toString()).toEqual(amountIn.value.toString());
      expect(tx.approval.transaction.to).toEqual(params.inputToken);
      expect(tx.approval.transaction.from).toEqual(params.fromAddress);
      expect(tx.approval.transaction.value).toEqual(0); // we do not want to send any ETH
    });

    it('should include the gas estimate for the approval transaction', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const amountIn = addAmount(APPROVED_AMOUNT, newAmountFromString('1', USDC_TEST_TOKEN));
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        amountIn.value,
      );

      expectToBeDefined(tx.approval?.gasFeeEstimate);
      expect(tx.approval.gasFeeEstimate.value).toEqual(TEST_GAS_PRICE * APPROVE_GAS_ESTIMATE);
      expect(tx.approval.gasFeeEstimate.token.chainId).toEqual(NATIVE_TEST_TOKEN.chainId);
      expect(tx.approval.gasFeeEstimate.token.address).toEqual('native');
      expect(tx.approval.gasFeeEstimate.token.decimals).toEqual(NATIVE_TEST_TOKEN.decimals);
      expect(tx.approval.gasFeeEstimate.token.symbol).toEqual(NATIVE_TEST_TOKEN.symbol);
      expect(tx.approval.gasFeeEstimate.token.name).toEqual(NATIVE_TEST_TOKEN.name);
    });
  });

  describe('When the swap transaction does not require approval', () => {
    it('should not include the unsigned approval transaction', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      // Set the amountIn to be the same as the APPROVED_AMOUNT
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        APPROVED_AMOUNT.value,
      );

      // we have already approved 1000000000000000000, so we don't expect to approve anything
      expect(tx.approval).toBe(null);
    });
  });

  describe('When no route found', () => {
    it('throws NoRoutesAvailableError', async () => {
      const params = setupSwapTxTest();

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: jest.fn().mockRejectedValue(new NoRoutesAvailableError()),
      }));

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);
      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
        ),
      ).rejects.toThrow(new NoRoutesAvailableError());
    });
  });

  describe('Pass in zero address', () => {
    it('throws InvalidAddressError', async () => {
      const params = setupSwapTxTest();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const invalidAddress = ZeroAddress;

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid from address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token out address'));
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddressError', async () => {
      const params = setupSwapTxTest();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid from address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token out address'));
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws InvalidMaxHopsError', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
          11,
        ),
      ).rejects.toThrow(new InvalidMaxHopsError('Error: max hops must be less than or equal to 10'));
    });
  });

  describe('Pass in maxHops < 1', () => {
    it('throws InvalidMaxHopsError', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          HIGHER_SLIPPAGE,
          0,
        ),
      ).rejects.toThrow(new InvalidMaxHopsError('Error: max hops must be greater than or equal to 1'));
    });
  });

  describe('With slippage greater than 50', () => {
    it('throws InvalidSlippageError', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          100,
          2,
        ),
      ).rejects.toThrow(new InvalidSlippageError('Error: slippage percent must be less than or equal to 50'));
    });
  });

  describe('With slippage less than 0', () => {
    it('throws InvalidSlippageError', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          newAmountFromString('100', USDC_TEST_TOKEN).value,
          -5,
          2,
        ),
      ).rejects.toThrow(new InvalidSlippageError('Error: slippage percent must be greater than or equal to 0'));
    });
  });
});
