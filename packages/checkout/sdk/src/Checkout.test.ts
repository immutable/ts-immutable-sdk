/*
 * @jest-environment jsdom
 */
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { connectWalletProvider } from './connect';
import { getNetworkInfo, switchWalletNetwork } from './network';

import { Checkout } from './Checkout';
import { ChainId, ConnectionProviders, GetBalanceParams } from './types';
import { getBalance, getERC20Balance } from './balances';
import { sendTransaction } from './transaction';
import { CheckoutError, CheckoutErrorType } from './errors';
import { CheckoutConfiguration } from './config';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');
jest.mock('./transaction');

describe(' Connect', () => {
  const testCheckoutConfig = new CheckoutConfiguration({
    baseConfig: { environment: Environment.PRODUCTION },
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should call the connectWalletProvider function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.connect({
      providerPreference: ConnectionProviders.METAMASK,
    });

    expect(connectWalletProvider).toBeCalledTimes(1);
    expect(getNetworkInfo).toBeCalledTimes(1);
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
    expect(getBalance).toBeCalledWith(
      testCheckoutConfig,
      {} as unknown as Web3Provider,
      '0x123',
    );
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
      {} as unknown as Web3Provider,
      '0x123',
      '0x456',
    );
  });

  it('should call the switchWalletNetwork function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await checkout.connect({
      providerPreference: ConnectionProviders.METAMASK,
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

  it('should throw error when calling the switchWalletNetwork function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    await expect(
      checkout.switchNetwork({
        provider: {
          provider: {
            request: () => {},
          },
        } as any as Web3Provider,
        chainId: ChainId.ETHEREUM,
      }),
    ).rejects.toThrow(
      new CheckoutError(
        'connect should be called before switchNetwork to set the provider preference',
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR,
      ),
    );
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
