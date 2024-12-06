import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  imx,
  ImxApiClients,
} from '@imtbl/generated-clients';
import {
  IMXClient,
  NftTransferDetails,
  StarkSigner,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import { trackError, trackFlow } from '@imtbl/metrics';
import { BrowserProvider } from 'ethers';
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

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  BrowserProvider: jest.fn(),
}));
jest.mock('./workflows');
jest.mock('./workflows/registration');
jest.mock('./getStarkSigner');
jest.mock('@imtbl/generated-clients');
jest.mock('@imtbl/x-client');
jest.mock('@imtbl/metrics');

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
    getYCoordinate: jest.fn(),
  } as StarkSigner;

  const mockEthSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  const magicAdapterMock = {
    login: jest.fn(),
  };

  const mockGuardianClient = {
    withDefaultConfirmationScreenTask: (task: () => any) => task,
    withConfirmationScreenTask: () => (task: () => any) => task,
  };

  const getSignerMock = jest.fn();

  let passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  const imxApiClients = new ImxApiClients({} as any);

  beforeEach(() => {
    jest.restoreAllMocks();
    getSignerMock.mockReturnValue(mockEthSigner);
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
    passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
    mockAuthManager.getUser.mockResolvedValue(mockUserImx);

    // Metrics
    (trackFlow as unknown as jest.Mock).mockImplementation(() => ({
      addEvent: jest.fn(),
    }));

    // Signers
    magicAdapterMock.login.mockResolvedValue({ getSigner: getSignerMock });
    (BrowserProvider as unknown as jest.Mock).mockReturnValue({ getSigner: getSignerMock });
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
      mockAuthManager.getUser.mockResolvedValue(mockUserImx);
      // Signers
      magicAdapterMock.login.mockResolvedValue({});
      (getStarkSigner as jest.Mock).mockRejectedValue(new Error('error'));

      // Metrics
      (trackFlow as unknown as jest.Mock).mockImplementation(() => ({
        addEvent: jest.fn(),
      }));

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
      const withDefaultConfirmationSpy = jest.spyOn(mockGuardianClient, 'withDefaultConfirmationScreenTask');
      const returnValue = {} as imx.CreateTransferResponseV1;
      const request = {} as UnsignedTransferRequest;

      (transfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.transfer(request);

      expect(withDefaultConfirmationSpy).toBeCalled();
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
      const withDefaultConfirmationScreenSpy = jest.spyOn(mockGuardianClient, 'withDefaultConfirmationScreenTask');
      const returnValue = {} as imx.CreateOrderResponse;
      const request = {} as UnsignedOrderRequest;

      (createOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createOrder(request);
      expect(withDefaultConfirmationScreenSpy).toBeCalled();

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
      const withDefaultConfirmationScreenSpy = jest.spyOn(mockGuardianClient, 'withDefaultConfirmationScreenTask');
      const returnValue = {} as imx.CancelOrderResponse;
      const request = {} as imx.GetSignableCancelOrderRequest;

      (cancelOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.cancelOrder(request);

      expect(withDefaultConfirmationScreenSpy).toBeCalled();

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
      const returnValue = {} as imx.CreateTradeResponse;
      const request = {} as imx.GetSignableTradeRequest;

      const withDefaultConfirmationScreenSpy = jest.spyOn(mockGuardianClient, 'withDefaultConfirmationScreenTask');
      (createTrade as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createTrade(request);
      expect(withDefaultConfirmationScreenSpy).toBeCalled();

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
      const returnValue = {} as imx.CreateTransferResponse;
      const request = [] as NftTransferDetails[];
      const withConfirmationScreenSpy = jest.spyOn(mockGuardianClient, 'withConfirmationScreenTask');

      (batchNftTransfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.batchNftTransfer(request);

      expect(withConfirmationScreenSpy).toBeCalledWith({ height: 784, width: 480 });
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
      const returnValue = {} as imx.CreateTransferResponseV1;
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
    ['transfer' as const, 'imxTransfer', {} as UnsignedTransferRequest],
    ['createOrder' as const, 'imxCreateOrder', {} as UnsignedOrderRequest],
    ['cancelOrder' as const, 'imxCancelOrder', {} as imx.GetSignableCancelOrderRequest],
    ['createTrade' as const, 'imxCreateTrade', {} as imx.GetSignableTradeRequest],
    ['batchNftTransfer' as const, 'imxBatchNftTransfer', [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, 'imxExchangeTransfer', {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, 'imxGetAddress', {} as any],
    ['isRegisteredOffchain' as const, 'imxIsRegisteredOffchain', {} as any],
  ])('when the user has been logged out - %s', (methodName, eventName, args) => {
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

    it(`should track metrics when error thrown for ${methodName}`, async () => {
      try {
        await passportImxProvider[methodName!](args);
      } catch (error) {
        expect(trackFlow).toHaveBeenCalledWith(
          'passport',
          eventName,
        );
        expect(trackError).toHaveBeenCalledWith(
          'passport',
          eventName,
          error,
        );
      }
    });
  });

  describe.each([
    ['transfer' as const, 'imxTransfer', {} as UnsignedTransferRequest],
    ['createOrder' as const, 'imxCreateOrder', {} as UnsignedOrderRequest],
    ['cancelOrder' as const, 'imxCancelOrder', {} as imx.GetSignableCancelOrderRequest],
    ['createTrade' as const, 'imxCreateTrade', {} as imx.GetSignableTradeRequest],
    ['batchNftTransfer' as const, 'imxBatchNftTransfer', [] as NftTransferDetails[]],
    ['exchangeTransfer' as const, 'imxExchangeTransfer', {} as UnsignedExchangeTransferRequest],
    ['getAddress' as const, 'imxGetAddress', {} as any],
    ['isRegisteredOffchain' as const, 'imxIsRegisteredOffchain', {} as any],
  ])('when the user\'s access token is expired and cannot be retrieved', (methodName, eventName, args) => {
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

    it(`should track metrics when error thrown for ${methodName}`, async () => {
      try {
        await passportImxProvider[methodName!](args);
      } catch (error) {
        expect(trackFlow).toHaveBeenCalledWith(
          'passport',
          eventName,
        );
        expect(trackError).toHaveBeenCalledWith(
          'passport',
          eventName,
          error,
        );
      }
    });
  });
});
