/**
 * Minimal guardian client for transaction evaluation
 * No ethers dependency - uses native fetch
 */

import type { User } from '@imtbl/auth';
import { JsonRpcError, RpcErrorCode } from './errors';
import { getEip155ChainId } from './utils/chain';
import type { TypedDataPayload } from './relayer';
import { ConfirmationScreen } from './confirmation/confirmation';
import { authenticatedFetch } from './utils/http-client';

export interface GuardianClientConfig {
  guardianUrl: string;
  /** Confirmation screen for showing confirmation UI */
  confirmationScreen: ConfirmationScreen;
}

/**
 * Guardian API response types
 */
interface MessageEvaluationResponse {
  confirmationRequired: boolean;
  messageId?: string;
}

interface TransactionEvaluationResponse {
  confirmationRequired: boolean;
  transactionId?: string;
}

/**
 * Minimal guardian client
 */
export class GuardianClient {
  private config: GuardianClientConfig;

  constructor(config: GuardianClientConfig) {
    this.config = config;
  }

  /**
   * Evaluates an ERC-191 message
   */
  async evaluateERC191Message(payload: string, walletAddress: string, chainId: number, user: User): Promise<void> {
    // User is guaranteed to be authenticated when this is called
    // (ensured by ensureAuthenticated() in provider)
    // Trust provider - use access_token directly

    let data: MessageEvaluationResponse;
    try {
      data = await authenticatedFetch<MessageEvaluationResponse>(
        `${this.config.guardianUrl}/v1/erc191-messages/evaluate`,
        {
          method: 'POST',
          body: {
            chainID: getEip155ChainId(chainId),
            payload,
          },
          token: user.access_token,
        }
      );
    } catch (error: any) {
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Message failed to validate: ${error.message}`
      );
    }

    // Handle confirmation if required
    if (data.confirmationRequired && data.messageId) {
      const confirmed = await this.handleMessageConfirmation(
        data.messageId,
        walletAddress,
        'erc191'
      );

      if (!confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Signature rejected by user'
        );
      }
    }
  }

  /**
   * Evaluates an EIP-712 message
   */
  async evaluateEIP712Message(payload: TypedDataPayload, walletAddress: string, chainId: number, user: User): Promise<void> {
    // User is guaranteed to be authenticated when this is called
    // (ensured by ensureAuthenticated() in provider)
    // Trust provider - use access_token directly

    let data: MessageEvaluationResponse;
    try {
      data = await authenticatedFetch<MessageEvaluationResponse>(
        `${this.config.guardianUrl}/v1/eip712-messages/evaluate`,
        {
          method: 'POST',
          body: {
            chainID: getEip155ChainId(chainId),
            payload,
          },
          token: user.access_token,
        }
      );
    } catch (error: any) {
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Message failed to validate: ${error.message}`
      );
    }

    // Handle confirmation if required
    if (data.confirmationRequired && data.messageId) {
      const confirmed = await this.handleMessageConfirmation(
        data.messageId,
        walletAddress,
        'eip712'
      );

      if (!confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Signature rejected by user'
        );
      }
    }
  }

  /**
   * Handles message confirmation
   */
  private async handleMessageConfirmation(
    messageId: string,
    walletAddress: string,
    messageType: 'erc191' | 'eip712'
  ): Promise<boolean> {
    const result = await this.config.confirmationScreen.requestMessageConfirmation(
      messageId,
      walletAddress,
      messageType
    );
    return result.confirmed;
  }

  /**
   * Handles transaction confirmation
   */
  private async handleTransactionConfirmation(
    transactionId: string,
    walletAddress: string,
    chainId: number
  ): Promise<boolean> {
    const result = await this.config.confirmationScreen.requestConfirmation(
      transactionId,
      walletAddress,
      getEip155ChainId(chainId)
    );
    return result.confirmed;
  }

  /**
   * Maps meta-transactions to Guardian API format
   * Guardian-specific transformation logic (converts bigint to string for JSON)
   */
  private mapMetaTransactionsForGuardian(
    metaTransactions: Array<{
      target: `0x${string}`;
      value: bigint;
      data: `0x${string}`;
      gasLimit: bigint;
      delegateCall: boolean;
      revertOnError: boolean;
    }>
  ): Array<{
    delegateCall: boolean;
    revertOnError: boolean;
    gasLimit: string;
    target: string;
    value: string;
    data: string;
  }> {
    return metaTransactions.map((tx) => ({
      delegateCall: tx.delegateCall,
      revertOnError: tx.revertOnError,
      gasLimit: tx.gasLimit.toString(),
      target: tx.target,
      value: tx.value.toString(),
      data: tx.data,
    }));
  }

  /**
   * Validates EVM transaction with Guardian API
   */
  async validateEVMTransaction({
    chainId,
    nonce,
    metaTransactions,
    walletAddress,
    isBackgroundTransaction,
    user,
  }: {
    chainId: string;
    nonce: string | bigint;
    metaTransactions: Array<{
      target: `0x${string}`;
      value: bigint;
      data: `0x${string}`;
      gasLimit: bigint;
      delegateCall: boolean;
      revertOnError: boolean;
    }>;
    walletAddress: string;
    isBackgroundTransaction?: boolean;
    user: User;
  }): Promise<void> {
    // User is guaranteed to be authenticated when this is called
    // (ensured by ensureAuthenticated() in provider)
    // Trust provider - use access_token directly

    // Transform meta-transactions for Guardian API
    const guardianTransactions = this.mapMetaTransactionsForGuardian(metaTransactions);

    let data: TransactionEvaluationResponse;
    try {
      data = await authenticatedFetch<TransactionEvaluationResponse>(
        `${this.config.guardianUrl}/v1/transactions/evm/evaluate`,
        {
          method: 'POST',
          body: {
            chainType: 'evm',
            chainId,
            transactionData: {
              nonce: nonce.toString(),
              userAddress: walletAddress,
              metaTransactions: guardianTransactions,
            },
          },
          token: user.access_token,
        }
      );
    } catch (error: any) {
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Transaction failed to validate: ${error.message}`
      );
    }

    // Handle confirmation if required
    if (data.confirmationRequired && data.transactionId) {
      const confirmed = await this.handleTransactionConfirmation(
        data.transactionId,
        walletAddress,
        parseInt(chainId.split(':')[1] || chainId)
      );

      if (!confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Transaction rejected by user'
        );
      }
    } else if (!isBackgroundTransaction) {
      // Close confirmation screen if not background transaction
      this.config.confirmationScreen.closeWindow();
    }
  }
}
