import { UnsignedOrderRequest, OrdersApi, GetSignableCancelOrderRequest } from '@imtbl/core-sdk';
import { parseEther } from '@ethersproject/units';
import { signRaw, convertToSignableToken } from '@imtbl/toolkit';
import { cancelOrder, createOrder } from './orders';
import { generateSigners, privateKey1, testConfig } from '../test/helpers';

jest.mock('@imtbl/core-sdk');
jest.mock('@imtbl/toolkit');

describe('Orders', () => {
  describe('createOrder()', () => {
    let getSignableOrderMock: jest.Mock;
    let createOrderMock: jest.Mock;
    const buyAmount = parseEther('30000').toString();

    const signableOrderRequest: UnsignedOrderRequest = {
      sell: {
        tokenAddress: '0x10',
        tokenId: 'abc123',
        type: 'ERC721',
      },
      buy: {
        type: 'ETH',
        amount: buyAmount,
      },
      fees: [],
    };
    const getSignableOrderResponse = {
      signable_message: 'hello',
      payload_hash: 'hash',
      amount_buy: buyAmount,
      amount_sell: 1,
      asset_id_buy: '1234',
      asset_id_sell: '5678',
      expiration_timestamp: 0,
      nonce: 0,
      stark_key: '0x10c',
      vault_id_buy: 'abc',
      vault_id_sell: 'def',
    };
    const createOrderResponse = {
      order_id: 0,
      request_id: '123456',
      status: 'some-status',
      time: 0,
    };

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableOrderMock = jest.fn().mockResolvedValue({
        data: getSignableOrderResponse,
      });
      createOrderMock = jest.fn().mockResolvedValue({
        data: createOrderResponse,
      });
      (OrdersApi as jest.Mock).mockReturnValue({
        getSignableOrder: getSignableOrderMock,
        createOrderV3: createOrderMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1);

      const response = await createOrder({
        signers,
        request: signableOrderRequest,
        config: testConfig,
      });
      expect(getSignableOrderMock).toHaveBeenCalledWith({
        getSignableOrderRequestV3: {
          user: await signers.ethSigner.getAddress(),
          amount_buy: buyAmount,
          token_buy: convertToSignableToken(signableOrderRequest.buy),
          amount_sell: '1',
          token_sell: convertToSignableToken(signableOrderRequest.sell),
          fees: signableOrderRequest.fees,
          expiration_timestamp: signableOrderRequest.expiration_timestamp,
        },
      });
      expect(createOrderMock).toHaveBeenCalledWith({
        createOrderRequest: {
          amount_buy: getSignableOrderResponse.amount_buy,
          amount_sell: getSignableOrderResponse.amount_sell,
          asset_id_buy: getSignableOrderResponse.asset_id_buy,
          asset_id_sell: getSignableOrderResponse.asset_id_sell,
          expiration_timestamp: getSignableOrderResponse.expiration_timestamp,
          fees: signableOrderRequest.fees,
          nonce: getSignableOrderResponse.nonce,
          stark_key: getSignableOrderResponse.stark_key,
          stark_signature:
            `${getSignableOrderResponse.payload_hash}STX${privateKey1}`,
          vault_id_buy: getSignableOrderResponse.vault_id_buy,
          vault_id_sell: getSignableOrderResponse.vault_id_sell,
        },
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: 'raw-eth-signature',
      });
      expect(response).toEqual(createOrderResponse);
    });
  });
  describe('cancelOrder()', () => {
    let getSignableCancelOrderMock: jest.Mock;
    let cancelOrderMock: jest.Mock;

    const signableCancelRequest: GetSignableCancelOrderRequest = {
      order_id: 1212,
    };
    const getSignableCancelResponse = {
      signable_message: 'hello',
      payload_hash: 'hash',
      order_id: 1212,
    };
    const createCancelResponse = {
      order_id: 0,
      status: 'some-status',
    };

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableCancelOrderMock = jest.fn().mockResolvedValue({
        data: getSignableCancelResponse,
      });
      cancelOrderMock = jest.fn().mockResolvedValue({
        data: createCancelResponse,
      });
      (OrdersApi as jest.Mock).mockReturnValue({
        getSignableCancelOrderV3: getSignableCancelOrderMock,
        cancelOrderV3: cancelOrderMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1);
      const starkSignature = `${getSignableCancelResponse.payload_hash}STX${privateKey1}`;

      const response = await cancelOrder({
        signers,
        request: signableCancelRequest,
        config: testConfig,
      });

      expect(getSignableCancelOrderMock).toHaveBeenCalledWith({
        getSignableCancelOrderRequest: signableCancelRequest,
      });

      expect(cancelOrderMock).toHaveBeenCalledWith({
        id: signableCancelRequest.order_id.toString(),
        cancelOrderRequest: {
          order_id: signableCancelRequest.order_id,
          stark_signature: starkSignature,
        },
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: 'raw-eth-signature',
      });
      expect(response).toEqual(createCancelResponse);
    });
  });
});
