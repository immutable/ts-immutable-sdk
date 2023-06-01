import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import {
  CancelOrderResponse,
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
import { mockUser } from '../test/mocks';
import { PassportError, PassportErrorType } from '../errors/passportError';
import PassportImxProvider from './passportImxProvider';
import { batchNftTransfer, transfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { createTrade } from '../workflows/trades';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';

jest.mock('../workflows/transfer');
jest.mock('../workflows/order');
jest.mock('../workflows/exchange');
jest.mock('../workflows/trades');

describe('PassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  let passportImxProvider: PassportImxProvider;

  const immutableXClient = new ImmutableXClient({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
  });

  const confirmationScreen = new ConfirmationScreen({} as PassportConfiguration);

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  beforeEach(() => {
    passportImxProvider = new PassportImxProvider({
      user: mockUser,
      starkSigner: mockStarkSigner,
      confirmationScreen,
      immutableXClient,
    });
  });

  describe('constructor', () => {
    it('sets the private properties', () => {
      // @ts-ignore
      expect(passportImxProvider.user).toEqual(mockUser);
      // @ts-ignore
      expect(passportImxProvider.starkSigner).toEqual(mockStarkSigner);
      // @ts-ignore
      expect(passportImxProvider.confirmationScreen).toEqual(confirmationScreen);
      // @ts-ignore
      expect(passportImxProvider.immutableXClient).toEqual(immutableXClient);
    });
  });

  describe('transfer', () => {
    it('calls transfer workflow', async () => {
      const returnValue = {} as CreateTransferResponseV1;
      const request = {} as UnsignedTransferRequest;

      (transfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.transfer(request);

      expect(transfer as jest.Mock).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        transfersApi: immutableXClient.transfersApi,
        confirmationScreen,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('registerOffchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.registerOffchain).toThrow(
        new PassportError(
          'Operation not supported',
          PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
        ),
      );
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.isRegisteredOnchain).toThrow(
        new PassportError(
          'Operation not supported',
          PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
        ),
      );
    });
  });

  describe('createOrder', () => {
    it('calls createOrder workflow', async () => {
      const returnValue = {} as CreateOrderResponse;
      const request = {} as UnsignedOrderRequest;

      (createOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createOrder(request);

      expect(createOrder).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        ordersApi: immutableXClient.ordersApi,
        confirmationScreen,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('cancelOrder', () => {
    it('calls cancelOrder workflow', async () => {
      const returnValue = {} as CancelOrderResponse;
      const request = {} as GetSignableCancelOrderRequest;

      (cancelOrder as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.cancelOrder(request);

      expect(cancelOrder).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        ordersApi: immutableXClient.ordersApi,
        confirmationScreen,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('createTrade', () => {
    it('calls createTrade workflow', async () => {
      const returnValue = {} as CreateTradeResponse;
      const request = {} as GetSignableTradeRequest;

      (createTrade as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.createTrade(request);

      expect(createTrade).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        tradesApi: immutableXClient.tradesApi,
        confirmationScreen,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('batchNftTransfer', () => {
    it('calls batchNftTransfer workflow', async () => {
      const returnValue = {} as CreateTransferResponse;
      const request = [] as NftTransferDetails[];

      (batchNftTransfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.batchNftTransfer(request);

      expect(batchNftTransfer).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        transfersApi: immutableXClient.transfersApi,
        confirmationScreen,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('exchangeTransfer', () => {
    it('calls the exchangeTransfer workflow', async () => {
      const returnValue = {} as CreateTransferResponseV1;
      const request = {} as UnsignedExchangeTransferRequest;

      (exchangeTransfer as jest.Mock).mockResolvedValue(returnValue);
      const result = await passportImxProvider.exchangeTransfer(request);

      expect(exchangeTransfer).toHaveBeenCalledWith({
        request,
        user: mockUser,
        starkSigner: mockStarkSigner,
        exchangesApi: immutableXClient.exchangeApi,
      });
      expect(result).toEqual(returnValue);
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit).toThrow(
        new PassportError(
          'Operation not supported',
          PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
        ),
      );
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal).toThrow(
        new PassportError(
          'Operation not supported',
          PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
        ),
      );
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal).toThrow(
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
      expect(response).toEqual('123');
    });
  });
});
