import {
  AbstractSigner, Provider, Signer, TransactionRequest, TypedDataDomain, TypedDataField,
} from 'ethers';
import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { isAxiosError } from 'axios';
import { Flow, trackDuration } from '@imtbl/metrics';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import { withMetricsAsync } from '../utils/metrics';
import { PassportEventEmitter, PassportEvents, RollupType } from '../types';

const CHAIN_IDENTIFIER = 'ETH';

interface UserWallet {
  userIdentifier: string;
  walletAddress: string;
}

export default class MagicTEESigner extends AbstractSigner {
  private readonly authManager: AuthManager;

  private readonly magicTeeApiClient: MagicTeeApiClients;

  private userWallet: UserWallet | null = null;

  constructor(authManager: AuthManager, magicTeeApiClient: MagicTeeApiClients, passportEventEmitter: PassportEventEmitter) {
    super();
    this.authManager = authManager;
    this.magicTeeApiClient = magicTeeApiClient;
    passportEventEmitter.on(PassportEvents.LOGGED_IN, this.createWallet.bind(this));
    passportEventEmitter.on(PassportEvents.LOGGED_OUT, () => {
      this.userWallet = null;
    });

    // Attempt to initialise the wallet and fail silently as the user may not be logged in
    this.createWallet().catch(() => {});
  }

  private async getUserWallet(): Promise<UserWallet> {
    let { userWallet } = this;
    if (!userWallet) {
      userWallet = await this.createWallet();
    }

    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }

    // Check if the user has changed since the last createWallet request was made. If so, initialise the new user's wallet.
    if (user.profile.sub !== userWallet.userIdentifier) {
      userWallet = await this.createWallet();
    }

    // Ensure that the wallet address returned by Magic matches the IMX user admin address in the user profile.
    const imxUserAdminAddress = user[RollupType.IMX]?.userAdminAddress;
    if (imxUserAdminAddress && imxUserAdminAddress !== userWallet.walletAddress) {
      throw new PassportError(
        `User admin address ${userWallet.walletAddress} does not match user IMX user profile address ${imxUserAdminAddress}`,
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    // Ensure that the wallet address returned by Magic matches the zkEvm user admin address in the user profile
    const zkEvmUserAdminAddress = user[RollupType.ZKEVM]?.userAdminAddress;
    if (zkEvmUserAdminAddress && zkEvmUserAdminAddress !== userWallet.walletAddress) {
      throw new PassportError(
        `User admin address ${userWallet.walletAddress} does not match user zkEVM user profile address ${zkEvmUserAdminAddress}`,
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    return userWallet;
  }

  private createWalletPromise: Promise<UserWallet> | null = null;

  // This method calls the createWallet endpoint. The user's wallet must be created before it can be used to sign messages.
  // The createWallet endpoint is idempotent, so it can be called multiple times without causing an error.
  private async createWallet(): Promise<UserWallet> {
    if (!this.createWalletPromise) {
      this.createWalletPromise = new Promise(async (resolve, reject) => {
        try {
          this.userWallet = null;

          const user = await this.authManager.getUser();
          if (!user) {
            return reject(new PassportError(
              'User has been logged out',
              PassportErrorType.NOT_LOGGED_IN_ERROR,
            ));
          }
          const headers = await this.getHeaders();

          return withMetricsAsync(async (flow: Flow) => {
            try {
              const startTime = performance.now();
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

              return resolve({
                userIdentifier: user.profile.sub,
                walletAddress: response.data.public_address,
              });
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
        } finally {
          this.createWalletPromise = null;
        }
      });
    }

    return this.createWalletPromise;
  }

  public async getAddress(): Promise<string> {
    const userWallet = await this.getUserWallet();
    return userWallet.walletAddress;
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    // Call getUserWallet to ensure that the createWallet endpoint has been called at some point in the past.
    // The createWallet endpoint must have been called once for each user at some point in the past before the user can sign messages.
    await this.getUserWallet();

    const messageToSign = message instanceof Uint8Array ? `0x${Buffer.from(message).toString('hex')}` : message;
    const headers = await this.getHeaders();

    return withMetricsAsync(async (flow: Flow) => {
      try {
        const startTime = performance.now();
        const response = await this.magicTeeApiClient.transactionApi.signMessageV1WalletPersonalSignPost({
          personalSignRequest: {
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

  private async getHeaders(): Promise<Record<string, string>> {
    const user = await this.authManager.getUser();
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

  connect(provider: null | Provider): Signer {
    throw new Error('Method not implemented.');
  }

  signTransaction(tx: TransactionRequest): Promise<string> {
    throw new Error('Method not implemented.');
  }

  signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
