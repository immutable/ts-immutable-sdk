import { toUtf8Bytes, keccak256, hashMessage, SigningKey } from 'ethers';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import AuthManager from '../../authManager';
import { User } from '../../types';
import { Signers } from '@0xsequence/wallet-core';
import {
  Config,
  Payload,
  Signature as SequenceSignature,
} from '@0xsequence/wallet-primitives';
import { ISigner } from './ISigner';
import { Address } from 'ox';

interface PrivateKeyWallet {
  userIdentifier: string;
  signerAddress: string;
  signer: Signers.Pk.Pk;
}

export class PrivateKeySigner implements ISigner {
  private readonly authManager: AuthManager;
  private privateKeyWallet: PrivateKeyWallet | null = null;
  private createWalletPromise: Promise<PrivateKeyWallet> | null = null;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  private async getUserOrThrow(): Promise<User> {
    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError(
        'User not authenticated',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return user;
  }

  private async getWalletInstance(): Promise<PrivateKeyWallet> {
    let { privateKeyWallet } = this;
    if (!privateKeyWallet) {
      privateKeyWallet = await this.createWallet();
    }

    const user = await this.getUserOrThrow();
    if (user.profile.sub !== privateKeyWallet.userIdentifier) {
      privateKeyWallet = await this.createWallet(user);
    }

    return privateKeyWallet;
  }

  private async createWallet(user?: User): Promise<PrivateKeyWallet> {
    if (this.createWalletPromise) return this.createWalletPromise;

    this.createWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.privateKeyWallet = null;
        const authenticatedUser = user || await this.getUserOrThrow();
        
        const privateKeyHash = keccak256(toUtf8Bytes(`${authenticatedUser.profile.sub}-sequence-arb-one`)) as `0x${string}`;
        console.log(`privateKeyHash = ${privateKeyHash}`);
        let signer = new Signers.Pk.Pk(privateKeyHash);

        const signerAddress = signer.address;

        this.privateKeyWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          signerAddress,
          signer,
        };

        return resolve(this.privateKeyWallet!);
      } catch (error) {
        const errorMessage = `Failed to create private key wallet: ${(error as Error).message}`;
        return reject(new PassportError(errorMessage, PassportErrorType.WALLET_CONNECTION_ERROR));
      } finally {
        this.createWalletPromise = null;
      }
    });

    return this.createWalletPromise;
  }

  async getAddress(): Promise<string> {
    console.log('getAddress');
    const wallet = await this.getWalletInstance();
    const privateKey = keccak256(toUtf8Bytes(`${wallet.userIdentifier}-sequence-arb-one`));
    console.log(`sequence privateKey = ${privateKey}`);
    console.log(`sequence wallet.signerAddress = ${wallet.signerAddress}`);
    return wallet.signerAddress;
  }

  async signPayload(walletAddress: Address.Address, chainId: number, payload: Payload.Parented): Promise<SequenceSignature.SignatureOfSignerLeaf> {
    const pkWallet = await this.getWalletInstance();
    return pkWallet.signer.sign(walletAddress, chainId, payload);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const pkWallet = await this.getWalletInstance();
    
    const privateKeyHash = keccak256(toUtf8Bytes(`${pkWallet.userIdentifier}-sequence-arb-one`)) as `0x${string}`;
    const signingKey = new SigningKey(privateKeyHash);
    
    return signingKey.sign(hashMessage(message)).serialized;
  }
}

