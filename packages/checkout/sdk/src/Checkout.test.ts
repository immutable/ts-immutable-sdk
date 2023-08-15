/*
 * @jest-environment jsdom
 */
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { BigNumber, ethers } from 'ethers';
import { getNetworkAllowList, getNetworkInfo, switchWalletNetwork } from './network';

import { Checkout } from './Checkout';
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
  FulfilmentDetailsType,
  SmartCheckoutParams,
} from './types';
import { getAllBalances, getBalance, getERC20Balance } from './balances';
import { sendTransaction } from './transaction';
import { gasEstimator } from './gasEstimate';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';
import { checkIsWalletConnected, connectSite } from './connect';
import * as network from './network';
import { createProvider, isWeb3Provider, validateProvider } from './provider';
import { getTokenAllowList } from './tokens';
import { getWalletAllowList } from './wallet';
import { buy } from './buy';
import { smartCheckout } from './smartCheckout';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');
jest.mock('./transaction');
jest.mock('./gasEstimate/gasEstimator');
jest.mock('./readOnlyProviders/readOnlyProvider');
jest.mock('./provider');
jest.mock('./tokens');
jest.mock('./wallet');
jest.mock('./buy');
jest.mock('./smartCheckout');

describe('Connect', () => {
  let providerMock: ExternalProvider;

  beforeEach(() => {
    jest.resetAllMocks();

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

  it('should call the connectWalletProvider function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.connect({
      provider: new Web3Provider(providerMock, ChainId.ETHEREUM),
    });

    expect(connectSite).toBeCalledTimes(1);
    expect(getNetworkInfo).toBeCalledTimes(1);
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
      contractAddress: '0x456',
    } as GetBalanceParams);

    expect(getBalance).toBeCalledTimes(0);
    expect(getERC20Balance).toBeCalledTimes(1);
    expect(getERC20Balance).toBeCalledWith(provider, '0x123', '0x456');
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
      walletProvider: WalletProviderName.METAMASK,
    });

    expect(createProvider).toBeCalledTimes(1);
    expect(createProvider).toBeCalledWith(
      WalletProviderName.METAMASK,
    );
    expect(result).toEqual(createProviderResult);
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
      orderId: '1',
    });

    expect(buy).toBeCalledTimes(1);
    expect(buy).toBeCalledWith(checkout.config, provider, '1');
  });

  it('should call smartCheckout function', async () => {
    const provider = new Web3Provider(providerMock, ChainId.SEPOLIA);
    const smartCheckoutResult = {};

    (validateProvider as jest.Mock).mockResolvedValue(provider);
    (smartCheckout as jest.Mock).mockResolvedValue(smartCheckoutResult);

    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const params: SmartCheckoutParams = {
      provider,
      itemRequirements: [],
      txnOrGasAmount: {
        type: FulfilmentDetailsType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from('1'),
        },
      },
    };
    await checkout.smartCheckout(params);

    expect(smartCheckout).toBeCalledTimes(1);
    expect(smartCheckout).toBeCalledWith(params.provider, params.itemRequirements, params.txnOrGasAmount);
  });

  it('should call isWeb3Provider', async () => {
    (isWeb3Provider as jest.Mock).mockResolvedValue(true);
    const result = await Checkout.isWeb3Provider(new Web3Provider(providerMock, ChainId.ETHEREUM));
    expect(result).toBeTruthy();
  });
});
