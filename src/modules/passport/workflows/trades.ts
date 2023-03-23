import {
  CreateTradeResponse,
  GetSignableTradeRequest,
  StarkSigner,
  TradesApi,
  TradesApiCreateTradeRequest
} from "@imtbl/core-sdk";
import { PassportErrorType, withPassportError } from '../errors/passportError';
import { UserWithEtherKey } from "../types";

type CreateTradeParams = {
  request: GetSignableTradeRequest;
  tradesApi: TradesApi;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
}

export async function createTrade({
    request,
    tradesApi,
    user,
    starkSigner
  }: CreateTradeParams): Promise<CreateTradeResponse> {
  return withPassportError<CreateTradeResponse>(async () => {
    const ethAddress = user.etherKey;
    const getSignableTradeRequest: GetSignableTradeRequest = {
      'expiration_timestamp': request.expiration_timestamp,
      'fees': request.fees,
      'order_id': request.order_id,
      'user': ethAddress
    }

    const getSignableTradeResponse = await tradesApi.getSignableTrade({
      getSignableTradeRequest
    })

    const {data: {payload_hash: payloadHash}} = getSignableTradeResponse;
    const starkSignature = await starkSigner.signMessage(payloadHash);
    const {data: signableResultData} = getSignableTradeResponse;

    const tradeParams: TradesApiCreateTradeRequest = {
      createTradeRequest: {
        include_fees: true,
        fees: request?.fees,
        stark_signature: starkSignature,
        order_id: request?.order_id,

        fee_info: signableResultData?.fee_info,
        amount_buy: signableResultData?.amount_buy,
        amount_sell: signableResultData?.amount_sell,
        asset_id_buy: signableResultData?.asset_id_buy,
        asset_id_sell: signableResultData?.asset_id_sell,
        expiration_timestamp: signableResultData?.expiration_timestamp,
        nonce: signableResultData?.nonce,
        stark_key: signableResultData?.stark_key,
        vault_id_buy: signableResultData?.vault_id_buy,
        vault_id_sell: signableResultData?.vault_id_sell,
      },
      // Notes[ID-451]: this is 2 params to bypass the Client non-empty check,
      // Should be able to remove it once the Backend have update the API
      // and generated the New Client
      xImxEthAddress: '',
      xImxEthSignature: '',
    }

    const headers = {Authorization: 'Bearer ' + user.accessToken}
    const {data: createTradeResponse} = await tradesApi.createTrade(tradeParams, {
      headers,
    })
    return {
      ...createTradeResponse,
    }
  }, PassportErrorType.CREATE_TRADE_ERROR)
}
