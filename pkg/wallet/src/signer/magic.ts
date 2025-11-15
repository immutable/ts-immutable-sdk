/**
 * Magic TEE Signer
 * Alternative signer implementation using Magic's TEE (Trusted Execution Environment)
 */

import type { User } from '@imtbl/auth';
import type { Signer } from './signer';

export interface MagicTEESignerConfig {
  /** Magic TEE API base URL */
  magicTeeBasePath: string;
  /** Magic publishable API key */
  magicPublishableApiKey: string;
  /** Magic provider ID */
  magicProviderId: string;
  /** Authenticated user */
  authenticatedUser: User;
}

const CHAIN_IDENTIFIER = 'ETH';

interface UserWallet {
  userIdentifier: string;
  walletAddress: string;
}

/**
 * Magic TEE Signer
 * Uses Magic's TEE for signing without exposing private keys
 */
export class MagicTEESigner implements Signer {
  private config: MagicTEESignerConfig;

  private userWallet: UserWallet | null = null;

  private createWalletPromise: Promise<UserWallet> | null = null;

  constructor(config: MagicTEESignerConfig) {
    this.config = config;
  }

  /**
   * Gets the user's wallet address
   */
  async getAddress(): Promise<string> {
    const userWallet = await this.getUserWallet();
    return userWallet.walletAddress;
  }

  /**
   * Signs a message using Magic TEE
   */
  async signMessage(message: string | Uint8Array): Promise<string> {
    // Ensure wallet is created
    await this.getUserWallet();

    const messageToSign = message instanceof Uint8Array
      ? `0x${Array.from(message).map((b) => b.toString(16).padStart(2, '0')).join('')}`
      : message;

    // Convert string to base64
    // messageToSign is always a string at this point
    const messageBase64 = btoa(
      new TextEncoder().encode(messageToSign).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    );

    const response = await fetch(
      `${this.config.magicTeeBasePath}/v1/wallet/sign/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Magic-API-Key': this.config.magicPublishableApiKey,
          'X-OIDC-Provider-ID': this.config.magicProviderId,
          'X-Magic-Chain': CHAIN_IDENTIFIER,
          Authorization: `Bearer ${this.config.authenticatedUser.id_token}`,
        },
        body: JSON.stringify({
          message_base64: messageBase64,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `MagicTEE: Failed to sign message with status ${response.status}: ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    return data.signature;
  }

  /**
   * Gets or creates the user's wallet
   */
  private async getUserWallet(): Promise<UserWallet> {
    let { userWallet } = this;
    if (!userWallet) {
      userWallet = await this.createWallet();
    }

    // Check if the user has changed since the last createWallet request was made
    const userIdentifier = this.config.authenticatedUser.profile?.sub;
    if (userIdentifier && userWallet.userIdentifier !== userIdentifier) {
      userWallet = await this.createWallet();
    }

    return userWallet;
  }

  /**
   * Creates a wallet via Magic TEE API
   * The createWallet endpoint is idempotent, so it can be called multiple times
   */
  private async createWallet(): Promise<UserWallet> {
    if (this.createWalletPromise) {
      return this.createWalletPromise;
    }

    this.createWalletPromise = (async () => {
      this.userWallet = null;

      const response = await fetch(
        `${this.config.magicTeeBasePath}/v1/wallet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Magic-API-Key': this.config.magicPublishableApiKey,
            'X-OIDC-Provider-ID': this.config.magicProviderId,
            'X-Magic-Chain': CHAIN_IDENTIFIER,
            Authorization: `Bearer ${this.config.authenticatedUser.id_token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `MagicTEE: Failed to initialise EOA with status ${response.status}: ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      const userIdentifier = this.config.authenticatedUser.profile?.sub || '';

      this.userWallet = {
        userIdentifier,
        walletAddress: data.public_address,
      };

      return this.userWallet;
    })();

    try {
      return await this.createWalletPromise;
    } finally {
      this.createWalletPromise = null;
    }
  }
}
