import { ethers } from 'ethers';
import {
  BridgeConfiguration,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { ImmutableConfiguration } from '@imtbl/config';
import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import {
  ChainId,
  CheckConnectionParams,
  CheckConnectionResult,
  CheckoutModuleConfiguration,
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
  SANDBOX_CONFIGURATION,
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { CheckoutError, CheckoutErrorType } from './errors';
import { CheckoutConfiguration } from './config';
import {
  getBridgeFeeEstimate,
  getBridgeGasEstimate,
} from './gasEstimate/bridgeGasEstimate';
import {
  GetBridgeGasEstimateParams,
  GetBridgeGasEstimateResult,
} from './types/gasEstimates';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';

export class Checkout {
  readonly config: CheckoutConfiguration;

  private providerPreference: ConnectionProviders | undefined;

  private readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  constructor(config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION) {
    this.config = new CheckoutConfiguration(config);
    this.readOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >();
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
  public async connect(params: ConnectParams): Promise<ConnectResult> {
    this.providerPreference = params.providerPreference;
    const provider = await connect.connectWalletProvider(params);
    const networkInfo = await network.getNetworkInfo(this.config, provider);

    return {
      provider,
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
    if (!this.providerPreference) {
      throw new CheckoutError(
        'connect should be called before switchNetwork to set the provider preference',
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR,
      );
    }

    return await network.switchWalletNetwork(
      this.config,
      this.providerPreference,
      params.provider,
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

  /**
   * Get gas estimates for bridge transaction.
   * @param {GetBridgeGasEstimateParams} params - The necessary data required to get the gas estimates.
   * @returns Network details.
   * @throws {@link ErrorType}
   */
  public async getBridgeGasEstimate(
    params: GetBridgeGasEstimateParams,
  ): Promise<GetBridgeGasEstimateResult> {
    const tokenBridge = await this.getBridgeInstance(
      params.fromChainId,
      params.toChainId,
    );

    const result: GetBridgeGasEstimateResult = {};

    const bridgeFee = await getBridgeFeeEstimate(
      tokenBridge,
      params.tokenAddress,
      params.toChainId,
    );

    result.bridgeFee = bridgeFee?.bridgeFee;
    result.bridgeable = bridgeFee?.bridgeable;

    if (result.bridgeable) {
      result.gasEstimate = await getBridgeGasEstimate(
        params.transaction,
        params.provider,
        params.fromChainId,
        params.approveTxn,
      );
    }

    return result;
  }

  private async getBridgeInstance(
    fromChainId: ChainId,
    toChainId: ChainId,
  ): Promise<TokenBridge> {
    this.readOnlyProviders = await createReadOnlyProviders(this.config);

    const rootChainProvider = this.readOnlyProviders.get(fromChainId);
    const childChainProvider = this.readOnlyProviders.get(toChainId);

    if (!rootChainProvider) {
      throw new CheckoutError(
        `Chain:${fromChainId} is not a supported chain`,
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
      );
    }
    if (!childChainProvider) {
      throw new CheckoutError(
        `Chain:${toChainId} is not a supported chain`,
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
      );
    }

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: this.config.environment,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
      // bridgeInstance: {
      //   rootChainID: `eip:${fromChainId.toString()}`,
      //   childChainID: `eip:${toChainId.toString()}`,
      // },
      rootProvider: rootChainProvider,
      childProvider: childChainProvider,
    });

    return new TokenBridge(bridgeConfig);
  }
}
