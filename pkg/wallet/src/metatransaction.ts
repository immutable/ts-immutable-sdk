/**
 * Meta-transaction building and signing utilities
 */

import type { User } from '@imtbl/auth';
import { toHex, createPublicClient, http } from 'viem';
import { JsonRpcError, RpcErrorCode } from './errors';
import type { RelayerClient } from './relayer';
import type { GuardianClient } from './guardian';
import type { Signer } from './signer/signer';
import { getFunctionSelector } from './utils/abi';
import { signMetaTransactions } from './sequence';
import { getEip155ChainId } from './utils/chain';

/**
 * Meta-transaction structure (all fields required)
 */
export interface MetaTransaction {
  gasLimit: bigint;
  target: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  delegateCall: boolean;
  revertOnError: boolean;
}

/**
 * Transaction request (from eth_sendTransaction)
 */
export interface TransactionRequest {
  to: string;
  data?: string;
  value?: bigint | string;
  nonce?: bigint | number;
  chainId?: number;
}

/**
 * Builds a MetaTransaction from TransactionRequest with defaults
 * Exported for use in ejection transactions and other cases where
 * we need to convert TransactionRequest to MetaTransaction directly
 */
export function buildMetaTransaction(
  request: TransactionRequest
): MetaTransaction {
  return {
    target: (request.to || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    value: typeof request.value === 'string' 
      ? BigInt(request.value) 
      : (request.value ?? BigInt(0)),
    data: (request.data || '0x') as `0x${string}`,
    gasLimit: BigInt(0), // Default, relayer handles gas
    delegateCall: false,
    revertOnError: true,
  };
}


/**
 * Gets nonce from smart contract wallet via RPC
 * Returns 0 if wallet is not deployed (BAD_DATA error)
 * Encodes nonce with space (space in upper 160 bits, nonce in lower 96 bits)
 */
export async function getNonce(
  rpcUrl: string,
  smartContractWalletAddress: string,
  nonceSpace?: bigint
): Promise<bigint> {
  const space = nonceSpace || BigInt(0);
  
  // Read nonce from wallet contract using eth_call
  // Function signature: readNonce(uint256 space) returns (uint256)
  const functionSelector = getFunctionSelector('readNonce(uint256)');
  
  // Encode the space parameter
  const spaceHex = toHex(space, { size: 32 });
  const data = functionSelector + spaceHex.slice(2);

  try {
    const client = createPublicClient({
      transport: http(rpcUrl),
    });
    const result = await client.call({
      to: smartContractWalletAddress as `0x${string}`,
      data: data as `0x${string}`,
    });

    if (result?.data && result.data !== '0x') {
      const nonce = BigInt(result.data);
      // Encode nonce with space (space in upper 160 bits, nonce in lower 96 bits)
      const shiftedSpace = space * (BigInt(2) ** BigInt(96));
      return nonce + shiftedSpace;
    }
    
    // If result is 0x or empty, wallet might not be deployed
    return BigInt(0);
  } catch (error: any) {
    // BAD_DATA error usually means wallet not deployed
    if (error?.message?.includes('BAD_DATA') || error?.message?.includes('execution reverted')) {
      return BigInt(0);
    }
    throw error;
  }
}


/**
 * Builds meta-transactions array with fee transaction
 * Returns transactions directly in normalized format (no intermediate type)
 * Also returns the nonce used for signing
 */
export async function buildMetaTransactions(
  transactionRequest: TransactionRequest,
  rpcUrl: string,
  relayerClient: RelayerClient,
  zkevmAddress: string,
  chainId: number,
  user: User,
  nonceSpace?: bigint
): Promise<{ transactions: [MetaTransaction, ...MetaTransaction[]]; nonce: bigint }> {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field'
    );
  }

  // Build transaction for fee estimation (nonce doesn't matter for fees)
  const txForFeeEstimation = buildMetaTransaction(transactionRequest);

  // Get nonce and fee option in parallel
  const [nonce, feeOption] = await Promise.all([
    getNonce(rpcUrl, zkevmAddress, nonceSpace),
    relayerClient.getFeeOption(zkevmAddress, [txForFeeEstimation], chainId, user),
  ]);

  // Build final transactions with valid nonce
  const metaTransactions: [MetaTransaction, ...MetaTransaction[]] = [
    buildMetaTransaction(transactionRequest),
  ];

  // Add fee transaction if fee is non-zero
  const feeValue = BigInt(feeOption.tokenPrice);
  if (feeValue !== BigInt(0)) {
    metaTransactions.push({
      target: feeOption.recipientAddress as `0x${string}`,
      value: feeValue,
      data: '0x' as `0x${string}`,
      gasLimit: BigInt(0),
      delegateCall: false,
      revertOnError: true,
    });
  }

  return { transactions: metaTransactions, nonce };
}

/**
 * Validates and signs meta-transactions in parallel
 * Consolidates the common pattern used in handleSendTransaction and deployWallet
 */
export async function validateAndSignTransaction(
  metaTransactions: MetaTransaction[],
  nonce: bigint,
  chainId: bigint,
  walletAddress: string,
  signer: Signer,
  guardianClient: GuardianClient,
  user: User,
  isBackgroundTransaction: boolean = false
): Promise<string> {
  const [, signedTransactionData] = await Promise.all([
    guardianClient.validateEVMTransaction({
      chainId: getEip155ChainId(Number(chainId)),
      nonce,
      metaTransactions,
      walletAddress,
      isBackgroundTransaction,
      user,
    }),
    signMetaTransactions(
      metaTransactions,
      nonce,
      chainId,
      walletAddress,
      signer
    ),
  ]);

  return signedTransactionData;
}



