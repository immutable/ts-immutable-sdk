import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import {
  CheckConnectionParams,
  CheckConnectionResult,
  ConnectionProviders,
  ConnectParams,
  ConnectResult,
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
} from './types';
import { CheckoutError, CheckoutErrorType } from './errors';

export class Checkout {
  private providerPreference: ConnectionProviders | undefined;

  /**
   * Check if a wallet is connected to the current application without requesting permission from the wallet and hence triggering a connect popup.
   * @param {CheckConnectionParams} params - The necessary data required to verify a wallet connection status.
   * @returns Wallet connection status details.
   * @example
   * ```
   * const checkConnectionResult = await checkout.checkIsWalletConnected({
   *   providerPreference: ConnectionProviders.METAMASK
   * });
   *
   * if(checkConnectionResult.isConnected) {
   *   // create provider object
   * } else {
   *   // redirect somewhere else
   * }
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Provider preference is not supported
   * {
   *   type: "PROVIDER_PREFERENCE_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Provider request funtion is missing (unsupported provider)
   * // Fix: checkout sdk needs to create a supported provider (unlikely to occur)
   * {
   *   type: "PROVIDER_REQUEST_MISSING_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Check wallet connection request failed
   * // Fix: unsure, this would be if the wallet threw an error
   * {
   *   type: "PROVIDER_REQUEST_FAILED_ERROR",
   *   data: { rpcMethod: "eth_accounts"},
   *   ...
   * }
   * ```
   */
  public async checkIsWalletConnected(
    params: CheckConnectionParams
  ): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(params.providerPreference);
  }

  /**
   * Establish a connection with a wallet provider such as MetaMask and returns the provider object and the current network details.
   * @param {ConnectParams} params - The necessary data required to establish a connection with a wallet provider.
   * @returns Wallet provider and current network information.
   * @example
   * ```
   * const provider = await checkout.connect({
   *   providerPreference: ConnectionProviders.METAMASK
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Provider preference is not supported
   * {
   *   type: "PROVIDER_PREFERENCE_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Problem with detecting MetaMask provider
   * {
   *   type: "METAMASK_PROVIDER_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Provider request funtion is missing (unsupported provider)
   * {
   *   type: "PROVIDER_REQUEST_MISSING_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // User rejected connection request
   * {
   *   type: "USER_REJECTED_REQUEST_ERROR",
   *   ...
   * }
   * ```
   */
  public async connect(params: ConnectParams): Promise<ConnectResult> {
    this.providerPreference = params.providerPreference;
    const provider = await connect.connectWalletProvider(params);
    const networkInfo = await network.getNetworkInfo(provider);

    return {
      provider,
      network: networkInfo,
    };
  }

  /**
   * Switch the currently connected wallet to a new network.
   * @param {SwitchNetworkParams} params - The necessary data required to switch network.
   * @returns The new network information.
   * @example
   * ```
   * const switchNetworkResponse = await checkout.switchNetwork({
   *  provider,
   *  chainId
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // ChainId not supported by Checkout
   * {
   *   type: "CHAIN_NOT_SUPPORTED_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Provider is not supported
   * {
   *   type: "PROVIDER_REQUEST_MISSING_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // User rejected switch network request
   * {
   *   type: "USER_REJECTED_REQUEST_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // User rejected add network request
   * {
   *   type: "USER_REJECTED_REQUEST_ERROR",
   *   ...
   * }
   * ```
   */
  public async switchNetwork(
    params: SwitchNetworkParams
  ): Promise<SwitchNetworkResult> {
    if (!this.providerPreference) {
      throw new CheckoutError(
        `connect should be called before switchNetwork to set the provider preference`,
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR
      );
    }

    return await network.switchWalletNetwork(
      this.providerPreference,
      params.provider,
      params.chainId
    );
  }

  /**
   * Fetch the balance of the native token of the current connected network or, if a contract address is provided, it will return the balance of that ERC20 token. For example, if the wallet is connected to the Ethereum Mainnet then the function gets the wallet ETH L1 balance.
   * @param {GetBalanceParams} params - The necessary data required to fetch the wallet balance.
   * @returns Native token balance for the given wallet.
   * @example
   * ```
   * const balanceResult = await checkout.getBalance({
   *   provider,
   *   walletAddress
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // When current connected network in not-supported
   * {
   *   type: "CHAIN_NOT_SUPPORTED_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Other errors
   * {
   *   type: "GET_BALANCE_ERROR",
   *   ...
   * }
   * ```
   */
  public async getBalance(params: GetBalanceParams): Promise<GetBalanceResult> {
    if (!params.contractAddress || params.contractAddress === '') {
      return await balances.getBalance(params.provider, params.walletAddress);
    }
    return await balances.getERC20Balance(
      params.provider,
      params.walletAddress,
      params.contractAddress
    );
  }

  /**
   * Fetch all available balances (ERC20 & Native) of the current connected network of the given wallet. It will loop through the list of allowed tokens and check for balance on each one.
   * @param {GetAllBalancesParams} params - The necessary data required to fetch all the wallet balances.
   * @returns List of tokens balance for the given wallet.
   * @example
   * ```
   * const getAllBalancesResult = await checkout.getAllBalances({
   *   provider,
   *   walletAddress,
   *   chainId
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // When current connected network in not-supported
   * {
   *   type: "CHAIN_NOT_SUPPORTED_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Error with provider
   * {
   *   type: "PROVIDER_REQUEST_MISSING_ERROR",
   *   ...
   * }
   * ```
   * ```
   * // Error fetching allowed-tokens list
   * {
   *   type:"API_ERROR",
   *   ...
   * }
   * ```
   */
  public async getAllBalances(
    params: GetAllBalancesParams
  ): Promise<GetAllBalancesResult> {
    return balances.getAllBalances(
      params.provider,
      params.walletAddress,
      params.chainId
    );
  }

  /**
   * Fetch the list of available networks that a wallet can add or/and switch to.
   * @param {GetNetworkAllowListParams} params - The necessary data required to fetch the list of available networks.
   * @returns List of networks.
   * @example
   * ```
   * const allowedNetworks = await checkoutSDK.getNetworkAllowList({
   *  type: walletFilter.ALL,
   *  exclude: [{chainId: ChainId.GOERLI}, ...],
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Error fetching allowed-network list
   * {
   *   type:"API_ERROR",
   *   ...
   * }
   * ```
   */
  public async getNetworkAllowList(
    params: GetNetworkAllowListParams
  ): Promise<GetNetworkAllowListResult> {
    return await network.getNetworkAllowList(params);
  }

  /**
   * Get the list of tokens which are allowed to be used with the product.
   * @param {GetTokenAllowListParams} params - The necessary data required to fetch the list of allowed tokens.
   * @returns List of allowed tokens.
   * @example
   * ```
   * const allowedNetworks = await checkoutSDK.getTokenAllowList({
   *  type: TokenFilterTypes.SWAP,
   *  chainID: ChainId.ZKEVM,
   *  exclude: [{address: '0x987654321'}, ...],
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Error fetching allowed-tokens list
   * {
   *   type:"API_ERROR",
   *   ...
   * }
   * ```
   */
  public async getTokenAllowList(
    params: GetTokenAllowListParams
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(params);
  }

  /**
   * Fetch the list of wallets which are available to connect with.
   * @param {GetWalletAllowListParams} params - The necessary data required to fetch the list of allowed wallets.
   * @returns List of allowed wallets.
   * @example
   * ```
   * const allowedNetworks = await checkoutSDK.getWalletAllowList({
   *   type: WalletFilterTypes.ALL,
   *   exclude: [{connectionProvider: ConnectionProviders.PASSPORT}, ...],
   * });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Error fetching allowed-wallets list
   * {
   *   type:"API_ERROR",
   *   ...
   * }
   * ```
   */
  public async getWalletAllowList(
    params: GetWalletAllowListParams
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  /**
   * Send a generic transaction to the provider.
   * @param {SendTransactionParams} params - The necessary data required to send a transaction.
   * @returns Transaction response.
   * @example
   * ```
   * const transactionResult = await checkoutSDK.sendTransaction({ provider, transaction });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Generic transaction error.
   * {
   *   type:"TRANSACTION_ERROR",
   *   ...
   * }
   * ```
   * @remarks
   * Further documenation can be found at [MetaMask | Sending Transactions](https://docs.metamask.io/guide/sending-transactions.html).
   */
  public async sendTransaction(
    params: SendTransactionParams
  ): Promise<SendTransactionResult> {
    return await transaction.sendTransaction(params);
  }

  /**
   * Get network information about the currently selected network.
   * @param {GetNetworkParams} params - The necessary data required to get the current network information.
   * @returns Network details.
   * @example
   * ```
   * const transactionResult = await checkoutSDK.getNetworkInfo({ provider });
   * ```
   * @throws {@link ErrorType}
   * ```
   * // Generic transaction error.
   * {
   *   type:"GET_NETWORK_INFO_ERROR",
   * }
   * ```
   */
  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
    return await network.getNetworkInfo(params.provider);
  }
}
