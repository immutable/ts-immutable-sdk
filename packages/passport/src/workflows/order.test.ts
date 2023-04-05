import {ETHAmount, OrdersApi, UnsignedOrderRequest, UnsignedTransferRequest} from '@imtbl/core-sdk';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { mockErrorMessage, mockStarkSignature, mockUser } from '../test/mocks';
import { cancelOrder, createOrder } from './order';
import { PassportConfiguration } from '../config';
import { Networks } from '../types';
import ConfirmationScreen from '../confirmation/confirmation';

jest.mock('../confirmation/confirmation');

describe('order', () => {
  const mockStartTransaction = jest.fn();

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  const passportConfig = {
    network: Networks.SANDBOX
  } as Partial<PassportConfiguration>;

  beforeEach(() => {
    jest.resetAllMocks();
    (ConfirmationScreen as jest.Mock).mockImplementation(() => ({
      startTransaction: mockStartTransaction,
    }));
  });

  describe('createOrder', () => {
    let getSignableCreateOrderMock: jest.Mock;
    let createOrderMock: jest.Mock;
    let ordersApiMock: OrdersApi;

    const buy = {type: 'ETH', amount: '2'} as ETHAmount;
    const sell = {type: 'ERC721', tokenId: '123', tokenAddress: '0x9999'};
    const expiration_timestamp = 1334302;
    const orderRequest = {
      buy,
      sell,
      expiration_timestamp,
    };

    beforeEach(() => {
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
      const {payload_hash: mockPayloadHash, ...restSignableOrderResponse} =
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
          Authorization: `Bearer ${mockUser.accessToken}`,
        },
      };
      const mockReturnValue = {
        status: 'success',
        time: 111,
        order_id: 123,
      };

      getSignableCreateOrderMock.mockResolvedValue(mockSignableOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      mockStartTransaction.mockResolvedValue({
        confirmed: true
      });
      createOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await createOrder({
        ordersApi: ordersApiMock,
        starkSigner: mockStarkSigner,
        user: mockUser,
        request: orderRequest as UnsignedOrderRequest,
        passportConfig: passportConfig as PassportConfiguration,
      });

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

    it('should return error if failed to call public api', async () => {
      getSignableCreateOrderMock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() =>
        createOrder({
          ordersApi: ordersApiMock,
          starkSigner: mockStarkSigner,
          user: mockUser,
          request: orderRequest as UnsignedOrderRequest,
          passportConfig: passportConfig as PassportConfiguration,
        })
      ).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.CREATE_ORDER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.CREATE_ORDER_ERROR
        )
      );
    });

    it('should return error if transfer is rejected by user', async () => {
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

      getSignableCreateOrderMock.mockResolvedValue(mockSignableOrderResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      mockStartTransaction.mockResolvedValue({
        confirmed: true
      });

      await expect(() =>
        createOrder({
          ordersApi: ordersApiMock,
          starkSigner: mockStarkSigner,
          user: mockUser,
          request: orderRequest as UnsignedOrderRequest,
          passportConfig: passportConfig as PassportConfiguration,
        })
      ).rejects.toThrowError('CREATE_ORDER_ERROR');
    });
  });

  describe('cancelOrder', () => {
    let getSignableCancelOrderMock: jest.Mock;
    let cancelOrderMock: jest.Mock;
    let ordersApiMock: OrdersApi;
    const orderId = 54321;
    const cancelOrderRequest = {
      order_id: orderId,
    };

    beforeEach(() => {
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
          stark_signature: mockStarkSignature,
        },
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
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      cancelOrderMock.mockResolvedValue({
        data: mockReturnValue,
      });
      mockStartTransaction.mockResolvedValue({
        confirmed: true
      });

      const result = await cancelOrder({
        ordersApi: ordersApiMock,
        starkSigner: mockStarkSigner,
        user: mockUser,
        request: cancelOrderRequest,
        passportConfig: passportConfig as PassportConfiguration,
      });

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

    it('should return error if transfer is rejected by user', async () => {
      const mockSignableCancelOrderResponse = {
        data: {
          payload_hash: '123123',
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

      await expect(() =>
        cancelOrder({
          ordersApi: ordersApiMock,
          starkSigner: mockStarkSigner,
          user: mockUser,
          request: cancelOrderRequest,
          passportConfig: passportConfig as PassportConfiguration,
        })
      ).rejects.toThrowError('CANCEL_ORDER_ERROR');
    });

    it('should return error if failed to call public api', async () => {
      getSignableCancelOrderMock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() =>
        cancelOrder({
          ordersApi: ordersApiMock,
          starkSigner: mockStarkSigner,
          user: mockUser,
          request: cancelOrderRequest,
          passportConfig: passportConfig as PassportConfiguration,
        })
      ).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.CANCEL_ORDER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.CANCEL_ORDER_ERROR
        )
      );
    });
  });
});
