import { BigNumberish, ethers } from 'ethers';
import { Transaction, TransactionEncoded } from './types';

export const META_TRANSACTIONS_TYPE = `tuple(
  bool delegateCall,
  bool revertOnError,
  uint256 gasLimit,
  address target,
  uint256 value,
  bytes data
)[]`;

export function sequenceTxAbiEncode(txs: Transaction[]): TransactionEncoded[] {
  return txs.map((t) => ({
    delegateCall: t.delegateCall === true,
    revertOnError: t.revertOnError === true,
    gasLimit: t.gasLimit !== undefined ? t.gasLimit : ethers.constants.Zero,
    target: t.to ?? ethers.constants.AddressZero,
    value: t.value !== undefined ? t.value : ethers.constants.Zero,
    data: t.data !== undefined ? t.data : [],
  }));
}

export function digestOfTransactionsNonce(nonce: BigNumberish, ...txs: Transaction[]) {
  const packMetaTransactionsNonceData = ethers.utils.defaultAbiCoder.encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, sequenceTxAbiEncode(txs)],
  );
  return ethers.utils.keccak256(packMetaTransactionsNonceData);
}
