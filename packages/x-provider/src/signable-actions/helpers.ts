import { EthSigner, ImmutableXConfiguration } from '@imtbl/x-client';

function isChainValid(chainID: number, config: ImmutableXConfiguration) {
  return chainID === config.ethConfiguration.chainID;
}

export async function validateChain(
  signer: EthSigner,
  config: ImmutableXConfiguration,
) {
  const chainID = (await signer.provider?.getNetwork())?.chainId;

  if (!isChainValid(Number(chainID), config)) {
    throw new Error(
      'The wallet used for this operation is not connected to the correct network.',
    );
  }
}
