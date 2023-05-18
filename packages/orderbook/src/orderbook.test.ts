import { Environment } from '@imtbl/config';
import { Orderbook } from 'orderbook';
import { providers } from 'ethers';
import { mock, instance } from 'ts-mockito';

describe('Orderbook', () => {
  const mockProvider = mock(providers.JsonRpcProvider);

  describe('when initializing', () => {
    describe('without an apiEndpoint override', () => {
      it('throws', () => {
        expect(() => new Orderbook({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          provider: instance(mockProvider),
          seaportContractAddress: '0x123',
          zoneContractAddress: '0x456',
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
          provider: instance(mockProvider),
          seaportContractAddress: '0x123',
          zoneContractAddress: '0x456',
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
          provider: instance(mockProvider),
          seaportContractAddress: '0x123',
          zoneContractAddress: '0x456',
          overrides: {
            apiEndpoint: 'http://foobar',
            chainId: '1',
          },
        })).toBeInstanceOf(Orderbook);
      });
    });
  });
});
