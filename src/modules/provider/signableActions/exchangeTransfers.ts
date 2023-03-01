import { CreateTransferResponseV1, UnsignedExchangeTransferRequest } from "../../../types";
import { convertToSignableToken } from "./utils/convertToSignableToken";
import { signRaw } from "./utils/crypto";
import { Signers } from "./types";
import { Immutable } from "../../apis/starkex";
import { ExchangesApi } from "@imtbl/core-sdk";
import { validateChain } from "./helpers";


type TransfersWorkflowParams = {
  signers: Signers
  request: UnsignedExchangeTransferRequest;
  imx: Immutable;
};

export async function exchangeTransfersWorkflow({
    signers,
    request,
    imx,
  }: TransfersWorkflowParams): Promise<CreateTransferResponseV1> {
  await validateChain(signers.ethSigner, imx.getConfiguration());

  const exchangeApi = new ExchangesApi(imx.getConfiguration().apiConfiguration)
  const ethAddress = await signers.ethSigner.getAddress();

  const transferAmount = request.amount;
  const signableResult = await exchangeApi.getExchangeSignableTransfer({
    id: request.transactionID,
    getSignableTransferRequest: {
      sender: ethAddress,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkExSigner.signMessage(payloadHash);

  const transferSigningParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sender_stark_key: signableResult.data.sender_stark_key!,
    sender_vault_id: signableResult.data.sender_vault_id,
    receiver_stark_key: signableResult.data.receiver_stark_key,
    receiver_vault_id: signableResult.data.receiver_vault_id,
    asset_id: signableResult.data.asset_id,
    amount: signableResult.data.amount,
    nonce: signableResult.data.nonce,
    expiration_timestamp: signableResult.data.expiration_timestamp,
    stark_signature: starkSignature,
  };

  const response = await exchangeApi.createExchangeTransfer({
    id: request.transactionID,
    createTransferRequest: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    sent_signature: response?.data.sent_signature,
    status: response?.data.status?.toString(),
    time: response?.data.time,
    transfer_id: response?.data.transfer_id,
  };
}
