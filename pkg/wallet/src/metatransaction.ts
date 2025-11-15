import type { User } from '@imtbl/auth';
import { toHex, createPublicClient, http } from 'viem';
import { JsonRpcError, RpcErrorCode } from './errors';
import type { RelayerClient } from './relayer';
import type { GuardianClient } from './guardian';
import type { Signer } from './signer/signer';
import { getFunctionSelector } from './utils/abi';
import { signMetaTransactions } from './sequence';
import { getEip155ChainId } from './utils/chain';

export interface MetaTransaction {
  gasLimit: bigint;
  target: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  delegateCall: boolean;
  revertOnError: boolean;
}

export interface TransactionRequest {
  to: string;
  data?: string;
  value?: bigint | string;
  nonce?: bigint | number;
  chainId?: number;
}

export function buildMetaTransaction(
  request: TransactionRequest,
): MetaTransaction {
  if (!request.to) {
    throw new Error('TransactionRequest.to is required');
  }

  return {
    target: request.to as `0x${string}`,
    value: typeof request.value === 'string'
      ? BigInt(request.value)
      : (request.value ?? BigInt(0)),
    data: (request.data || '0x') as `0x${string}`,
    gasLimit: BigInt(0),
    delegateCall: false,
    revertOnError: true,
  };
}

/**
 * Gets nonce from smart contract wallet via RPC
 * Encodes nonce with space: space in upper 160 bits, nonce in lower 96 bits
 * Returns 0 if wallet is not deployed
 */
export async function getNonce(
  rpcUrl: string,
  smartContractWalletAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> {
  const space = nonceSpace || BigInt(0);
  const functionSelector = getFunctionSelector('readNonce(uint256)');
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
      const shiftedSpace = space * (BigInt(2) ** BigInt(96));
      return nonce + shiftedSpace;
    }

    return BigInt(0);
  } catch (error: unknown) {
    // If wallet is not deployed, RPC call will fail
    // Return 0 nonce for undeployed wallets
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('BAD_DATA')
      || errorMessage.includes('execution reverted')
      || errorMessage.includes('revert')
      || errorMessage.includes('invalid opcode')
    ) {
      return BigInt(0);
    }
    throw error;
  }
}

/**
 * Builds meta-transactions array with fee transaction
 * Fetches nonce and fee option in parallel, then builds final transaction array
 */
export async function buildMetaTransactions(
  transactionRequest: TransactionRequest,
  rpcUrl: string,
  relayerClient: RelayerClient,
  zkevmAddress: string,
  chainId: number,
  user: User,
  nonceSpace?: bigint,
): Promise<{ transactions: [MetaTransaction, ...MetaTransaction[]]; nonce: bigint }> {
  if (!transactionRequest.to || typeof transactionRequest.to !== 'string') {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const txForFeeEstimation = buildMetaTransaction(transactionRequest);

  const [nonce, feeOption] = await Promise.all([
    getNonce(rpcUrl, zkevmAddress, nonceSpace),
    relayerClient.getFeeOption(zkevmAddress, [txForFeeEstimation], chainId, user),
  ]);

  const metaTransactions: [MetaTransaction, ...MetaTransaction[]] = [
    buildMetaTransaction(transactionRequest),
  ];

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
 * Guardian validation and Sequence signing happen concurrently for performance
 */
export async function validateAndSignTransaction(
  metaTransactions: MetaTransaction[],
  nonce: bigint,
  chainId: bigint,
  walletAddress: string,
  signer: Signer,
  guardianClient: GuardianClient,
  user: User,
  isBackgroundTransaction: boolean = false,
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
      signer,
    ),
  ]);

  return signedTransactionData;
}
