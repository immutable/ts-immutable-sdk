import { Address } from 'ox';
import {
  Payload,
  Signature as SequenceSignature,
} from '@0xsequence/wallet-primitives';

/**
 * Signer interface for Sequence wallet operations.
 * Used by non-zkEVM chains (e.g., Arbitrum).
 */
export interface SequenceSigner {
  /** Get the signer's address */
  getAddress(): Promise<string>;

  /** Sign a Sequence payload (for transactions) */
  signPayload(
    walletAddress: Address.Address,
    chainId: number,
    payload: Payload.Parented,
  ): Promise<SequenceSignature.SignatureOfSignerLeaf>;

  /** Sign a message (EIP-191 personal_sign) */
  signMessage(message: string | Uint8Array): Promise<string>;
}
