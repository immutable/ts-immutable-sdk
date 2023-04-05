import PassportImxProvider from './passportImxProvider';
import {
  ERC721Token,
  ETHAmount,
  ExchangesApi,
  OrdersApi,
  TradesApi,
  TransfersApi,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import ConfirmationScreen from '../confirmation/confirmation';
import { mockErrorMessage, mockStarkSignature, mockUser } from '../test/mocks';
import { PassportError, PassportErrorType } from '../errors/passportError';

jest.mock('@imtbl/core-sdk', () => {
  const original = jest.requireActual('@imtbl/core-sdk');
  return {
    ...original,
    TransfersApi: jest.fn(),
    OrdersApi: jest.fn(),
    ExchangesApi: jest.fn(),
    TradesApi: jest.fn()
  };
});
jest.mock('../confirmation/confirmation');

describe('PassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  let passportImxProvider: PassportImxProvider;
  let getSignableTransferV1Mock: jest.Mock;
  let createTransferV1Mock: jest.Mock;
  let getSignableCreateOrderMock: jest.Mock;
  let createOrderMock: jest.Mock;
  let getSignableCancelOrderMock: jest.Mock;
  let cancelOrderMock: jest.Mock;
  let getSignableTransferMock: jest.Mock;
  let createTransferMock: jest.Mock;
  let getExchangeSignableTransferMock: jest.Mock;
  let createExchangeTransferMock: jest.Mock;
  let getSignableTradeMock: jest.Mock;
  let createTradeMock: jest.Mock;
  let mockStartTransaction: jest.Mock;

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  beforeEach(() => {
    getSignableTransferV1Mock = jest.fn();
    createTransferV1Mock = jest.fn();
    getSignableTransferMock = jest.fn();
    createTransferMock = jest.fn();
    (TransfersApi as jest.Mock).mockReturnValue({
      getSignableTransferV1: getSignableTransferV1Mock,
      createTransferV1: createTransferV1Mock,
      getSignableTransfer: getSignableTransferMock,
      createTransfer: createTransferMock,
    });

    getSignableCreateOrderMock = jest.fn();
    createOrderMock = jest.fn();
    getSignableCancelOrderMock = jest.fn();
    cancelOrderMock = jest.fn();
    (OrdersApi as jest.Mock).mockReturnValue({
      getSignableOrder: getSignableCreateOrderMock,
      createOrder: createOrderMock,
      getSignableCancelOrder: getSignableCancelOrderMock,
      cancelOrder: cancelOrderMock,
    });

    getExchangeSignableTransferMock = jest.fn();
    createExchangeTransferMock = jest.fn();
    (ExchangesApi as jest.Mock).mockReturnValue({
      getExchangeSignableTransfer: getExchangeSignableTransferMock,
      createExchangeTransfer: createExchangeTransferMock,
    });

    getSignableTradeMock = jest.fn();
    createTradeMock = jest.fn();
    (TradesApi as jest.Mock).mockReturnValue({
      getSignableTrade: getSignableTradeMock,
      createTrade: createTradeMock,
    });

    mockStartTransaction = jest.fn();
    (ConfirmationScreen as jest.Mock).mockImplementation(() => ({
      startTransaction: mockStartTransaction,
    }));

    passportImxProvider = new PassportImxProvider({
      user: mockUser,
      starkSigner: mockStarkSigner,
      passportConfig: { imxAPIConfiguration: { basePath: 'http://test.com'} } as never,
    });
  });

  describe('transfer', () => {
    const mockReceiver = 'AAA';
    const type = 'ERC721';
    const tokenId = '111';
    const tokenAddress = '0x1234';
    const mockTransferRequest = {
      type,
      tokenId,
      tokenAddress,
      receiver: mockReceiver,
    };

    it('should returns success transfer result', async () => {
      const mockSignableTransferRequest = {
        getSignableTransferRequest: {
          amount: '1',
          receiver: mockReceiver,
          sender: mockUser.etherKey,
          token: {
            data: { token_address: tokenAddress, token_id: tokenId },
            type,
          },
        },
      };
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };
      const {
        payload_hash: mockPayloadHash,
        ...restSignableTransferV1Response
      } = mockSignableTransferV1Response.data;
      const mockCreateTransferRequest = {
        createTransferRequest: {
          ...restSignableTransferV1Response,
          stark_signature: mockStarkSignature,
        },
      };
      const mockHeader = {
        headers: {
          Authorization: `Bearer ${ mockUser.accessToken }`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };

      mockStartTransaction.mockResolvedValue({
        confirmed: true,
      });

      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.transfer(
        mockTransferRequest as UnsignedTransferRequest
      );

      expect(getSignableTransferV1Mock).toBeCalledWith(
        mockSignableTransferRequest
      );
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(createTransferV1Mock).toBeCalledWith(
        mockCreateTransferRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferV1Mock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() =>
        passportImxProvider.transfer(
          mockTransferRequest as UnsignedTransferRequest
        )
      ).rejects.toThrowError(new PassportError(
        `${ PassportErrorType.TRANSFER_ERROR }: ${ mockErrorMessage }`,
        PassportErrorType.TRANSFER_ERROR
      ));
    });
  });

  describe('registerOffchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.registerOffchain).toThrow(new PassportError(
        "Operation not supported",
        PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
      ));
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.isRegisteredOnchain).toThrow(new PassportError(
        "Operation not supported",
        PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
      ));
    });
  });

  describe('createOrder', () => {
    const buy = { type: 'ETH', amount: '2' } as ETHAmount;
    const sell = {
      type: 'ERC721',
      tokenId: '123',
      tokenAddress: '0x9999',
    } as ERC721Token;
    const expiration_timestamp = 1334302;
    const orderRequest = {
      buy,
      sell,
      expiration_timestamp,
    };

    it('should returns success createOrder result', async () => {
      const mockSignableOrderRequest = {
        getSignableOrderRequestV3: {
          amount_buy: buy.amount,
          amount_sell: '1',
          token_buy: {
            data: {
              decimals: 18,
            },
            type: 'ETH',
          },
          token_sell: {
            data: {
              token_address: sell.tokenAddress,
              token_id: sell.tokenId,
            },
            type: 'ERC721',
          },
          fees: undefined,
          expiration_timestamp,
          user: mockUser.etherKey,
        },
      };

      const mockSignableOrderResponse = {
        data: {
          payload_hash: '123123',
          amount_buy: buy.amount,
          amount_sell: '1',
          asset_id_buy: '5530812',
          asset_id_sell: '8024836',
          expiration_timestamp: expiration_timestamp,
          nonce: '847570072',
          stark_key: '0x1234',
          vault_id_buy:
            '0x02705737cd248ac819034b5de474c8f0368224f72a0fda9e031499d519992d9e',
          vault_id_sell:
            '0x04006590f0986f008231e309b980e81f8a55944a702ec633b47ceb326242c9f8',
        },
      };
      const { payload_hash: mockPayloadHash, ...restSignableOrderResponse } =
        mockSignableOrderResponse.data;
      const mockCreateOrderRequest = {
        createOrderRequest: {
          ...restSignableOrderResponse,
          stark_signature: mockStarkSignature,
          fees: undefined,
          include_fees: true,
        },
      };
      const mockHeader = {
        headers: {
          Authorization: `Bearer ${ mockUser.accessToken }`,
        },
      };
      const mockReturnValue = {
        status: 'success',
        time: 111,
        order_id: 123,
      };

      getSignableCreateOrderMock.mockResolvedValue(mockSignableOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.createOrder(orderRequest);

      expect(getSignableCreateOrderMock).toBeCalledWith(
        mockSignableOrderRequest
      );
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(createOrderMock).toBeCalledWith(
        mockCreateOrderRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });
  });

  describe('cancelOrder', () => {
    const orderId = 54321;
    const cancelOrderRequest = {
      order_id: orderId,
    };

    it('should returns success cancelOrder result', async () => {
      const mockSignableCancelOrderRequest = {
        getSignableCancelOrderRequest: {
          ...cancelOrderRequest,
        },
      };
      const mockSignableCancelOrderResponse = {
        data: {
          payload_hash: '123123',
        },
      };

      const { payload_hash: mockPayloadHash } =
        mockSignableCancelOrderResponse.data;

      const mockCancelOrderRequest = {
        id: orderId.toString(),
        cancelOrderRequest: {
          order_id: orderId,
          stark_signature: mockStarkSignature,
        },
      };

      const mockHeader = {
        headers: {
          Authorization: `Bearer ${ mockUser.accessToken }`,
        },
      };

      const mockReturnValue = {
        order_id: orderId,
        status: 'success',
      };

      getSignableCancelOrderMock.mockResolvedValue(
        mockSignableCancelOrderResponse
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      cancelOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.cancelOrder(cancelOrderRequest);

      expect(getSignableCancelOrderMock).toBeCalledWith(
        mockSignableCancelOrderRequest
      );
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(cancelOrderMock).toBeCalledWith(
        mockCancelOrderRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });
  });

  describe('createTrade', () => {
    // mock data
    const mockPayloadHash = 'test_payload_hash';
    const mockSignableTradeRequest = {
      getSignableTradeRequest: {
        expiration_timestamp: 1231234,
        fees: [],
        order_id: 1234,
        user: mockUser.etherKey
      },
    };
    const mockSignableTradeResponseData = {
      amount_buy: '2',
      amount_sell: '1',
      asset_id_buy: '1234',
      asset_id_sell: '4321',
      expiration_timestamp: 0,
      fee_info: [],
      nonce: 0,
      stark_key: '0x1234',
      vault_id_buy: '0x02705737c',
      vault_id_sell: '0x04006590f',
    }
    const mockSignableTradeResponse = {
      data: {
        ...mockSignableTradeResponseData,
        payload_hash: mockPayloadHash,
        readable_transaction: 'test_readable_transaction',
        signable_message: 'test_signable_message',
        verification_signature: 'test_verification_signature'
      },
    };
    const mockCreateTradeRequest = {
      createTradeRequest: {
        ...mockSignableTradeResponseData,
        stark_signature: mockStarkSignature,
        fees: [],
        include_fees: true,
        order_id: 1234
      },
    };
    const mockHeader = {
      headers: {
        Authorization: `Bearer ${ mockUser.accessToken }`,
      },
    };
    const mockReturnValue = {
      status: 'success',
      trade_id: 123,
    };

    it('should return a successful createTrade result', async () => {
      getSignableTradeMock.mockResolvedValue(mockSignableTradeResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTradeMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.createTrade(mockSignableTradeRequest.getSignableTradeRequest);

      expect(getSignableTradeMock).toBeCalledWith(
        mockSignableTradeRequest
      );
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(createTradeMock).toBeCalledWith(
        mockCreateTradeRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });
  });

  describe('batchNftTransfer', () => {
    it('should returns success transfer result', async () => {
      const transferRequest = [
        {
          tokenId: '1',
          tokenAddress: 'token_address',
          receiver: 'receiver_eth_address',
        },
      ];
      const mockTransferResponse = {
        data: {
          transfer_ids: [ 'transfer_id_1' ],
        },
      };
      const sender_stark_key = 'sender_stark_key';
      const sender_vault_id = 'sender_vault_id';
      const receiver_stark_key = 'receiver_stark_key';
      const receiver_vault_id = 'receiver_vault_id';
      const asset_id = 'asset_id';
      const amount = 'amount';
      const nonce = 'nonce';
      const expiration_timestamp = 'expiration_timestamp';

      const mockSignableTransferResponse = {
        data: {
          sender_stark_key,
          signable_responses: [
            {
              sender_vault_id,
              receiver_stark_key,
              receiver_vault_id,
              asset_id,
              amount,
              nonce,
              expiration_timestamp,
            },
          ],
        },
      };
      getSignableTransferMock.mockResolvedValue(mockSignableTransferResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferMock.mockResolvedValue(mockTransferResponse);

      const result = await passportImxProvider.batchNftTransfer(
        transferRequest
      );
      expect(result).toEqual({
        transfer_ids: mockTransferResponse.data.transfer_ids,
      });
      expect(getSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequestV2: {
          sender_ether_key: mockUser.etherKey,
          signable_requests: [
            {
              amount: '1',
              token: {
                type: 'ERC721',
                data: {
                  token_id: transferRequest[0].tokenId,
                  token_address: transferRequest[0].tokenAddress,
                },
              },
              receiver: transferRequest[0].receiver,
            },
          ],
        },
      });
      expect(mockStarkSigner.signMessage).toHaveBeenCalled();
      expect(createTransferMock).toHaveBeenCalledWith(
        {
          createTransferRequestV2: {
            sender_stark_key,
            requests: [
              {
                sender_vault_id,
                receiver_stark_key,
                receiver_vault_id,
                asset_id,
                amount,
                nonce,
                expiration_timestamp,
                stark_signature: mockStarkSignature,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ mockUser.accessToken }`,
          },
        }
      );
    });
  });

  describe('exchangeTransfer', () => {
    it('should returns success exchange transfer result', async () => {
      const ethAmount: ETHAmount = {
        type: 'ETH',
        amount: '100',
      };

      const exchangeTransferRequest = {
        ...ethAmount,
        receiver: '0x456...',
        transactionID: 'abc123',
      };
      const mockGetExchangeSignableTransferResponse = {
        data: {
          payload_hash: 'hash123',
          sender_stark_key: 'senderKey',
          sender_vault_id: 'senderVault',
          receiver_stark_key: 'receiverKey',
          receiver_vault_id: 'receiverVault',
          asset_id: 'assetID',
          amount: 100,
          nonce: 'nonce123',
          expiration_timestamp: 123456789,
        },
      };

      const mockCreateExchangeTransferResponse = {
        data: {
          sent_signature: 'signature123',
          status: 'SUCCESS',
          time: '2022-01-01T00:00:00Z',
          transfer_id: 'transfer123',
        },
      };

      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      getExchangeSignableTransferMock.mockResolvedValue(
        mockGetExchangeSignableTransferResponse
      );
      createExchangeTransferMock.mockResolvedValue(
        mockCreateExchangeTransferResponse
      );

      const response = await passportImxProvider.exchangeTransfer(
        exchangeTransferRequest
      );

      expect(getExchangeSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequest: {
          amount: ethAmount.amount,
          receiver: exchangeTransferRequest.receiver,
          sender: mockUser.etherKey,
          token: {
            data: {
              decimals: 18,
            },
            type: ethAmount.type,
          },
        },
        id: exchangeTransferRequest.transactionID,
      });
      expect(response).toEqual({
        sent_signature: mockCreateExchangeTransferResponse.data.sent_signature,
        status: mockCreateExchangeTransferResponse.data.status,
        time: mockCreateExchangeTransferResponse.data.time,
        transfer_id: mockCreateExchangeTransferResponse.data.transfer_id,
      });
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit).toThrow(new PassportError(
        "Operation not supported",
        PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
      ));
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal).toThrow(new PassportError(
        "Operation not supported",
        PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
      ));
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal).toThrow(new PassportError(
        "Operation not supported",
        PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
      ));
    });
  });

  describe('getAddress', () => {
    it('should return stark signer address', async () => {
      mockStarkSigner.getAddress.mockResolvedValue('0x1234...');
      const response = await passportImxProvider.getAddress();
      expect(response).toEqual('0x1234...');
    });
  });
});
