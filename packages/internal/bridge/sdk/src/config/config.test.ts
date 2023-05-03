import { describe, expect, it } from '@jest/globals';
import { BridgeModuleConfiguration } from '../types';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { BridgeConfiguration } from './index';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';

describe('config', () => {
  it('should create successfully', () => {
    const bridgeModuleConfiguration: BridgeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
    };

    const bridgeConfig = new BridgeConfiguration(bridgeModuleConfiguration);
    expect(bridgeConfig.baseConfig.environment).toBe(Environment.SANDBOX);
  });

  it('throw error if bridge not supported on chain without overrides', () => {
    const bridgeModuleConfiguration: BridgeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.PRODUCTION,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
    };

    expect(() => new BridgeConfiguration(bridgeModuleConfiguration)).toThrow(
      new Error(
        'Bridge instance with rootchain eip155:11155111 and childchain eip155:13373 is not supported in environment production'
      )
    );
  });
  it('valid configuration if overrides used', () => {
    const bridgeModuleConfiguration: BridgeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.PRODUCTION,
      }),
      bridgeInstance: { rootChainID: 'eip155:789', childChainID: 'eip155:987' },
      overrides: {
        bridgeContracts: {
          rootChainERC20Predicate: '0x',
          rootChainStateSender: '0x',
          childChainERC20Predicate: '0x',
          childChainStateReceiver: '0x',
        },
      },
    };
    const bridgeConfig = new BridgeConfiguration(bridgeModuleConfiguration);
    expect(bridgeConfig.baseConfig.environment).toBe(Environment.PRODUCTION);
  });
});
