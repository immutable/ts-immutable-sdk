import {
  ETHAmount,
  OrdersApi,
  StarkSigner,
  UnsignedOrderRequest,
} from '@imtbl/core-sdk';
import { cancelOrder, createOrder } from './order';

describe('order', () => {
  afterEach(jest.resetAllMocks);
  const mockUser = {
    etherKey: '123',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
    profile: {
      sub: '111',
    },
  };
  const starkSignature = 'starkSignature';

  describe('createOrder', () => {
    let signMessageMock: jest.Mock;
    let getSignableCreateOrderMock: jest.Mock;
    let createOrderMock: jest.Mock;
    let ordersApiMock: OrdersApi;
    let starkSigner: StarkSigner;

    const buy = { type: 'ETH', amount: '2' } as ETHAmount;
    const sell = { type: 'ERC721', tokenId: '123', tokenAddress: '0x9999' };
    const expiration_timestamp = 1334302;
    const orderRequest = {
      buy,
      sell,
      expiration_timestamp,
    };

    beforeEach(() => {
      signMessageMock = jest.fn();

      starkSigner = {
        signMessage: signMessageMock,
        getAddress: jest.fn(),
      };

      getSignableCreateOrderMock = jest.fn();
      createOrderMock = jest.fn();
      ordersApiMock = {
        getSignableOrder: getSignableCreateOrderMock,
        createOrder: createOrderMock,
      } as unknown as OrdersApi;
    });

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

      const result = await createOrder({
        ordersApi: ordersApiMock,
        starkSigner,
        user: mockUser,
        request: orderRequest as UnsignedOrderRequest,
      });

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

    it('should return error if failed to call public api', async () => {
      getSignableCreateOrderMock.mockRejectedValue(new Error('Server is down'));

      await expect(() =>
        createOrder({
          ordersApi: ordersApiMock,
          starkSigner,
          user: mockUser,
          request: orderRequest as UnsignedOrderRequest,
        })
      ).rejects.toThrowError('Server is down');
    });
  });

  describe('cancelOrder', () => {
    let signMessageMock: jest.Mock;
    let getSignableCancelOrderMock: jest.Mock;
    let cancelOrderMock: jest.Mock;
    let ordersApiMock: OrdersApi;
    let starkSigner: StarkSigner;
    const orderId = 54321;
    const cancelOrderRequest = {
      order_id: orderId,
    };

    beforeEach(() => {
      signMessageMock = jest.fn();

      starkSigner = {
        signMessage: signMessageMock,
        getAddress: jest.fn(),
      };

      getSignableCancelOrderMock = jest.fn();
      cancelOrderMock = jest.fn();
      ordersApiMock = {
        getSignableCancelOrder: getSignableCancelOrderMock,
        cancelOrder: cancelOrderMock,
      } as unknown as OrdersApi;
    });

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

      const result = await cancelOrder({
        ordersApi: ordersApiMock,
        starkSigner,
        user: mockUser,
        request: cancelOrderRequest,
      });

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

    it('should return error if failed to call public api', async () => {
      getSignableCancelOrderMock.mockRejectedValue(new Error('Server is down'));

      await expect(() =>
        cancelOrder({
          ordersApi: ordersApiMock,
          starkSigner,
          user: mockUser,
          request: cancelOrderRequest,
        })
      ).rejects.toThrowError('Server is down');
    });
  });
});
