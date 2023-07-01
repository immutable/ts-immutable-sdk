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
import * as gasEstimatorService from './gasEstimate';
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
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
  ValidateProviderOptions,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateBridgeToL2Result,
} from './types';
import { CheckoutConfiguration } from './config';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';

const SANDBOX_CONFIGURATION = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
};

export class Checkout {
  readonly config: CheckoutConfiguration;

  private readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  /**
   * Constructs a new instance of the CheckoutModule class.
   * @param {CheckoutModuleConfiguration} [config=SANDBOX_CONFIGURATION] - The configuration object for the CheckoutModule.
   */
  constructor(
    config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION,
  ) {
    this.config = new CheckoutConfiguration(config);
    this.readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>();
  }

  /**
   * Creates a provider using the given parameters.
   * @param {CreateProviderParams} params - The parameters for creating the provider.
   * @returns {Promise<CreateProviderResult>} A promise that resolves to the created provider.
   */
  public async createProvider(
    params: CreateProviderParams,
  ): Promise<CreateProviderResult> {
    const web3Provider: Web3Provider = await provider.createProvider(
      params.walletProvider,
    );
    return {
      provider: web3Provider,
    };
  }

  /**
   * Checks if a wallet is connected to the specified provider.
   * @param {CheckConnectionParams} params - The parameters for checking the wallet connection.
   * @returns {Promise<CheckConnectionResult>} - A promise that resolves to the result of the check.
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
   * Connects to a blockchain network using the specified provider.
   * @param {ConnectParams} params - The parameters for connecting to the network.
   * @returns {Promise<ConnectResult>} A promise that resolves to an object containing the provider and network information.
   * @throws {Error} If the provider is not valid or if there is an error connecting to the network.
   */
  public async connect(
    params: ConnectParams,
  ): Promise<ConnectResult> {
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
   * Switches the network for the current wallet provider.
   * @param {SwitchNetworkParams} params - The parameters for switching the network.
   * @returns {Promise<SwitchNetworkResult>} - A promise that resolves to the result of switching the network.
   */
  public async switchNetwork(
    params: SwitchNetworkParams,
  ): Promise<SwitchNetworkResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      {
        allowUnsupportedProvider: true,
        allowMistmatchedChainId: true,
      } as ValidateProviderOptions,
    );

    const switchNetworkRes = await network.switchWalletNetwork(
      this.config,
      web3Provider,
      params.chainId,
    );

    return switchNetworkRes;
  }

  /**
   * Retrieves the balance of a wallet address.
   * @param {GetBalanceParams} params - The parameters for retrieving the balance.
   * @returns {Promise<GetBalanceResult>} - A promise that resolves to the balance result.
   */
  public async getBalance(
    params: GetBalanceParams,
  ): Promise<GetBalanceResult> {
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
   * Retrieves the balances of all tokens for a given wallet address on a specific chain.
   * @param {GetAllBalancesParams} params - The parameters for retrieving the balances.
   * @returns {Promise<GetAllBalancesResult>} - A promise that resolves to the result of retrieving the balances.
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
   * Retrieves the supported networks based on the provided parameters.
   * @param {GetNetworkAllowListParams} params - The parameters for retrieving the network allow list.
   * @returns {Promise<GetNetworkAllowListResult>} - A promise that resolves to the network allow list result.
   */
  public async getNetworkAllowList(
    params: GetNetworkAllowListParams,
  ): Promise<GetNetworkAllowListResult> {
    return await network.getNetworkAllowList(this.config, params);
  }

  /**
   * Retrieves the supported tokens based on the provided parameters.
   * @param {GetTokenAllowListParams} params - The parameters for retrieving the token allow list.
   * @returns {Promise<GetTokenAllowListResult>} - A promise that resolves to the token allow list result.
   */
  public async getTokenAllowList(
    params: GetTokenAllowListParams,
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(this.config, params);
  }

  /**
   * Retrieves the default supported wallets based on the provided parameters.
   * @param {GetWalletAllowListParams} params - The parameters for retrieving the wallet allow list.
   * @returns {Promise<GetWalletAllowListResult>} - A promise that resolves to the wallet allow list result.
   */
  public async getWalletAllowList(
    params: GetWalletAllowListParams,
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  /**
   * Sends a transaction using the specified provider and transaction parameters.
   * @param {SendTransactionParams} params - The parameters for sending the transaction.
   * @returns {Promise<SendTransactionResult>} A promise that resolves to the result of the transaction.
   */
  public async sendTransaction(
    params: SendTransactionParams,
  ): Promise<SendTransactionResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );
    return await transaction.sendTransaction(web3Provider, params.transaction);
  }

  /**
   * Retrieves network information using the specified provider.
   * @param {GetNetworkParams} params - The parameters for retrieving network information.
   * @returns {Promise<NetworkInfo>} A promise that resolves to the network information.
   */
  public async getNetworkInfo(
    params: GetNetworkParams,
  ): Promise<NetworkInfo> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
      {
        allowUnsupportedProvider: true,
        allowMistmatchedChainId: true,
      } as ValidateProviderOptions,
    );
    return await network.getNetworkInfo(this.config, web3Provider);
  }

  /**
   * Checks if the given object is a Web3 provider.
   * @param {Web3Provider} web3Provider - The object to check.
   * @returns {boolean} - True if the object is a Web3 provider, false otherwise.
   */
  static isWeb3Provider(
    web3Provider: Web3Provider,
  ) {
    return provider.isWeb3Provider(web3Provider);
  }

  /**
   * Estimates the gas required for a swap or bridge transaction.
   * @param {GasEstimateParams} params - The parameters for the gas estimation.
   * @returns {Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result>} - A promise that resolves to the gas estimation result.
   */
  public async gasEstimate(
    params: GasEstimateParams,
  ): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
    this.readOnlyProviders = await createReadOnlyProviders(
      this.config,
      this.readOnlyProviders,
    );

    return await gasEstimatorService.gasEstimator(
      params,
      this.readOnlyProviders,
      this.config,
    );
  }
}
