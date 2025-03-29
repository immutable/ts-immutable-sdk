import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ProviderConfiguration } from '../config';
import { MetaMaskIMXProvider } from './metaMaskWrapper';
import { connect } from './metaMask';
import {
  connect as buildImxSigner,
  disconnect as disconnectImxSigner,
} from '../imx-wallet/imxWallet';
import { ProviderError, ProviderErrorType } from '../errors/providerError';

jest.mock('./metaMask');
jest.mock('../imx-wallet/imxWallet');

describe('metaMetaWrapper', () => {
  const config = new ProviderConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.PRODUCTION,
    }),
  });

  describe('imxSigner undefined', () => {
    it('should throw error when calling sign message', async () => {
      await expect(
        MetaMaskIMXProvider.signMessage('Message to sign'),
      ).rejects.toThrow(
        new ProviderError(
          'Attempted to sign a message with the MetaMask IMX provider without an established connection',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR,
        ),
      );
    });

    it('should throw error when calling disconnect', async () => {
      await expect(MetaMaskIMXProvider.disconnect()).rejects.toThrow(
        new ProviderError(
          'Attempted to disconnect from the MetaMask IMX provider without an established connection',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR,
        ),
      );
    });
  });

  describe('connect', () => {
    it('should create a metamask imx provider with a eth signer and imx signer when calling connect', async () => {
      const ethSigner = {
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };
      const imxSigner = {
        getAddress: jest.fn().mockResolvedValue('0x456'),
        signMessage: jest.fn().mockResolvedValue('signed-message'),
      };

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });

      (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);

      const metamaskIMXProvider = await MetaMaskIMXProvider.connect(config);

      expect(connect).toBeCalledTimes(1);
      expect(connect).toBeCalledWith({ chainID: 1 });
      expect(buildImxSigner).toBeCalledTimes(1);
      expect(buildImxSigner).toBeCalledWith(
        { getSigner: getSignerMock },
        Environment.PRODUCTION,
      );
      expect(getSignerMock).toBeCalledTimes(1);
      expect(metamaskIMXProvider).toBeInstanceOf(MetaMaskIMXProvider);
    });

    it('should throw wallet connection error when wallet connect fails', async () => {
      (connect as jest.Mock).mockRejectedValue(
        new Error('The Metamask provider was not found'),
      );

      await expect(MetaMaskIMXProvider.connect(config)).rejects.toThrow(
        new ProviderError(
          'The Metamask provider was not found',
          ProviderErrorType.WALLET_CONNECTION_ERROR,
        ),
      );
    });

    it('should throw wallet connection error when imx connect fails', async () => {
      (connect as jest.Mock).mockResolvedValue({});
      (buildImxSigner as jest.Mock).mockRejectedValue(
        new Error('The L2 IMX Wallet connection has failed'),
      );

      await expect(MetaMaskIMXProvider.connect(config)).rejects.toThrow(
        new ProviderError(
          'The L2 IMX Wallet connection has failed',
          ProviderErrorType.WALLET_CONNECTION_ERROR,
        ),
      );
    });
  });

  describe('signMessage', () => {
    it('should call sign message on imx signer and return a string', async () => {
      const ethSigner = {
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };
      const imxSigner = {
        getAddress: jest.fn().mockResolvedValue('0x456'),
        signMessage: jest.fn().mockResolvedValue('signed-message'),
      };

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });
      (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);

      await MetaMaskIMXProvider.connect(config);
      const signedMessage = await MetaMaskIMXProvider.signMessage(
        'Message to sign',
      );

      expect(imxSigner.signMessage).toBeCalledTimes(1);
      expect(imxSigner.signMessage).toBeCalledWith('Message to sign');
      expect(signedMessage).toEqual('signed-message');
    });

    it('should throw provider error when error calling sign message', async () => {
      const ethSigner = {
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };
      const imxSigner = {
        getAddress: jest.fn().mockResolvedValue('0x456'),
        signMessage: jest.fn().mockRejectedValue(new Error('Sign message failed')),
      };

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });
      (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);

      await MetaMaskIMXProvider.connect(config);
      await expect(
        MetaMaskIMXProvider.signMessage('Message to sign'),
      ).rejects.toThrow(
        new ProviderError(
          'Sign message failed',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR,
        ),
      );
    });
  });

  describe('disconnect', () => {
    it('should call disconnect with the imx signer', async () => {
      const ethSigner = {
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };
      const imxSigner = {
        getAddress: jest.fn().mockResolvedValue('0x456'),
        signMessage: jest.fn().mockResolvedValue('signed-message'),
      };

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });
      (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);
      (disconnectImxSigner as jest.Mock).mockResolvedValue({});
      await MetaMaskIMXProvider.connect(config);
      await MetaMaskIMXProvider.disconnect();
      expect(disconnectImxSigner).toBeCalledTimes(1);
    });

    it('should throw provider error when error calling disconnect', async () => {
      const ethSigner = {
        getAddress: jest.fn().mockResolvedValue('0x123'),
      };
      const imxSigner = {
        getAddress: jest.fn().mockResolvedValue('0x456'),
        signMessage: jest.fn().mockResolvedValue('signed-message'),
      };

      const getSignerMock = jest.fn().mockReturnValue(ethSigner);
      (connect as jest.Mock).mockResolvedValue({
        getSigner: getSignerMock,
      });
      (buildImxSigner as jest.Mock).mockResolvedValue(imxSigner);
      (disconnectImxSigner as jest.Mock).mockRejectedValue(
        new Error('Error disconnecting'),
      );
      await MetaMaskIMXProvider.connect(config);
      await expect(MetaMaskIMXProvider.disconnect()).rejects.toThrow(
        new ProviderError(
          'Error disconnecting',
          ProviderErrorType.PROVIDER_CONNECTION_ERROR,
        ),
      );
    });
  });
});
