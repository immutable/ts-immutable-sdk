import { AbstractSigner, Provider, Signer, TransactionRequest, TypedDataDomain, TypedDataField } from 'ethers';
import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { isAxiosError } from 'axios';
import { Flow, trackDuration } from '@imtbl/metrics';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import { withMetricsAsync } from '../utils/metrics';

const CHAIN_IDENTIFIER = 'ETH';

export default class MagicTEESigner extends AbstractSigner {
  private readonly authManager: AuthManager;

  private readonly magicTeeApiClient: MagicTeeApiClients;

  private walletAddress: string | null = null;

  private walletAddressPromise: Promise<string> | null = null;

  constructor(authManager: AuthManager, magicTeeApiClient: MagicTeeApiClients) {
    super();
    this.authManager = authManager;
    this.magicTeeApiClient = magicTeeApiClient;
    this.createWallet()
      .then((address) => {
        this.walletAddress = address;
      })
      .catch(() => {
        this.walletAddress = null;
      });
  }

  public async getAddress(): Promise<string> {
    if (this.walletAddress) {
      return this.walletAddress;
    } else if (this.walletAddressPromise) {
      return this.walletAddressPromise;
    }

    return this.createWallet();
  }

  private async createWallet(): Promise<string> {
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

        this.walletAddress = response.data.public_address;
        return this.walletAddress;
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

        throw new Error(errorMessage);
      } finally {
        this.walletAddressPromise = null;
      }
    }, 'magicCreateWallet');
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    // Call getAddress to ensure that the wallet has been created
    if (!this.walletAddress) {
      await this.getAddress();
    }

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
