/* eslint-disable class-methods-use-this */
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
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
  SANDBOX_CONFIGURATION,
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

export class Checkout {
  readonly config: CheckoutConfiguration;

  private readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  /**
 * This is a constructor function that initializes a CheckoutModuleConfiguration object and a Map of
 * JsonRpcProviders.
 * @param {CheckoutModuleConfiguration} config - The `config` parameter is an optional argument of type
 * `CheckoutModuleConfiguration` that is used to configure the checkout module. If no configuration is
 * provided, the module will use the default `SANDBOX_CONFIGURATION`.
 */
  /**
   * Constructs a new instance of the CheckoutModule class with the given configuration.
   * @param {CheckoutModuleConfiguration} [config=SANDBOX_CONFIGURATION] - The configuration object for the CheckoutModule.
   * @returns None
   */
  constructor(config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION) {
    this.config = new CheckoutConfiguration(config);
    this.readOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >();
  }

  /**
 * This function creates a web3 provider using a wallet provider and returns it as a promise.
 * @param {CreateProviderParams} params - The `params` parameter is of type `CreateProviderParams` and
 * is an object that contains the following properties:
 * @returns The `createProvider` function is returning a Promise that resolves to an object with a
 * `provider` property, which is a `Web3Provider` object created using the `walletProvider` parameter
 * passed to the function.
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
   * This function checks if a wallet is connected to a web3 provider.
   * @param {CheckConnectionParams} params - CheckConnectionParams is a type of object that contains
   * information about the provider being used to connect to a wallet. It may include properties such
   * as the provider URL, network ID, and other relevant details.
   * @returns The function `checkIsWalletConnected` is returning a Promise that resolves to a
   * `CheckConnectionResult` object. The `CheckConnectionResult` type is not defined in the code
   * snippet provided, so it is unclear what properties or values it contains.
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
  * This function connects to a web3 provider and returns the provider and network information.
  * @param {ConnectParams} params - The `params` parameter is an object that contains information
  * needed to connect to a blockchain network. It may include the provider URL, account information,
  * and other relevant details.
  * @returns An object with two properties: "provider" and "network". The "provider" property contains
  * the validated web3 provider, and the "network" property contains information about the connected
  * network.
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
 * This function switches the network of a wallet using a given provider and chain ID.
 * @param {SwitchNetworkParams} params - The `params` parameter is an object that contains the
 * following properties:
 * @returns The function `switchNetwork` returns a Promise that resolves to a `SwitchNetworkResult`
 * object.
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
   * This function retrieves the balance of a wallet address for either Ether or an ERC20 token.
   * @param {GetBalanceParams} params - The `params` parameter is an object that contains the following
   * properties:
   * @returns The function `getBalance` returns a Promise that resolves to a `GetBalanceResult` object.
   * The contents of this object depend on the execution of the function, which can either return the
   * balance of a wallet address or the balance of an ERC20 token held by a wallet address.
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
  * This function retrieves all balances for a given wallet address on a specified chain using a
  * validated web3 provider.
  * @param {GetAllBalancesParams} params - GetAllBalancesParams object containing the following
  * properties:
  * @returns The `getAllBalances` function is being called with the provided parameters, and the result
  * of that function call is being returned as a Promise with the type `GetAllBalancesResult`.
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
   * This function retrieves the network allow list using the provided parameters.
   * @param {GetNetworkAllowListParams} params - GetNetworkAllowListParams is a type of object that
   * contains the parameters required for the getNetworkAllowList function. The specific properties of
   * this object depend on the implementation of the function, but typically include information such
   * as network configuration settings and filters for the returned data.
   * @returns A promise that resolves to a `GetNetworkAllowListResult` object. The result is obtained
   * by calling the `network.getNetworkAllowList` function with the provided `params` and `config`
   * properties of the current object.
   */
  public async getNetworkAllowList(
    params: GetNetworkAllowListParams,
  ): Promise<GetNetworkAllowListResult> {
    return await network.getNetworkAllowList(this.config, params);
  }

  /**
   * This function returns a promise that resolves to the result of calling the `getTokenAllowList`
   * function with the provided parameters.
   * @param {GetTokenAllowListParams} params - The `params` parameter is an object that contains the
   * necessary information to retrieve the token allow list. The specific properties of this object
   * will depend on the implementation of the `getTokenAllowList` method.
   * @returns The `getTokenAllowList` method is returning a Promise that resolves to a
   * `GetTokenAllowListResult` object. The `tokens.getTokenAllowList(params)` method is being called
   * with the `params` argument and its result is being returned.
   */
  public async getTokenAllowList(
    params: GetTokenAllowListParams,
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(params);
  }

  /**
   * This function retrieves the wallet allow list using the parameters provided.
   * @param {GetWalletAllowListParams} params - GetWalletAllowListParams is a type of object that
   * contains the parameters required for the getWalletAllowList function. The specific properties of
   * this object depend on the implementation of the function, but typically it would include things
   * like filters or pagination options for retrieving a list of wallet addresses.
   * @returns The `getWalletAllowList` function is returning a Promise that resolves to a
   * `GetWalletAllowListResult` object. The `GetWalletAllowListResult` type is not shown in the code
   * snippet, but it is likely an interface or type that defines the structure of the data that will be
   * returned.
   */
  public async getWalletAllowList(
    params: GetWalletAllowListParams,
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  /**
  * This function sends a transaction using a validated web3 provider and returns the result.
  * @param {SendTransactionParams} params - The `params` parameter is an object of type
  * `SendTransactionParams` which contains the following properties:
  * @returns The `sendTransaction` method is returning a `Promise` that resolves to a
  * `SendTransactionResult` object.
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
   * This function retrieves network information using a validated web3 provider.
   * @param {GetNetworkParams} params - The `params` parameter is an object that contains the following
   * properties:
   * @returns The `getNetworkInfo` function is returning a Promise that resolves to a `NetworkInfo`
   * object. The `NetworkInfo` object likely contains information about the current network, such as
   * the network ID, name, and other relevant details.
   */
  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
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
   * This function checks if a given object is a Web3 provider.
   * @param {Web3Provider} web3Provider - The web3Provider parameter is an object that represents a
   * provider for interacting with a blockchain network using the Web3.js library. It can be used to
   * send transactions, read data from the blockchain, and interact with smart contracts.
   * @returns The function `isWeb3Provider` is being returned, which takes a `web3Provider` parameter
   * of type `Web3Provider` and checks if it is a valid web3 provider by calling the `isWeb3Provider`
   * method of the `provider` object. The return value of this function is a boolean value indicating
   * whether the `web3Provider` is a valid web3 provider or
   */
  static isWeb3Provider(web3Provider: Web3Provider) {
    return provider.isWeb3Provider(web3Provider);
  }

  /**
   * This function estimates gas for a swap or bridge transaction using read-only providers and a gas
   * estimator service.
   * @param {GasEstimateParams} params - The `params` parameter is an object that contains the
   * necessary information to estimate the gas cost of a transaction. The specific properties of this
   * object depend on whether the function is estimating gas for a swap or a bridge to Layer 2
   * transaction. The `GasEstimateSwapResult` and `GasEst
   * @returns a Promise that resolves to either a `GasEstimateSwapResult` or a
   * `GasEstimateBridgeToL2Result`.
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
