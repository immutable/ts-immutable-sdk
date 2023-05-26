import { Web3Provider } from '@ethersproject/providers';
import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as provider from './provider';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import {
  CheckConnectionParams,
  CheckConnectionResult,
  CheckoutModuleConfiguration,
  ConnectParams,
  ConnectResult,
  CreateProviderParams,
  CreateProviderResult,
  CurrentProviderInfo,
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
  Providers,
  SANDBOX_CONFIGURATION,
  SendTransactionParams,
  SendTransactionResult,
  SetProviderParams,
  SetProviderResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { CheckoutConfiguration } from './config';
import { CheckoutError, CheckoutErrorType } from './errors';

export class Checkout {
  readonly config: CheckoutConfiguration;

  private allProviders: Providers;

  private currentProviderInfo: CurrentProviderInfo;

  constructor(config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION) {
    this.config = new CheckoutConfiguration(config);
    this.currentProviderInfo = {};
    this.allProviders = {};
  }

  public async createDefaultProvider(
    params: CreateProviderParams,
  ): Promise<CreateProviderResult> {
    const web3Provider: Web3Provider = await provider.createProvider(
      this.config,
      params.providerName,
    );
    return {
      web3Provider,
      name: params.providerName,
    };
  }

  public async getProviders() {
    return {
      providers: this.allProviders,
    };
  }

  public async getCurrentProvider() {
    return {
      currentProviderInfo: this.currentProviderInfo,
    };
  }

  public async setProvider(
    params: SetProviderParams,
  ): Promise<SetProviderResult> {
    const { providers, networkInfo } = await provider.cloneProviders(
      this.config,
      params,
    );
    this.currentProviderInfo.name = params.name;
    this.currentProviderInfo.network = networkInfo;
    this.allProviders = providers;
    return {
      providers: this.allProviders,
      currentProviderInfo: this.currentProviderInfo,
    };
  }

  /**
   * Check if a wallet is connected to the current application
   * without requesting permission from the wallet and hence triggering a connect popup.
   * @param {CheckConnectionParams} params - The necessary data required to verify a wallet connection status.
   * @returns Wallet connection status details.
   * @throws {@link ErrorType}
   */
  // eslint-disable-next-line class-methods-use-this
  public async checkIsWalletConnected(
    params: CheckConnectionParams,
  ): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(params.providerPreference); // @WT-1345 remove provider preference
  }

  /**
   * Establish a connection with a wallet provider such as MetaMask and returns the provider object and the current network details.
   * @param {ConnectParams} params - The necessary data required to establish a connection with a wallet provider.
   * @returns Wallet provider and current network information.
   * @throws {@link ErrorType}
   */
  public async connect(params: ConnectParams = {}): Promise<ConnectResult> {
    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
    );
    await connect.connectWalletProvider({ web3Provider });
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
    if (!this.allProviders) {
      throw new CheckoutError(
        'checkout.setProvider should be called before switchNetwork to create the providers for each available network',
        CheckoutErrorType.PROVIDER_ERROR,
      );
    }

    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
    );

    const switchNetworkRes = await network.switchWalletNetwork(
      this.config,
      web3Provider,
      params.chainId,
      this.currentProviderInfo,
      this.allProviders,
    );

    this.currentProviderInfo.network = switchNetworkRes.network;

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
    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
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
    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
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
  // eslint-disable-next-line class-methods-use-this
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
  // eslint-disable-next-line class-methods-use-this
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
  // eslint-disable-next-line class-methods-use-this
  public async sendTransaction(
    params: SendTransactionParams,
  ): Promise<SendTransactionResult> {
    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
    );
    return await transaction.sendTransaction({
      web3Provider,
      transaction: params.transaction,
    });
  }

  /**
   * Get network information about the currently selected network.
   * @param {GetNetworkParams} params - The necessary data required to get the current network information.
   * @returns Network details.
   * @throws {@link ErrorType}
   */
  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
    const web3Provider = await provider.getWeb3Provider(
      params,
      this.currentProviderInfo,
      this.allProviders,
    );
    return await network.getNetworkInfo(this.config, web3Provider);
  }
}
