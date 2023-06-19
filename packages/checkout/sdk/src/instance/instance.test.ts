import { Environment } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { ethers } from 'ethers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { ChainId } from '../types';
import { createBridgeInstance, createExchangeInstance } from './instance';

describe('instance', () => {
  describe('createBridgeInstance', () => {
    const readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>([
      [ChainId.SEPOLIA, new ethers.providers.JsonRpcProvider('sepolia')],
      [ChainId.IMTBL_ZKEVM_DEVNET, new ethers.providers.JsonRpcProvider('devnet')],
    ]);

    it('should create an instance of TokenBridge', async () => {
      const fromChainId = ChainId.SEPOLIA;
      const toChainId = ChainId.IMTBL_ZKEVM_DEVNET;
      const environment = Environment.SANDBOX;
      const bridge = await createBridgeInstance(fromChainId, toChainId, readOnlyProviders, environment);
      expect(bridge).toBeInstanceOf(TokenBridge);
    });

    it('should throw an error if unsupported root chain provider', async () => {
      const fromChainId = 123 as ChainId;
      const toChainId = ChainId.SEPOLIA;
      const environment = Environment.SANDBOX;

      await expect(createBridgeInstance(fromChainId, toChainId, readOnlyProviders, environment)).rejects.toThrowError(
        'Chain:123 is not a supported chain',
      );
    });

    it('should throw an error if unsupported child chain provider', async () => {
      const fromChainId = ChainId.IMTBL_ZKEVM_DEVNET;
      const toChainId = 123 as ChainId;
      const environment = Environment.SANDBOX;

      await expect(createBridgeInstance(fromChainId, toChainId, readOnlyProviders, environment)).rejects.toThrowError(
        'Chain:123 is not a supported chain',
      );
    });
  });

  describe('createExchangeInstance', () => {
    it('should create an instance of Exchange', async () => {
      const chainId = ChainId.ETHEREUM;
      const environment = Environment.SANDBOX;
      const exchange = await createExchangeInstance(chainId, environment);
      expect(exchange).toBeInstanceOf(Exchange);
    });
  });
});
