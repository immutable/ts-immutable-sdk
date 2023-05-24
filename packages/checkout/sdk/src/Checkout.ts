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
  ProviderInfo,
  SANDBOX_CONFIGURATION,
  SendTransactionParams,
  SendTransactionResult,
  SetProviderParams,
  SetProviderResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { CheckoutConfiguration } from './config';

export class Checkout {
  readonly config: CheckoutConfiguration;

  private providerInfo: ProviderInfo;

  constructor(config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION) {
    this.config = new CheckoutConfiguration(config);
    this.providerInfo = {};
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
      providers: this.providerInfo.providers,
    };
  }

  public async setProvider(
    params: SetProviderParams,
  ): Promise<SetProviderResult> {
    const { providers, networkInfo } = await provider.cloneProviders(
      this.config,
      params,
    );
    this.providerInfo.currentProvider = params.name;
    this.providerInfo.currentNetwork = networkInfo;
    this.providerInfo.providers = providers;
    return {
      providers: this.providerInfo.providers,
      currentProvider: this.providerInfo.currentProvider,
      currentNetwork: this.providerInfo.currentNetwork,
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
    return connect.checkIsWalletConnected(params.providerPreference);
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
      this.providerInfo,
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
    // if (!this.providerPreference) {
    //   throw new CheckoutError(
    //     'connect should be called before switchNetwork to set the provider preference',
    //     CheckoutErrorType.PROVIDER_PREFERENCE_ERROR
    //   );
    // }

    const web3Provider = await provider.getWeb3Provider(
      params,
      this.providerInfo,
    );

    return await network.switchWalletNetwork(
      this.config,
      web3Provider,
      params.chainId,
    );
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
    if (!params.contractAddress || params.contractAddress === '') {
      return await balances.getBalance(
        this.config,
        params.provider,
        params.walletAddress,
      );
    }
    return await balances.getERC20Balance(
      params.provider,
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
    return balances.getAllBalances(
      this.config,
      params.provider,
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
    return await transaction.sendTransaction(params);
  }

  /**
   * Get network information about the currently selected network.
   * @param {GetNetworkParams} params - The necessary data required to get the current network information.
   * @returns Network details.
   * @throws {@link ErrorType}
   */
  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
    return await network.getNetworkInfo(this.config, params.provider);
  }
}
