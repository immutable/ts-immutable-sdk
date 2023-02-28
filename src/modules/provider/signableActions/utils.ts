import { Config, EthSigner } from "@imtbl/core-sdk";


function isChainValid(chainID: number) {
  return chainID === Config.SANDBOX.ethConfiguration.chainID;
}

export async function validateChain(signer: EthSigner) {
  const chainID = await signer.getChainId();

  if (!isChainValid(chainID))
    throw new Error(
      'The wallet used for this operation is not from the correct network.',
    );
}
