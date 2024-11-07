import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { describe, expect } from '@jest/globals';
import { JsonRpcProvider } from 'ethers';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET, ZKEVM_DEVNET_CHAIN_ID } from '../constants/bridges';
import { BridgeConfiguration } from './index';
import { BridgeModuleConfiguration } from '../types';

describe('config', () => {
  const voidRootProvider = new JsonRpcProvider('x');
  const voidChildProvider = new JsonRpcProvider('y');
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
        `Bridge instance with rootchain 11155111 and childchain ${ZKEVM_DEVNET_CHAIN_ID} is not supported in environment production`,
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
          rootERC20BridgeFlowRate: '0x',
          childERC20Bridge: '0x',
          rootChainIMX: '0x',
          rootChainWrappedETH: '0x',
          childChainWrappedETH: '0x',
          childChainWrappedIMX: '0x',
        },
      },
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    };
    const bridgeConfig = new BridgeConfiguration(bridgeModuleConfiguration);
    expect(bridgeConfig.baseConfig.environment).toBe(Environment.PRODUCTION);
  });
});
