import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { Wallet } from "@0xsequence/wallet-core";
import {
  Config,
  Payload,
  Signature as SequenceSignature,
} from "@0xsequence/wallet-primitives";
import { ISigner } from './signer/ISigner';
import { IdentityInstrumentSigner } from './signer/identityInstrumentSigner';
import { PrivateKeySigner } from './signer/privateKeySigner';
import { Address } from 'ox';

export default class SequenceSigner implements ISigner {
  private readonly identityInstrumentSigner: ISigner;
  private readonly privateKeySigner: ISigner;
  private readonly useIdentityInstrument: boolean;

  constructor(authManager: AuthManager, config: PassportConfiguration) {
    this.identityInstrumentSigner = new IdentityInstrumentSigner(authManager, config);
    this.privateKeySigner = new PrivateKeySigner(authManager);
    this.useIdentityInstrument = config.authenticationDomain !== 'https://auth.dev.immutable.com';
  }

  async getAddress(): Promise<string> {
    return this.useIdentityInstrument
      ? this.identityInstrumentSigner.getAddress()
      : this.privateKeySigner.getAddress();
  }

  async getWalletConfig(): Promise<Config.Config> {
    return this.useIdentityInstrument
      ? this.identityInstrumentSigner.getWalletConfig()
      : this.privateKeySigner.getWalletConfig();
  }

  async signPayload(walletAddress: Address.Address, chainId: number, payload: Payload.Parented): Promise<SequenceSignature.SignatureOfSignerLeaf> {
    return this.useIdentityInstrument
      ? this.identityInstrumentSigner.signPayload(walletAddress, chainId, payload)
      : this.privateKeySigner.signPayload(walletAddress, chainId, payload);
  }

  async signMessage(message: string): Promise<string> {
    return this.useIdentityInstrument
      ? this.identityInstrumentSigner.signMessage(message)
      : this.privateKeySigner.signMessage(message);
  }
}
