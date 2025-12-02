import { Config, Payload, Signature as SequenceSignature } from '@0xsequence/wallet-primitives';
import { Address } from 'ox';

export interface ISigner {
  getAddress(): Promise<string>;
  getWalletConfig(): Promise<Config.Config>;
  signPayload(walletAddress: Address.Address, chainId: number, payload: Payload.Parented): Promise<SequenceSignature.SignatureOfSignerLeaf>;
  signMessage(message: string): Promise<string>;
}

