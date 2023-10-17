import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import {
  InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError, NoRoutesAvailableError,
} from 'errors';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { constants, utils } from 'ethers';
import { Exchange } from './exchange';
import {
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_PERIPHERY_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_GAS_PRICE,
  TEST_TRANSACTION_GAS_USAGE,
  TEST_FEE_RECIPIENT,
  TEST_MAX_FEE_BASIS_POINTS,
  TEST_SECONDARY_FEE_ADDRESS,
  decodePathForExactInput,
  decodeMulticallExactInputSingleWithFees,
  decodeMulticallExactInputWithFees,
  decodeMulticallExactInputSingleWithoutFees,
  expectToBeDefined,
  formatAmount,
  formatEther,
  USDC_TEST_TOKEN,
  expectInstanceOf,
  newAmountFromString,
  formatTokenAmount,
  NATIVE_TEST_TOKEN,
  expectERC20,
  expectNative,
  createPool,
  WIMX_TEST_TOKEN,
  makeAddr,
  FUN_TEST_TOKEN,
} from './test/utils';
import { addAmount, Router, SecondaryFee } from './lib';

jest.mock('@ethersproject/providers');
jest.mock('@ethersproject/contracts');
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
const APPROVE_GAS_ESTIMATE = BigNumber.from('100000');

describe('getUnsignedSwapTxFromAmountIn', () => {
  let erc20Contract: jest.Mock<any, any, any>;

  beforeAll(() => {
    erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
      allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT.value),
      estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
      paused: jest.fn().mockResolvedValue(false),
    }));

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
      getFeeData: async () => ({
        maxFeePerGas: null,
        gasPrice: TEST_GAS_PRICE,
      }),
      connect: jest.fn().mockResolvedValue(erc20Contract),
    })) as unknown as JsonRpcProvider;
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
      expect(decodedResults[0]).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
      // we have already approved 1000000000000000000, so we expect to approve 1000000000000000000 more
      expect(decodedResults[1].toString()).toEqual(APPROVED_AMOUNT.value.toString());
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
      expect(tx.approval.gasFeeEstimate.value).toEqual(TEST_GAS_PRICE.mul(APPROVE_GAS_ESTIMATE));
      expect(tx.approval.gasFeeEstimate.token.chainId).toEqual(NATIVE_TEST_TOKEN.chainId);
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

  describe('Swap with single pool and secondary fees', () => {
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
      expectInstanceOf(BigNumber, swapParams.amountIn);

      expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].basisPoints.toString()).toBe('100');

      expect(swapParams.tokenIn).toBe(params.inputToken);
      expect(swapParams.tokenOut).toBe(params.outputToken);
      expect(swapParams.fee).toBe(10000);
      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0'); // swap.amountIn = userQuoteReq.amountIn
      expect(formatEther(swapParams.amountOutMinimum)).toBe('961.165048543689320388'); // swap.amountOutMinimum = ourQuoteRes.amountOut - slippage
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');

      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00');
    });
  });

  describe('Swap with multiple pools and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest({ multiPoolSwap: true });
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [{ recipient: TEST_FEE_RECIPIENT, basisPoints: TEST_MAX_FEE_BASIS_POINTS }];

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
      expectInstanceOf(BigNumber, swapParams.amountIn);

      expect(secondaryFeeParams[0].recipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].basisPoints.toString()).toBe(TEST_MAX_FEE_BASIS_POINTS.toString());

      const decodedPath = decodePathForExactInput(swapParams.path.toString());

      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0 amount of the native token

      expect(utils.getAddress(decodedPath.inputToken)).toBe(params.inputToken);
      expect(utils.getAddress(decodedPath.intermediaryToken)).toBe(params.intermediaryToken);
      expect(utils.getAddress(decodedPath.outputToken)).toBe(params.outputToken);
      expect(decodedPath.firstPoolFee.toString()).toBe('10000');
      expect(decodedPath.secondPoolFee.toString()).toBe('10000');

      expect(swapParams.recipient).toBe(params.fromAddress); // recipient of swap
      expect(formatTokenAmount(swapParams.amountIn, USDC_TEST_TOKEN)).toBe('100.0');
      expect(formatEther(swapParams.amountOutMinimum)).toBe('899.100899100899100899'); // includes slippage and fees
    });

    it('returns a quote', async () => {
      const params = setupSwapTxTest({ multiPoolSwap: true });
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [{ recipient: TEST_FEE_RECIPIENT, basisPoints: TEST_MAX_FEE_BASIS_POINTS }];

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
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // expect the default router contract to be used
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
        expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS); // expect the secondary fee contract to be used
      });
    });
  });

  describe('Swap with single pool without fees and default slippage tolerance', () => {
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
      expectInstanceOf(BigNumber, swapParams.amountIn);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
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

      expect(tx.swap.gasFeeEstimate.value).toEqual(TEST_TRANSACTION_GAS_USAGE.mul(TEST_GAS_PRICE));
      expect(tx.swap.gasFeeEstimate.token.chainId).toEqual(NATIVE_TEST_TOKEN.chainId);
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
      expectERC20(quote.amount.token);
      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.1);
      expect(formatAmount(quote.amount)).toEqual('1000.0');
      expectERC20(quote.amountWithMaxSlippage.token);
      expect(quote.amountWithMaxSlippage.token.address).toEqual(params.outputToken);
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('999.000999000999000999'); // includes slippage
    });
  });

  describe('Swap with single pool without fees and high slippage tolerance', () => {
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
      expectInstanceOf(BigNumber, swapParams.amountIn);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
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

      expectERC20(quote.amount.token);
      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.2);
      expect(formatAmount(quote.amount)).toEqual('1000.0');
      expectERC20(quote.amountWithMaxSlippage.token);
      expect(quote.amountWithMaxSlippage.token.address).toEqual(params.outputToken);
      expect(formatAmount(quote.amountWithMaxSlippage)).toEqual('998.003992015968063872'); // includes 0.2% slippage
    });
  });

  describe('With an Exact Input, and native Token In', () => {
    it('uses the wrapped native pool to quote', async () => {
      mockRouterImplementation({
        pools: [createPool(WIMX_TEST_TOKEN, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        makeAddr('sicko'),
        'native',
        FUN_TEST_TOKEN.address,
        utils.parseEther('1'), // 1 native IMX
      );

      expectERC20(quote.amount.token, FUN_TEST_TOKEN.address);
      expectERC20(quote.amountWithMaxSlippage.token, FUN_TEST_TOKEN.address);
      expect(formatAmount(quote.amount)).toEqual('10.0');
    });

    it('calculates fees in the native token', async () => {
      mockRouterImplementation({
        pools: [createPool(WIMX_TEST_TOKEN, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange({
        ...TEST_DEX_CONFIGURATION,
        secondaryFees: [{ recipient: TEST_FEE_RECIPIENT, basisPoints: 100 }],
      });

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        makeAddr('sicko'),
        'native',
        FUN_TEST_TOKEN.address,
        utils.parseEther('1'), // 1 native IMX
      );

      expectNative(quote.fees[0].amount.token);
    });
  });

  describe('With an Exact Input, and native Token Out', () => {
    it('returns a quote amount in the native token', async () => {
      mockRouterImplementation({
        pools: [createPool(WIMX_TEST_TOKEN, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        makeAddr('sicko'),
        FUN_TEST_TOKEN.address,
        'native',
        utils.parseEther('1'), // 1 FUN
      );

      expectNative(quote.amount.token);
      expectNative(quote.amountWithMaxSlippage.token);
      expect(formatAmount(quote.amount)).toEqual('10.0');
    });
  });

  describe('With an Exact Input, and wrapped native Token Out', () => {
    it('returns a quote amount in the wrapped native token', async () => {
      mockRouterImplementation({
        pools: [createPool(WIMX_TEST_TOKEN, FUN_TEST_TOKEN)],
      });

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        makeAddr('sicko'),
        FUN_TEST_TOKEN.address,
        WIMX_TEST_TOKEN.address,
        utils.parseEther('1'), // 1 FUN
      );

      expectERC20(quote.amount.token);
      expectERC20(quote.amountWithMaxSlippage.token);
      expect(formatAmount(quote.amount)).toEqual('10.0');
    });
  });

  describe('Pass in zero address', () => {
    it('throws InvalidAddressError', async () => {
      const params = setupSwapTxTest();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const invalidAddress = constants.AddressZero;

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
