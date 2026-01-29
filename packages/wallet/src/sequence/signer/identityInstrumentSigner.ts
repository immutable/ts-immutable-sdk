import { hashMessage, toHex, concat } from 'viem';
import { Identity } from '@0xsequence/wallet-wdk';
import { IdentityInstrument, IdTokenChallenge } from '@0xsequence/identity-instrument';
import { WalletError, WalletErrorType } from '../../errors';
import { User, decodeJwtPayload } from '@imtbl/auth';
import { Hex, Address } from 'ox';
import {
  Payload,
  Signature as SequenceSignature,
} from '@0xsequence/wallet-primitives';
import { SequenceSigner } from './types';
import { GetUserFunction } from '../../types';

interface IdTokenPayload {
  iss: string;
  aud: string;
  sub: string;
}

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

export interface IdentityInstrumentSignerConfig {
  /** Sequence Identity Instrument endpoint URL */
  identityInstrumentEndpoint: string;
}

export class IdentityInstrumentSigner implements SequenceSigner {
  readonly #getUser: GetUserFunction;

  readonly #config: IdentityInstrumentSignerConfig;

  #userWallet: UserWallet | null = null;

  #createWalletPromise: Promise<UserWallet> | null = null;

  constructor(getUser: GetUserFunction, config: IdentityInstrumentSignerConfig) {
    this.#getUser = getUser;
    this.#config = config;
  }

  async #getUserOrThrow(): Promise<User> {
    const user = await this.#getUser();
    if (!user) {
      throw new WalletError(
        'User not authenticated',
        WalletErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return user;
  }

  async #getUserWallet(): Promise<UserWallet> {
    let userWallet = this.#userWallet;
    if (!userWallet) {
      userWallet = await this.#createWallet();
    }

    const user = await this.#getUserOrThrow();
    if (user.profile.sub !== userWallet.userIdentifier) {
      userWallet = await this.#createWallet(user);
    }

    return userWallet;
  }

  async #createWallet(user?: User): Promise<UserWallet> {
    if (this.#createWalletPromise) return this.#createWalletPromise;

    this.#createWalletPromise = (async () => {
      try {
        this.#userWallet = null;
        // Force refresh to get latest user data including idToken
        await this.#getUser(true);

        const authenticatedUser = user || await this.#getUserOrThrow();

        if (!authenticatedUser.idToken) {
          throw new WalletError(
            'User idToken not available',
            WalletErrorType.NOT_LOGGED_IN_ERROR,
          );
        }

        const { idToken } = authenticatedUser;
        const decoded = decodeJwtPayload<IdTokenPayload>(idToken);
        const issuer = decoded.iss;
        const audience = decoded.aud;

        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['sign', 'verify'],
        );

        const publicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
        const authKey: AuthKey = {
          address: Hex.fromBytes(new Uint8Array(publicKey)),
          privateKey: keyPair.privateKey,
          identitySigner: '',
          expiresAt: new Date(Date.now() + 3600000),
        };

        const identityInstrument = new IdentityInstrument(
          this.#config.identityInstrumentEndpoint,
          '@14:test',
        );
        const challenge = new IdTokenChallenge(issuer, audience, idToken);

        await identityInstrument.commitVerifier(
          Identity.toIdentityAuthKey(authKey),
          challenge,
        );

        const result = await identityInstrument.completeAuth(
          Identity.toIdentityAuthKey(authKey),
          challenge,
        );

        const signerAddress = result.signer.address;
        authKey.identitySigner = signerAddress;

        this.#userWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          signerAddress,
          authKey,
          identityInstrument,
        };

        return this.#userWallet;
      } catch (error) {
        const errorMessage = `Identity Instrument: Failed to create signer: ${(error as Error).message}`;
        throw new WalletError(errorMessage, WalletErrorType.WALLET_CONNECTION_ERROR);
      } finally {
        this.#createWalletPromise = null;
      }
    })();

    return this.#createWalletPromise;
  }

  async getAddress(): Promise<string> {
    const wallet = await this.#getUserWallet();
    return wallet.signerAddress;
  }

  async signPayload(
    walletAddress: Address.Address,
    chainId: number,
    payload: Payload.Parented,
  ): Promise<SequenceSignature.SignatureOfSignerLeaf> {
    const wallet = await this.#getUserWallet();

    const signer = new Identity.IdentitySigner(
      wallet.identityInstrument,
      wallet.authKey,
    );

    return signer.sign(walletAddress, chainId, payload);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const wallet = await this.#getUserWallet();

    const signer = new Identity.IdentitySigner(
      wallet.identityInstrument,
      wallet.authKey,
    );

    const messageBytes = typeof message === 'string'
      ? new TextEncoder().encode(message)
      : message;
    const digest = hashMessage({ raw: messageBytes });

    const signature = await signer.signDigest(Hex.toBytes(digest));

    // Format signature: r (32 bytes) + s (32 bytes) + v (1 byte)
    const r = toHex(signature.r, { size: 32 });
    const s = toHex(signature.s, { size: 32 });
    const v = toHex(signature.yParity + 27, { size: 1 });

    return concat([r, s, v]);
  }
}
