import { Environment } from '@imtbl/config';
import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { Exchange } from 'exchange';

describe('Exchange', () => {
  describe('when given an invalid chain ID', () => {
    it('returns an error', () => {
      expect(
        () => new Exchange({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          chainId: 0,
        }),
      ).toThrowError(
        'Chain with ID 0 is not a supported chain in environment sandbox',
      );
    });
  });

  describe('when given an invalid overrides', () => {
    it('returns an error', () => {
      expect(
        () => new Exchange({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          chainId: 0,
          overrides: {
            rpcURL: '',
            exchangeContracts: {
              coreFactory: '',
              multicall: '',
              peripheryRouter: '',
              quoterV2: '',
            },
            commonRoutingTokens: [],
            nativeToken: {
              address: '',
              chainId: 0,
              decimals: 0,
            },
          },
        }),
      ).toThrowError('Missing override: rpcURL');
    });
  });

  describe('when given an invalid exchange contract', () => {
    it('returns an error', () => {
      expect(
        () => new Exchange({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          chainId: 0,
          overrides: {
            rpcURL: 'x',
            exchangeContracts: {
              coreFactory: 'blah',
              multicall: '',
              peripheryRouter: '',
              quoterV2: '',
            },
            commonRoutingTokens: [],
            nativeToken: {
              address: '',
              chainId: 0,
              decimals: 0,
            },
          },
        }),
      ).toThrowError('Invalid exchange contract address for coreFactory');
    });
  });

  describe('when given valid overrides', () => {
    it('returns the exchange', () => {
      const exchange = new Exchange({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        chainId: 0,
        overrides: {
          rpcURL: 'x',
          exchangeContracts: {
            coreFactory: '0xebbf4C07a63986204C37cc5A188AaBF53564C583',
            multicall: '0xebbf4C07a63986204C37cc5A188AaBF53564C583',
            peripheryRouter: '0xebbf4C07a63986204C37cc5A188AaBF53564C583',
            quoterV2: '0xebbf4C07a63986204C37cc5A188AaBF53564C583',
          },
          commonRoutingTokens: [],
          nativeToken: {
            address: '',
            chainId: 0,
            decimals: 0,
          },
        },
      });
      expect(exchange).toBeDefined();
    });
  });

  describe('when given valid inputs', () => {
    it('returns an exchange', () => {
      const exchange = new Exchange({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        chainId: IMMUTABLE_TESTNET_CHAIN_ID,
      });

      expect(exchange).toBeDefined();
    });
  });
});
