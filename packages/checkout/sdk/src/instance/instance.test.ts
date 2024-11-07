import { Environment } from '@imtbl/config';
import { Exchange, SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT } from '@imtbl/dex-sdk';
import { ethers, JsonRpcProvider } from 'ethers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { Orderbook } from '@imtbl/orderbook';
import { ChainId } from '../types';
import { createBridgeInstance, createExchangeInstance, createOrderbookInstance } from './instance';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { HttpClient } from '../api/http';

jest.mock('../instance');
jest.mock('../config/remoteConfigFetcher');

describe('instance', () => {
  (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
    getConfig: jest.fn().mockResolvedValue({
      secondaryFees: [{
        recipient: '0xa6C368164Eb270C31592c1830Ed25c2bf5D34BAE',
        basisPoints: 100,
      }],
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

  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config: CheckoutConfiguration = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  describe('createBridgeInstance', () => {
    const readOnlyProviders = new Map<
    ChainId,
    JsonRpcProvider
    >([
      [ChainId.SEPOLIA, new JsonRpcProvider('sepolia')],
      [
        ChainId.IMTBL_ZKEVM_TESTNET,
        new JsonRpcProvider('devnet'),
      ],
    ]);

    it('should create an instance of TokenBridge', () => {
      const fromChainId = ChainId.SEPOLIA;
      const toChainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const bridge = createBridgeInstance(
        fromChainId,
        toChainId,
        readOnlyProviders,
        config,
      );
      expect(bridge).toBeInstanceOf(TokenBridge);
    });

    it('should throw an error if unsupported root chain provider', () => {
      const fromChainId = 123 as ChainId;
      const toChainId = ChainId.SEPOLIA;

      expect(
        () => createBridgeInstance(fromChainId, toChainId, readOnlyProviders, config),
      ).toThrowError('Chain:123 is not a supported chain');
    });

    it('should throw an error if unsupported child chain provider', () => {
      const fromChainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const toChainId = 123 as ChainId;

      expect(
        () => createBridgeInstance(fromChainId, toChainId, readOnlyProviders, config),
      ).toThrowError('Chain:123 is not a supported chain');
    });
  });

  describe('createExchangeInstance', () => {
    it('should create an instance of Exchange', async () => {
      const chainId = Object.keys(
        SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT[config.environment],
      )[0] as unknown as number;
      const exchange = await createExchangeInstance(
        SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT[config.environment][chainId]
          .chainId,
        config,
      );
      expect(exchange).toBeInstanceOf(Exchange);
    });
  });

  describe('createOrderbookInstance', () => {
    it('should create an instance of Orderbook', () => {
      expect(createOrderbookInstance(
        config,
      )).toBeInstanceOf(Orderbook);
    });
  });
});
