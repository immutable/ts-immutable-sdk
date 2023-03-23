/*
 * @jest-environment jsdom
 */
import { connectWalletProvider, getNetworkInfo } from './connect';

import { CheckoutSDK } from './CheckoutSDK';
import { switchWalletNetwork } from './network';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, ConnectionProviders, GetBalanceParams } from './types';
import { getBalance, getERC20Balance } from './balances';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');

describe('CheckoutSDK Connect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should call the connectWalletProvider function', async () => {
    const checkoutSDK = new CheckoutSDK();

    await checkoutSDK.connect({
      providerPreference: ConnectionProviders.METAMASK,
    });

    expect(connectWalletProvider).toBeCalledTimes(1);
    expect(getNetworkInfo).toBeCalledTimes(1);
  });

  it('should call getBalance when no contract address provided', async () => {
    const checkoutSDK = new CheckoutSDK();
    await checkoutSDK.getBalance({
      provider: {} as unknown as Web3Provider,
      walletAddress: '0x123',
    } as GetBalanceParams);
    expect(getERC20Balance).toBeCalledTimes(0);
    expect(getBalance).toBeCalledTimes(1);
    expect(getBalance).toBeCalledWith({} as unknown as Web3Provider, '0x123');
  });

  it('should call getERC20Balance when a contract address is provided', async () => {
    const checkoutSDK = new CheckoutSDK();
    await checkoutSDK.getBalance({
      provider: {} as unknown as Web3Provider,
      walletAddress: '0x123',
      contractAddress: '0x456',
    } as GetBalanceParams);
    expect(getBalance).toBeCalledTimes(0);
    expect(getERC20Balance).toBeCalledTimes(1);
    expect(getERC20Balance).toBeCalledWith(
      {} as unknown as Web3Provider,
      '0x123',
      '0x456'
    );
  });

  it('should call the switchWalletNetwork function', async () => {
    const checkoutSDK = new CheckoutSDK();

    await checkoutSDK.switchNetwork({
      provider: {} as Web3Provider,
      chainId: ChainId.ETHEREUM,
    });

    expect(switchWalletNetwork).toBeCalledTimes(1);
  });
});
