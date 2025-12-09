import { Auth } from '@imtbl/auth';
import { mr as MultiRollup } from '@imtbl/generated-clients';
import { ConfirmationScreen, retryWithDelay } from '@imtbl/wallet';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { toUserImx } from '../utils/imxUser';
import { getHttpStatus } from '../utils/httpError';

const transactionRejectedCrossSdkBridgeError = 'Transaction requires confirmation but this functionality is not'
  + ' supported in this environment. Please contact Immutable support if you need to enable this feature.';

type ImxGuardianClientParams = {
  auth: Auth;
  guardianApi: MultiRollup.GuardianApi;
  confirmationScreen: ConfirmationScreen;
  crossSdkBridgeEnabled?: boolean;
};

export class ImxGuardianClient {
  private readonly auth: Auth;

  private readonly guardianApi: MultiRollup.GuardianApi;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly crossSdkBridgeEnabled: boolean;

  constructor({
    auth,
    guardianApi,
    confirmationScreen,
    crossSdkBridgeEnabled = false,
  }: ImxGuardianClientParams) {
    this.auth = auth;
    this.guardianApi = guardianApi;
    this.confirmationScreen = confirmationScreen;
    this.crossSdkBridgeEnabled = crossSdkBridgeEnabled;
  }

  public async evaluateTransaction(payloadHash: string): Promise<void> {
    const user = await this.auth.getUser();
    if (!user) {
      throw new PassportError('User has been logged out', PassportErrorType.NOT_LOGGED_IN_ERROR);
    }

    const imxUser = toUserImx(user);
    const headers = { Authorization: `Bearer ${imxUser.accessToken}` };

    try {
      const finallyFn = () => {
        this.confirmationScreen.closeWindow();
      };

      const transactionRes = await retryWithDelay(
        async () => this.guardianApi.getTransactionByID({
          transactionID: payloadHash,
          chainType: 'starkex',
        }, { headers }),
        { finallyFn },
      );

      if (!transactionRes.data.id) {
        throw new PassportError(
          'Transaction does not exist',
          PassportErrorType.TRANSFER_ERROR,
        );
      }

      const evaluationResponse = await this.guardianApi.evaluateTransaction({
        id: payloadHash,
        transactionEvaluationRequest: {
          chainType: 'starkex',
        },
      }, { headers });

      const { confirmationRequired } = evaluationResponse.data;
      if (confirmationRequired) {
        if (this.crossSdkBridgeEnabled) {
          throw new PassportError(
            transactionRejectedCrossSdkBridgeError,
            PassportErrorType.TRANSACTION_REJECTED,
          );
        }

        const confirmationResult = await this.confirmationScreen.requestConfirmation(
          payloadHash,
          imxUser.imx.ethAddress,
          MultiRollup.TransactionApprovalRequestChainTypeEnum.Starkex,
        );

        if (!confirmationResult.confirmed) {
          throw new PassportError(
            'Transaction rejected by user',
            PassportErrorType.TRANSACTION_REJECTED,
          );
        }
      } else {
        this.confirmationScreen.closeWindow();
      }
    } catch (error) {
      if (getHttpStatus(error) === 403) {
        throw new PassportError('Service unavailable', PassportErrorType.SERVICE_UNAVAILABLE_ERROR);
      }
      throw error;
    }
  }
}
