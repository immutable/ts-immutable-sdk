import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import {
  CancelOrderResponse,
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  EthSigner,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  StarkSigner,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import AuthManager from 'authManager';
import registerPassportStarkEx from './workflows/registration';
import { mockUserImx, testConfig, mockUser } from '../test/mocks';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportImxProvider } from './passportImxProvider';
import {
  batchNftTransfer, cancelOrder, createOrder, createTrade, exchangeTransfer, transfer,
} from './workflows';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';
import { PassportEventMap, PassportEvents } from '../types';
import TypedEventEmitter from '../typedEventEmitter';

jest.mock('./workflows');
jest.mock('./workflows/registration');
describe('PassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  let passportImxProvider: PassportImxProvider;

  const immutableXClient = new ImmutableXClient({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
  });

  const confirmationScreen = new ConfirmationScreen({} as PassportConfiguration);

  const mockAuthManager = {
    loginSilent: jest.fn(),
    login: jest.fn(),
    getUser: jest.fn(),
  };

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  } as StarkSigner;

  const mockEthSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  const magicAdapterMock = {
    login: jest.fn(),
  };

  const getSignerMock = jest.fn();

  let passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  beforeEach(() => {
    jest.restoreAllMocks();
    getSignerMock.mockReturnValue(mockEthSigner);
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
    passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
    mockAuthManager.getUser.mockResolvedValue(mockUserImx);

    passportImxProvider = new PassportImxProvider({
      authManager: mockAuthManager as unknown as AuthManager,
      starkSigner: mockStarkSigner,
      ethSigner: mockEthSigner as unknown as EthSigner,
      confirmationScreen,
      immutableXClient,
      config: testConfig,
      passportEventEmitter,
    });
  });

  describe('transfer', () => {
    it('calls transfer workflow', async () => {
      const returnValue = {} as CreateTransferResponseV1;
      const request = {} as UnsignedTransferRequest;

      (transfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.transfer(request);

      expect(transfer as jest.Mock)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          transfersApi: immutableXClient.transfersApi,
          // @ts-ignore
          guardianClient: passportImxProvider.guardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should return true when a user is registered', async () => {
      const isRegistered = await passportImxProvider.isRegisteredOnchain();
      expect(isRegistered).toEqual(true);
    });

    it('should return false when a user is not registered', async () => {
      mockAuthManager.getUser.mockResolvedValue({});
      const isRegistered = await passportImxProvider.isRegisteredOnchain();
      expect(isRegistered).toEqual(false);
    });

    it('should bubble up the error if user is not logged in', async () => {
      mockAuthManager.getUser.mockResolvedValue(undefined);
      expect(passportImxProvider.isRegisteredOnchain()).rejects.toThrow(new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      ));
    });
  });

  describe('createOrder', () => {
    it('calls createOrder workflow', async () => {
      const returnValue = {} as CreateOrderResponse;
      const request = {} as UnsignedOrderRequest;

      (createOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createOrder(request);

      expect(createOrder)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          ordersApi: immutableXClient.ordersApi,
          // @ts-ignore
          guardianClient: passportImxProvider.guardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('cancelOrder', () => {
    it('calls cancelOrder workflow', async () => {
      const returnValue = {} as CancelOrderResponse;
      const request = {} as GetSignableCancelOrderRequest;

      (cancelOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.cancelOrder(request);

      expect(cancelOrder)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          ordersApi: immutableXClient.ordersApi,
          // @ts-ignore
          guardianClient: passportImxProvider.guardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('createTrade', () => {
    it('calls createTrade workflow', async () => {
      const returnValue = {} as CreateTradeResponse;
      const request = {} as GetSignableTradeRequest;

      (createTrade as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createTrade(request);

      expect(createTrade)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          tradesApi: immutableXClient.tradesApi,
          // @ts-ignore
          guardianClient: passportImxProvider.guardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('batchNftTransfer', () => {
    it('calls batchNftTransfer workflow', async () => {
      const returnValue = {} as CreateTransferResponse;
      const request = [] as NftTransferDetails[];

      (batchNftTransfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.batchNftTransfer(request);

      expect(batchNftTransfer)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          transfersApi: immutableXClient.transfersApi,
          // @ts-ignore
          guardianClient: passportImxProvider.guardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('exchangeTransfer', () => {
    it('calls the exchangeTransfer workflow', async () => {
      const returnValue = {} as CreateTransferResponseV1;
      const request = {} as UnsignedExchangeTransferRequest;

      (exchangeTransfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.exchangeTransfer(request);

      expect(exchangeTransfer)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          exchangesApi: immutableXClient.exchangeApi,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit)
        .toThrow(
          new PassportError(
            'Operation not supported',
            PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
          ),
        );
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal)
        .toThrow(
          new PassportError(
            'Operation not supported',
            PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
          ),
        );
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal)
        .toThrow(
          new PassportError(
            'Operation not supported',
            PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
          ),
        );
    });
  });

  describe('getAddress', () => {
    it('should return user ether key address', async () => {
      const response = await passportImxProvider.getAddress();
      expect(response)
        .toEqual(mockUserImx.imx.ethAddress);
    });
  });

  describe.each([
    ['transfer' as const, {} as UnsignedTransferRequest],
    ['createOrder' as const, {} as UnsignedOrderRequest],
    ['cancelOrder' as const, {} as GetSignableCancelOrderRequest],
    ['createTrade' as const, {} as GetSignableTradeRequest],
    ['batchNftTransfer' as const, [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, {} as any],
  ])('when the user has been logged out - %s', (methodName, args) => {
    beforeEach(() => {
      passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
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

  describe.each([
    ['transfer' as const, {} as UnsignedTransferRequest],
    ['createOrder' as const, {} as UnsignedOrderRequest],
    ['cancelOrder' as const, {} as GetSignableCancelOrderRequest],
    ['createTrade' as const, {} as GetSignableTradeRequest],
    ['batchNftTransfer' as const, [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, {} as any],
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

  describe('registerOffChain', () => {
    it('should register the user and update the provider instance user', async () => {
      const magicProviderMock = {};

      mockAuthManager.login.mockResolvedValue(mockUser);
      magicAdapterMock.login.mockResolvedValue(magicProviderMock);
      mockAuthManager.loginSilent.mockResolvedValue({ ...mockUser, imx: { ethAddress: '', starkAddress: '', userAdminAddress: '' } });

      await passportImxProvider.registerOffchain();

      expect(registerPassportStarkEx).toHaveBeenCalledWith({
        ethSigner: mockEthSigner,
        starkSigner: mockStarkSigner,
        usersApi: immutableXClient.usersApi,
      }, mockUserImx.accessToken);
      expect(mockAuthManager.loginSilent).toHaveBeenCalledTimes(1);
      expect(mockAuthManager.loginSilent).toHaveBeenCalledWith({ forceRefresh: true });
    });
  });
});
