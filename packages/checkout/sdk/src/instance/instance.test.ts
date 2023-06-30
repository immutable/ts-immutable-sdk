import { Environment } from '@imtbl/config';
import { Exchange, SupportedChainIdsForEnvironment } from '@imtbl/dex-sdk';
import { ethers } from 'ethers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { ChainId } from '../types';
import { createBridgeInstance, createExchangeInstance } from './instance';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';

jest.mock('../instance');
jest.mock('../config/remoteConfigFetcher');

describe('instance', () => {
  (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
    get: jest.fn().mockResolvedValue({
      overrides: {
        rpcURL: 'https://test',
        commonRoutingTokens: [
          {
            chainId: ChainId.IMTBL_ZKEVM_DEVNET,
            address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
            decimals: 18,
            symbol: 'FUN',
          },
        ],
        exchangeContracts: {
          multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
        },
        nativeToken: {
          chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        },
      },
    }),
  });

  const config: CheckoutConfiguration = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  describe('createBridgeInstance', () => {
    const readOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >([
      [ChainId.SEPOLIA, new ethers.providers.JsonRpcProvider('sepolia')],
      [
        ChainId.IMTBL_ZKEVM_TESTNET,
        new ethers.providers.JsonRpcProvider('devnet'),
      ],
    ]);

    it('should create an instance of TokenBridge', async () => {
      const fromChainId = ChainId.SEPOLIA;
      const toChainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const bridge = await createBridgeInstance(
        fromChainId,
        toChainId,
        readOnlyProviders,
        config,
      );
      expect(bridge).toBeInstanceOf(TokenBridge);
    });

    it('should throw an error if unsupported root chain provider', async () => {
      const fromChainId = 123 as ChainId;
      const toChainId = ChainId.SEPOLIA;

      await expect(
        createBridgeInstance(
          fromChainId,
          toChainId,
          readOnlyProviders,
          config,
        ),
      ).rejects.toThrowError('Chain:123 is not a supported chain');
    });

    it('should throw an error if unsupported child chain provider', async () => {
      const fromChainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const toChainId = 123 as ChainId;

      await expect(
        createBridgeInstance(
          fromChainId,
          toChainId,
          readOnlyProviders,
          config,
        ),
      ).rejects.toThrowError('Chain:123 is not a supported chain');
    });
  });

  describe('createExchangeInstance', () => {
    it('should create an instance of Exchange', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({}),
      });

      const chainId = Object.keys(SupportedChainIdsForEnvironment[config.environment])[0] as unknown as number;
      const exchange = await createExchangeInstance(
        SupportedChainIdsForEnvironment[config.environment][chainId].chainId,
        config,
      );
      expect(exchange).toBeInstanceOf(Exchange);
    });
  });
});
