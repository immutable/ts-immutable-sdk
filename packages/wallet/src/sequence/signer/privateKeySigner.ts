import { keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { WalletError, WalletErrorType } from '../../errors';
import { Auth, User } from '@imtbl/auth';
import { Signers } from '@0xsequence/wallet-core';
import {
  Payload,
  Signature as SequenceSignature,
} from '@0xsequence/wallet-primitives';
import { SequenceSigner } from './types';
import { Address } from 'ox';

interface PrivateKeyWallet {
  userIdentifier: string;
  signerAddress: string;
  signer: Signers.Pk.Pk;
  privateKey: `0x${string}`;
}

/**
 * Private key signer for dev environments (behind VPN).
 * Uses a deterministic private key derived from the user's sub.
 */
export class PrivateKeySigner implements SequenceSigner {
  readonly #auth: Auth;

  #privateKeyWallet: PrivateKeyWallet | null = null;

  #createWalletPromise: Promise<PrivateKeyWallet> | null = null;

  constructor(auth: Auth) {
    this.#auth = auth;
  }

  async #getUserOrThrow(): Promise<User> {
    const user = await this.#auth.getUser();
    if (!user) {
      throw new WalletError('User not authenticated', WalletErrorType.NOT_LOGGED_IN_ERROR);
    }
    return user;
  }

  async #getWalletInstance(): Promise<PrivateKeyWallet> {
    let privateKeyWallet = this.#privateKeyWallet;
    if (!privateKeyWallet) {
      privateKeyWallet = await this.#createWallet();
    }

    const user = await this.#getUserOrThrow();
    if (user.profile.sub !== privateKeyWallet.userIdentifier) {
      privateKeyWallet = await this.#createWallet(user);
    }

    return privateKeyWallet;
  }

  async #createWallet(user?: User): Promise<PrivateKeyWallet> {
    if (this.#createWalletPromise) return this.#createWalletPromise;

    this.#createWalletPromise = (async () => {
      try {
        this.#privateKeyWallet = null;
        const authenticatedUser = user || (await this.#getUserOrThrow());

        const privateKeyHash = keccak256(toBytes(`${authenticatedUser.profile.sub}-sequence`));
        const signer = new Signers.Pk.Pk(privateKeyHash);
        const signerAddress = signer.address;

        this.#privateKeyWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          signerAddress,
          signer,
          privateKey: privateKeyHash,
        };

        return this.#privateKeyWallet;
      } catch (error) {
        const errorMessage = `Failed to create private key wallet: ${(error as Error).message}`;
        throw new WalletError(errorMessage, WalletErrorType.WALLET_CONNECTION_ERROR);
      } finally {
        this.#createWalletPromise = null;
      }
    })();

    return this.#createWalletPromise;
  }

  async getAddress(): Promise<string> {
    const wallet = await this.#getWalletInstance();
    return wallet.signerAddress;
  }

  async signPayload(
    walletAddress: Address.Address,
    chainId: number,
    payload: Payload.Parented,
  ): Promise<SequenceSignature.SignatureOfSignerLeaf> {
    const pkWallet = await this.#getWalletInstance();
    return pkWallet.signer.sign(walletAddress, chainId, payload);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const pkWallet = await this.#getWalletInstance();

    // Use viem's account to sign
    const account = privateKeyToAccount(pkWallet.privateKey);
    const messageToSign = typeof message === 'string' ? message : { raw: message };

    return await account.signMessage({ message: messageToSign });
  }
}
