import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { describe, expect } from '@jest/globals';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET, ZKEVM_DEVNET_CHAIN_ID } from 'constants/bridges';
import { ethers } from 'ethers';
import { BridgeConfiguration } from './index';
import { BridgeModuleConfiguration } from '../types';

describe('config', () => {
  const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
  const voidChildProvider = new ethers.providers.JsonRpcProvider('y');
  it('should create successfully', () => {
    const bridgeModuleConfiguration: BridgeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
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
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    };

    expect(() => new BridgeConfiguration(bridgeModuleConfiguration)).toThrow(
      new Error(
        `Bridge instance with rootchain eip155:11155111 and childchain ${ZKEVM_DEVNET_CHAIN_ID} is not supported in environment production`,
      ),
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
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    };
    const bridgeConfig = new BridgeConfiguration(bridgeModuleConfiguration);
    expect(bridgeConfig.baseConfig.environment).toBe(Environment.PRODUCTION);
  });
});
