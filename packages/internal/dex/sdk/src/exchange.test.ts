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
