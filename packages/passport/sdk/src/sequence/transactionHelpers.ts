import { Flow } from '@imtbl/metrics';
import { BigNumberish, TransactionRequest } from 'ethers';
import { Address, Bytes, Hex, Provider } from 'ox';
import { getEip155ChainId, getNonce, isWalletDeployed } from './walletHelpers';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import SequenceSigner from './sequenceSigner';
import { Payload, Config, Context } from '@0xsequence/wallet-primitives';
import { Wallet } from '@0xsequence/wallet-core';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import AuthManager from '../authManager';
import { createStateProvider, createWalletConfig, saveWalletConfig, SEQUENCE_CONTEXT } from './signer/signerHelpers';
import GuardianClient, { convertBigNumberishToString } from '../guardian';
import { MetaTransaction } from '../zkEvm/types';

export type TransactionParams = {
  sequenceSigner: SequenceSigner;
  oxRpcProvider: Provider.Provider;
  guardianClient: GuardianClient;
  relayerClient: SequenceRelayerClient;
  walletAddress: string;
  flow: Flow;
  authManager: AuthManager;
  nonceSpace?: bigint;
  isBackgroundTransaction?: boolean;
};

const buildMetaTransaction = async (
  transactionRequest: TransactionRequest,
  rpcProvider: Provider.Provider,
  walletAddress: string,
  nonceSpace?: bigint,
): Promise<MetaTransaction> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to.toString(),
    data: transactionRequest.data,
    nonce: BigInt(0), // NOTE: We don't need a valid nonce to estimate the fee
    value: transactionRequest.value,
    revertOnError: true,
  };

  // Get the nonce from the smart wallet
  const nonce = await getNonce(rpcProvider, walletAddress, nonceSpace);

  // Build the meta transactions array with a valid nonce
  return {
    ...metaTransaction,
    nonce,
  };
};

const createWallet = async (
  authManager: AuthManager,
  walletAddress: Address.Address,
  sequenceSigner: SequenceSigner,
): Promise<Wallet> => {
  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }
  const deploymentSalt = await fetchDeploymentSalt(user.accessToken);
  console.log(`deployment salt = ${deploymentSalt}`);

  const signerAddress = await sequenceSigner.getAddress();
  const walletConfig = createWalletConfig(Address.from(signerAddress));
  const realImageHash = Bytes.toHex(Config.hashConfiguration(walletConfig));
  console.log(`realImageHash = ${realImageHash}`);

  const stateProvider = createStateProvider(walletAddress, deploymentSalt, realImageHash);
  const wallet = new Wallet(walletAddress, { 
    stateProvider: stateProvider,
    knownContexts: [SEQUENCE_CONTEXT as Context.KnownContext],
  });
  await saveWalletConfig(walletConfig, stateProvider);

  return wallet;
};

export const prepareAndSignTransaction = async ({
  transactionRequest,
  sequenceSigner,
  oxRpcProvider,
  guardianClient,
  relayerClient,
  walletAddress,
  flow,
  authManager,
  nonceSpace,
  isBackgroundTransaction,
}: TransactionParams & { transactionRequest: TransactionRequest }): Promise<{ to: Address.Address; data: Hex.Hex; }> => {
  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }

  const chainId = await oxRpcProvider.request({ method: 'eth_chainId' });

  const metaTransaction = await buildMetaTransaction(
    transactionRequest,
    oxRpcProvider,
    walletAddress,
    nonceSpace,
  );
  flow.addEvent('endBuildMetaTransactions');

  const { nonce } = metaTransaction;
  if (typeof nonce === 'undefined') {
    throw new Error('Failed to retrieve nonce from the smart wallet');
  }

  const validateTransaction = async () => {
    await guardianClient.validateEVMTransaction({
      chainId: getEip155ChainId(Number(chainId)),
      nonce: convertBigNumberishToString(nonce),
      metaTransactions: [metaTransaction],
      isBackgroundTransaction,
    });
    flow.addEvent('endValidateEVMTransaction');
  };

  const signTransaction = async () => {
    const signed = await signMetaTransaction(
      walletAddress,
      metaTransaction,
      authManager,
      oxRpcProvider,
      sequenceSigner,
      chainId,
      flow,
      nonce,
    );
    flow.addEvent('endSignMetaTransaction');
    return signed;
  }

  const [  _,  signature] = await Promise.all([
    validateTransaction(),
    signTransaction(),
  ]);

  const response = await fetch('http://localhost:8073/relayer-mr/v1/build-guest-module-calldata', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chain_id: getEip155ChainId(Number(chainId)),
      to: transactionRequest.to,
      value: Hex.fromNumber(BigInt(transactionRequest.value ?? 0)),
      data: transactionRequest.data ?? '0x',
      user_ecdsa_signature: signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to build guest module calldata: ${response.statusText}`);
  }

  const result = await response.json();

  flow.addEvent('endBuildGuestModuleMulticall');

  console.log(`response ${JSON.stringify(result)}`);

  return { to: result.to, data: result.data };
};

const signMetaTransaction = async (
  walletAddress: string,
  metaTransaction: MetaTransaction,
  authManager: AuthManager,
  rpcProvider: Provider.Provider,
  sequenceSigner: SequenceSigner,
  chainId: string,
  flow: Flow,
  nonce: BigNumberish,
): Promise<Hex.Hex> => {
  flow.addEvent('startSignMetaTransaction');

  const wallet = await createWallet(authManager, Address.from(walletAddress), sequenceSigner);

  const call: Payload.Call = {
    to: metaTransaction.to as `0x${string}`,
    value: BigInt(metaTransaction.value || 0),
    data: (metaTransaction.data || '0x') as `0x${string}`,
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: "revert",
  };
  
  const envelope = await wallet.prepareTransaction(rpcProvider as any, [call], { noConfigUpdate: true });
  
  const isDeployed = await isWalletDeployed(rpcProvider, walletAddress);

  // Adjust nonce to 1 for user transaction (bootstrap transaction uses nonce 0)
  const adjustedEnvelope = {
    ...envelope,
    payload: {
      ...envelope.payload,
      nonce: isDeployed ? BigInt(nonce) : 1n,
    },
  };

  // Encode payload to bytes and sign with EIP-191 prefix
  const payloadDigest = Payload.hash(Address.from(walletAddress), Number(chainId), adjustedEnvelope.payload);
  const signature = await sequenceSigner.signMessage(payloadDigest) as `0x${string}`;

  flow.addEvent('endSignMetaTransaction');

  return signature;
};

async function fetchDeploymentSalt(
  accessToken: string
): Promise<string> {
  const apiUrl = 'http://localhost:8072/passport-mr/v1/counterfactual-salt';
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch deployment salt: ${response.statusText}`);
  }

  const data = await response.json();
  return data.salt;
}