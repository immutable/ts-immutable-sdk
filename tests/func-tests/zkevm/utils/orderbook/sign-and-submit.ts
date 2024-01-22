import {
  PopulatedTransaction, Signer, TypedDataDomain,
  Wallet,
} from 'ethers';
import { GAS_OVERRIDES } from './gas';

export async function signAndSubmitTx(
  transaction: PopulatedTransaction,
  signer: Signer,
) {
  const rawTx = transaction;
  rawTx.nonce = await signer.getTransactionCount();
  rawTx.maxFeePerGas = GAS_OVERRIDES.maxFeePerGas;
  rawTx.maxPriorityFeePerGas = GAS_OVERRIDES.maxPriorityFeePerGas;
  const signedTx = await signer.sendTransaction(rawTx);
  await signedTx.wait();
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
