/*
 * @jest-environment jsdom
 */
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { createProvider } from './provider';
import { switchWalletNetwork } from './network';

import { Checkout } from './Checkout';
import {
  ChainId, GetBalanceParams, WalletProviderName,
} from './types';
import { getBalance, getERC20Balance } from './balances';
import { sendTransaction } from './transaction';
import { CheckoutConfiguration } from './config';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');
jest.mock('./transaction');
jest.mock('./provider');

describe(' Connect', () => {
  const testCheckoutConfig = new CheckoutConfiguration({
    baseConfig: { environment: Environment.PRODUCTION },
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should call the createProvider function', async () => {
    const checkout = new Checkout({ baseConfig: { environment: Environment.PRODUCTION } });

    await checkout.createProvider({
      providerName: WalletProviderName.METAMASK,
    });

    expect(createProvider).toBeCalledTimes(1);
  });

  it('should call getBalance when no contract address provided', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    await checkout.getBalance({
      provider: {} as unknown as Web3Provider,
      walletAddress: '0x123',
    } as GetBalanceParams);
    expect(getERC20Balance).toBeCalledTimes(0);
    expect(getBalance).toBeCalledTimes(1);
    expect(getBalance).toBeCalledWith(testCheckoutConfig, undefined, '0x123');
  });

  it('should call getERC20Balance when a contract address is provided', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    await checkout.getBalance({
      provider: {} as unknown as Web3Provider,
      walletAddress: '0x123',
      contractAddress: '0x456',
    } as GetBalanceParams);
    expect(getBalance).toBeCalledTimes(0);
    expect(getERC20Balance).toBeCalledTimes(1);
    expect(getERC20Balance).toBeCalledWith(
      undefined,
      '0x123',
      '0x456',
    );
  });

  it('should call the switchWalletNetwork function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.createProvider({
      providerName: WalletProviderName.METAMASK,
    });

    await checkout.switchNetwork({
      provider: {
        provider: {
          request: () => {},
        },
      } as any as Web3Provider,
      chainId: ChainId.ETHEREUM,
    });

    expect(switchWalletNetwork).toBeCalledTimes(1);
  });

  it('should call sendTransaction function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.sendTransaction({
      provider: {} as Web3Provider,
      transaction: {
        nonce: '',
        gasPrice: '',
        gasLimit: '',
        to: '',
        from: '',
        value: '',
        data: '',
        chainId: 1,
      },
    });

    expect(sendTransaction).toBeCalledTimes(1);
  });
});
