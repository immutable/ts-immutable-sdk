import { BigNumber, ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { DuplicateAddressesError, InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError } from './errors';
import { calculateGasFee, fetchGasPrice } from './lib/transactionUtils/gas';
import { getApproval, prepareApproval } from './lib/transactionUtils/approval';
import { getOurQuoteReqAmount, prepareUserQuote } from './lib/transactionUtils/getQuote';
import { Fees } from './lib/fees';
import { Multicall__factory, ImmutableSwapProxy__factory, WIMX__factory } from './contracts/types';
import { NativeTokenService } from './lib/nativeTokenService';
import { IMX_UNWRAP_GAS_COST, IMX_WRAP_GAS_COST } from './constants/wrapping';
import { DEFAULT_MAX_HOPS, DEFAULT_SLIPPAGE, MAX_MAX_HOPS, MIN_MAX_HOPS } from './constants';
import { Router } from './lib/router';
import {
  getDefaultDeadlineSeconds,
  getTokenDecimals,
  isValidNonZeroAddress,
  isValidTokenLiteral,
  newAmount,
  toPublicAmount,
} from './lib/utils';
import {
  Coin,
  CoinAmount,
  ERC20,
  ExchangeModuleConfiguration,
  Native,
  Quote,
  SecondaryFee,
  TransactionDetails,
  TransactionResponse,
} from './types';
import { getSwap, adjustQuoteWithFees } from './lib/transactionUtils/swap';
import { ExchangeConfiguration } from './config';

const toPublicQuote = (
  amount: CoinAmount<Coin>,
  amountWithMaxSlippage: CoinAmount<Coin>,
  slippage: number,
  fees: Fees,
): Quote => ({
  amount: toPublicAmount(amount),
  amountWithMaxSlippage: toPublicAmount(amountWithMaxSlippage),
  slippage,
  fees: fees.withAmounts().map((fee) => ({
    ...fee,
    amount: toPublicAmount(fee.amount),
  })),
});

/**
 * Type representing the details of a wrap or unwrap transaction
 * @property {@link TransactionDetails} transaction - The wrap or unwrap transaction
 * @property {@link TransactionDetails | null} approval - The approval transaction or null if it is not required
 */
type WrapUnwrapTransactionDetails = {
  transaction: TransactionDetails,
  approval: TransactionDetails | null,
};

export class Exchange {
  private provider: ethers.providers.StaticJsonRpcProvider;

  private batchProvider: ethers.providers.JsonRpcBatchProvider;

  private router: Router;

  private chainId: number;

  private nativeToken: Native;

  private wrappedNativeToken: ERC20;

  private secondaryFees: SecondaryFee[];

  private nativeTokenService: NativeTokenService;

  private swapProxyContractAddress: string;

  private routerContractAddress: string;

  constructor(configuration: ExchangeModuleConfiguration) {
    const config = new ExchangeConfiguration(configuration);

    this.chainId = config.chain.chainId;
    this.nativeToken = config.chain.nativeToken;
    this.wrappedNativeToken = config.chain.wrappedNativeToken;
    this.nativeTokenService = new NativeTokenService(this.nativeToken, this.wrappedNativeToken);
    this.secondaryFees = config.secondaryFees;
    this.routerContractAddress = config.chain.contracts.swapRouter;
    this.swapProxyContractAddress = config.chain.contracts.immutableSwapProxy;

    this.provider = new ethers.providers.StaticJsonRpcProvider({
      url: config.chain.rpcUrl,
      skipFetchSetup: true,
    }, config.chain.chainId);

    this.batchProvider = new ethers.providers.JsonRpcBatchProvider({
      url: config.chain.rpcUrl,
      skipFetchSetup: true,
    }, config.chain.chainId);

    const multicallContract = Multicall__factory.connect(config.chain.contracts.multicall, this.provider);

    this.router = new Router(
      this.batchProvider,
      multicallContract,
      config.chain.commonRoutingTokens,
      config.chain.contracts,
    );
  }

  private static validate(
    tokenInAddress: string,
    tokenOutAddress: string,
    maxHops: number,
    slippagePercent: number,
    fromAddress: string,
  ) {
    if (!isValidNonZeroAddress(fromAddress)) throw new InvalidAddressError('Error: invalid from address');
    if (!isValidTokenLiteral(tokenInAddress)) throw new InvalidAddressError('Error: invalid token in address');
    if (!isValidTokenLiteral(tokenOutAddress)) throw new InvalidAddressError('Error: invalid token out address');
    if (tokenInAddress.toLocaleLowerCase() === tokenOutAddress.toLocaleLowerCase()) throw new DuplicateAddressesError();
    if (maxHops > MAX_MAX_HOPS) throw new InvalidMaxHopsError('Error: max hops must be less than or equal to 10');
    if (maxHops < MIN_MAX_HOPS) throw new InvalidMaxHopsError('Error: max hops must be greater than or equal to 1');
    // eslint-disable-next-line max-len
    if (slippagePercent > 50) throw new InvalidSlippageError('Error: slippage percent must be less than or equal to 50');
    // eslint-disable-next-line max-len
    if (slippagePercent < 0) throw new InvalidSlippageError('Error: slippage percent must be greater than or equal to 0');
  }

  private async getSecondaryFees(provider: ethers.providers.JsonRpcBatchProvider) {
    if (this.secondaryFees.length === 0) {
      return [];
    }

    const swapProxyContract = ImmutableSwapProxy__factory.connect(this.swapProxyContractAddress, provider);

    if (await swapProxyContract.paused()) {
      // Do not use secondary fees if the contract is paused
      return [];
    }

    return this.secondaryFees;
  }

  private parseTokenLiteral(tokenLiteral: string, decimals: number): Coin {
    if (tokenLiteral === 'native') {
      return this.nativeToken;
    }

    return {
      type: 'erc20',
      address: tokenLiteral,
      chainId: this.chainId,
      decimals,
    };
  }

  private async getUnwrapTransaction(
    fromAddress: string,
    tokenAmount: BigNumber,
    wimxInterface: ethers.utils.Interface,
    gasPrice: CoinAmount<Native> | null,
  ): Promise<WrapUnwrapTransactionDetails> {
    const calldata = wimxInterface.encodeFunctionData('withdraw', [tokenAmount]);
    const gasEstimate = ethers.BigNumber.from(IMX_UNWRAP_GAS_COST);

    const gasFeeEstimate = gasPrice ? toPublicAmount(calculateGasFee(false, gasPrice, gasEstimate)) : null;
    // This transaction is for calling calling `withdraw` on the WETH/WIMX contract.
    const transactionDetails: TransactionDetails = {
      transaction: {
        data: calldata,
        to: this.wrappedNativeToken.address, // wrapping and unwrapping is done on the WETH/WIMX contract itself
        from: fromAddress,
      },
      gasFeeEstimate,
    };

    return {
      transaction: transactionDetails,
      approval: null,
    };
  }

  private getWrapTransaction(
    fromAddress: string,
    tokenAmount: BigNumber,
    wimxInterface: ethers.utils.Interface,
    gasPrice: CoinAmount<Native> | null,
  ): WrapUnwrapTransactionDetails {
    const calldata = wimxInterface.encodeFunctionData('deposit');
    const gasEstimate = ethers.BigNumber.from(IMX_WRAP_GAS_COST);

    const gasFeeEstimate = gasPrice ? toPublicAmount(calculateGasFee(false, gasPrice, gasEstimate)) : null;
    // This transaction is for calling calling `deposit` on the WETH/WIMX contract.
    const transactionDetails: TransactionDetails = {
      transaction: {
        data: calldata,
        to: this.wrappedNativeToken.address, // wrapping and unwrapping is done on the WETH/WIMX contract itself
        value: tokenAmount, // Wrapping involves sending the native asset as TX.value
        from: fromAddress,
      },
      gasFeeEstimate,
    };

    return {
      transaction: transactionDetails,
      approval: null,
    };
  }

  private async getUnsignedWrapUnwrapTx(
    tokenSpecified: Coin,
    amountIn: CoinAmount<Coin>,
    fromAddress: string,
    gasPrice: CoinAmount<Native> | null,
  ): Promise<TransactionResponse> {
    const isWrap = amountIn.token.type === 'native';
    const quoteToken = tokenSpecified.type === 'native' ? this.wrappedNativeToken : this.nativeToken;
    const otherTokenCoinAmount = {
      token: quoteToken,
      value: amountIn.value,
    };

    // The quote is always 1:1 (0 {price impact, slippage}) when wrapping/unwrapping.
    const quote: Quote = {
      amount: toPublicAmount(otherTokenCoinAmount),
      amountWithMaxSlippage: toPublicAmount(otherTokenCoinAmount),
      slippage: 0,
      fees: [],
    };

    const wimxInterface = WIMX__factory.createInterface();
    let transactionDetails;

    if (isWrap) {
      transactionDetails = this.getWrapTransaction(
        fromAddress,
        otherTokenCoinAmount.value,
        wimxInterface,
        gasPrice,
      );
    } else {
      transactionDetails = await this.getUnwrapTransaction(
        fromAddress,
        otherTokenCoinAmount.value,
        wimxInterface,
        gasPrice,
      );
    }

    return { quote, approval: transactionDetails.approval, swap: transactionDetails.transaction };
  }

  private async getUnsignedSwapTx(
    fromAddress: string,
    tokenInLiteral: string,
    tokenOutLiteral: string,
    amount: ethers.BigNumber,
    slippagePercent: number,
    maxHops: number,
    deadline: number,
    tradeType: TradeType,
  ): Promise<TransactionResponse> {
    Exchange.validate(tokenInLiteral, tokenOutLiteral, maxHops, slippagePercent, fromAddress);

    // get the decimals of the tokens that will be swapped
    const promises = [
      getTokenDecimals(tokenInLiteral, this.batchProvider, this.nativeToken),
      getTokenDecimals(tokenOutLiteral, this.batchProvider, this.nativeToken),
      this.getSecondaryFees(this.batchProvider),
      fetchGasPrice(this.batchProvider, this.nativeToken),
    ] as const;

    const [tokenInDecimals, tokenOutDecimals, secondaryFees, gasPrice] = await Promise.all(promises);

    const tokenIn = this.parseTokenLiteral(tokenInLiteral, tokenInDecimals);
    const tokenOut = this.parseTokenLiteral(tokenOutLiteral, tokenOutDecimals);

    // determine which amount was specified for the swap from the TradeType
    const [tokenSpecified, otherToken] =
      tradeType === TradeType.EXACT_INPUT ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

    const amountSpecified = newAmount(amount, tokenSpecified);

    if (this.nativeTokenService.isWrapOrUnwrap(tokenIn, tokenOut)) {
      // If the user is swapping between the native token and the wrapped native token,
      // we want to just wrap/unwrap the native token instead of swapping
      return this.getUnsignedWrapUnwrapTx(
        tokenSpecified,
        newAmount(amount, tokenIn),
        fromAddress,
        gasPrice,
      );
    }

    const fees = new Fees(secondaryFees, tokenIn);

    const ourQuoteReqAmount = getOurQuoteReqAmount(amountSpecified, fees, tradeType, this.nativeTokenService);

    // Quotes will always use ERC20s. If the user-specified token is Native, we use the Wrapped Native Token pool
    const ourQuote = await this.router.findOptimalRoute(
      ourQuoteReqAmount,
      this.nativeTokenService.maybeWrapToken(otherToken),
      tradeType,
      maxHops,
    );

    const adjustedQuote = adjustQuoteWithFees(ourQuote, amountSpecified, fees, this.nativeTokenService);

    const swap = getSwap(
      tokenIn,
      tokenOut,
      adjustedQuote,
      fromAddress,
      slippagePercent,
      deadline,
      this.routerContractAddress,
      this.swapProxyContractAddress,
      gasPrice,
      secondaryFees,
    );

    const { quotedAmount, quotedAmountWithMaxSlippage } = prepareUserQuote(
      this.nativeTokenService,
      adjustedQuote,
      slippagePercent,
      otherToken,
    );

    const preparedApproval = prepareApproval(
      tradeType,
      amountSpecified,
      quotedAmountWithMaxSlippage,
      {
        routerAddress: this.routerContractAddress,
        secondaryFeeAddress: this.swapProxyContractAddress,
      },
      secondaryFees,
    );

    // preparedApproval always uses the tokenIn address because we are always selling the tokenIn
    const approval = preparedApproval
      ? await getApproval(this.provider, fromAddress, preparedApproval, gasPrice)
      : null;

    const quote = toPublicQuote(quotedAmount, quotedAmountWithMaxSlippage, slippagePercent, fees);

    return { quote, approval, swap };
  }

  /**
   * Get the unsigned swap transaction given the amount to sell.
   * Includes quote details for the swap.
   *
   * @param {string} fromAddress The public address that will sign and submit the transaction
   * @param {string} tokenInAddress Token address or 'native' to sell
   * @param {string} tokenOutAddress Token address or 'native' to buy
   * @param {ethers.BigNumberish} amountIn Amount to sell in the smallest unit of the token-in
   * @param {number} slippagePercent (optional) The percentage of slippage tolerance. Default = 0.1. Max = 50. Min = 0
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes
   * @return {TransactionResponse} The result containing the unsigned transaction and details of the swap
   */
  public async getUnsignedSwapTxFromAmountIn(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: ethers.BigNumberish,
    slippagePercent: number = DEFAULT_SLIPPAGE,
    maxHops: number = DEFAULT_MAX_HOPS,
    deadline: number = getDefaultDeadlineSeconds(),
  ): Promise<TransactionResponse> {
    return await this.getUnsignedSwapTx(
      fromAddress,
      tokenInAddress,
      tokenOutAddress,
      ethers.BigNumber.from(amountIn),
      slippagePercent,
      maxHops,
      deadline,
      TradeType.EXACT_INPUT,
    );
  }

  /**
   * Get the unsigned swap transaction given the amount to buy.
   * Includes quote details for the swap.
   *
   * @param {string} fromAddress The public address that will sign and submit the transaction
   * @param {string} tokenInAddress ERC20 contract address or 'native' to sell
   * @param {string} tokenOutAddress ERC20 contract address or 'native' to buy
   * @param {ethers.BigNumberish} amountOut Amount to buy in the smallest unit of the token-out
   * @param {number} slippagePercent (optional) The percentage of slippage tolerance. Default = 0.1. Max = 50. Min = 0
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes
   * @return {TransactionResponse} The result containing the unsigned transaction and details of the swap
   */
  public async getUnsignedSwapTxFromAmountOut(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountOut: ethers.BigNumberish,
    slippagePercent: number = DEFAULT_SLIPPAGE,
    maxHops: number = DEFAULT_MAX_HOPS,
    deadline: number = getDefaultDeadlineSeconds(),
  ): Promise<TransactionResponse> {
    return await this.getUnsignedSwapTx(
      fromAddress,
      tokenInAddress,
      tokenOutAddress,
      ethers.BigNumber.from(amountOut),
      slippagePercent,
      maxHops,
      deadline,
      TradeType.EXACT_OUTPUT,
    );
  }
}
