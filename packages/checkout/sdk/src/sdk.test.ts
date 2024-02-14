/*
 * @jest-environment jsdom
 */
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { BigNumber, ethers } from 'ethers';
import { Passport, UserProfile } from '@imtbl/passport';
import { getNetworkAllowList, getNetworkInfo, switchWalletNetwork } from './network';

import { Checkout } from './sdk';
import {
  ChainId,
  GetBalanceParams,
  GetNetworkAllowListResult,
  GasEstimateSwapResult,
  GasEstimateType,
  ChainName,
  WalletProviderName,
  NetworkFilterTypes,
  TokenFilterTypes,
  WalletFilterTypes,
  GasTokenType,
  ItemType,
  TransactionOrGasType,
  SmartCheckoutParams,
  NetworkInfo,
  GetTokenAllowListResult,
  TokenInfo,
  BuyToken,
} from './types';
import { getAllBalances, getBalance, getERC20Balance } from './balances';
import { sendTransaction } from './transaction';
import { gasEstimator } from './gasEstimate';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';
import { checkIsWalletConnected, connectSite, requestPermissions } from './connect';
import * as network from './network';
import { createProvider, isWeb3Provider, validateProvider } from './provider';
import { getERC20TokenInfo, getTokenAllowList } from './tokens';
import { getWalletAllowList } from './wallet';
import { buy } from './smartCheckout/buy';
import { sell } from './smartCheckout/sell';
import { smartCheckout } from './smartCheckout';
import { cancel } from './smartCheckout/cancel';
import { FiatRampService } from './fiatRamp';
import { FiatRampParams, ExchangeType } from './types/fiatRamp';
import { getItemRequirementsFromRequirements } from './smartCheckout/itemRequirements';
import { CheckoutErrorType } from './errors';
import { availabilityService } from './availability';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');
jest.mock('./transaction');
jest.mock('./gasEstimate/gasEstimator');
jest.mock('./readOnlyProviders/readOnlyProvider');
jest.mock('./provider');
jest.mock('./tokens');
jest.mock('./wallet');
jest.mock('./smartCheckout/buy');
jest.mock('./smartCheckout/sell');
jest.mock('./smartCheckout/cancel');
jest.mock('./smartCheckout');
jest.mock('./fiatRamp');
jest.mock('./smartCheckout/itemRequirements');
jest.mock('./availability');

describe('Connect', () => {
  let providerMock: ExternalProvider;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const requestMock = jest.fn();
    providerMock = {
      request: requestMock,
    };
    requestMock.mockResolvedValue('0x1');

    const getNetworkAllListMock = jest.fn().mockResolvedValue({
      networks: [
        {
          chainId: ChainId.ETHEREUM,
          name: ChainName.ETHEREUM,
          isSupported: true,
          nativeCurrency: {},
        },
      ],
    } as GetNetworkAllowListResult);
    (network.getNetworkAllowList as jest.Mock).mockImplementation(
      getNetworkAllListMock,
    );
  });

  it('should call the connectSite function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.connect({
      provider: new Web3Provider(providerMock, ChainId.ETHEREUM),
    });

    expect(connectSite).toBeCalledTimes(1);
  });

  it(`should call the requestPermissions function if requestWalletPermissions is
  true and provider is not Passport`, async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    (validateProvider as jest.Mock).mockResolvedValue(provider);

    await checkout.connect({
      provider,
      requestWalletPermissions: true,
    });

    expect(connectSite).not.toHaveBeenCalled();
    expect(requestPermissions).toBeCalledWith(provider);
  });

  it(`should call the connectSite function if requestWalletPermissions is
  true and provider is Passport`, async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const requestMock = jest.fn();
    providerMock = {
      isPassport: true,
      request: requestMock,
    } as unknown as ExternalProvider;
    requestMock.mockResolvedValue('0x1');

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    (validateProvider as jest.Mock).mockResolvedValue(provider);

    await checkout.connect({
      provider,
      requestWalletPermissions: true,
    });

    expect(connectSite).toBeCalledTimes(1);
    expect(requestPermissions).not.toBeCalled();
  });

  it('should call getBalance when no contract address provided', async () => {
    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);

    (getBalance as jest.Mock).mockResolvedValue({});
    (validateProvider as jest.Mock).mockResolvedValue(provider);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.getBalance({
      provider,
      walletAddress: '0x123',
    } as GetBalanceParams);

    expect(getERC20Balance).toBeCalledTimes(0);
    expect(getBalance).toBeCalledTimes(1);
    expect(getBalance).toBeCalledWith(checkout.config, provider, '0x123');
  });

  it('should call getERC20Balance when a contract address is provided', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    (getBalance as jest.Mock).mockResolvedValue({});
    (validateProvider as jest.Mock).mockResolvedValue(provider);

    await checkout.getBalance({
      provider,
      walletAddress: '0x123',
      tokenAddress: '0x456',
    } as GetBalanceParams);

    expect(getBalance).toBeCalledTimes(0);
    expect(getERC20Balance).toBeCalledTimes(1);
    expect(getERC20Balance).toBeCalledWith(provider, '0x123', '0x456');
  });

  it('should call getTokenInfo', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    (getERC20TokenInfo as jest.Mock).mockResolvedValue({});

    await checkout.getTokenInfo({
      provider,
      tokenAddress: '0x456',
    });

    expect(getERC20TokenInfo).toBeCalledTimes(1);
    expect(getERC20TokenInfo).toBeCalledWith(provider, '0x456');
  });

  it('should call the switchWalletNetwork function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    const switchWalletNetworkResult = {
      network: {
        name: ChainName.ETHEREUM,
        chainId: ChainId.ETHEREUM,
        nativeCurrency: {
          name: 'ETHEREUM',
          symbol: 'ETH',
          decimals: 18,
        },
        isSupported: true,
      },
      provider,
    };

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (switchWalletNetwork as jest.Mock).mockResolvedValue(switchWalletNetworkResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    await checkout.connect({
      provider,
    });

    const result = await checkout.switchNetwork({
      provider,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
    });

    expect(switchWalletNetwork).toBeCalledTimes(1);
    expect(switchWalletNetwork).toBeCalledWith(checkout.config, provider, ChainId.IMTBL_ZKEVM_TESTNET);
    expect(result).toEqual(switchWalletNetworkResult);
  });

  it('should call sendTransaction function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    (validateProvider as jest.Mock).mockResolvedValue(provider);

    const transaction = {
      nonce: '',
      gasPrice: '',
      gasLimit: '',
      to: '',
      from: '',
      value: '',
      data: '',
      chainId: ChainId.ETHEREUM,
    };

    await checkout.sendTransaction({
      provider,
      transaction,
    });

    expect(sendTransaction).toBeCalledTimes(1);
    expect(sendTransaction).toBeCalledWith(provider, transaction);
  });

  it('should call gasEstimate function', async () => {
    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      {} as Map<ChainId, ethers.providers.JsonRpcProvider>,
    );
    (gasEstimator as jest.Mock).mockResolvedValue({} as GasEstimateSwapResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    await checkout.gasEstimate({
      gasEstimateType: GasEstimateType.SWAP,
    });

    expect(gasEstimator).toBeCalledTimes(1);
    expect(gasEstimator).toBeCalledWith(
      {
        gasEstimateType: GasEstimateType.SWAP,
      },
      {},
      checkout.config,
    );
  });

  it('should call createProvider function', async () => {
    const createProviderResult = {
      provider: {} as Web3Provider,
      walletProviderName: WalletProviderName.METAMASK,
    };
    (createProvider as jest.Mock).mockResolvedValue(createProviderResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.createProvider({
      walletProviderName: WalletProviderName.METAMASK,
    });

    expect(createProvider).toBeCalledTimes(1);
    expect(createProvider).toBeCalledWith(
      WalletProviderName.METAMASK,
      undefined,
    );
    expect(result).toEqual(createProviderResult);
  });

  it('should call createProvider function for Passport wallet', async () => {
    (createProvider as jest.Mock).mockResolvedValue({});

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
      passport: {} as unknown as Passport,
    });

    await checkout.createProvider({
      walletProviderName: WalletProviderName.PASSPORT,
    });

    expect(createProvider).toBeCalledTimes(1);
    expect(createProvider).toBeCalledWith(
      WalletProviderName.PASSPORT,
      {} as unknown as Passport,
    );
  });

  it('should call checkIsWalletConnected function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    const checkIsWalletConnectedResult = {
      isConnected: true,
      walletAddress: '0x123',
    };

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (checkIsWalletConnected as jest.Mock).mockResolvedValue(checkIsWalletConnectedResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.checkIsWalletConnected({
      provider,
    });

    expect(checkIsWalletConnected).toBeCalledTimes(1);
    expect(checkIsWalletConnected).toBeCalledWith(provider);
    expect(result).toEqual(checkIsWalletConnectedResult);
  });

  it('should call getAllBalances function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    const getAllBalancesResult = {
      balances:
      [
        {
          balance: BigNumber.from('1'),
          formattedBalance: '1',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      ],
    };

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.getAllBalances({
      provider,
      walletAddress: '0x123',
      chainId: ChainId.ETHEREUM,
    });

    expect(getAllBalances).toBeCalledTimes(1);
    expect(getAllBalances).toBeCalledWith(
      checkout.config,
      provider,
      '0x123',
      ChainId.ETHEREUM,
    );
    expect(result).toEqual(getAllBalancesResult);
  });

  it('should call getNetworkAllowList function', async () => {
    const getNetworkAllowListResult = {
      networks: [
        {
          name: ChainName.ETHEREUM,
          chainId: ChainId.ETHEREUM,
          nativeCurrency: {
            name: 'ETHEREUM',
            symbol: 'ETH',
            decimals: 18,
          },
          isSupported: true,
        },
      ],
    };
    (getNetworkAllowList as jest.Mock).mockResolvedValue(getNetworkAllowListResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.getNetworkAllowList({
      type: NetworkFilterTypes.ALL,
    });

    expect(getNetworkAllowList).toBeCalledTimes(1);
    expect(getNetworkAllowList).toBeCalledWith(checkout.config, { type: NetworkFilterTypes.ALL });
    expect(result).toEqual(getNetworkAllowListResult);
  });

  it('should call getTokenAllowList function', async () => {
    const getTokenAllowListResult = {
      tokens: [
        {
          name: 'ETHEREUM',
          symbol: 'ETH',
          decimals: 18,
        },
      ],
    };
    (getTokenAllowList as jest.Mock).mockResolvedValue(getTokenAllowListResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.getTokenAllowList({
      type: TokenFilterTypes.ALL,
      chainId: ChainId.ETHEREUM,
    });

    expect(getTokenAllowList).toBeCalledTimes(1);
    expect(getTokenAllowList).toBeCalledWith(
      checkout.config,
      {
        type: TokenFilterTypes.ALL,
        chainId: ChainId.ETHEREUM,
      },
    );
    expect(result).toEqual(getTokenAllowListResult);
  });

  it('should call getWalletAllowList function', async () => {
    const walletAllowListResult = {
      wallets: [
        {
          walletProviderName: WalletProviderName.METAMASK,
          name: 'metamask',
        },
      ],
    };
    (getWalletAllowList as jest.Mock).mockResolvedValue(walletAllowListResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.getWalletAllowList({
      type: WalletFilterTypes.ALL,
    });

    expect(getWalletAllowList).toBeCalledTimes(1);
    expect(getWalletAllowList).toBeCalledWith({ type: WalletFilterTypes.ALL });
    expect(result).toEqual(walletAllowListResult);
  });

  it('should call getNetworkInfo function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    const networkInfoResult = {
      name: ChainName.ETHEREUM,
      chainId: ChainId.ETHEREUM,
      nativeCurrency: {
        name: 'ETHEREUM',
        symbol: 'ETH',
        decimals: 18,
      },
      isSupported: true,
    };

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (getNetworkInfo as jest.Mock).mockResolvedValue(networkInfoResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const result = await checkout.getNetworkInfo({
      provider,
    });

    expect(getNetworkInfo).toBeCalledTimes(1);
    expect(getNetworkInfo).toBeCalledWith(checkout.config, provider);
    expect(result).toEqual(networkInfoResult);
  });

  it('should call buy function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.SEPOLIA);
    const buyResult = {
      requirements: [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('1'),
        },
      ],
      gas: {
        type: GasTokenType.NATIVE,
        limit: BigNumber.from('1'),
      },
    };

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (buy as jest.Mock).mockResolvedValue(buyResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    await checkout.buy({
      provider,
      orders: [{ id: '1', takerFees: [] }],
    });

    expect(buy).toBeCalledTimes(1);
    expect(buy).toBeCalledWith(checkout.config, provider, [{ id: '1', takerFees: [] }], undefined);
  });

  it('should call sell function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.SEPOLIA);
    const sellResult = {};

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (sell as jest.Mock).mockResolvedValue(sellResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const orders = [{
      sellToken: {
        id: '0',
        collectionAddress: '0xERC721',
      },
      buyToken: {
        type: ItemType.NATIVE,
        amount: '10',
      } as BuyToken,
      makerFees: [
        {
          amount: { percentageDecimal: 0.025 },
          recipient: '0x222',
        },
      ],
    }];

    await checkout.sell({
      provider,
      orders,
    });

    expect(sell).toBeCalledTimes(1);
    expect(sell).toBeCalledWith(
      checkout.config,
      provider,
      orders,
    );
  });

  it('should call cancel function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.SEPOLIA);

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (cancel as jest.Mock).mockResolvedValue({});

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    await checkout.cancel({
      provider,
      orderIds: ['1234'],
    });

    expect(cancel).toBeCalledTimes(1);
    expect(cancel).toBeCalledWith(
      checkout.config,
      provider,
      ['1234'],
      undefined,
    );
  });

  it('should call smartCheckout function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.SEPOLIA);
    const smartCheckoutResult = {};

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);
    (getItemRequirementsFromRequirements as jest.Mock).mockResolvedValue([]);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const params: SmartCheckoutParams = {
      provider,
      itemRequirements: [],
      transactionOrGasAmount: {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from('1'),
        },
      },
    };
    await checkout.smartCheckout(params);

    expect(smartCheckout).toBeCalledTimes(1);
    expect(smartCheckout).toBeCalledWith(
      checkout.config,
      params.provider,
      params.itemRequirements,
      params.transactionOrGasAmount,
    );
  });

  it('should throw error for smartCheckout function if cannot get itemRequirements', async () => {
    const provider = new Web3Provider(providerMock, ChainId.IMTBL_ZKEVM_TESTNET);
    const smartCheckoutResult = {};

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (getItemRequirementsFromRequirements as jest.Mock).mockRejectedValue(new Error('Unable to get decimals'));
    (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const params: SmartCheckoutParams = {
      provider,
      itemRequirements: [{
        type: ItemType.ERC20,
        tokenAddress: '0xNOADDRESS',
        spenderAddress: '0xSPENDER',
        amount: '1.5',
      }],
      transactionOrGasAmount: {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from('1'),
        },
      },
    };

    let errMessage;
    let errType;
    try {
      await checkout.smartCheckout(params);
    } catch (err:any) {
      errMessage = err.message;
      errType = err.type;
    }
    expect(errMessage).toEqual('Failed to map item requirements');
    expect(errType).toEqual(CheckoutErrorType.ITEM_REQUIREMENTS_ERROR);
    expect(smartCheckout).toBeCalledTimes(0);
  });

  it('should call isWeb3Provider', async () => {
    (isWeb3Provider as jest.Mock).mockResolvedValue(true);
    const result = await Checkout.isWeb3Provider(new Web3Provider(providerMock, ChainId.ETHEREUM));
    expect(result).toBeTruthy();
  });

  describe('createFiatRampUrl', () => {
    let createWidgetUrlMock: jest.Mock;
    let checkout: Checkout;
    let mockProvider: Web3Provider;
    let networkInfoResult: NetworkInfo;
    let getTokenAllowListResult: GetTokenAllowListResult;

    const defaultWidgetUrl = 'https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2'
      + '&network=immutablezkevm&defaultPaymentMethod=credit_debit_card&disablePaymentMethods='
      + 'sepa_bank_transfer,gbp_bank_transfer,pm_cash_app,pm_jwire,pm_paymaya,pm_bpi,pm_ubp,pm_grabpay,'
      + 'pm_shopeepay,pm_gcash,pm_pix,pm_astropay,pm_pse,inr_bank_transfer&productsAvailed=buy'
      + '&exchangeScreenTitle=Buy&themeColor=0D0D0D';

    beforeEach(() => {
      createWidgetUrlMock = jest.fn().mockResolvedValue(defaultWidgetUrl);
      (FiatRampService as jest.Mock).mockReturnValue({
        createWidgetUrl: createWidgetUrlMock,
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
        network: {
          chainId: ChainId.ETHEREUM,
        },
      } as unknown as Web3Provider;

      networkInfoResult = {
        name: ChainName.ETHEREUM,
        chainId: ChainId.ETHEREUM,
        nativeCurrency: {
          name: 'ETHEREUM',
          symbol: 'ETH',
          decimals: 18,
        },
        isSupported: true,
      };
      (getNetworkInfo as jest.Mock).mockResolvedValue(networkInfoResult);

      getTokenAllowListResult = {
        tokens: [],
      };
      (getTokenAllowList as jest.Mock).mockResolvedValue(getTokenAllowListResult);

      checkout = new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      });
    });

    it(`should call FiatRampService.createWidgetUrl with correct params
      when only onRampProvider, exchangeType and web3Provider are provided`, async () => {
      const params: FiatRampParams = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: mockProvider,
      };

      await checkout.createFiatRampUrl(params);

      expect(createWidgetUrlMock).toBeCalledTimes(1);
      expect(createWidgetUrlMock).toBeCalledWith({
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0xADDRESS',
        tokenAmount: undefined,
        tokenSymbol: 'IMX',
        email: undefined,
        allowedTokens: [],
      });
    });

    it(`should call fiatRampService.createWidgetUrl with correct params
      when tokenAmount and tokenAddress are provided`, async () => {
      getTokenAllowListResult = {
        tokens: [
          {
            address: '0xaddr',
            decimals: 18,
          } as TokenInfo,
          {
            name: 'Ethereum',
            address: '0xethAddr',
            symbol: 'ETH',
            decimals: 18,
          } as TokenInfo,
          {
            name: 'Matic',
            address: '0xmaticAddr',
            symbol: 'MATIC',
            decimals: '18',
          },
        ],
      } as GetTokenAllowListResult;
      (getTokenAllowList as jest.Mock).mockResolvedValue(getTokenAllowListResult);

      const params: FiatRampParams = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: mockProvider,
        tokenAmount: '10',
        tokenAddress: '0xethAddr',
      };

      await checkout.createFiatRampUrl(params);

      expect(createWidgetUrlMock).toBeCalledTimes(1);
      expect(createWidgetUrlMock).toBeCalledWith({
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0xADDRESS',
        tokenAmount: '10',
        tokenSymbol: 'ETH',
        email: undefined,
        allowedTokens: ['ETH', 'MATIC'],
      });
    });

    it(`should call fiatRampService.createWidgetUrl with correct params
      when only tokenAmount is provided`, async () => {
      getTokenAllowListResult = {
        tokens: [
          {
            decimals: 18,
            symbol: 'IMX',
          } as TokenInfo,
          {
            name: 'Ethereum',
            address: '0xethAddr',
            symbol: 'ETH',
            decimals: 18,
          } as TokenInfo,
          {
            name: 'Matic',
            address: '0xmaticAddr',
            symbol: 'MATIC',
            decimals: '18',
          },
        ],
      } as GetTokenAllowListResult;
      (getTokenAllowList as jest.Mock).mockResolvedValue(getTokenAllowListResult);

      const params: FiatRampParams = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: mockProvider,
        tokenAmount: '10',
      };

      await checkout.createFiatRampUrl(params);

      expect(createWidgetUrlMock).toBeCalledTimes(1);
      expect(createWidgetUrlMock).toBeCalledWith({
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0xADDRESS',
        tokenAmount: '10',
        tokenSymbol: 'IMX',
        email: undefined,
        allowedTokens: ['IMX', 'ETH', 'MATIC'],
      });
    });

    it(`should call fiatRampService.createWidgetUrl with correct params
      when passport is provided`, async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        },
        provider: {
          isPassport: true,
        },
      } as unknown as Web3Provider;
      const mockUser: UserProfile = {
        sub: 'email|123',
        email: 'passport.user@immutable.com',
      };
      const mockPassport = {
        getUserInfo: jest.fn().mockResolvedValue(mockUser),
      } as unknown as Passport;
      (getTokenAllowList as jest.Mock).mockResolvedValue([]);

      const params: FiatRampParams = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: mockProvider,
        passport: mockPassport,
      };

      await checkout.createFiatRampUrl(params);

      expect(createWidgetUrlMock).toBeCalledTimes(1);
      expect(createWidgetUrlMock).toBeCalledWith({
        exchangeType: ExchangeType.ONRAMP,
        isPassport: true,
        walletAddress: '0xADDRESS',
        tokenAmount: undefined,
        tokenSymbol: 'IMX',
        email: mockUser.email,
      });
    });
  });

  describe('getExchangeFeeEstimate', () => {
    let feeEstimateMock: jest.Mock;
    let checkout: Checkout;

    const feeEstimate = {
      minPercentage: '3.5',
      maxPercentage: '5.5',
      feePercentage: undefined,
    };

    beforeEach(() => {
      feeEstimateMock = jest.fn().mockResolvedValue(feeEstimate);
      (FiatRampService as jest.Mock).mockReturnValue({
        feeEstimate: feeEstimateMock,
      });

      checkout = new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      });
    });

    it('should call fiatRampService.getExchangeFeeEstimate', async () => {
      await checkout.getExchangeFeeEstimate();

      expect(feeEstimateMock).toBeCalledTimes(1);
    });
  });

  describe('isSwapAvailable', () => {
    let checkout: Checkout;

    beforeEach(() => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockResolvedValue(true),
      });
      checkout = new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      });
    });

    it('should call availability.checkDexAvailability', async () => {
      await checkout.isSwapAvailable();

      expect(checkout.availability.checkDexAvailability).toBeCalledTimes(1);
    });
  });
});
