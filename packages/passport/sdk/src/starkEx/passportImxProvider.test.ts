import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  imx,
  ImxApiClients,
} from '@imtbl/generated-clients';
import {
  IMXClient,
  StarkSigner,
} from '@imtbl/x-client';
import registerPassportStarkEx from './workflows/registration';
import { mockUser, mockUserImx } from '../test/mocks';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportImxProvider } from './passportImxProvider';
import {
  batchNftTransfer, cancelOrder, createOrder, createTrade, exchangeTransfer, transfer,
} from './workflows';
import { PassportEventMap, PassportEvents } from '../types';
import TypedEventEmitter from '../utils/typedEventEmitter';
import AuthManager from '../authManager';
import MagicAdapter from '../magicAdapter';
import { getStarkSigner } from './getStarkSigner';
import GuardianClient from '../guardian';

jest.mock('@ethersproject/providers');
jest.mock('./workflows');
jest.mock('./workflows/registration');
jest.mock('./getStarkSigner');
jest.mock('@imtbl/generated-clients');
jest.mock('@imtbl/x-client');

describe('PassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  let passportImxProvider: PassportImxProvider;

  const immutableXClient = new IMXClient({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
  });

  const mockAuthManager = {
    login: jest.fn(),
    getUser: jest.fn(),
    forceUserRefresh: jest.fn(),
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

  const mockGuardianClient = {};

  const getSignerMock = jest.fn();

  let passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  const imxApiClients = new ImxApiClients({} as any);

  beforeEach(() => {
    jest.restoreAllMocks();
    getSignerMock.mockReturnValue(mockEthSigner);
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
    passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
    mockAuthManager.getUser.mockResolvedValue(mockUserImx);

    // Signers
    magicAdapterMock.login.mockResolvedValue({ getSigner: getSignerMock });
    (Web3Provider as unknown as jest.Mock).mockReturnValue({ getSigner: getSignerMock });
    (getStarkSigner as jest.Mock).mockResolvedValue(mockStarkSigner);

    passportImxProvider = new PassportImxProvider({
      authManager: mockAuthManager as unknown as AuthManager,
      magicAdapter: magicAdapterMock as unknown as MagicAdapter,
      guardianClient: mockGuardianClient as unknown as GuardianClient,
      immutableXClient,
      passportEventEmitter,
      imxApiClients,
    });
  });

  describe('async signer initialisation', () => {
    it('initialises the eth and stark signers correctly', async () => {
      // The promise is created in the constructor but not awaited until a method is called
      await passportImxProvider.getAddress();

      expect(magicAdapterMock.login).toHaveBeenCalledWith(mockUserImx.idToken);
      expect(getStarkSigner).toHaveBeenCalledWith(mockEthSigner);
    });

    it('initialises the eth and stark signers only once', async () => {
      await passportImxProvider.getAddress();
      await passportImxProvider.getAddress();
      await passportImxProvider.getAddress();

      expect(magicAdapterMock.login).toHaveBeenCalledTimes(1);
      expect(getStarkSigner).toHaveBeenCalledTimes(1);
    });

    it('re-throws the initialisation error when a method is called', async () => {
      jest.resetAllMocks();
      jest.restoreAllMocks();

      mockAuthManager.getUser.mockResolvedValue(mockUserImx);
      // Signers
      magicAdapterMock.login.mockResolvedValue({});
      (getStarkSigner as jest.Mock).mockRejectedValue(new Error('error'));

      const pp = new PassportImxProvider({
        authManager: mockAuthManager as unknown as AuthManager,
        magicAdapter: magicAdapterMock as unknown as MagicAdapter,
        guardianClient: mockGuardianClient as unknown as GuardianClient,
        immutableXClient,
        passportEventEmitter: new TypedEventEmitter<PassportEventMap>(),
        imxApiClients: new ImxApiClients({} as any),
      });

      await expect(pp.registerOffchain()).rejects.toThrow(new Error('error'));
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
          guardianClient: mockGuardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('isRegisteredOffchain', () => {
    it('should return true when a user is registered', async () => {
      const isRegistered = await passportImxProvider.isRegisteredOffchain();
      expect(isRegistered).toEqual(true);
    });

    it('should return false when a user is not registered', async () => {
      mockAuthManager.getUser.mockResolvedValue({});
      const isRegistered = await passportImxProvider.isRegisteredOffchain();
      expect(isRegistered).toEqual(false);
    });

    it('should bubble up the error if user is not logged in', async () => {
      mockAuthManager.getUser.mockResolvedValue(undefined);

      await expect(passportImxProvider.isRegisteredOffchain()).rejects.toThrow(new PassportError(
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
          guardianClient: mockGuardianClient,
        });
      expect(result)
        .toEqual(returnValue);
    });
  });

  describe('cancelOrder', () => {
    it('calls cancelOrder workflow', async () => {
      const returnValue = {} as imx.CancelOrderResponse;
      const request = {} as GetSignableCancelOrderRequest;

      (cancelOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.cancelOrder(request);

      expect(cancelOrder)
        .toHaveBeenCalledWith({
          request,
          user: mockUserImx,
          starkSigner: mockStarkSigner,
          ordersApi: immutableXClient.ordersApi,
          guardianClient: mockGuardianClient,
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
          guardianClient: mockGuardianClient,
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
          guardianClient: mockGuardianClient,
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

  describe('registerOffChain', () => {
    it('should register the user and update the provider instance user', async () => {
      const magicProviderMock = {};

      mockAuthManager.login.mockResolvedValue(mockUser);
      magicAdapterMock.login.mockResolvedValue(magicProviderMock);
      mockAuthManager.forceUserRefresh.mockResolvedValue({ ...mockUser, imx: { ethAddress: '', starkAddress: '', userAdminAddress: '' } });
      await passportImxProvider.registerOffchain();

      expect(registerPassportStarkEx).toHaveBeenCalledWith({
        ethSigner: mockEthSigner,
        starkSigner: mockStarkSigner,
        imxApiClients: new ImxApiClients({} as any),
      }, mockUserImx.accessToken);
      expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(1);
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
    ['isRegisteredOffchain' as const, {} as any],
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
