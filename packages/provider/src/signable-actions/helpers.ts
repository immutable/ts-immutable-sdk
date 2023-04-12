import { ImmutableXConfiguration } from '@imtbl/core-sdk';
import { EthSigner } from '@imtbl/core-sdk';

function isChainValid(chainID: number, config: ImmutableXConfiguration) {
  return chainID === config.ethConfiguration.chainID;
}

export async function validateChain(
  signer: EthSigner,
  config: ImmutableXConfiguration
) {
  const chainID = await signer.getChainId();

  if (!isChainValid(chainID, config))
    throw new Error(
      'The wallet used for this operation is not connected to the correct network.'
    );
}
