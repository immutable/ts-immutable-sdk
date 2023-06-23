/*
 * @jest-environment jsdom
 */
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import { getNetworkInfo, switchWalletNetwork } from './network';

import { Checkout } from './Checkout';
import {
  ChainId,
  GetBalanceParams,
  GetNetworkAllowListResult,
  GasEstimateSwapResult,
  GasEstimateType,
} from './types';
import { getBalance, getERC20Balance } from './balances';
import { sendTransaction } from './transaction';
import { CheckoutConfiguration } from './config';
import { gasEstimator } from './gasEstimate';
import { createReadOnlyProviders } from './readOnlyProviders/readOnlyProvider';
import { connectSite } from './connect';
import * as network from './network';

jest.mock('./connect');
jest.mock('./network');
jest.mock('./balances');
jest.mock('./transaction');
jest.mock('./gasEstimate/gasEstimator');
jest.mock('./readOnlyProviders/readOnlyProvider');

describe('Connect', () => {
  const testCheckoutConfig = new CheckoutConfiguration({
    baseConfig: { environment: Environment.PRODUCTION },
  });
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
          chainId: 1,
          name: 'Ethereum',
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
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    await checkout.getBalance({
      provider,
      walletAddress: '0x123',
    } as GetBalanceParams);

    expect(getERC20Balance).toBeCalledTimes(0);
    expect(getBalance).toBeCalledTimes(1);
    expect(getBalance).toBeCalledWith(testCheckoutConfig, provider, '0x123');
  });

  it('should call getERC20Balance when a contract address is provided', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
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
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    await checkout.connect({
      provider,
    });

    await checkout.switchNetwork({
      provider,
      chainId: ChainId.IMTBL_ZKEVM_DEVNET,
    });

    expect(switchWalletNetwork).toBeCalledTimes(1);
  });

  it('should call sendTransaction function', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const provider = new Web3Provider(providerMock, ChainId.ETHEREUM);
    await checkout.sendTransaction({
      provider,
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
  });
});
