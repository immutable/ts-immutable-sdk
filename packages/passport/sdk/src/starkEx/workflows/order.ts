import { imx } from '@imtbl/generated-clients';
import {
  StarkSigner,
  UnsignedOrderRequest,
} from '@imtbl/x-client';
import { convertToSignableToken } from '@imtbl/toolkit';
import { PassportErrorType, withPassportError } from '../../errors/passportError';
import { UserImx } from '../../types';
import GuardianClient from '../../guardian';
import { LoadingResult } from '../../confirmation';

type CancelOrderParams = {
  request: imx.GetSignableCancelOrderRequest;
  ordersApi: imx.OrdersApi;
  user: UserImx;
  starkSigner: StarkSigner;
  guardianClient: GuardianClient;
};

type CreateOrderParams = {
  request: UnsignedOrderRequest;
  ordersApi: imx.OrdersApi;
  user: UserImx;
  starkSigner: StarkSigner;
  guardianClient: GuardianClient;
};

const ERC721 = 'ERC721';

export async function createOrder({
  starkSigner,
  user,
  request,
  ordersApi,
  guardianClient,
}: CreateOrderParams): Promise<imx.CreateOrderResponse> {
  return withPassportError<imx.CreateOrderResponse>(guardianClient.withDefaultConfirmationScreenTask(
    async (isScreenReadyPromise: Promise<LoadingResult | undefined>) => {
      const { ethAddress } = user.imx;
      const amountSell = request.sell.type === ERC721 ? '1' : request.sell.amount;
      const amountBuy = request.buy.type === ERC721 ? '1' : request.buy.amount;
      const headers = { Authorization: `Bearer ${user.accessToken}` };

      const getSignableOrderRequestV3: imx.GetSignableOrderRequest = {
        user: ethAddress,
        amount_buy: amountBuy,
        token_buy: convertToSignableToken(request.buy),
        amount_sell: amountSell,
        token_sell: convertToSignableToken(request.sell),
        fees: request.fees,
        split_fees: true,
        expiration_timestamp: request.expiration_timestamp,
      };

      const getSignableOrderResponse = await ordersApi.getSignableOrder(
        {
          getSignableOrderRequestV3,
        },
        { headers },
      );

      await guardianClient.evaluateImxTransaction({
        payloadHash: getSignableOrderResponse.data.payload_hash,
        isScreenReadyPromise,
      });

      const { payload_hash: payloadHash } = getSignableOrderResponse.data;

      const starkSignature = await starkSigner.signMessage(payloadHash);

      const signableResultData = getSignableOrderResponse.data;

      const orderParams: imx.OrdersApiCreateOrderV3Request = {
        createOrderRequest: {
          include_fees: true,
          fees: request.fees,
          stark_signature: starkSignature,

          amount_buy: signableResultData.amount_buy,
          amount_sell: signableResultData.amount_sell,
          asset_id_buy: signableResultData.asset_id_buy,
          asset_id_sell: signableResultData.asset_id_sell,
          expiration_timestamp: signableResultData.expiration_timestamp,
          nonce: signableResultData.nonce,
          stark_key: signableResultData.stark_key,
          vault_id_buy: signableResultData.vault_id_buy,
          vault_id_sell: signableResultData.vault_id_sell,
        },
      };

      const createOrderResponse = await ordersApi.createOrderV3(orderParams, {
        headers,
      });

      return {
        ...createOrderResponse.data,
      };
    },
  ), PassportErrorType.CREATE_ORDER_ERROR);
}

export async function cancelOrder({
  user,
  starkSigner,
  request,
  ordersApi,
  guardianClient,
}: CancelOrderParams): Promise<imx.CancelOrderResponse> {
  return withPassportError<imx.CancelOrderResponse>(guardianClient.withDefaultConfirmationScreenTask(
    async (isScreenReadyPromise: Promise<LoadingResult | undefined>) => {
      const getSignableCancelOrderRequest: imx.GetSignableCancelOrderRequest = {
        order_id: request.order_id,
      };

      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${user.accessToken}`,
      };
      const getSignableCancelOrderResponse = await ordersApi.getSignableCancelOrderV3({
        getSignableCancelOrderRequest,
      }, { headers });

      await guardianClient.evaluateImxTransaction({
        payloadHash: getSignableCancelOrderResponse.data.payload_hash,
        isScreenReadyPromise,
      });

      const { payload_hash: payloadHash } = getSignableCancelOrderResponse.data;

      const starkSignature = await starkSigner.signMessage(payloadHash);

      const cancelOrderResponse = await ordersApi.cancelOrderV3(
        {
          id: request.order_id.toString(),
          cancelOrderRequest: {
            order_id: request.order_id,
            stark_signature: starkSignature,
          },
        },
        { headers },
      );

      return {
        order_id: cancelOrderResponse.data.order_id,
        status: cancelOrderResponse.data.status,
      };
    },
  ), PassportErrorType.CANCEL_ORDER_ERROR);
}
