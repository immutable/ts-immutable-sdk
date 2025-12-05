import { Flow } from '@imtbl/metrics';
import { TransactionRequest } from 'ethers';
import { Address, Bytes, Hex, AbiFunction, Provider } from 'ox';
import { getEip155ChainId, isWalletDeployed } from './walletHelpers';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import SequenceSigner from './sequenceSigner';
import { Payload, Config, Signature, Constants, Context } from '@0xsequence/wallet-primitives';
import { Envelope, Wallet } from '@0xsequence/wallet-core';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import AuthManager from '../authManager';
import { createStateProvider, saveWalletConfig, SEQUENCE_CONTEXT } from './signer/signerHelpers';

export type TransactionParams = {
  sequenceSigner: SequenceSigner;
  rpcProvider: Provider.Provider;
  relayerClient: SequenceRelayerClient;
  walletAddress: string;
  flow: Flow;
  authManager: AuthManager;
  nonceSpace?: bigint;
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

  const userTransction = await buildUserTransactionCall(walletAddress, transactionRequest, wallet, rpcProvider, sequenceSigner, chainId, flow);

  const response = await fetch('http://localhost:8073/relayer-mr/v1/build-guest-module-calldata', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wallet_address: walletAddress,
      user_eoa: await sequenceSigner.getAddress(),
      chain_id: getEip155ChainId(Number(chainId)),
      user_execute_data: userTransction.data,
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
): Promise<Wallet> => {
  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }
  const deploymentSalt = await fetchDeploymentSalt(user.accessToken);

  const walletConfig = await sequenceSigner.getWalletConfig();
  const realImageHash = Bytes.toHex(Config.hashConfiguration(walletConfig));
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
  rpcProvider,
  relayerClient,
  walletAddress,
  flow,
  authManager,
}: TransactionParams & { transactionRequest: TransactionRequest }): Promise<{ to: Address.Address; data: Hex.Hex; }> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const chainId = await rpcProvider.request({ method: 'eth_chainId' });

  const wallet = await createWallet(authManager, Address.from(walletAddress), sequenceSigner);
  
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
const buildUserTransactionCall = async (
  walletAddress: string,
  transactionRequest: TransactionRequest,
  wallet: Wallet,
  rpcProvider: Provider.Provider,
  sequenceSigner: SequenceSigner,
  chainId: string,
  flow: Flow,
): Promise<Payload.Call> => {
  flow.addEvent('startBuildUserTransactionCall');

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

  // Sign user transaction
  const userSignature = await sequenceSigner.signPayload(Address.from(walletAddress), Number(chainId), userEnvelope.payload);

  const signerAddress = await sequenceSigner.getAddress();
  const signedUserEnvelope = Envelope.toSigned(userEnvelope, [
    {
      address: Address.from(signerAddress),
      signature: userSignature,
    },
  ]);
  
  // Encode signature
  const status = await wallet.getStatus(rpcProvider as any);
  const userRawSig = Envelope.encodeSignature(signedUserEnvelope);
  const userEncodedSig = Bytes.toHex(
    Signature.encodeSignature({
      ...userRawSig,
      suffix: status.pendingUpdates.map(({ signature }: any) => signature),
    })
  );

  flow.addEvent('endBuildUserTransactionCall');

  const userTransactionCall: Payload.Call = {
    to: Address.from(walletAddress),
    value: 0n,
    data: AbiFunction.encodeData(Constants.EXECUTE, [
      Bytes.toHex(Payload.encode(signedUserEnvelope.payload)),
      userEncodedSig,
    ]),
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: 'revert',
  };

  flow.addEvent('endBuildUserTransactionCall');

  return userTransactionCall;
};

async function fetchDeploymentSalt(
  accessToken: string
): Promise<string> {
  const apiUrl = 'http://localhost:8071/v2/passport/counterfactual-salt';
  
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
