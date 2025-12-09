import { Auth, isUserZkEvm } from '@imtbl/auth';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { trackFlow, trackError } from '@imtbl/metrics';
import { WalletError, WalletErrorType } from './errors';
import { isAxiosError } from './utils/http';

export type LinkWalletParams = {
  type: string;
  walletAddress: string;
  signature: string;
  nonce: string;
};

export type LinkedWallet = {
  address: string;
  type: string;
  created_at: string;
  updated_at: string;
  name?: string;
  clientName: string;
};

type APIError = {
  code: string;
  message: string;
  details?: unknown;
};

function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
  );
}

/**
 * Get all addresses linked to the current user's account
 * @param auth - Auth instance to get current user
 * @param apiClient - MultiRollupApiClients instance for API calls
 * @returns Array of linked addresses
 * @throws WalletError if user is not logged in
 */
export async function getLinkedAddresses(
  auth: Auth,
  apiClient: MultiRollupApiClients,
): Promise<string[]> {
  const user = await auth.getUser();
  if (!user?.profile.sub) {
    return [];
  }

  const headers = {
    Authorization: `Bearer ${user.accessToken}`,
  };

  const { data } = await apiClient.passportProfileApi.getUserInfo({ headers });
  return data.linked_addresses;
}

/**
 * Link an external wallet to the current user's account
 * @param auth - Auth instance to get current user
 * @param apiClient - MultiRollupApiClients instance for API calls
 * @param params - Link wallet parameters
 * @returns Linked wallet information
 * @throws WalletError if user is not logged in, not registered, or linking fails
 */
export async function linkExternalWallet(
  auth: Auth,
  apiClient: MultiRollupApiClients,
  params: LinkWalletParams,
): Promise<LinkedWallet> {
  const flowInit = trackFlow('wallet', 'linkExternalWallet');

  try {
    const user = await auth.getUser();
    if (!user) {
      throw new WalletError('User is not logged in', WalletErrorType.NOT_LOGGED_IN_ERROR);
    }

    const isZkEvmUser = isUserZkEvm(user);
    if (!isZkEvmUser) {
      throw new WalletError('User has not been registered on Immutable zkEVM', WalletErrorType.WALLET_CONNECTION_ERROR);
    }

    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
    };

    const linkWalletV2Request = {
      type: params.type,
      wallet_address: params.walletAddress,
      signature: params.signature,
      nonce: params.nonce,
    };

    const linkWalletV2Result = await apiClient
      .passportProfileApi.linkWalletV2({ linkWalletV2Request }, { headers });
    return { ...linkWalletV2Result.data };
  } catch (error) {
    // Track error
    if (error instanceof Error) {
      trackError('wallet', 'linkExternalWallet', error);
    } else {
      flowInit.addEvent('errored');
    }

    // Handle and rethrow
    if (isAxiosError(error) && error.response) {
      if (error.response.data && isAPIError(error.response.data)) {
        const { code, message } = error.response.data;

        switch (code) {
          case 'ALREADY_LINKED':
            throw new WalletError(message, WalletErrorType.WALLET_CONNECTION_ERROR);
          case 'MAX_WALLETS_LINKED':
            throw new WalletError(message, WalletErrorType.WALLET_CONNECTION_ERROR);
          case 'DUPLICATE_NONCE':
            throw new WalletError(message, WalletErrorType.WALLET_CONNECTION_ERROR);
          case 'VALIDATION_ERROR':
            throw new WalletError(message, WalletErrorType.WALLET_CONNECTION_ERROR);
          default:
            throw new WalletError(message, WalletErrorType.WALLET_CONNECTION_ERROR);
        }
      } else if (error.response.status) {
        throw new WalletError(
          `Link wallet request failed with status code ${error.response.status}`,
          WalletErrorType.WALLET_CONNECTION_ERROR,
        );
      }
    }

    let message: string = 'Link wallet request failed';
    if (error instanceof Error) {
      message += `: ${error.message}`;
    }

    throw new WalletError(
      message,
      WalletErrorType.WALLET_CONNECTION_ERROR,
    );
  } finally {
    flowInit.addEvent('End');
  }
}
