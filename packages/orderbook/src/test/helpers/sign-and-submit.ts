import {
  PopulatedTransaction, Signer, TypedDataDomain,
  providers, Wallet,
} from 'ethers';

export async function signAndSubmitTx(
  transaction: PopulatedTransaction,
  signer: Signer,
  provider: providers.Provider,
) {
  const rawTx = transaction;
  rawTx.nonce = await signer.getTransactionCount();
  rawTx.gasPrice = (await provider.getGasPrice()).mul(2);
  const signedTx = await signer.signTransaction(rawTx);
  const receipt = await provider.sendTransaction(signedTx);
  await receipt.wait();
}

export async function signMessage(
  {
    domain,
    types,
    value,
  }: { domain: TypedDataDomain, types: any, value: Record<string, any> },
  signer: Wallet,
): Promise<string> {
  // eslint-disable-next-line
  return signer._signTypedData(domain, types, value);
}
