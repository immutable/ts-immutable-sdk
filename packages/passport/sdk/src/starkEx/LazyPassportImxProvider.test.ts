import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import {
  CreateOrderResponse,
  CreateTransferResponseV1,
  EthSigner, GetSignableCancelOrderRequest, GetSignableTradeRequest, NftTransferDetails,
  StarkSigner, UnsignedExchangeTransferRequest, UnsignedOrderRequest, UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import AuthManager from 'authManager';
import { testConfig } from '../test/mocks';
import { PassportImxProvider } from './passportImxProvider';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';
import { PassportEventMap } from '../types';
import TypedEventEmitter from '../typedEventEmitter';
import { LazyPassportImxProvider } from './LazyPassportImxProvider';

let lazyProvider: LazyPassportImxProvider;

const mockAuthManager = {
  loginSilent: jest.fn(),
  login: jest.fn(),
  getUser: jest.fn(),
} as unknown as AuthManager;

const mockStarkSigner = {
  signMessage: jest.fn(),
  getAddress: jest.fn(),
} as StarkSigner;

const mockEthSigner = {
  signMessage: jest.fn(),
  getAddress: jest.fn(),
} as unknown as EthSigner;

const mockImxClient = new ImmutableXClient({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
});

const mockEventEmitter = new TypedEventEmitter<PassportEventMap>();

const mockConfirmationScreen = new ConfirmationScreen({} as PassportConfiguration);

jest.mock('./passportImxProvider');

const mockPassportImxProvider = PassportImxProvider as jest.Mock;

describe('LazyPassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  beforeEach(() => {
    lazyProvider = new LazyPassportImxProvider({
      authManager: mockAuthManager,
      confirmationScreen: mockConfirmationScreen,
      immutableXClient: mockImxClient,
      config: testConfig,
      passportEventEmitter: mockEventEmitter,
      signersPromise: Promise.resolve({ ethSigner: mockEthSigner, starkSigner: mockStarkSigner }),
    });
  });

  describe('when a method is called on the lazy provider', () => {
    it('should initialise the internal provider with the correct args', async () => {
      mockPassportImxProvider.mockImplementation(() => ({
        getAddress: jest.fn(),
      }));

      await lazyProvider.getAddress();

      expect(mockPassportImxProvider).toHaveBeenCalledWith({
        authManager: mockAuthManager,
        confirmationScreen: mockConfirmationScreen,
        immutableXClient: mockImxClient,
        config: testConfig,
        passportEventEmitter: mockEventEmitter,
        ethSigner: mockEthSigner,
        starkSigner: mockStarkSigner,
      });
    });

    it('should only initialise the provider once', async () => {
      const mockGetAddress = jest.fn();
      mockPassportImxProvider.mockImplementation(() => ({
        getAddress: mockGetAddress,
      }));

      await lazyProvider.getAddress();
      await lazyProvider.getAddress();
      await lazyProvider.getAddress();

      expect(mockPassportImxProvider).toHaveBeenCalledTimes(1);
      expect(mockGetAddress).toHaveBeenCalledTimes(3);
    });

    it('should propagate the error if the internal provider cannot be constructed', async () => {
      lazyProvider = new LazyPassportImxProvider({
        authManager: mockAuthManager,
        confirmationScreen: mockConfirmationScreen,
        immutableXClient: mockImxClient,
        config: testConfig,
        passportEventEmitter: mockEventEmitter,
        signersPromise: Promise.reject(new Error('Failed to initialise providers')),
      });

      await expect(lazyProvider.getAddress()).rejects.toThrow('Failed to initialise providers');

      expect(mockPassportImxProvider).toHaveBeenCalledTimes(0);
    });

    describe.each([
      ['transfer' as const, {} as UnsignedTransferRequest, {} as CreateTransferResponseV1],
      ['createOrder' as const, {} as UnsignedOrderRequest, {} as CreateOrderResponse],
      ['cancelOrder' as const, {} as GetSignableCancelOrderRequest, {} as CreateOrderResponse],
      ['createTrade' as const, {} as GetSignableTradeRequest, {} as CreateOrderResponse],
      ['batchNftTransfer' as const, [] as NftTransferDetails[], {} as CreateOrderResponse],
      ['exchangeTransfer' as const, {} as UnsignedExchangeTransferRequest, {} as CreateOrderResponse],
      ['getAddress' as const, {} as any, '0x1'],
    ])('when the user has been logged out - %s', (methodName, args, expectedRes) => {
      it(`should proxy ${methodName} with the correct args`, async () => {
        const mockMethod = jest.fn().mockResolvedValue(expectedRes);
        mockPassportImxProvider.mockImplementation(() => ({
          [methodName]: mockMethod,
        }));

        const result = await lazyProvider[methodName!](args);

        expect(result).toBe(expectedRes);
      });
    });
  });
});
