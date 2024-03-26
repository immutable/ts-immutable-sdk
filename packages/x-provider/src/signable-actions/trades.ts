import { GetSignableTradeRequest, CreateTradeResponse } from '@imtbl/x-client';
import { imx } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { Signers } from './types';
import { validateChain } from './helpers';
import { ProviderConfiguration } from '../config';

type CreateTradeWorkflowParams = {
  signers: Signers;
  request: GetSignableTradeRequest;
  config: ProviderConfiguration;
};

export async function createTrade({
  signers: { ethSigner, starkSigner },
  request,
  config,
}: CreateTradeWorkflowParams): Promise<CreateTradeResponse> {
  await validateChain(ethSigner, config.immutableXConfig);
  const ethAddress = await ethSigner.getAddress();
  const tradesApi = new imx.TradesApi(config.immutableXConfig.apiConfiguration);

  const signableResult = await tradesApi.getSignableTrade({
    getSignableTradeRequest: {
      user: ethAddress,
      order_id: request.order_id,
      fees: request.fees,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const createTradeResponse = await tradesApi.createTradeV3({
    createTradeRequest: {
      amount_buy: signableResult.data.amount_buy,
      amount_sell: signableResult.data.amount_sell,
      asset_id_buy: signableResult.data.asset_id_buy,
      asset_id_sell: signableResult.data.asset_id_sell,
      expiration_timestamp: signableResult.data.expiration_timestamp,
      fee_info: signableResult.data.fee_info,
      fees: request.fees,
      include_fees: true,
      nonce: signableResult.data.nonce,
      order_id: request.order_id,
      stark_key: signableResult.data.stark_key,
      vault_id_buy: signableResult.data.vault_id_buy,
      vault_id_sell: signableResult.data.vault_id_sell,
      stark_signature: starkSignature,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return createTradeResponse.data;
}
