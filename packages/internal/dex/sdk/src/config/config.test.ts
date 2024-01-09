import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError, InvalidConfigurationError } from 'errors';
import * as test from 'test/utils';
import { ERC20 } from 'types';
import { ExchangeContracts, ExchangeModuleConfiguration, ExchangeOverrides } from '../types';
import { ExchangeConfiguration } from './index';
import { IMMUTABLE_TESTNET_CHAIN_ID } from '../constants/chains';

describe('ExchangeConfiguration', () => {
  const chainId = 999999999;
  // This list can be updated with any Tokens that are deployed to the chain being configured
  // These tokens will be used to find available pools for a swap
  const commonRoutingTokensSingle: ERC20[] = [
    {
      type: 'erc20',
      chainId,
      address: '0x12958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
      decimals: 18,
      symbol: 'FUN',
      name: 'The Fungibles Token',
    },
  ];

  const contractOverrides: ExchangeContracts = {
    multicall: test.TEST_MULTICALL_ADDRESS,
    coreFactory: test.TEST_V3_CORE_FACTORY_ADDRESS,
    quoter: test.TEST_QUOTER_ADDRESS,
    swapRouter: test.TEST_ROUTER_ADDRESS,
    immutableSwapProxy: test.TEST_SWAP_PROXY_ADDRESS,
  };

  describe('when given sandbox environment with supported chain id', () => {
    it('should create successfully', () => {
      const baseConfig = new ImmutableConfiguration({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        environment: Environment.SANDBOX,
      });
      const exchangeConfiguration: ExchangeModuleConfiguration = {
        baseConfig,
        chainId: IMMUTABLE_TESTNET_CHAIN_ID,
      };

      const config = new ExchangeConfiguration(exchangeConfiguration);
      expect(config.chain.chainId).toBe(IMMUTABLE_TESTNET_CHAIN_ID);
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
      const dummyFeeRecipient = '0xb18c44b211065E69844FbA9AE146DA362104AfBf';

      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      // This list can be updated with any Tokens that are deployed to the chain being configured
      // These tokens will be used to find available pools for a swap
      const commonRoutingTokens: ERC20[] = [
        {
          type: 'erc20',
          chainId,
          address: '0x12958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'FUN',
          name: 'The Fungibles Token',
        },
        {
          type: 'erc20',
          chainId,
          address: '0x22958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'USDC',
          name: 'US Dollar Coin',
        },
        {
          type: 'erc20',
          chainId,
          address: '0x32958b06abdf2701ace6ceb3ce0b8b1ce11e0851',
          decimals: 18,
          symbol: 'WETH',
          name: 'Wrapped Ether',
        },
      ];

      const secondaryFees = [
        {
          recipient: dummyFeeRecipient,
          basisPoints: 100,
        },
      ];

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      const config = new ExchangeConfiguration({
        baseConfig: immutableConfig,
        chainId,
        secondaryFees,
        overrides,
      });

      expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
      expect(config.chain.chainId).toBe(chainId);
      expect(config.chain.rpcUrl).toBe(rpcURL);
      // contracts
      expect(config.chain.contracts.coreFactory).toBe(contractOverrides.coreFactory);
      expect(config.chain.contracts.multicall).toBe(contractOverrides.multicall);
      expect(config.chain.contracts.swapRouter).toBe(contractOverrides.swapRouter);
      expect(config.chain.contracts.quoter).toBe(contractOverrides.quoter);
      // tokens
      expect(config.chain.commonRoutingTokens[0].address.toLocaleLowerCase()).toEqual(
        commonRoutingTokens[0].address.toLocaleLowerCase(),
      );

      expect(config.chain.commonRoutingTokens[1].address.toLowerCase()).toEqual(
        commonRoutingTokens[1].address.toLowerCase(),
      );

      expect(config.chain.commonRoutingTokens[2].address.toLowerCase()).toEqual(
        commonRoutingTokens[2].address.toLowerCase(),
      );

      expect(config.secondaryFees).toBeDefined();
      if (!config.secondaryFees) {
        // This should never happen
        throw new Error('Secondary fees should be defined');
      }
      expect(config.secondaryFees[0].recipient.toLowerCase()).toEqual(dummyFeeRecipient.toLowerCase());
      expect(config.secondaryFees[0].basisPoints.toString()).toEqual(secondaryFees[0].basisPoints.toString());
    });

    it('should throw when missing configuration', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      const invalidContractOverrides: ExchangeContracts = {
        multicall: '',
        coreFactory: test.TEST_V3_CORE_FACTORY_ADDRESS,
        quoter: test.TEST_QUOTER_ADDRESS,
        swapRouter: test.TEST_ROUTER_ADDRESS,
        immutableSwapProxy: test.TEST_SWAP_PROXY_ADDRESS,
      };

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: invalidContractOverrides,
        commonRoutingTokens: commonRoutingTokensSingle,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      expect(
        () =>
          new ExchangeConfiguration({
            chainId,
            baseConfig: immutableConfig,
            overrides,
          }),
      ).toThrow(new InvalidConfigurationError('Invalid exchange contract address for multicall'));
    });

    it('show throw when given an invalid RPC URL', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      const rpcURL = '';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens: commonRoutingTokensSingle,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      expect(
        () =>
          new ExchangeConfiguration({
            chainId,
            baseConfig: immutableConfig,
            overrides,
          }),
      ).toThrow(new InvalidConfigurationError('Missing override: rpcURL'));
    });

    it('should throw when given an invalid secondary fee recipient address', () => {
      const invalidFeeRecipient = '0x18c44b211065E69844FbA9AE146DA362104AfBf'; // too short

      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      const secondaryFees = [
        {
          recipient: invalidFeeRecipient,
          basisPoints: 100,
        },
      ];

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens: commonRoutingTokensSingle,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      expect(
        () =>
          new ExchangeConfiguration({
            baseConfig: immutableConfig,
            chainId,
            secondaryFees,
            overrides,
          }),
      ).toThrow(
        new InvalidConfigurationError(`Invalid secondary fee recipient address: ${secondaryFees[0].recipient}`),
      );
    });

    it('should throw when given invalid secondary fee basis points', () => {
      const dummyFeeRecipient = '0xb18c44b211065E69844FbA9AE146DA362104AfBf';

      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      const secondaryFeesOneRecipient = [
        {
          recipient: dummyFeeRecipient,
          basisPoints: 1001,
        },
      ];

      const secondaryFeesMultipleRecipients = [
        {
          recipient: dummyFeeRecipient,
          basisPoints: 500,
        },
        {
          recipient: dummyFeeRecipient,
          basisPoints: 500,
        },
        {
          recipient: dummyFeeRecipient,
          basisPoints: 100,
        },
      ];

      const secondaryFeesWithZeroBasisPoints = [
        {
          recipient: dummyFeeRecipient,
          basisPoints: 0,
        },
      ];

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens: commonRoutingTokensSingle,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      expect(
        () =>
          new ExchangeConfiguration({
            baseConfig: immutableConfig,
            chainId,
            secondaryFees: secondaryFeesOneRecipient,
            overrides,
          }),
      ).toThrow(
        new InvalidConfigurationError(
          `Invalid secondary fee basis points: ${secondaryFeesOneRecipient[0].basisPoints}`,
        ),
      );

      expect(
        () =>
          new ExchangeConfiguration({
            baseConfig: immutableConfig,
            chainId,
            secondaryFees: secondaryFeesMultipleRecipients,
            overrides,
          }),
      ).toThrow(new InvalidConfigurationError('Invalid total secondary fee basis points: 1100'));

      expect(
        () =>
          new ExchangeConfiguration({
            baseConfig: immutableConfig,
            chainId,
            secondaryFees: secondaryFeesWithZeroBasisPoints,
            overrides,
          }),
      ).toThrow(new InvalidConfigurationError('Invalid secondary fee basis points: 0'));
    });

    it('should not set secondary fees when not given', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }); // environment isn't used because we override all of the config values

      const rpcURL = 'https://anrpcurl.net';
      const overrides: ExchangeOverrides = {
        rpcURL,
        exchangeContracts: contractOverrides,
        commonRoutingTokens: commonRoutingTokensSingle,
        nativeToken: test.NATIVE_TEST_TOKEN,
        wrappedNativeToken: test.WIMX_TEST_TOKEN,
      };

      const config = new ExchangeConfiguration({
        chainId,
        baseConfig: immutableConfig,
        overrides,
      });

      expect(config.secondaryFees).toEqual([]);
    });
  });
});
