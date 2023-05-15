import { Environment } from '@imtbl/config';
import { Orderbook } from 'orderbook';

describe('Orderbook', () => {
  describe('when initializing', () => {
    describe('without an apiEndpoint override', () => {
      it('throws', () => {
        expect(() => new Orderbook({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          overrides: {
            chainId: '1',
          },
        })).toThrow();
      });
    });
    describe('without a chainId override', () => {
      it('throws', () => {
        expect(() => new Orderbook({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          overrides: {
            apiEndpoint: 'http://foobar',
          },
        })).toThrow();
      });
    });
    describe('with required overrides', () => {
      it('resolves an orderbook instance', () => {
        expect(new Orderbook({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          overrides: {
            apiEndpoint: 'http://foobar',
            chainId: '1',
          },
        })).toBeInstanceOf(Orderbook);
      });
    });
  });
});
