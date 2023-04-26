import {
  CancelOrderResponse,
  CreateOrderResponse,
  GetSignableCancelOrderRequest,
  GetSignableOrderRequest,
  OrdersApi,
  OrdersApiCreateOrderRequest,
  UnsignedOrderRequest,
} from '@imtbl/core-sdk';
import { convertToSignableToken, signRaw } from '@imtbl/toolkit';
import { Signers } from './types';
import { validateChain } from './helpers';
import { ProviderConfiguration } from '../config';

type CreateOrderWorkflowParams = {
  signers: Signers;
  request: UnsignedOrderRequest;
  config: ProviderConfiguration;
};

type CancelOrderWorkflowParams = {
  signers: Signers;
  request: GetSignableCancelOrderRequest;
  config: ProviderConfiguration;
};

export async function createOrder({
  signers,
  request,
  config,
}: CreateOrderWorkflowParams): Promise<CreateOrderResponse> {
  await validateChain(signers.ethSigner, config.immutableXConfig);

  const ethAddress = await signers.ethSigner.getAddress();
  const ordersApi = new OrdersApi(config.immutableXConfig.apiConfiguration);

  const amountSell = request.sell.type === 'ERC721' ? '1' : request.sell.amount;
  const amountBuy = request.buy.type === 'ERC721' ? '1' : request.buy.amount;
  const getSignableOrderRequest: GetSignableOrderRequest = {
    user: ethAddress,
    amount_buy: amountBuy,
    token_buy: convertToSignableToken(request.buy),
    amount_sell: amountSell,
    token_sell: convertToSignableToken(request.sell),
    fees: request.fees,
    expiration_timestamp: request.expiration_timestamp,
  };

  const getSignableOrderResponse = await ordersApi.getSignableOrder({
    getSignableOrderRequestV3: getSignableOrderRequest,
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    getSignableOrderResponse.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkSigner.signMessage(payloadHash);

  const resp = getSignableOrderResponse.data;

  const orderParams: OrdersApiCreateOrderRequest = {
    createOrderRequest: {
      amount_buy: resp.amount_buy,
      amount_sell: resp.amount_sell,
      asset_id_buy: resp.asset_id_buy,
      asset_id_sell: resp.asset_id_sell,
      expiration_timestamp: resp.expiration_timestamp,
      include_fees: true,
      fees: request.fees,
      nonce: resp.nonce,
      stark_key: resp.stark_key,
      stark_signature: starkSignature,
      vault_id_buy: resp.vault_id_buy,
      vault_id_sell: resp.vault_id_sell,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  };

  const createOrderResponse = await ordersApi.createOrder(orderParams);

  return {
    ...createOrderResponse.data,
  };
}

export async function cancelOrder({
  signers,
  request,
  config,
}: CancelOrderWorkflowParams): Promise<CancelOrderResponse> {
  const ordersApi = new OrdersApi(config.immutableXConfig.apiConfiguration);

  const getSignableCancelOrderResponse = await ordersApi.getSignableCancelOrder(
    {
      getSignableCancelOrderRequest: {
        order_id: request.order_id,
      },
    }
  );

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    getSignableCancelOrderResponse.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkSigner.signMessage(payloadHash);

  const ethAddress = await signers.ethSigner.getAddress();

  const cancelOrderResponse = await ordersApi.cancelOrder({
    id: request.order_id.toString(),
    cancelOrderRequest: {
      order_id: request.order_id,
      stark_signature: starkSignature,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    order_id: cancelOrderResponse.data.order_id,
    status: cancelOrderResponse.data.status,
  };
}
