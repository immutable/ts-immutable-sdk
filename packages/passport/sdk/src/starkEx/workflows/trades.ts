import { imx } from '@imtbl/generated-clients';
import { RegisteredUserAndSigners } from '../../types';
import { PassportErrorType, withPassportError } from '../../errors/passportError';
import GuardianClient from '../../guardian';

type CreateTradeParams = {
  request: imx.GetSignableTradeRequest;
  tradesApi: imx.TradesApi;
  guardianClient: GuardianClient,
  getRegisteredImxUserAndSigners: () => Promise<RegisteredUserAndSigners>;
};

export async function createTrade({
  request,
  tradesApi,
  guardianClient,
  getRegisteredImxUserAndSigners,
}: CreateTradeParams): Promise<imx.CreateTradeResponse> {
  return withPassportError<imx.CreateTradeResponse>(guardianClient.withDefaultConfirmationScreenTask(async () => {
    const { user, starkSigner } = await getRegisteredImxUserAndSigners();
    const { ethAddress } = user.imx;
    const getSignableTradeRequest: imx.GetSignableTradeRequest = {
      expiration_timestamp: request.expiration_timestamp,
      fees: request.fees,
      order_id: request.order_id,
      user: ethAddress,
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = { Authorization: `Bearer ${user.accessToken}` };

    const getSignableTradeResponse = await tradesApi.getSignableTrade({
      getSignableTradeRequest,

    }, { headers });

    await guardianClient.evaluateImxTransaction({
      payloadHash: getSignableTradeResponse.data.payload_hash,
    });

    const { payload_hash: payloadHash } = getSignableTradeResponse.data;
    const starkSignature = await starkSigner.signMessage(payloadHash);
    const { data: signableResultData } = getSignableTradeResponse;

    const tradeParams: imx.TradesApiCreateTradeV3Request = {
      createTradeRequest: {
        include_fees: true,
        fees: request?.fees,
        stark_signature: starkSignature,
        order_id: request?.order_id,

        fee_info: signableResultData.fee_info,
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

    const { data: createTradeResponse } = await tradesApi.createTradeV3(
      tradeParams,
      {
        headers,
      },
    );
    return createTradeResponse;
  }), PassportErrorType.CREATE_TRADE_ERROR);
}
