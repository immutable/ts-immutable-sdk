import { ImxApiClients, imx } from '@imtbl/generated-clients';
import {
  Environment,
  IMXClient,
  ImmutableConfiguration,
  NftTransferDetails,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import AuthManager from 'authManager';
import { PassportError, PassportErrorType } from 'errors/passportError';
import GuardianClient from 'guardian';
import MagicAdapter from 'magicAdapter';
import { PassportImxProvider } from 'starkEx/passportImxProvider';
import { PassportEventMap, PassportEvents } from 'types';
import TypedEventEmitter from 'utils/typedEventEmitter';

describe('passportImxProvider auth tests', () => {
  const mockAuthManager = {
    login: jest.fn(),
    getUser: jest.fn(),
    forceUserRefresh: jest.fn(),
  };

  const immutableXClient = new IMXClient({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
  });

  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();

  const magicAdapterMock = {
    login: jest.fn(),
  };

  const imxApiClients = new ImxApiClients({} as any);

  const mockGuardianClient = {
    withDefaultConfirmationScreenTask: (task: () => any) => task,
    withConfirmationScreenTask: (task: () => any) => (() => task()),
  };

  const passportImxProvider = new PassportImxProvider({
    authManager: mockAuthManager as unknown as AuthManager,
    magicAdapter: magicAdapterMock as unknown as MagicAdapter,
    guardianClient: mockGuardianClient as unknown as GuardianClient,
    immutableXClient,
    passportEventEmitter,
    imxApiClients,
  });

  describe.each([
    ['transfer' as const, {} as UnsignedTransferRequest],
    ['createOrder' as const, {} as UnsignedOrderRequest],
    ['cancelOrder' as const, {} as imx.GetSignableCancelOrderRequest],
    ['createTrade' as const, {} as imx.GetSignableTradeRequest],
    ['batchNftTransfer' as const, [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, {} as any],
    ['isRegisteredOffchain' as const, {} as any],
  ])('when the user has been logged out - %s', (methodName, args) => {
    beforeEach(() => {
      passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
    });

    it(`should return an error for ${methodName}`, async () => {
      expect(async () => await passportImxProvider[methodName!](args))
        .rejects
        .toThrow(
          new PassportError(
            'User has been logged out',
            PassportErrorType.NOT_LOGGED_IN_ERROR,
          ),
        );
    });
  });

  describe.only.each([
    ['transfer' as const, {} as UnsignedTransferRequest],
    ['createOrder' as const, {} as UnsignedOrderRequest],
    ['cancelOrder' as const, {} as imx.GetSignableCancelOrderRequest],
    ['createTrade' as const, {} as imx.GetSignableTradeRequest],
    ['batchNftTransfer' as const, [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, {} as any],
    ['isRegisteredOffchain' as const, {} as any],
  ])('when the user\'s access token is expired and cannot be retrieved', (methodName, args) => {
    beforeEach(() => {
      mockAuthManager.getUser.mockResolvedValue(null);
    });

    it(`should return an error for ${methodName}`, async () => {
      await expect(async () => passportImxProvider[methodName!](args))
        .rejects
        .toThrow(
          new PassportError(
            'User has been logged out',
            PassportErrorType.NOT_LOGGED_IN_ERROR,
          ),
        );
    });
  });
});
