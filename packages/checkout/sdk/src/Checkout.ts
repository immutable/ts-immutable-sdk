/* eslint-disable class-methods-use-this */
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Environment } from '@imtbl/config';
import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as provider from './provider';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import * as gasEstimate from './gasEstimate';
import * as instance from './instance';
import {
  ChainId,
  CheckConnectionParams,
  CheckConnectionResult,
  CheckoutModuleConfiguration,
  ConnectParams,
  ConnectResult,
  CreateProviderParams,
  CreateProviderResult,
  GetAllBalancesParams,
  GetAllBalancesResult,
  GetBalanceParams,
  GetBalanceResult,
  GetNetworkAllowListParams,
  GetNetworkAllowListResult,
  GetNetworkParams,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  NetworkInfo,
  SANDBOX_CONFIGURATION,
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
  ValidateProviderOptions,
} from './types';
import { CheckoutConfiguration } from './config';
import {
  getBridgeEstimatedGas,
  getBridgeFeeEstimate,
} from './gasEstimate/bridgeGasEstimate';
import {
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateBridgeToL2Result,
  GetBridgeGasEstimateParams,
  GetBridgeGasEstimateResult,
} from './types/gasEstimate';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';

export class Checkout {
  readonly config: CheckoutConfiguration;

  private readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  constructor(config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION) {
    this.config = new CheckoutConfiguration(config);
    this.readOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >();
  }

  /**
   * Create a provider object which can be used within the Checkout class mathods.
   * Based on a walletProviderName
   * @param {CreateProviderParams} params The data required to create a provider
   * @returns A new provider object
   * @throws {@link ErrorType}
   */
  public async createProvider(
    params: CreateProviderParams,
  ): Promise<CreateProviderResult> {
    const web3Provider: Web3Provider = await provider.createProvider(
      params.providerName,
    );
    return {
      provider: web3Provider,
    };
  }

  /**
   * Check if a wallet is connected to the current application
   * without requesting permission from the wallet and hence triggering a connect popup.
   * @param {CheckConnectionParams} params - The necessary data required to verify a wallet connection status.
   * @returns Wallet connection status details.
   * @throws {@link ErrorType}
   */
  public async checkIsWalletConnected(
    params: CheckConnectionParams,
  ): Promise<CheckConnectionResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      { allowUnsupportedProvider: true } as ValidateProviderOptions,
    );
    return connect.checkIsWalletConnected(web3Provider);
  }

  /**
   * Establish a connection with a wallet provider such as MetaMask and returns the provider object and the current network details.
   * @param {ConnectParams} params - The necessary data required to establish a connection with a wallet provider.
   * @returns Wallet provider and current network information.
   * @throws {@link ErrorType}
   */
  public async connect(params: ConnectParams): Promise<ConnectResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      { allowUnsupportedProvider: true } as ValidateProviderOptions,
    );
    await connect.connectSite(web3Provider);
    const networkInfo = await network.getNetworkInfo(this.config, web3Provider);

    return {
      provider: web3Provider,
      network: networkInfo,
    };
  }

  /**
   * Switch the currently connected wallet to a new network.
   * @param {SwitchNetworkParams} params - The necessary data required to switch network.
   * @returns The new network information.
   * @throws {@link ErrorType}
   */
  public async switchNetwork(
    params: SwitchNetworkParams,
  ): Promise<SwitchNetworkResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      { allowUnsupportedProvider: true, allowMistmatchedChainId: true } as ValidateProviderOptions,
    );

    const switchNetworkRes = await network.switchWalletNetwork(
      this.config,
      web3Provider,
      params.chainId,
    );

    return switchNetworkRes;
  }

  /**
   * Fetch the balance of the native token of the current connected network or,
   * if a contract address is provided, it will return the balance of that ERC20 token. For example,
   * if the wallet is connected to the Ethereum Mainnet then the function gets the wallet ETH L1 balance.
   * @param {GetBalanceParams} params - The necessary data required to fetch the wallet balance.
   * @returns Native token balance for the given wallet.
   * @throws {@link ErrorType}
   */
  public async getBalance(params: GetBalanceParams): Promise<GetBalanceResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    if (!params.contractAddress || params.contractAddress === '') {
      return await balances.getBalance(
        this.config,
        web3Provider,
        params.walletAddress,
      );
    }
    return await balances.getERC20Balance(
      web3Provider,
      params.walletAddress,
      params.contractAddress,
    );
  }

  /**
   * Fetch all available balances (ERC20 & Native) of the current connected network of the given wallet.
   * It will loop through the list of allowed tokens and check for balance on each one.
   * @param {GetAllBalancesParams} params - The necessary data required to fetch all the wallet balances.
   * @returns List of tokens balance for the given wallet.
   * @throws {@link ErrorType}
   */
  public async getAllBalances(
    params: GetAllBalancesParams,
  ): Promise<GetAllBalancesResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    return balances.getAllBalances(
      this.config,
      web3Provider,
      params.walletAddress,
      params.chainId,
    );
  }

  /**
   * Fetch the list of available networks that a wallet can add or/and switch to.
   * @param {GetNetworkAllowListParams} params - The necessary data required to fetch the list of available networks.
   * @returns List of networks.
   * @throws {@link ErrorType}
   */
  public async getNetworkAllowList(
    params: GetNetworkAllowListParams,
  ): Promise<GetNetworkAllowListResult> {
    return await network.getNetworkAllowList(this.config, params);
  }

  /**
   * Get the list of tokens which are allowed to be used with the product.
   * @param {GetTokenAllowListParams} params - The necessary data required to fetch the list of allowed tokens.
   * @returns List of allowed tokens.
   * @throws {@link ErrorType}
   */
  public async getTokenAllowList(
    params: GetTokenAllowListParams,
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(params);
  }

  /**
   * Fetch the list of wallets which are available to connect with.
   * @param {GetWalletAllowListParams} params - The necessary data required to fetch the list of allowed wallets.
   * @returns List of allowed wallets.
   * @throws {@link ErrorType}
   */
  public async getWalletAllowList(
    params: GetWalletAllowListParams,
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  /**
   * Send a generic transaction to the provider.
   * @param {SendTransactionParams} params - The necessary data required to send a transaction.
   * @returns Transaction response.
   * @throws {@link ErrorType}
   * @remarks
   * Further documenation can be found at [MetaMask | Sending Transactions](https://docs.metamask.io/guide/sending-transactions.html).
   */
  public async sendTransaction(
    params: SendTransactionParams,
  ): Promise<SendTransactionResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );
    return await transaction.sendTransaction(
      web3Provider,
      params.transaction,
    );
  }

  /**
   * Get network information about the currently selected network.
   * @param {GetNetworkParams} params - The necessary data required to get the current network information.
   * @returns Network details.
   * @throws {@link ErrorType}
   */
  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      { allowUnsupportedProvider: true, allowMistmatchedChainId: true } as ValidateProviderOptions,

    );
    return await network.getNetworkInfo(this.config, web3Provider);
  }

  static isWeb3Provider(web3Provider: Web3Provider) {
    return provider.isWeb3Provider(web3Provider);
  }

  /**
   * Estimates the gas to perform an action.
   * @param {GasEstimateParams} params - The params required to calculate a gas estimate
   * @returns The gas estimate for the given action.
   */
  public async gasEstimate(
    params: GasEstimateParams,
  ): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
    this.readOnlyProviders = await createReadOnlyProviders(
      this.config,
      this.readOnlyProviders,
    );

    return await gasEstimate.gasServiceEstimator(
      params.gasEstimateType,
      this.readOnlyProviders,
      this.config.environment,
    );
  }

  /**
   * Get gas estimates for bridge transaction.
   * @param {GetBridgeGasEstimateParams} params - The necessary data required to get the gas estimates.
   * @returns Bridge gas estimate.
   * @throws {@link ErrorType}
   */
  public async getBridgeGasEstimate(
    params: GetBridgeGasEstimateParams,
  ): Promise<GetBridgeGasEstimateResult> {
    const fromChainId = this.config.environment === Environment.PRODUCTION
      ? ChainId.ETHEREUM
      : ChainId.SEPOLIA;
    const toChainId = this.config.environment === Environment.PRODUCTION
      ? ChainId.IMTBL_ZKEVM_TESTNET
      : ChainId.IMTBL_ZKEVM_DEVNET;

    this.readOnlyProviders = await createReadOnlyProviders(
      this.config,
      this.readOnlyProviders,
    );
    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      this.readOnlyProviders,
      this.config.environment,
    );

    const result: GetBridgeGasEstimateResult = {};

    const bridgeFee = await getBridgeFeeEstimate(
      tokenBridge,
      params.tokenAddress,
      toChainId,
    );

    result.bridgeFee = bridgeFee?.bridgeFee;
    result.bridgeable = bridgeFee?.bridgeable;

    result.gasEstimate = await getBridgeEstimatedGas(
      params.provider,
      fromChainId,
      params.isSpendingCapApprovalRequired,
    );

    return result;
  }
}
