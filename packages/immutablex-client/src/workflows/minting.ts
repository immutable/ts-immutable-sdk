/* eslint-disable @typescript-eslint/naming-convention */
import { Signer } from '@ethersproject/abstract-signer';
import { toUtf8Bytes } from '@ethersproject/strings';
import {
  MintRequest,
  MintTokensResponse,
} from '@imtbl/generated-clients/src/imx/models';
import {
  MintsApi,
  MintsApiMintTokensRequest,
} from '@imtbl/generated-clients/src/imx/api';
import { keccak256 } from '@ethersproject/keccak256';
import { UnsignedMintRequest } from '../types';
import { signRaw } from '../utils';

export async function mintingWorkflow(
  signer: Signer,
  request: UnsignedMintRequest,
  mintsApi: MintsApi,
): Promise<MintTokensResponse> {
  // TODO: improve this object key rearrangement.
  // object keys should respect this order, but the logic can be improved
  const users = request.users.map((user) => ({
    ether_key: user.user,
    tokens: user.tokens.map((token) => ({
      id: token.id,
      blueprint: token.blueprint,
      ...(token.royalties
        && token.royalties.length > 0 && {
        royalties: token.royalties.map((royalty) => ({
          recipient: royalty.recipient,
          percentage: royalty.percentage,
        })),
      }),
    })),
  }));

  const { royalties } = request;
  const signablePayload = {
    contract_address: request.contract_address,
    ...(royalties
      && royalties.length > 0 && {
      royalties: royalties.map((fee) => ({
        recipient: fee.recipient,
        percentage: fee.percentage,
      })),
    }),
    users,
    auth_signature: '',
  };

  const hash = keccak256(toUtf8Bytes(JSON.stringify(signablePayload)));
  const authSignature = await signRaw(hash, signer);

  const apiPayload: MintRequest = {
    users: signablePayload.users.map((user) => ({
      user: user.ether_key,
      tokens: user.tokens,
    })),
    ...(royalties && royalties.length > 0 && { royalties }),
    contract_address: request.contract_address,
    auth_signature: authSignature,
  };

  const apiRequest: MintsApiMintTokensRequest = {
    mintTokensRequestV2: [apiPayload],
  };

  const response = await mintsApi.mintTokens(apiRequest);

  return response.data;
}
