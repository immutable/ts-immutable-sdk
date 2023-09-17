import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import {
  allowListCheck, allowListCheckForBridge, allowListCheckForOnRamp, allowListCheckForSwap,
} from './allowListCheck';
import {
  BridgeConfig,
  ChainId,
  DexConfig,
  IMX_ADDRESS_ZKEVM,
  OnRampConfig, OnRampProvider,
  OnRampProviderConfig,
} from '../../types';
import { TokenBalanceResult } from '../routing/types';
import { RemoteConfigFetcher } from '../../config/remoteConfigFetcher';

jest.mock('../../config/remoteConfigFetcher');

describe('allowListCheck', () => {
  let config: CheckoutConfiguration;
  let dexConfig: DexConfig;
  let bridgeConfig: BridgeConfig;
  let onRampConfig: OnRampConfig;
  let balances: Map<ChainId, TokenBalanceResult>;

  beforeEach(() => {
    jest.resetAllMocks();
    (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
      getConfig: jest.fn().mockImplementation((key) => {
        let remoteConfig: any;
        // eslint-disable-next-line default-case
        switch (key) {
          case 'bridge':
            remoteConfig = bridgeConfig;
            break;
          case 'dex':
            remoteConfig = dexConfig;
            break;
          case 'onramp':
            remoteConfig = onRampConfig;
            break;
        }
        return remoteConfig;
      }),
    });

    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    dexConfig = {
      tokens: [{
        address: IMX_ADDRESS_ZKEVM,
        decimals: 18,
        symbol: 'IMX',
        name: 'IMX',
      }],
    };
    bridgeConfig = {
      tokens: [{
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
      }],
    };
    onRampConfig = {
      [OnRampProvider.TRANSAK]: {
        publishableApiKey: '',
        tokens: [{
          address: IMX_ADDRESS_ZKEVM,
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        }],
        fees: {},
      } as OnRampProviderConfig,
    };
    balances = new Map<ChainId, TokenBalanceResult>([
      [ChainId.IMTBL_ZKEVM_TESTNET, {
        success: true,
        balances: [
          {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              address: IMX_ADDRESS_ZKEVM,
              decimals: 18,
              symbol: 'IMX',
              name: 'IMX',
            },
          },
          {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      }],
      [ChainId.SEPOLIA, {
        success: true,
        balances: [
          {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      }],
    ]);
  });

  describe('allowListCheck', () => {
    it('should return all route option allowlists when options enabled', async () => {
      const availableRoutingOptions = { swap: true, bridge: true, onRamp: true };

      const allowList = await allowListCheck(config, balances, availableRoutingOptions);
      expect(allowList).toEqual({
        swap: [{
          address: IMX_ADDRESS_ZKEVM,
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        }],
        bridge: [{
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        }],
        onRamp: {
          [OnRampProvider.TRANSAK]: [{
            address: IMX_ADDRESS_ZKEVM,
            decimals: 18,
            symbol: 'IMX',
            name: 'IMX',
          }],
        },
      });
    });

    it('should return only bridge allowlist when bridge option enabled', async () => {
      const availableRoutingOptions = { swap: false, bridge: true, onRamp: false };

      const allowList = await allowListCheck(config, balances, availableRoutingOptions);
      expect(allowList).toEqual({
        bridge: [{
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        }],
        onRamp: {},
        swap: [],
      });
    });

    it('should return only swap allowlist when swap option enabled', async () => {
      const availableRoutingOptions = { swap: true, bridge: false, onRamp: false };

      const allowList = await allowListCheck(config, balances, availableRoutingOptions);
      expect(allowList).toEqual({
        bridge: [],
        onRamp: {},
        swap: [{
          address: IMX_ADDRESS_ZKEVM,
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        }],
      });
    });

    it('should return only onRamp allowlist when onRamp option enabled', async () => {
      const availableRoutingOptions = { swap: false, bridge: false, onRamp: true };

      const allowList = await allowListCheck(config, balances, availableRoutingOptions);
      expect(allowList).toEqual({
        bridge: [],
        onRamp: {
          [OnRampProvider.TRANSAK]: [{
            address: IMX_ADDRESS_ZKEVM,
            decimals: 18,
            symbol: 'IMX',
            name: 'IMX',
          }],
        },
        swap: [],
      });
    });

    it('should return no allowlist tokens when all options disabled', async () => {
      const availableRoutingOptions = { swap: false, bridge: false, onRamp: false };

      const allowList = await allowListCheck(config, balances, availableRoutingOptions);
      expect(allowList).toEqual({
        bridge: [],
        onRamp: {},
        swap: [],
      });
    });
  });

  describe('allowListCheckForBridge', () => {
    it('should return bridge allowlist', async () => {
      const result = await allowListCheckForBridge(config, balances, { bridge: true });
      expect(result).toEqual([{
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
      }]);
    });

    it('should return bridge allowlist with ERC20 and Native', async () => {
      balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.SEPOLIA, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                address: '0x0000000',
                decimals: 18,
                symbol: 'MEGA',
                name: 'Mega',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      bridgeConfig = {
        tokens: [{
          address: '0x0000000',
          decimals: 18,
          symbol: 'MEGA',
          name: 'Mega',
        },
        {
          decimals: 18,
          symbol: 'ETH',
          name: 'Ethereum',
        }],
      };

      const result = await allowListCheckForBridge(config, balances, { bridge: true });
      expect(result).toEqual([{
        address: '0x0000000',
        decimals: 18,
        symbol: 'MEGA',
        name: 'Mega',
      },
      {
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
      }]);
    });

    it('should return an empty array if bridge option is disabled', async () => {
      const result = await allowListCheckForBridge(config, balances, { bridge: false });
      expect(result).toEqual([]);
    });

    it('should return an empty array if there are no balances', async () => {
      const result = await allowListCheckForBridge(config, new Map(), { bridge: true });
      expect(result).toEqual([]);
    });

    it('should return an empty array if bridge allowlist is empty', async () => {
      bridgeConfig = {
        tokens: [],
      };

      const result = await allowListCheckForBridge(config, balances, { bridge: true });
      expect(result).toEqual([]);
    });

    it('should return an empty array if allowlist tokens have no balance', async () => {
      bridgeConfig = {
        tokens: [{
          address: '0x0000000',
          decimals: 18,
          symbol: 'MEGA',
          name: 'Mega',
        }],
      };

      const result = await allowListCheckForBridge(config, balances, { bridge: true });
      expect(result).toEqual([]);
    });
  });

  describe('allowListCheckForSwap', () => {
    it('should return swap allowlist', async () => {
      const result = await allowListCheckForSwap(config, balances, { swap: true });
      expect(result).toEqual([{
        address: IMX_ADDRESS_ZKEVM,
        decimals: 18,
        symbol: 'IMX',
        name: 'IMX',
      }]);
    });

    it('should return an empty array if swap option is disabled', async () => {
      const result = await allowListCheckForSwap(config, balances, { swap: false });
      expect(result).toEqual([]);
    });

    it('should return an empty array if there are no balances', async () => {
      const result = await allowListCheckForSwap(config, new Map(), { bridge: true });
      expect(result).toEqual([]);
    });

    it('should return an empty array if swap allowlist is empty', async () => {
      dexConfig = {
        tokens: [],
      };

      const result = await allowListCheckForSwap(config, balances, { swap: true });
      expect(result).toEqual([]);
    });

    it('should return an empty array if allowlist tokens have no balance', async () => {
      dexConfig = {
        tokens: [{
          address: '0x0000000',
          decimals: 18,
          symbol: 'MEGA',
          name: 'Mega',
        }],
      };

      const result = await allowListCheckForSwap(config, balances, { swap: true });
      expect(result).toEqual([]);
    });
  });

  describe('allowListCheckForOnRamp', () => {
    it('should return onRamp allowlist', async () => {
      const result = await allowListCheckForOnRamp(config, { onRamp: true });
      expect(result).toEqual({
        [OnRampProvider.TRANSAK]: [{
          address: IMX_ADDRESS_ZKEVM,
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        }],
      });
    });

    it('should return an empty object if onRamp option is disabled', async () => {
      const result = await allowListCheckForOnRamp(config, { onRamp: false });
      expect(result).toEqual({});
    });

    it('should return an empty object if no onRamp providers configured', async () => {
      onRampConfig = {};

      const result = await allowListCheckForOnRamp(config, { onRamp: true });
      expect(result).toEqual({});
    });

    it('should return an empty array if onRamp allowlist is empty', async () => {
      onRampConfig = {
        [OnRampProvider.TRANSAK]: {
          publishableApiKey: '',
          tokens: [],
          fees: {},
        } as OnRampProviderConfig,
      };

      const result = await allowListCheckForOnRamp(config, { onRamp: true });
      expect(result).toEqual({
        [OnRampProvider.TRANSAK]: [],
      });
    });
  });
});
