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
        exchangeContracts: {
          multicall: '0xb18c44b211065E69844FbA9AE146DA362104AfBf',
          coreFactory: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',
          quoterV2: '0xF674847fBcca5C80315e3AE37043Dce99F6CC529',
          peripheryRouter: '0x0Afe6F5f4DC34461A801420634239FFaD50A2e44',
          migrator: '0xbF6943Ce1614e95203Cce415De63993eEa68aaF4',
          nonfungiblePositionManager: '0xC283F434172D36BBC1C03B601ACd40C3a07585bd',
          tickLens: '0x4DB567A44451b27C1fAd7f52e1cDf64b915d62f9',
        },
        commonRoutingTokens: [
          {
            chainId: ChainId.IMTBL_ZKEVM_DEVNET,
            address: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
            decimals: 18,
            symbol: 'zkONE',
            name: 'The zkONE Token',
          },
        ],
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
