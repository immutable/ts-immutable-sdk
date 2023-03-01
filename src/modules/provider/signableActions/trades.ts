import { CreateTradeResponse, GetSignableTradeRequest } from "src/types";
import { Signers } from "./types";
import { validateChain } from "./helpers";
import { signRaw } from "./utils/crypto";
import { ImmutableX } from "../../apis/starkex";

type createTradeWorkflowParams = {
  signers: Signers;
  request: GetSignableTradeRequest;
  imx: ImmutableX;
};

export async function createTrade({
    signers: {
      ethSigner,
      starkExSigner,
    },
    request,
    imx
  }: createTradeWorkflowParams): Promise<CreateTradeResponse> {
  await validateChain(ethSigner, imx.getConfig());
  const ethAddress = await ethSigner.getAddress();

  const signableResult = await imx.StarkEx.tradesApi.getSignableTrade({
    getSignableTradeRequest: {
      user: ethAddress,
      order_id: request.order_id,
      fees: request.fees,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkExSigner.signMessage(payloadHash);

  const createTradeResponse = await imx.StarkEx.tradesApi.createTrade({
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
