import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { isAxiosError } from 'axios';
import { Flow, trackDuration } from '@imtbl/metrics';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import { withMetricsAsync } from '../utils/metrics';

const CHAIN_IDENTIFIER = 'ETH';

export default class MagicTeeAdapter {
  private readonly authManager: AuthManager;

  private readonly magicTeeApiClient: MagicTeeApiClients;

  constructor(authManager: AuthManager, magicTeeApiClient: MagicTeeApiClients) {
    this.authManager = authManager;
    this.magicTeeApiClient = magicTeeApiClient;
  }

  public async createWallet(): Promise<string> {
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

        return response.data.public_address;
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
      }
    }, 'magicCreateWallet');
  }

  public async personalSign(message: string | Uint8Array): Promise<string> {
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
}
