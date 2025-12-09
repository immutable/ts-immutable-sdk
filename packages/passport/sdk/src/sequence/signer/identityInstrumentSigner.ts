import { toUtf8Bytes, hashMessage, toBeHex, concat, getBytes } from 'ethers';
import { Identity } from '@0xsequence/wallet-wdk';
import { IdentityInstrument, IdTokenChallenge } from '@0xsequence/identity-instrument';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import AuthManager from '../../authManager';
import { PassportConfiguration } from '../../config';
import { User } from '../../types';
import { Hex, Address } from 'ox';
import jwtDecode from 'jwt-decode';
import { IdTokenPayload } from '../../types';
import {
  Payload,
  Signature as SequenceSignature,
} from '@0xsequence/wallet-primitives';
import { ISigner } from './ISigner';

interface AuthKey {
  address: string;
  privateKey: CryptoKey;
  identitySigner: string;
  expiresAt: Date;
}

interface UserWallet {
  userIdentifier: string;
  signerAddress: string;
  authKey: AuthKey;
  identityInstrument: IdentityInstrument;
}

export class IdentityInstrumentSigner implements ISigner {
  private readonly authManager: AuthManager;
  private readonly config: PassportConfiguration;
  private userWallet: UserWallet | null = null;
  private createWalletPromise: Promise<UserWallet> | null = null;

  constructor(authManager: AuthManager, config: PassportConfiguration) {
    this.authManager = authManager;
    this.config = config;
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

  private async getUserWallet(): Promise<UserWallet> {
    let { userWallet } = this;
    if (!userWallet) {
      userWallet = await this.createWallet();
    }

    const user = await this.getUserOrThrow();
    if (user.profile.sub !== userWallet.userIdentifier) {
      userWallet = await this.createWallet(user);
    }

    return userWallet;
  }

  private async createWallet(user?: User): Promise<UserWallet> {
    if (this.createWalletPromise) return this.createWalletPromise;

    this.createWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.userWallet = null;
        await this.authManager.forceUserRefresh();

        const authenticatedUser = user || await this.getUserOrThrow();
        
        if (!authenticatedUser.idToken) {
          throw new PassportError(
            'User idToken not available',
            PassportErrorType.NOT_LOGGED_IN_ERROR,
          );
        }

        const idToken = authenticatedUser.idToken;
        const decoded = jwtDecode<IdTokenPayload>(idToken);
        const issuer = decoded.iss;
        const audience = decoded.aud;

        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['sign', 'verify']
        );

        const publicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
        const authKey: AuthKey = {
          address: Hex.fromBytes(new Uint8Array(publicKey)),
          privateKey: keyPair.privateKey,
          identitySigner: '',
          expiresAt: new Date(Date.now() + 3600000),
        };

        const identityInstrument = new IdentityInstrument(this.config.sequenceIdentityInstrumentEndpoint, "@14:test");
        const challenge = new IdTokenChallenge(issuer, audience, idToken);

        await identityInstrument.commitVerifier(
          Identity.toIdentityAuthKey(authKey),
          challenge
        );

        const result = await identityInstrument.completeAuth(
          Identity.toIdentityAuthKey(authKey),
          challenge
        );

        const signerAddress = result.signer.address;
        authKey.identitySigner = signerAddress;

        this.userWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          signerAddress: signerAddress,
          authKey,
          identityInstrument,
        };

        return resolve(this.userWallet!);
      } catch (error) {
        const errorMessage = `Identity Instrument: Failed to create signer: ${(error as Error).message}`;
        console.error('[IdentityInstrumentSigner] Error:', errorMessage, error);
        return reject(new PassportError(errorMessage, PassportErrorType.WALLET_CONNECTION_ERROR));
      } finally {
        this.createWalletPromise = null;
      }
    });

    return this.createWalletPromise;
  }

  async getAddress(): Promise<string> {
    const wallet = await this.getUserWallet();
    return wallet.signerAddress;
  }

  async signPayload(walletAddress: Address.Address, chainId: number, payload: Payload.Parented): Promise<SequenceSignature.SignatureOfSignerLeaf> {
    const wallet = await this.getUserWallet();
    
    const signer = new Identity.IdentitySigner(
      wallet.identityInstrument,
      wallet.authKey
    );

    return signer.sign(walletAddress, chainId, payload);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const wallet = await this.getUserWallet();
    
    const signer = new Identity.IdentitySigner(
      wallet.identityInstrument,
      wallet.authKey
    );

    const digest = hashMessage(message);
    
    const signature = await signer.signDigest(getBytes(digest));
    
    const r = toBeHex(signature.r, 32);
    const s = toBeHex(signature.s, 32);
    const v = toBeHex(signature.yParity + 27, 1);
    
    return concat([r, s, v]);
  }
}

