import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { MetaMaskIMXProvider } from './metaMaskWrapper';
import { connect } from './metaMask';
import {
  connect as buildStarkSigner,
  disconnect as disconnectStarkSigner,
} from '../imx-wallet/imxWallet';
import { ProviderError, ProviderErrorType } from '../errors/providerError';
import { ProviderConfiguration } from 'config';

jest.mock('./metaMask');
jest.mock('../imx-wallet/imxWallet');

describe('metaMetaWrapper', () => {
  const config = new ProviderConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.PRODUCTION,
    }),
  });

  describe('starkSigner undefined', () => {
    it('should throw error when calling sign message', async () => {
      await expect(
        MetaMaskIMXProvider.signMessage('Message to sign')
      ).rejects.toThrow(
        new ProviderError(
          'Attempted to sign a message with the MetaMask IMX provider without an established connection',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR
        )
      );
    });

    it('should throw error when calling disconnect', async () => {
      await expect(MetaMaskIMXProvider.disconnect()).rejects.toThrow(
        new ProviderError(
          'Attempted to disconnect from the MetaMask IMX provider without an established connection',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR
        )
      );
    });
  });

  describe('connect', () => {
    it('should create a metamask imx provider with a eth signer and imx signer when calling connect', async () => {
      const ethSigner = {};
      const starkSigner = {};

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });

      (buildStarkSigner as jest.Mock).mockResolvedValue(starkSigner);

      const metamaskIMXProvider = await MetaMaskIMXProvider.connect(config);

      expect(connect).toBeCalledTimes(1);
      expect(connect).toBeCalledWith({ chainID: 1 });
      expect(buildStarkSigner).toBeCalledTimes(1);
      expect(buildStarkSigner).toBeCalledWith(
        { getSigner: getSignerMock },
        Environment.PRODUCTION
      );
      expect(getSignerMock).toBeCalledTimes(1);
      expect(metamaskIMXProvider).toBeInstanceOf(MetaMaskIMXProvider);
    });

    it('should throw wallet connection error when wallet connect fails', async () => {
      (connect as jest.Mock).mockRejectedValue(
        new Error('The Metamask provider was not found')
      );

      await expect(MetaMaskIMXProvider.connect(config)).rejects.toThrow(
        new ProviderError(
          'The Metamask provider was not found',
          ProviderErrorType.WALLET_CONNECTION_ERROR
        )
      );
    });

    it('should throw wallet connection error when imx connect fails', async () => {
      (connect as jest.Mock).mockResolvedValue({});
      (buildStarkSigner as jest.Mock).mockRejectedValue(
        new Error('The L2 IMX Wallet connection has failed')
      );

      await expect(MetaMaskIMXProvider.connect(config)).rejects.toThrow(
        new ProviderError(
          'The L2 IMX Wallet connection has failed',
          ProviderErrorType.WALLET_CONNECTION_ERROR
        )
      );
    });
  });

  describe('signMessage', () => {
    it('should call sign message on imx signer and return a string', async () => {
      const getSignerMock = jest.fn().mockReturnValue({});
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });
      const signMessageMock = jest.fn().mockReturnValue('Signed message');
      (buildStarkSigner as jest.Mock).mockResolvedValue({
        signMessage: signMessageMock,
      });

      await MetaMaskIMXProvider.connect(config);
      const signedMessage = await MetaMaskIMXProvider.signMessage(
        'Message to sign'
      );

      expect(signMessageMock).toBeCalledTimes(1);
      expect(signMessageMock).toBeCalledWith('Message to sign');
      expect(signedMessage).toEqual('Signed message');
    });

    it('should throw provider error when error calling sign message', async () => {
      (connect as jest.Mock).mockResolvedValue({
        getSigner: jest.fn().mockReturnValue({}),
      });
      (buildStarkSigner as jest.Mock).mockResolvedValue({
        signMessage: jest
          .fn()
          .mockRejectedValue(new Error('Error signing the message')),
      });
      await MetaMaskIMXProvider.connect(config);
      await expect(
        MetaMaskIMXProvider.signMessage('Message to sign')
      ).rejects.toThrow(
        new ProviderError(
          'Error signing the message',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR
        )
      );
    });
  });

  describe('disconnect', () => {
    it('should call disconnect with the imx signer', async () => {
      (connect as jest.Mock).mockResolvedValue({
        getSigner: jest.fn(),
      });
      (buildStarkSigner as jest.Mock).mockResolvedValue({});
      (disconnectStarkSigner as jest.Mock).mockResolvedValue({});
      await MetaMaskIMXProvider.connect(config);
      await MetaMaskIMXProvider.disconnect();
      expect(disconnectStarkSigner).toBeCalledTimes(1);
    });

    it('should throw provider error when error calling disconnect', async () => {
      (connect as jest.Mock).mockResolvedValue({
        getSigner: jest.fn().mockReturnValue({}),
      });
      (buildStarkSigner as jest.Mock).mockResolvedValue({});
      (disconnectStarkSigner as jest.Mock).mockRejectedValue(
        new Error('Error disconnecting')
      );
      await MetaMaskIMXProvider.connect(config);
      await expect(MetaMaskIMXProvider.disconnect()).rejects.toThrow(
        new ProviderError(
          'Error disconnecting',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR
        )
      );
    });
  });
});
