/* eslint-disable no-bitwise */
import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { Flow, trackDuration } from '@imtbl/metrics';
import { toHex } from 'viem';
import { WalletError, WalletErrorType } from '../errors';
import { Auth } from '@imtbl/auth';
import { withMetricsAsync } from '../utils/metrics';
import { isUserZkEvm, User } from '../types';
import { isAxiosError } from '../utils/http';

const CHAIN_IDENTIFIER = 'ETH';

interface UserWallet {
  userIdentifier: string;
  walletAddress: string;
}

const encodeUtf8 = (value: string): Uint8Array => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  const utf8 = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i += 1) {
    bytes[i] = utf8.charCodeAt(i);
  }
  return bytes;
};

const toBase64 = (value: string): string => {
  const bytes = encodeUtf8(value);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = bytes[i + 1];
    const byte3 = bytes[i + 2];

    const triplet = (byte1 << 16) | ((byte2 ?? 0) << 8) | (byte3 ?? 0);

    const enc1 = (triplet >> 18) & 0x3f;
    const enc2 = (triplet >> 12) & 0x3f;
    const enc3 = (triplet >> 6) & 0x3f;
    const enc4 = triplet & 0x3f;

    output += alphabet[enc1] + alphabet[enc2];
    output += Number.isFinite(byte2) ? alphabet[enc3] : '=';
    output += Number.isFinite(byte3) ? alphabet[enc4] : '=';
  }

  return output;
};

export default class MagicTEESigner {
  private readonly auth: Auth;

  private readonly magicTeeApiClient: MagicTeeApiClients;

  private userWallet: UserWallet | null = null;

  private createWalletPromise: Promise<UserWallet> | null = null;

  constructor(auth: Auth, magicTeeApiClient: MagicTeeApiClients) {
    this.auth = auth;
    this.magicTeeApiClient = magicTeeApiClient;
  }

  private async getUserWallet(): Promise<UserWallet> {
    let { userWallet } = this;
    if (!userWallet) {
      userWallet = await this.createWallet();
    }

    // Check if the user has changed since the last createWallet request was made. If so, initialise the new user's wallet.
    const user = await this.getUserOrThrow();
    if (user.profile.sub !== userWallet.userIdentifier) {
      userWallet = await this.createWallet(user);
    }

    if (isUserZkEvm(user) && user.zkEvm.userAdminAddress.toLowerCase() !== userWallet.walletAddress.toLowerCase()) {
      throw new WalletError(
        'Wallet address mismatch.'
          + `Rollup: zkEVM, TEE address: ${userWallet.walletAddress}, profile address: ${user.zkEvm.userAdminAddress}`,
        WalletErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    return userWallet;
  }

  /**
   * This method calls the createWallet endpoint. The user's wallet must be created before it can be used to sign messages.
   * The createWallet endpoint is idempotent, so it can be called multiple times without causing an error.
   * If a createWallet request is already in flight, return the existing promise.
   */
  private async createWallet(user?: User): Promise<UserWallet> {
    if (this.createWalletPromise) return this.createWalletPromise;

    // eslint-disable-next-line no-async-promise-executor
    this.createWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.userWallet = null;

        const authenticatedUser = user || await this.getUserOrThrow();
        const headers = MagicTEESigner.getHeaders(authenticatedUser);

        await withMetricsAsync(async (flow: Flow) => {
          try {
            const startTime = performance.now();
            // The createWallet endpoint is idempotent, so it can be called multiple times without causing an error.
            const response = await this.magicTeeApiClient.walletApi.createWalletV1WalletPost(
              {
                xMagicChain: CHAIN_IDENTIFIER,
              },
              { headers },
            );

            trackDuration(
              'passport',
              flow.details.flowName,
              Math.round(performance.now() - startTime),
            );

            this.userWallet = {
              userIdentifier: authenticatedUser.profile.sub,
              walletAddress: response.data.public_address,
            };

            return resolve(this.userWallet);
          } catch (error) {
            let errorMessage: string = 'MagicTEE: Failed to initialise EOA';

            if (isAxiosError(error)) {
              if (error.response) {
                errorMessage += ` with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
              } else {
                errorMessage += `: ${error.message}`;
              }
            } else {
              errorMessage += `: ${(error as Error).message}`;
            }

            return reject(new Error(errorMessage));
          }
        }, 'magicCreateWallet');
      } catch (error) {
        reject(error);
      } finally {
        this.createWalletPromise = null;
      }
    });

    return this.createWalletPromise;
  }

  private async getUserOrThrow(): Promise<User> {
    const user = await this.auth.getUser();
    if (!user) {
      throw new WalletError(
        'User has been logged out',
        WalletErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return user;
  }

  private static getHeaders(user: User): Record<string, string> {
    if (!user) {
      throw new WalletError(
        'User has been logged out',
        WalletErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return {
      Authorization: `Bearer ${user.idToken}`,
    };
  }

  public async getAddress(): Promise<string> {
    const userWallet = await this.getUserWallet();
    return userWallet.walletAddress;
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    // Call getUserWallet to ensure that the createWallet endpoint has been called at least once,
    // as this is a prerequisite for signing messages.
    await this.getUserWallet();

    const messageToSign = message instanceof Uint8Array ? `0x${toHex(message)}` : message;
    const user = await this.getUserOrThrow();
    const headers = await MagicTEESigner.getHeaders(user);

    return withMetricsAsync(async (flow: Flow) => {
      try {
        const startTime = performance.now();
        const response = await this.magicTeeApiClient.signOperationsApi.signMessageV1WalletSignMessagePost(
          {
            signMessageRequest: {
              message_base64: toBase64(messageToSign),
            },
            xMagicChain: CHAIN_IDENTIFIER,
          },
          { headers },
        );

        trackDuration(
          'passport',
          flow.details.flowName,
          Math.round(performance.now() - startTime),
        );

        return response.data.signature;
      } catch (error) {
        let errorMessage: string = 'MagicTEE: Failed to sign message using EOA';

        if (isAxiosError(error)) {
          if (error.response) {
            errorMessage += ` with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
          } else {
            errorMessage += `: ${error.message}`;
          }
        } else {
          errorMessage += `: ${(error as Error).message}`;
        }

        throw new Error(errorMessage);
      }
    }, 'magicSignMessage');
  }
}
