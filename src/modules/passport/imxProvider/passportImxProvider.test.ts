import PassportImxProvider from './passportImxProvider';
import {
  ERC721Token,
  ETHAmount,
  OrdersApi,
  TransfersApi,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';

jest.mock('@imtbl/core-sdk', () => {
  const original = jest.requireActual('@imtbl/core-sdk');
  return {
    ...original,
    TransfersApi: jest.fn(),
    OrdersApi: jest.fn(),
  };
});

describe('PassportImxProvider', () => {
  afterEach(jest.resetAllMocks);

  let passportImxProvider: PassportImxProvider;
  let signMessageMock: jest.Mock;
  let getSignableTransferV1Mock: jest.Mock;
  let createTransferV1Mock: jest.Mock;
  let getSignableCreateOrderMock: jest.Mock;
  let createOrderMock: jest.Mock;
  let getSignableCancelOrderMock: jest.Mock;
  let cancelOrderMock: jest.Mock;

  const mockUser = {
    etherKey: '123',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
    profile: {
      sub: '111',
    },
  };

  beforeEach(() => {
    signMessageMock = jest.fn();

    const starkSigner = {
      signMessage: signMessageMock,
      getAddress: jest.fn(),
    };

    getSignableTransferV1Mock = jest.fn();
    createTransferV1Mock = jest.fn();
    (TransfersApi as jest.Mock).mockReturnValue({
      getSignableTransferV1: getSignableTransferV1Mock,
      createTransferV1: createTransferV1Mock,
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

    passportImxProvider = new PassportImxProvider({
      user: mockUser,
      starkSigner,
      apiConfig: { basePath: 'http://test.com' },
    });
  });
  const starkSignature = 'starkSignature';

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
          stark_signature: starkSignature,
        },
      };
      const mockHeader = {
        headers: {
          Authorization: `Bearer ${mockUser.accessToken}`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };

      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response
      );
      signMessageMock.mockResolvedValue(starkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.transfer(
        mockTransferRequest as UnsignedTransferRequest
      );

      expect(getSignableTransferV1Mock).toBeCalledWith(
        mockSignableTransferRequest
      );
      expect(signMessageMock).toBeCalledWith(mockPayloadHash);
      expect(createTransferV1Mock).toBeCalledWith(
        mockCreateTransferRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferV1Mock.mockRejectedValue(new Error('Server is down'));

      await expect(() =>
        passportImxProvider.transfer(
          mockTransferRequest as UnsignedTransferRequest
        )
      ).rejects.toThrowError('Server is down');
    });
  });

  describe('registerOffchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.registerOffchain).toThrowError();
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.isRegisteredOnchain).toThrowError();
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
          stark_signature: starkSignature,
          fees: undefined,
          include_fees: true,
        },
        xImxEthAddress: '',
        xImxEthSignature: '',
      };
      const mockHeader = {
        headers: {
          Authorization: `Bearer ${mockUser.accessToken}`,
        },
      };
      const mockReturnValue = {
        status: 'success',
        time: 111,
        order_id: 123,
      };

      getSignableCreateOrderMock.mockResolvedValue(mockSignableOrderResponse);
      signMessageMock.mockResolvedValue(starkSignature);
      createOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.createOrder(orderRequest);

      expect(getSignableCreateOrderMock).toBeCalledWith(
        mockSignableOrderRequest
      );
      expect(signMessageMock).toBeCalledWith(mockPayloadHash);
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
          stark_signature: starkSignature,
        },
        xImxEthAddress: '',
        xImxEthSignature: '',
      };

      const mockHeader = {
        headers: {
          Authorization: `Bearer ${mockUser.accessToken}`,
        },
      };

      const mockReturnValue = {
        order_id: orderId,
        status: 'success',
      };

      getSignableCancelOrderMock.mockResolvedValue(
        mockSignableCancelOrderResponse
      );
      signMessageMock.mockResolvedValue(starkSignature);
      cancelOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.cancelOrder(cancelOrderRequest);

      expect(getSignableCancelOrderMock).toBeCalledWith(
        mockSignableCancelOrderRequest
      );
      expect(signMessageMock).toBeCalledWith(mockPayloadHash);
      expect(cancelOrderMock).toBeCalledWith(
        mockCancelOrderRequest,
        mockHeader
      );
      expect(result).toEqual(mockReturnValue);
    });
  });

  describe('createTrade', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.createTrade).toThrowError();
    });
  });

  describe('batchNftTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.batchNftTransfer).toThrowError();
    });
  });

  describe('exchangeTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.exchangeTransfer).toThrowError();
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit).toThrowError();
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal).toThrowError();
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal).toThrowError();
    });
  });
});
