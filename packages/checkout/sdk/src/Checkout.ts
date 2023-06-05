import { Web3Provider } from '@ethersproject/providers';
import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import {
  CheckConnectionResult,
  CheckoutModuleConfiguration,
  ConnectResult,
  CreateProviderParams,
  CreateProviderResult,
  GetAllBalancesParams,
  GetAllBalancesResult,
  GetBalanceParams,
  GetBalanceResult,
  GetNetworkAllowListParams,
  GetNetworkAllowListResult,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  NetworkInfo,
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { CheckoutError, CheckoutErrorType } from './errors';
import {
  CheckoutConfiguration,
} from './config';

export class Checkout {
  readonly config: CheckoutConfiguration;

  private provider: Web3Provider;

  constructor(config: CheckoutModuleConfiguration, provider: Web3Provider) {
    this.config = new CheckoutConfiguration(config);

    // check web3provider compatibility in constructor
    // this means Checkout class 'wraps' the provider and uses it
    if (!provider || !(provider instanceof Web3Provider)) {
      throw new CheckoutError(
        'incompatible provider added, please add a provider',
        CheckoutErrorType.CHECKOUT_CONSTRUCTION_ERROR,
      );
    }

    this.provider = provider;
  }

  /**
   * Optional, MP can pass its own web3provider to constructor or use this method to do creation
   * static method allows us to expose createProvider logic for use before object creation
   * allows us to provide this experience to end users:
   * const createResult = await Checkout.createProvider({providerPreference: "metamask"});
   * const checkout = new Checkout(config, createResult.provider);
   * @param params
   * @returns
   */
  static async createProvider(params: CreateProviderParams): Promise<CreateProviderResult> {
    const provider = await connect.getWalletProviderForPreference(params.providerPreference);
    return { provider };
  }

  /**
   * Check if a wallet is connected to the current application
   * without requesting permission from the wallet and hence triggering a connect popup.
   * @param {CheckConnectionParams} params - The necessary data required to verify a wallet connection status.
   * @returns Wallet connection status details.
   * @throws {@link ErrorType}
   */
  // eslint-disable-next-line class-methods-use-this
  public async checkIsWalletConnected(): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(this.provider);
  }

  /**
   * Establish a connection with a wallet provider such as MetaMask and returns the provider object and the current network details.
   * @param {ConnectParams} params - The necessary data required to establish a connection with a wallet provider.
   * @returns Wallet provider and current network information.
   * @throws {@link ErrorType}
   */
  public async connect(): Promise<ConnectResult> {
    const provider = await connect.connectWalletProvider(this.provider);
    const networkInfo = await network.getNetworkInfo(this.config, provider);

    // we do not return provider anymore, it is already set in the constructor
    return {
      // provider,
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
    // switch the provider on this Checkout object, re-wrap and return
    // we do return the newly wrapped web3provider
    const switchResult = await network.switchWalletNetwork(
      this.config,
      this.provider,
      params.chainId,
    );

    // reset this Checkout objects provider with newly wrapped web3Provider (same underlying but switched network)
    this.provider = switchResult.provider;

    return switchResult;
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
        this.provider,
        params.walletAddress,
      );
    }
    return await balances.getERC20Balance(
      this.provider,
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
      this.provider,
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
    return await transaction.sendTransaction(this.provider, params.transaction);
  }

  /**
   * Get network information about the currently selected network.
   * @returns Network details.
   * @throws {@link ErrorType}
   */
  public async getNetworkInfo(): Promise<NetworkInfo> {
    return await network.getNetworkInfo(this.config, this.provider);
  }
}
