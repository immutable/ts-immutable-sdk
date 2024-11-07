import { EthSigner, ImmutableXConfiguration } from '@imtbl/x-client';

function isChainValid(chainID: number, config: ImmutableXConfiguration) {
  return chainID === config.ethConfiguration.chainID;
}

export async function validateChain(
  signer: EthSigner,
  config: ImmutableXConfiguration,
) {
  // @ts-expect-error getChainId is not in the types for signer but it is in the implementation
  const chainID = await signer.getChainId();

  if (!isChainValid(Number(chainID), config)) {
    throw new Error(
      'The wallet used for this operation is not connected to the correct network.',
    );
  }
}
