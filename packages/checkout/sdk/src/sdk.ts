/* eslint-disable class-methods-use-this */
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Environment } from '@imtbl/config';
import { Passport } from '@imtbl/passport';
import { track } from '@imtbl/metrics';
import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as provider from './provider';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import * as gasEstimatorService from './gasEstimate';
import * as buy from './smartCheckout/buy';
import * as cancel from './smartCheckout/cancel';
import * as sell from './smartCheckout/sell';
import * as smartCheckout from './smartCheckout';
import {
  BuyParams,
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
  SmartCheckoutParams,
  TokenFilterTypes,
  OnRampProviderFees,
  FiatRampParams,
  SmartCheckoutResult,
  CancelResult,
  BuyResult,
  SellResult,
  TokenInfo,
  GetTokenInfoParams,
  AddNetworkParams,
  EIP6963ProviderDetail,
} from './types';
import { CheckoutConfiguration } from './config';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';
import { SellParams } from './types/sell';
import { CancelParams } from './types/cancel';
import { FiatRampService, FiatRampWidgetParams } from './fiatRamp';
import { getItemRequirementsFromRequirements } from './smartCheckout/itemRequirements';
import { CheckoutError, CheckoutErrorType } from './errors';
import { AvailabilityService, availabilityService } from './availability';
import { getWidgetsEsmUrl, loadUnresolvedBundle } from './widgets/load';
import { WidgetsInit } from './types/widgets';
import { HttpClient } from './api/http';
import { isMatchingAddress } from './utils/utils';
import { WidgetConfiguration } from './widgets/definitions/configurations';
import { SemanticVersion } from './widgets/definitions/types';
import { validateAndBuildVersion } from './widgets/version';
import { InjectedProvidersManager } from './provider/injectedProvidersManager';

const SANDBOX_CONFIGURATION = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
  passport: undefined,
};

// Checkout SDK
export class Checkout {
  private readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  private httpClient: HttpClient;

  readonly config: CheckoutConfiguration;

  readonly fiatRampService: FiatRampService;

  readonly availability: AvailabilityService;

  readonly passport?: Passport;

  /**
   * Constructs a new instance of the CheckoutModule class.
   * @param {CheckoutModuleConfiguration} [config=SANDBOX_CONFIGURATION] - The configuration object for the CheckoutModule.
   */
  constructor(
    config: CheckoutModuleConfiguration = SANDBOX_CONFIGURATION,
  ) {
    this.httpClient = new HttpClient(config);
    this.config = new CheckoutConfiguration(config, this.httpClient);
    this.fiatRampService = new FiatRampService(this.config);
    this.readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>();
    this.availability = availabilityService(this.config.isDevelopment, this.config.isProduction);
    this.passport = config.passport;

    track('checkout_sdk', 'initialised');
  }

  /**
   * Loads the widgets bundle and initiate the widgets factory.
   * @param {WidgetsInit} init - The initialisation parameters for loading the widgets bundle and applying configuration
   */
  public async widgets(init: WidgetsInit): Promise<ImmutableCheckoutWidgets.WidgetsFactory> {
    const checkout = this;

    // Preload the configurations
    await checkout.config.remote.getConfig();

    try {
      const factory = await this.loadEsModules(init.config, init.version);
      return factory;
    } catch (err: any) {
      throw new CheckoutError(
        'Failed to load widgets script',
        CheckoutErrorType.WIDGETS_SCRIPT_LOAD_ERROR,
        { error: err },
      );
    }
  }

  private async loadUmdBundle(
    config: WidgetConfiguration,
    version?: SemanticVersion,
  ) {
    const checkout = this;

    const factory = new Promise<ImmutableCheckoutWidgets.WidgetsFactory>((resolve, reject) => {
      try {
        const scriptId = 'immutable-checkout-widgets-bundle';
        const validVersion = validateAndBuildVersion(version);

        // Prevent the script to be loaded more than once
        // by checking the presence of the script and its version.
        const initScript = document.getElementById(scriptId) as HTMLScriptElement;
        if (initScript) {
          if (typeof ImmutableCheckoutWidgets !== 'undefined') {
            resolve(new ImmutableCheckoutWidgets.WidgetsFactory(checkout, config));
          } else {
            reject(
              new CheckoutError(
                'Failed to find ImmutableCheckoutWidgets script',
                CheckoutErrorType.WIDGETS_SCRIPT_LOAD_ERROR,
              ),
            );
          }
        }

        const tag = document.createElement('script');

        tag.addEventListener('load', () => {
          if (typeof ImmutableCheckoutWidgets !== 'undefined') {
            resolve(new ImmutableCheckoutWidgets.WidgetsFactory(checkout, config));
          } else {
            reject(
              new CheckoutError(
                'Failed to find ImmutableCheckoutWidgets script',
                CheckoutErrorType.WIDGETS_SCRIPT_LOAD_ERROR,
              ),
            );
          }
        });

        tag.addEventListener('error', (err) => {
          reject(
            new CheckoutError(
              'Failed to load widgets script',
              CheckoutErrorType.WIDGETS_SCRIPT_LOAD_ERROR,
              { error: err },
            ),
          );
        });

        loadUnresolvedBundle(tag, scriptId, validVersion);
      } catch (err: any) {
        reject(
          new CheckoutError(
            'Failed to load widgets script',
            CheckoutErrorType.WIDGETS_SCRIPT_LOAD_ERROR,
            { error: err },
          ),
        );
      }
    });

    return factory;
  }

  private async loadEsModules(
    config: WidgetConfiguration,
    version?: SemanticVersion,
  ) {
    const checkout = this;
    try {
      const cdnUrl = getWidgetsEsmUrl(version);

      // WebpackIgnore comment required to prevent webpack modifying the import statement and
      // breaking the dynamic import in certain applications integrating checkout
      const checkoutWidgetsModule = await import(/* webpackIgnore: true */ cdnUrl);

      if (checkoutWidgetsModule && checkoutWidgetsModule.WidgetsFactory) {
        return new checkoutWidgetsModule.WidgetsFactory(checkout, config);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to resolve checkout widgets module, falling back to UMD bundle. Error: ${err.message}`);
    }

    // Fallback to UMD bundle if esm bundle fails to load
    return await checkout.loadUmdBundle(config, version);
  }

  /**
   * Creates a provider using the given parameters.
   * @param {CreateProviderParams} params - The parameters for creating the provider.
   * @returns {Promise<CreateProviderResult>} A promise that resolves to the created provider.
   */
  public async createProvider(
    params: CreateProviderParams,
  ): Promise<CreateProviderResult> {
    return await provider.createProvider(
      params.walletProviderName,
      this.passport,
    );
  }

  /**
   * Returns a list of EIP-6963 injected providers and their metadata.
   */
  public getInjectedProviders(): readonly EIP6963ProviderDetail[] {
    return InjectedProvidersManager.getInstance().getProviders();
  }

  /**
   * Finds an injected provider by its RDNS.
   * @param {rdns: string} args - The parameters for finding the injected provider.
   * @returns {EIP6963ProviderDetail | undefined} - The found provider and metadata or undefined.
   */
  public findInjectedProvider(args: { rdns: string }): EIP6963ProviderDetail | undefined {
    return InjectedProvidersManager.getInstance().findProvider(args);
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
      { allowMistmatchedChainId: true, allowUnsupportedProvider: true } as ValidateProviderOptions,
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
      {
        allowUnsupportedProvider: true,
        allowMistmatchedChainId: true,
      } as ValidateProviderOptions,
    );

    if (params.requestWalletPermissions && !(web3Provider.provider as any)?.isPassport) {
      await connect.requestPermissions(web3Provider);
    } else {
      await connect.connectSite(web3Provider);
    }

    return { provider: web3Provider };
  }

  /**
   * Adds the network for the current wallet provider.
   * @param {AddNetworkParams} params - The parameters for adding the network.
   * @returns {Promise<any>} - A promise that resolves to the result of adding the network.
   */
  public async addNetwork(
    params: AddNetworkParams,
  ): Promise<any> {
    const addNetworkRes = await network.addNetworkToWallet(
      this.config.networkMap,
      params.provider,
      params.chainId,
    );

    return addNetworkRes;
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
   * Retrieves the token information given the token address. This function makes RPC calls to
   * ERC20 contracts to fetch the main contract information (e.g. symbol).
   * @param {GetTokenInfoParams} params - The parameters for retrieving the token information.
   * @returns {Promise<TokenInfo>} - A promise that resolves to the token info request.
   */
  public async getTokenInfo(
    params: GetTokenInfoParams,
  ): Promise<TokenInfo> {
    return await tokens.getERC20TokenInfo(
      params.provider,
      params.tokenAddress,
    );
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

    if (!params.tokenAddress || params.tokenAddress === '') {
      return await balances.getBalance(
        this.config,
        web3Provider,
        params.walletAddress,
      );
    }
    return await balances.getERC20Balance(
      web3Provider,
      params.walletAddress,
      params.tokenAddress,
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
    return balances.getAllBalances(
      this.config,
      params.provider,
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
      {
        allowUnsupportedProvider: true,
        allowMistmatchedChainId: true,
      } as ValidateProviderOptions,
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
   * Determines the requirements for performing a buy.
   * @param {BuyParams} params - The parameters for the buy.
  */
  public async buy(
    params: BuyParams,
  ): Promise<BuyResult> {
    if (params.orders.length > 1) {
      // eslint-disable-next-line no-console
      console.warn('This endpoint currently only processes the first order in the array.');
    }

    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    return await buy.buy(this.config, web3Provider, params.orders, params.overrides);
  }

  /**
   * Determines the requirements for performing a sell.
   * @param {SellParams} params - The parameters for the sell.
   * Only currently actions the first order in the array until we support batch processing.
   * Only currently actions the first fee in the fees array of each order until we support multiple fees.
  */
  public async sell(
    params: SellParams,
  ): Promise<SellResult> {
    if (params.orders.length > 1) {
      // eslint-disable-next-line no-console
      console.warn('This endpoint currently only processes the first order in the array.');
    }

    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    return await sell.sell(
      this.config,
      web3Provider,
      params.orders,
    );
  }

  /**
   * Cancels a sell.
   * @param {CancelParams} params - The parameters for the cancel.
   */
  public async cancel(
    params: CancelParams,
  ): Promise<CancelResult> {
    // eslint-disable-next-line no-console
    console.warn('This endpoint currently only processes the first order in the array.');

    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    return await cancel.cancel(this.config, web3Provider, params.orderIds, params.overrides);
  }

  /**
   * Determines the transaction requirements to complete a purchase.
   * @params {SmartCheckoutParams} params - The parameters for smart checkout.
   */
  public async smartCheckout(
    params: SmartCheckoutParams,
  ): Promise<SmartCheckoutResult> {
    const web3Provider = await provider.validateProvider(
      this.config,
      params.provider,
    );

    let itemRequirements = [];
    try {
      itemRequirements = await getItemRequirementsFromRequirements(web3Provider, params.itemRequirements);
    } catch (err: any) {
      throw new CheckoutError(
        'Failed to map item requirements',
        CheckoutErrorType.ITEM_REQUIREMENTS_ERROR,
        { error: err },
      );
    }

    return await smartCheckout.smartCheckout(
      this.config,
      web3Provider,
      itemRequirements,
      params.transactionOrGasAmount,
    );
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

  /**
   * Creates and returns a URL for the fiat ramp widget.
   * @param {FiatRampParams} params - The parameters for creating the url.
   * @returns {Promise<string>} - A promise that resolves to a string url.
   */
  public async createFiatRampUrl(params: FiatRampParams): Promise<string> {
    let tokenAmount;
    let tokenSymbol = 'IMX';
    let email;

    const walletAddress = await params.web3Provider.getSigner().getAddress();
    const isPassport = (params.web3Provider.provider as any)?.isPassport || false;

    if (isPassport && params.passport) {
      const userInfo = await params.passport.getUserInfo();
      email = userInfo?.email;
    }

    const tokenList = await tokens.getTokenAllowList(this.config, { type: TokenFilterTypes.ONRAMP });
    const token = tokenList.tokens?.find((t) => isMatchingAddress(t.address, params.tokenAddress));
    if (token) {
      tokenAmount = params.tokenAmount;
      tokenSymbol = token.symbol;
    }
    const allowedTokens = tokenList?.tokens?.filter((t) => t.symbol).map((t) => t.symbol);

    return await this.fiatRampService.createWidgetUrl({
      exchangeType: params.exchangeType,
      isPassport,
      walletAddress,
      tokenAmount,
      tokenSymbol,
      email,
      allowedTokens,
    } as FiatRampWidgetParams);
  }

  /**
   * Fetches fiat ramp fee estimations.
   * @returns {Promise<OnRampProviderFees>} - A promise that resolves to OnRampProviderFees.
   */
  public async getExchangeFeeEstimate(): Promise<OnRampProviderFees> {
    return await this.fiatRampService.feeEstimate();
  }

  /**
   * Fetches Swap widget availability.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean.
   */
  public async isSwapAvailable(): Promise<boolean> {
    return this.availability.checkDexAvailability();
  }
}
