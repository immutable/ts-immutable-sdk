import { describe, expect, it } from '@jest/globals';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError } from 'errors';
import { ExchangeModuleConfiguration, ExchangeOverrides, TokenInfo } from '../types';
import { ExchangeConfiguration, ExchangeContracts } from './index';
import { POLYGON_TESTNET_CHAIN_ID } from '../constants/tokens/polygon';

describe('ExchangeConfiguration', () => {
  describe('when given sandbox environment with supported chain id', () => {
    it('should create successfully', () => {
      const baseConfig = new ImmutableConfiguration({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        environment: Environment.SANDBOX,
      });
      const exchangeConfiguration: ExchangeModuleConfiguration = {
        baseConfig,
        chainId: POLYGON_TESTNET_CHAIN_ID,
      };

      const config = new ExchangeConfiguration(exchangeConfiguration);
      expect(config.chain.chainId).toBe(POLYGON_TESTNET_CHAIN_ID);
      expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
    });
  });

  describe('when given sandbox environment with unsupported chain id', () => {
    it('should throw ChainNotSupportedError', () => {
      const baseConfig = new ImmutableConfiguration({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        environment: Environment.SANDBOX,
      });
      const exchangeConfiguration: ExchangeModuleConfiguration = {
        baseConfig,
        chainId: 1,
      };

      expect(() => new ExchangeConfiguration(exchangeConfiguration)).toThrow(
        new ChainNotSupportedError(1, Environment.SANDBOX),
      );
    });
  });

  describe('when given overrides', () => {
    it('should override any configuration with given values', () => {
      const chainId = 999999999;

      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // doesn't really matter what we use here because we'll be overriding all of the config values

      const contractOverrides: ExchangeContracts = {
        multicall: '0xabc',
        coreFactory: '0xabc',
        quoterV2: '0xabc',
        peripheryRouter: '0xabc',
        migrator: '0xabc',
        nonfungiblePositionManager: '0xabc',
        tickLens: '0xabc',
      };

      // This list can be updated with any Tokens that are deployed to the chain being configured
      // These tokens will be used to find available pools for a swap
      const commonRoutingTokens: TokenInfo[] = [
        {
          chainId,
          address: '0x12958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'FUN',
          name: 'The Fungibles Token',
        },
        {
          chainId,
          address: '0x22958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'USDC',
          name: 'US Dollar Coin',
        },
        {
          chainId,
          address: '0x32958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'WETH',
          name: 'Wrapped Ether',
        },
      ];

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens,
      };

      const config = new ExchangeConfiguration({
        chainId,
        baseConfig: immutableConfig,
        overrides,
      });

      expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
      expect(config.chain.chainId).toBe(chainId);
      expect(config.chain.rpcUrl).toBe(rpcURL);
      // contracts
      expect(config.chain.contracts.coreFactory).toBe(contractOverrides.coreFactory);
      expect(config.chain.contracts.migrator).toBe(contractOverrides.migrator);
      expect(config.chain.contracts.multicall).toBe(contractOverrides.multicall);
      expect(config.chain.contracts.nonfungiblePositionManager).toBe(contractOverrides.nonfungiblePositionManager);
      expect(config.chain.contracts.peripheryRouter).toBe(contractOverrides.peripheryRouter);
      expect(config.chain.contracts.quoterV2).toBe(contractOverrides.quoterV2);
      expect(config.chain.contracts.tickLens).toBe(contractOverrides.tickLens);
      // tokens
      expect(config.chain.commonRoutingTokens[0].address.toLocaleLowerCase())
        .toEqual(commonRoutingTokens[0].address.toLocaleLowerCase());

      expect(config.chain.commonRoutingTokens[1].address.toLowerCase())
        .toEqual(commonRoutingTokens[1].address.toLowerCase());

      expect(config.chain.commonRoutingTokens[2].address.toLowerCase())
        .toEqual(commonRoutingTokens[2].address.toLowerCase());
    });
  });
});
