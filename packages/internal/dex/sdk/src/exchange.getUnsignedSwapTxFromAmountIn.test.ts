import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import {
  InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError, NoRoutesAvailableError,
} from 'errors';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { ethers } from 'ethers';
import { Exchange } from './exchange';
import {
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_PERIPHERY_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_GAS_PRICE,
  IMX_TEST_TOKEN,
  TEST_TRANSACTION_GAS_USAGE,
  TEST_FEE_RECIPIENT,
  TEST_MAX_FEE_BASIS_POINTS,
  TEST_SECONDARY_FEE_ADDRESS,
  decodePathForExactInput,
  decodeMulticallExactInputSingleWithFees,
  decodeMulticallExactInputWithFees,
  decodeMulticallExactInputSingleWithoutFees,
  expectToBeDefined,
} from './test/utils';
import { Router, SecondaryFee } from './lib';

jest.mock('@ethersproject/providers');
jest.mock('@ethersproject/contracts');
jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  getERC20Decimals: async () => 18,
}));

const HIGHER_SLIPPAGE = 0.2;
const APPROVED_AMOUNT = BigNumber.from('1000000000000000000');
const APPROVE_GAS_ESTIMATE = BigNumber.from('100000');

describe('getUnsignedSwapTxFromAmountIn', () => {
  let erc20Contract: jest.Mock<any, any, any>;

  beforeAll(() => {
    erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT),
        estimateGas: { approve: jest.fn().mockResolvedValue(APPROVE_GAS_ESTIMATE) },
      }),
    );

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
      () => ({
        getFeeData: async () => ({
          maxFeePerGas: null,
          gasPrice: TEST_GAS_PRICE,
        }),
        connect: jest.fn().mockResolvedValue(erc20Contract),
      }),
    ) as unknown as JsonRpcProvider;
  });

  describe('When the swap transaction requires approval', () => {
    it('should include the unsigned approval transaction', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);
      const erc20ContractInterface = ERC20__factory.createInterface();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const amountIn = APPROVED_AMOUNT.add(BigNumber.from('1000000000000000000'));
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        amountIn,
      );

      expectToBeDefined(tx.approval?.transaction.data);

      const decodedResults = erc20ContractInterface
        .decodeFunctionData('approve', tx.approval.transaction.data);
      expect(decodedResults[0]).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
      // we have already approved 1000000000000000000, so we expect to approve 1000000000000000000 more
      expect(decodedResults[1].toString()).toEqual(APPROVED_AMOUNT.toString());
      expect(tx.approval.transaction.to).toEqual(params.inputToken);
      expect(tx.approval.transaction.from).toEqual(params.fromAddress);
      expect(tx.approval.transaction.value).toEqual(0); // we do not want to send any ETH
    });

    it('should include the gas estimate for the approval transaction', async () => {
      const params = setupSwapTxTest();
      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const amountIn = APPROVED_AMOUNT.add(BigNumber.from('1000000000000000000'));
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        amountIn,
      );

      expectToBeDefined(tx.approval?.gasFeeEstimate);
      expect(tx.approval.gasFeeEstimate.value).toEqual(TEST_GAS_PRICE.mul(APPROVE_GAS_ESTIMATE));
      expect(tx.approval.gasFeeEstimate.token.chainId).toEqual(IMX_TEST_TOKEN.chainId);
      expect(tx.approval.gasFeeEstimate.token.address).toEqual(IMX_TEST_TOKEN.address);
      expect(tx.approval.gasFeeEstimate.token.decimals).toEqual(IMX_TEST_TOKEN.decimals);
      expect(tx.approval.gasFeeEstimate.token.symbol).toEqual(IMX_TEST_TOKEN.symbol);
      expect(tx.approval.gasFeeEstimate.token.name).toEqual(IMX_TEST_TOKEN.name);
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
        APPROVED_AMOUNT,
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
      await expect(exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        ethers.utils.parseEther('100'),
      )).rejects.toThrow(new NoRoutesAvailableError());
    });
  });

  describe('Swap with single pool and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest();
      const findOptimalRouteMock = mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: 100 }, // 1% Fee
      ];
      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap, quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        ethers.utils.parseEther('100'),
        3, // 3% Slippage
      );

      expectToBeDefined(swap.transaction.data);

      expect(quote.amountWithMaxSlippage.value.toString()).toEqual('961165048543689320388'); // userQuoteRes.amountOutMinimum = swapReq.amountOutMinimum

      const ourQuoteReqAmountIn = findOptimalRouteMock.mock.calls[0][0];
      expect(ourQuoteReqAmountIn.toExact()).toEqual('99'); // ourQuoteReq.amountIn = the amount specified less the fee

      const data = swap.transaction.data.toString();

      const { swapParams, secondaryFeeParams } = decodeMulticallExactInputSingleWithFees(data);

      expect(secondaryFeeParams[0].feeRecipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].feeBasisPoints).toBe(100);

      expect(swapParams.tokenIn).toBe(params.inputToken);
      expect(swapParams.tokenOut).toBe(params.outputToken);
      expect(swapParams.fee).toBe(10000);
      expect(swapParams.recipient).toBe(params.fromAddress);
      expect(swapParams.amountIn.toString()).toBe('100000000000000000000'); // 100: swap.amountIn = userQuoteReq.amountIn
      expect(swapParams.amountOutMinimum.toString()).toBe('961165048543689320388'); // 961.2: swap.amountOutMinimum = ourQuoteRes.amountOut - slippage
      expect(swapParams.sqrtPriceLimitX96.toString()).toBe('0');

      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS);
      expect(swap.transaction.from).toBe(params.fromAddress);
      expect(swap.transaction.value).toBe('0x00');
    });
  });

  describe('Swap with multiple pools and secondary fees', () => {
    it('generates valid swap calldata', async () => {
      const params = setupSwapTxTest(true);
      mockRouterImplementation(params);

      const secondaryFees: SecondaryFee[] = [
        { feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: TEST_MAX_FEE_BASIS_POINTS },
      ];

      const exchange = new Exchange({ ...TEST_DEX_CONFIGURATION, secondaryFees });

      const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        ethers.utils.parseEther('100'),
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams, secondaryFeeParams } = decodeMulticallExactInputWithFees(data);

      expect(secondaryFeeParams[0].feeRecipient).toBe(TEST_FEE_RECIPIENT);
      expect(secondaryFeeParams[0].feeBasisPoints).toBe(TEST_MAX_FEE_BASIS_POINTS);

      const decodedPath = decodePathForExactInput(swapParams.path.toString());

      expect(swap.transaction.to).toBe(TEST_SECONDARY_FEE_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0 amount of the native token

      expect(ethers.utils.getAddress(decodedPath.inputToken)).toBe(params.inputToken);
      expect(ethers.utils.getAddress(decodedPath.intermediaryToken)).toBe(params.intermediaryToken);
      expect(ethers.utils.getAddress(decodedPath.outputToken)).toBe(params.outputToken);
      expect(decodedPath.firstPoolFee.toString()).toBe('10000');
      expect(decodedPath.secondPoolFee.toString()).toBe('10000');

      expect(swapParams.recipient).toBe(params.fromAddress); // recipient of swap
      expect(swapParams.amountIn.toString()).toBe('100000000000000000000'); // 100
      expect(swapParams.amountOutMinimum.toString()).toBe('899100899100899100899'); // 899 includes slippage and fees
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
        ethers.utils.parseEther('100'),
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(swapParams.amountIn.toString()).toBe('100000000000000000000'); // amount in (100)
      expect(swapParams.amountOutMinimum.toString()).toBe('999000999000999000999'); // min amount out (999 includes slippage)
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
        ethers.utils.parseEther('100'),
      );

      expectToBeDefined(tx.swap.gasFeeEstimate);

      expect(tx.swap.gasFeeEstimate.value).toEqual(TEST_TRANSACTION_GAS_USAGE.mul(TEST_GAS_PRICE));
      expect(tx.swap.gasFeeEstimate.token.chainId).toEqual(IMX_TEST_TOKEN.chainId);
      expect(tx.swap.gasFeeEstimate.token.address).toEqual(IMX_TEST_TOKEN.address);
      expect(tx.swap.gasFeeEstimate.token.decimals).toEqual(IMX_TEST_TOKEN.decimals);
      expect(tx.swap.gasFeeEstimate.token.symbol).toEqual(IMX_TEST_TOKEN.symbol);
      expect(tx.swap.gasFeeEstimate.token.name).toEqual(IMX_TEST_TOKEN.name);
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest();

      mockRouterImplementation(params);

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const { quote } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        ethers.utils.parseEther('100'),
      );

      expect(quote).not.toBe(undefined);
      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.1);
      expect(quote.amount.value.toString()).toEqual('1000000000000000000000'); // 1,000
      expect(quote.amountWithMaxSlippage.token.address).toEqual(
        params.outputToken,
      );
      expect(quote.amountWithMaxSlippage.value.toString()).toEqual(
        '999000999000999000999', // 999 includes slippage
      );
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
        ethers.utils.parseEther('100'),
        HIGHER_SLIPPAGE,
      );

      expectToBeDefined(swap.transaction.data);

      const data = swap.transaction.data.toString();

      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(data);

      expect(swapParams.tokenIn).toBe(params.inputToken); // input token
      expect(swapParams.tokenOut).toBe(params.outputToken); // output token
      expect(swapParams.fee).toBe(10000); // fee
      expect(swapParams.recipient).toBe(params.fromAddress); // recipient
      expect(swap.transaction.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(swap.transaction.from).toBe(params.fromAddress); // from address
      expect(swap.transaction.value).toBe('0x00'); // refers to 0ETH
      expect(swapParams.amountIn.toString()).toBe('100000000000000000000'); // amount in (100)
      expect(swapParams.amountOutMinimum.toString()).toBe('998003992015968063872'); // min amount out (998 includes 0.2% slippage)
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
        ethers.utils.parseEther('100'),
        HIGHER_SLIPPAGE,
      );

      expect(quote).not.toBe(undefined);
      expect(quote.amount.token.address).toEqual(params.outputToken);
      expect(quote.slippage).toBe(0.2);
      expect(quote.amount.value.toString()).toEqual('1000000000000000000000'); // 1000
      expect(quote.amountWithMaxSlippage.token.address).toEqual(
        params.outputToken,
      );
      expect(quote.amountWithMaxSlippage.value.toString()).toEqual(
        '998003992015968063872', // 998 includes 0.2% slippage
      );
    });
  });

  describe('Pass in zero address', () => {
    it('throws InvalidAddressError', async () => {
      const params = setupSwapTxTest();

      const exchange = new Exchange(TEST_DEX_CONFIGURATION);

      const invalidAddress = ethers.constants.AddressZero;

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          ethers.utils.parseEther('100'),
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(
        new InvalidAddressError('Error: invalid from address'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          ethers.utils.parseEther('100'),
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          ethers.utils.parseEther('100'),
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
          ethers.utils.parseEther('100'),
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(
        new InvalidAddressError('Error: invalid from address'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          ethers.utils.parseEther('100'),
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          ethers.utils.parseEther('100'),
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
          ethers.utils.parseEther('100'),
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
          ethers.utils.parseEther('100'),
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
          ethers.utils.parseEther('100'),
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
          ethers.utils.parseEther('100'),
          -5,
          2,
        ),
      ).rejects.toThrow(new InvalidSlippageError('Error: slippage percent must be greater than or equal to 0'));
    });
  });
});
