import { Flow } from '@imtbl/metrics';
import { TransactionRequest } from 'ethers';
import { Address, Bytes, Hex, AbiFunction, Provider } from 'ox';
import { getEip155ChainId, getNonce, isWalletDeployed } from './walletHelpers';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import SequenceSigner from './sequenceSigner';
import { Payload, Config, Signature, Constants, Context } from '@0xsequence/wallet-primitives';
import { Envelope, State, Wallet } from '@0xsequence/wallet-core';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import AuthManager from '../authManager';
import { createStateProvider, createWalletConfig, saveWalletConfig, SEQUENCE_CONTEXT } from './signer/signerHelpers';
import GuardianClient from '../guardian';
import { MetaTransaction } from '../zkEvm/types';

export type TransactionParams = {
  sequenceSigner: SequenceSigner;
  rpcProvider: Provider.Provider;
  guardianClient: GuardianClient;
  relayerClient: SequenceRelayerClient;
  walletAddress: string;
  flow: Flow;
  authManager: AuthManager;
  nonceSpace?: bigint;
  isBackgroundTransaction?: boolean;
};

const buildMetaTransactions = async (
  transactionRequest: TransactionRequest,
  rpcProvider: Provider.Provider,
  relayerClient: SequenceRelayerClient,
  zkevmAddress: string,
  nonceSpace?: bigint,
): Promise<[MetaTransaction, ...MetaTransaction[]]> => {
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

  // Estimate the fee and get the nonce from the smart wallet
  const nonce = await getNonce(rpcProvider, zkevmAddress, nonceSpace);

  // Build the meta transactions array with a valid nonce and fee transaction
  const metaTransactions: [MetaTransaction, ...MetaTransaction[]] = [
    {
      ...metaTransaction,
      nonce,
    },
  ];

  return metaTransactions;
};

/**
 * Deploy wallet and execute first transaction
 * Combines: deploy + updateImageHash (nonce 0) + user transaction (nonce 1)
 */
const deployBootstrapAndExecute = async (
  transactionRequest: TransactionRequest,
  sequenceSigner: SequenceSigner,
  rpcProvider: Provider.Provider,
  walletAddress: Address.Address,
  wallet: Wallet,
  chainId: string,
  flow: Flow,
  stateProvider: State.Provider,
  authManager: AuthManager,
): Promise<{ to: Address.Address; signedTransaction: Hex.Hex; }> => {  
  flow.addEvent('startDeployBootstrapAndExecute');

  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }

  const userSignature = await signUserTransaction(walletAddress, transactionRequest, wallet, rpcProvider, sequenceSigner, chainId, flow);

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
      user_ecdsa_signature: userSignature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to build guest module calldata: ${response.statusText}`);
  }

  const result = await response.json();

  flow.addEvent('endBuildGuestModuleMulticall');

  return { to: result.to, signedTransaction: result.data };
};

const createWallet = async (
  authManager: AuthManager,
  walletAddress: Address.Address,
  sequenceSigner: SequenceSigner,
): Promise<{ wallet: Wallet; stateProvider: State.Provider; }> => {
  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }
  const deploymentSalt = await fetchDeploymentSalt(user.accessToken);

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

  return { wallet: wallet, stateProvider: stateProvider };
};

export const prepareAndSignTransaction = async ({
  transactionRequest,
  sequenceSigner,
  rpcProvider,
  guardianClient,
  relayerClient,
  walletAddress,
  flow,
  authManager,
  isBackgroundTransaction,
}: TransactionParams & { transactionRequest: TransactionRequest }): Promise<{ to: Address.Address; data: Hex.Hex; }> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const chainId = await rpcProvider.request({ method: 'eth_chainId' });

  const {wallet, stateProvider} = await createWallet(authManager, Address.from(walletAddress), sequenceSigner);
  
  const deployed = await isWalletDeployed(rpcProvider, walletAddress);
  if (!deployed) {
    const result = await deployBootstrapAndExecute(
      transactionRequest,
      sequenceSigner,
      rpcProvider,
      Address.from(walletAddress),
      wallet,
      Number(chainId).toString(),
      flow,
      stateProvider,
      authManager,
    );
    flow.addEvent('endPrepareDeployBootstrapExecuteTransaction');
    return { to: result.to, data: result.signedTransaction };
  }

  flow.addEvent('startBuildMetaTransactions');

  const tx: Payload.Call = {
    to: transactionRequest.to as `0x${string}`,
    data: (transactionRequest.data || '0x') as `0x${string}`,
    value: BigInt(transactionRequest.value || 0),
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: "revert",
  };


  const envelope = await wallet.prepareTransaction(rpcProvider as any, [tx]);

  const signature = await sequenceSigner.signPayload(Address.from(walletAddress), Number(chainId), envelope.payload);

  const signedEnvelope = Envelope.toSigned(envelope, [
    {
      address: Address.from(await sequenceSigner.getAddress()),
      signature: signature,
    },
  ]);

  const { to, data } = await wallet.buildTransaction(rpcProvider as any, signedEnvelope);

  return { to: to, data: data };
};

/**
 * Build and sign user transaction call (nonce 1)
 */
const signUserTransaction = async (
  walletAddress: string,
  transactionRequest: TransactionRequest,
  wallet: Wallet,
  rpcProvider: Provider.Provider,
  sequenceSigner: SequenceSigner,
  chainId: string,
  flow: Flow,
): Promise<Hex.Hex> => {
  flow.addEvent('startSignUserTransaction');

  const userTx: Payload.Call = {
    to: transactionRequest.to as `0x${string}`,
    value: BigInt(transactionRequest.value || 0),
    data: (transactionRequest.data || '0x') as `0x${string}`,
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: "revert",
  };
  
  const envelope = await wallet.prepareTransaction(rpcProvider as any, [userTx], { noConfigUpdate: true });

  // Adjust nonce to 1 for user transaction (bootstrap transaction uses nonce 0)
  const userEnvelope = {
    ...envelope,
    payload: {
      ...envelope.payload,
      nonce: 1n,
    },
  };

  // Encode payload to bytes and sign with EIP-191 prefix
  const payloadDigest = Payload.hash(Address.from(walletAddress), Number(chainId), userEnvelope.payload);
  const userSignatureHex = await sequenceSigner.signMessage(payloadDigest) as `0x${string}`;

  flow.addEvent('endSignUserTransaction');

  return userSignatureHex;
};

async function fetchDeploymentSalt(
  accessToken: string
): Promise<string> {
  const apiUrl = 'http://localhost:8072/v2/passport/counterfactual-salt';
  
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
