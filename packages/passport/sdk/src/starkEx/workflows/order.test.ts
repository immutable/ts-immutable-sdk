import { imx } from '@imtbl/generated-clients';
import { ETHAmount, UnsignedOrderRequest } from '@imtbl/x-client';
import GuardianClient from '../../guardian';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import { mockErrorMessage, mockStarkSignature, mockUserImx } from '../../test/mocks';
import { cancelOrder, createOrder } from './order';

jest.mock('../../guardian');

describe('order', () => {
  const mockGuardianClient = new GuardianClient({} as any);

  beforeEach(() => {
    (mockGuardianClient.withDefaultConfirmationScreenTask as jest.Mock).mockImplementation((task) => task);
  });

  afterEach(jest.resetAllMocks);

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  describe('createOrder', () => {
    let mockGetSignableCreateOrder: jest.Mock;
    let mockCreateOrder: jest.Mock;
    let mockOrdersApi: imx.OrdersApi;

    const buy = { type: 'ETH', amount: '2' } as ETHAmount;
    const sell = { type: 'ERC721', tokenId: '123', tokenAddress: '0x9999' };
    const expiration_timestamp = 1334302;
    const orderRequest = {
      buy,
      sell,
      expiration_timestamp,
    };

    beforeEach(() => {
      mockGetSignableCreateOrder = jest.fn();
      mockCreateOrder = jest.fn();
      mockOrdersApi = {
        getSignableOrder: mockGetSignableCreateOrder,
        createOrderV3: mockCreateOrder,
      } as unknown as imx.OrdersApi;
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
          user: mockUserImx.imx.ethAddress,
          split_fees: true,
        },
      };

      const mockSignableOrderResponse = {
        data: {
          payload_hash: '123123',
          amount_buy: buy.amount,
          amount_sell: '1',
          asset_id_buy: '5530812',
          asset_id_sell: '8024836',
          expiration_timestamp,
          nonce: '847570072',
          stark_key: '0x1234',
          vault_id_buy:
            '0x02705737cd248ac819034b5de474c8f0368224f72a0fda9e031499d519992d9e',
          vault_id_sell:
            '0x04006590f0986f008231e309b980e81f8a55944a702ec633b47ceb326242c9f8',
        },
      };
      const {
        payload_hash: mockPayloadHash,
        ...restSignableOrderResponse
      } = mockSignableOrderResponse.data;
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserImx.accessToken}`,
        },
      };
      const mockReturnValue = {
        status: 'success',
        time: 111,
        order_id: 123,
      };

      mockGetSignableCreateOrder.mockResolvedValue(mockSignableOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      mockCreateOrder.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await createOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: orderRequest as UnsignedOrderRequest,
        guardianClient: mockGuardianClient,
      });

      expect(mockGetSignableCreateOrder).toBeCalledWith(mockSignableOrderRequest, mockHeader);
      expect(mockGuardianClient.withDefaultConfirmationScreenTask).toBeCalled();
      expect(mockGuardianClient.evaluateImxTransaction)
        .toBeCalledWith({ payloadHash: mockSignableOrderResponse.data.payload_hash });
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockCreateOrder).toBeCalledWith(
        mockCreateOrderRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if failed to call public api', async () => {
      mockGetSignableCreateOrder.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => createOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: orderRequest as UnsignedOrderRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          mockErrorMessage,
          PassportErrorType.CREATE_ORDER_ERROR,
        ),
      );
    });

    it('should return error if transfer is rejected by user', async () => {
      mockGetSignableCreateOrder.mockRejectedValue(new Error(mockErrorMessage));
      const mockSignableOrderResponse = {
        data: {
          payload_hash: '123123',
          amount_buy: buy.amount,
          amount_sell: '1',
          asset_id_buy: '5530812',
          asset_id_sell: '8024836',
          expiration_timestamp,
          nonce: '847570072',
          stark_key: '0x1234',
          vault_id_buy:
            '0x02705737cd248ac819034b5de474c8f0368224f72a0fda9e031499d519992d9e',
          vault_id_sell:
            '0x04006590f0986f008231e309b980e81f8a55944a702ec633b47ceb326242c9f8',
        },
      };

      mockGetSignableCreateOrder.mockResolvedValue(mockSignableOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      (mockGuardianClient.evaluateImxTransaction as jest.Mock)
        .mockRejectedValue(new Error('Transaction rejected by user'));

      await expect(() => createOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: orderRequest as UnsignedOrderRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrowError(new PassportError(
        'Transaction rejected by user',
        PassportErrorType.CREATE_ORDER_ERROR,
      ));
      expect(mockGuardianClient.withDefaultConfirmationScreenTask).toBeCalled();
      expect(mockGuardianClient.evaluateImxTransaction)
        .toBeCalledWith({ payloadHash: mockSignableOrderResponse.data.payload_hash });
    });
  });

  describe('cancelOrder', () => {
    let mockGetSignableCancelOrder: jest.Mock;
    let mockCancelOrder: jest.Mock;
    let mockOrdersApi: imx.OrdersApi;
    const orderId = 54321;
    const cancelOrderRequest = {
      order_id: orderId,
    };

    beforeEach(() => {
      mockGetSignableCancelOrder = jest.fn();
      mockCancelOrder = jest.fn();
      mockOrdersApi = {
        getSignableCancelOrderV3: mockGetSignableCancelOrder,
        cancelOrderV3: mockCancelOrder,
      } as unknown as imx.OrdersApi;
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

      const { payload_hash: mockPayloadHash } = mockSignableCancelOrderResponse.data;

      const mockCancelOrderRequest = {
        id: orderId.toString(),
        cancelOrderRequest: {
          order_id: orderId,
          stark_signature: mockStarkSignature,
        },
      };

      const mockHeader = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserImx.accessToken}`,
        },
      };

      const mockReturnValue = {
        order_id: orderId,
        status: 'success',
      };

      mockGetSignableCancelOrder.mockResolvedValue(
        mockSignableCancelOrderResponse,
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      mockCancelOrder.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await cancelOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: cancelOrderRequest,
        guardianClient: mockGuardianClient,
      });

      expect(mockGetSignableCancelOrder).toBeCalledWith(
        mockSignableCancelOrderRequest,
        mockHeader,
      );
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockGuardianClient.withDefaultConfirmationScreenTask).toBeCalled();
      expect(mockGuardianClient.evaluateImxTransaction)
        .toBeCalledWith({ payloadHash: mockPayloadHash });
      expect(mockCancelOrder).toBeCalledWith(
        mockCancelOrderRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if transfer is rejected by user', async () => {
      const mockSignableCancelOrderResponse = {
        data: {
          payload_hash: '123123',
        },
      };

      mockGetSignableCancelOrder.mockResolvedValue(mockSignableCancelOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      (mockGuardianClient.evaluateImxTransaction as jest.Mock)
        .mockRejectedValue(new Error('Transaction rejected by user'));

      await expect(() => cancelOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: cancelOrderRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrowError(new PassportError(
        'Transaction rejected by user',
        PassportErrorType.CANCEL_ORDER_ERROR,
      ));
    });

    it('should return error if failed to call public api', async () => {
      mockGetSignableCancelOrder.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => cancelOrder({
        ordersApi: mockOrdersApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: cancelOrderRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          mockErrorMessage,
          PassportErrorType.CANCEL_ORDER_ERROR,
        ),
      );
    });
  });
});
