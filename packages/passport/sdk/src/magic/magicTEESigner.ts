import { AbstractSigner, Signer } from 'ethers';
import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { isAxiosError } from 'axios';
import { Flow, trackDuration } from '@imtbl/metrics';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import { withMetricsAsync } from '../utils/metrics';
import { isUserImx, isUserZkEvm, User } from '../types';

const CHAIN_IDENTIFIER = 'ETH';

interface UserWallet {
  userIdentifier: string;
  walletAddress: string;
}

export default class MagicTEESigner extends AbstractSigner {
  private readonly authManager: AuthManager;

  private readonly magicTeeApiClient: MagicTeeApiClients;

  private userWallet: UserWallet | null = null;

  private createWalletPromise: Promise<UserWallet> | null = null;

  constructor(authManager: AuthManager, magicTeeApiClient: MagicTeeApiClients) {
    super();
    this.authManager = authManager;
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
      userWallet = await this.createWallet();
    }

    if (isUserImx(user) && user.imx.userAdminAddress !== userWallet.walletAddress) {
      throw new PassportError(
        'Wallet address mismatch.'
          + `Rollup: IMX, TEE address: ${userWallet.walletAddress}, profile address: ${user.imx.userAdminAddress}`,
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    if (isUserZkEvm(user) && user.zkEvm.userAdminAddress !== userWallet.walletAddress) {
      throw new PassportError(
        'Wallet address mismatch.'
          + `Rollup: zkEVM, TEE address: ${userWallet.walletAddress}, profile address: ${user.zkEvm.userAdminAddress}`,
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    return userWallet;
  }

  /**
   * This method calls the createWallet endpoint. The user's wallet must be created before it can be used to sign messages.
   * The createWallet endpoint is idempotent, so it can be called multiple times without causing an error.
   * If a createWallet request is already in flight, return the existing promise.
   */
  private async createWallet(): Promise<UserWallet> {
    if (this.createWalletPromise) return this.createWalletPromise;

    // eslint-disable-next-line no-async-promise-executor
    this.createWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.userWallet = null;

        const user = await this.getUserOrThrow();
        const headers = MagicTEESigner.getHeaders(user);

        await withMetricsAsync(async (flow: Flow) => {
          try {
            const startTime = performance.now();
            // The createWallet endpoint is idempotent, so it can be called multiple times without causing an error.
            const response = await this.magicTeeApiClient.walletApi.createWalletV1WalletPost(
              {
                createWalletRequestModel: {
                  chain: CHAIN_IDENTIFIER,
                },
              },
              { headers },
            );

            trackDuration(
              'passport',
              flow.details.flowName,
              Math.round(performance.now() - startTime),
            );

            // HACK for now
            await new Promise((delayResolve) => { setTimeout(delayResolve, 500); });

            this.userWallet = {
              userIdentifier: user.profile.sub,
              walletAddress: response.data.public_address,
            };

            return resolve(this.userWallet);
          } catch (error) {
            let errorMessage: string = 'Failed to create wallet';

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
    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return user;
  }

  private static getHeaders(user: User): Record<string, string> {
    if (!user) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
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

    const messageToSign = message instanceof Uint8Array ? `0x${Buffer.from(message).toString('hex')}` : message;
    const user = await this.getUserOrThrow();
    const headers = await MagicTEESigner.getHeaders(user);

    return withMetricsAsync(async (flow: Flow) => {
      try {
        const startTime = performance.now();
        const response = await this.magicTeeApiClient.signOperationsApi.signMessageV1WalletPersonalSignPost({
          signMessageRequest: {
            message_base64: Buffer.from(messageToSign, 'utf-8').toString('base64'),
            chain: CHAIN_IDENTIFIER,
          },
        }, { headers });

        trackDuration(
          'passport',
          flow.details.flowName,
          Math.round(performance.now() - startTime),
        );

        return response.data.signature;
      } catch (error) {
        let errorMessage: string = 'Failed to create signature using EOA';

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
    }, 'magicPersonalSign');
  }

  // eslint-disable-next-line class-methods-use-this
  connect(): Signer {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  signTransaction(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  signTypedData(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
