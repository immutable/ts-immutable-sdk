import { Flow } from '@imtbl/metrics';
import { TransactionRequest } from 'ethers';
import { isWalletDeployed } from './walletHelpers';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import SequenceSigner from './sequenceSigner';
import { Address, Bytes, Hex, Abi, AbiFunction, Provider, Hash, RpcTransport } from 'ox';
import { Payload, Config, Signature, Erc6492, Constants, Context } from '@0xsequence/wallet-primitives';
import { Envelope, Signers, State, Wallet } from '@0xsequence/wallet-core';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import AuthManager from '../authManager';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { createStateProvider, saveWalletConfig, SEQUENCE_CONTEXT } from './signer/signerHelpers';

const UPDATE_IMAGE_HASH = Abi.from(['function updateImageHash(bytes32 _imageHash) external'])[0];

export type TransactionParams = {
  sequenceSigner: SequenceSigner;
  rpcProvider: Provider.Provider;
  relayerClient: SequenceRelayerClient;
  walletAddress: string;
  flow: Flow;
  authManager: AuthManager;
  nonceSpace?: bigint;
  multiRollupApiClients: MultiRollupApiClients;
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
  stateProvider: State.Provider,
  chainId: string,
  flow: Flow,
  multiRollupApiClients: MultiRollupApiClients,
): Promise<{ to: Address.Address; signedTransaction: Hex.Hex; }> => {  
  flow.addEvent('startDeployBootstrapAndExecute');
  
  // Get deployment info
  const deployInfo = await stateProvider.getDeploy(Address.from(walletAddress));
  if (!deployInfo) {
    throw new Error(`Cannot find deploy information for wallet ${walletAddress}`);
  }
  
  // Build deploy call
  const deployTx = Erc6492.deploy(deployInfo.imageHash, deployInfo.context);
  const deployCall: Payload.Call = {
    to: deployTx.to,
    value: 0n,
    data: deployTx.data,
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: 'revert',
  };

  flow.addEvent('endDeployBootstrapAndExecute');

  // Build updateImageHash and user transaction calls in parallel
  const [updateImageHashCall, userTransactionCall] = await Promise.all([
    buildUpdateImageHashCall(walletAddress, sequenceSigner, Number(chainId), flow),
    buildUserTransactionCall(walletAddress, transactionRequest, wallet, rpcProvider, sequenceSigner, chainId, flow),
  ]);
  
  // Build Guest Module multicall: deploy + updateImageHash + user tx
  const signedTransaction = Bytes.toHex(
    Payload.encode({
      type: 'call',
      space: 0n,
      nonce: 0n,
      calls: [deployCall, updateImageHashCall, userTransactionCall],
    })
  );

  flow.addEvent('endBuildGuestModuleMulticall');
  
  return { to: wallet.guest, signedTransaction };
};

const createWalletAndStateProvider = async (
  authManager: AuthManager,
  walletAddress: Address.Address,
  sequenceSigner: SequenceSigner,
  multiRollupApiClients: MultiRollupApiClients
): Promise<{ wallet: Wallet; stateProvider: State.Provider; }> => {
  const user = await authManager.getUser();
  if (!user?.accessToken) {
    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'No access token found',
    );
  }
  const deploymentSalt = await fetchDeploymentSalt(user.accessToken, multiRollupApiClients);

  const walletConfig = await sequenceSigner.getWalletConfig();
  const realImageHash = Bytes.toHex(Config.hashConfiguration(walletConfig));
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
  relayerClient,
  walletAddress,
  flow,
  authManager,
  multiRollupApiClients,
}: TransactionParams & { transactionRequest: TransactionRequest }): Promise<{ to: Address.Address; data: Hex.Hex; }> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const chainId = await rpcProvider.request({ method: 'eth_chainId' });

  const { wallet, stateProvider } = await createWalletAndStateProvider(authManager, Address.from(walletAddress), sequenceSigner, multiRollupApiClients);
  
  const deployed = await isWalletDeployed(rpcProvider, walletAddress);
  if (!deployed) {
    const result = await deployBootstrapAndExecute(
      transactionRequest,
      sequenceSigner,
      rpcProvider,
      Address.from(walletAddress),
      wallet,
      stateProvider,
      Number(chainId).toString(),
      flow,
      multiRollupApiClients
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
  console.log(`sig = ${signature}`);
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
 * Build and sign updateImageHash call (nonce 0)
 */
const buildUpdateImageHashCall = async (
  walletAddress: string,
  sequenceSigner: SequenceSigner,
  chainId: number,
  flow: Flow,
): Promise<Payload.Call> => {
  flow.addEvent('startBuildUpdateImageHashCall');

  const signerAddress = await sequenceSigner.getAddress();
  const topology: Config.Topology = {
    type: "signer",
    address: Address.from(signerAddress),
    weight: 1n,
  };

  const walletConfig: Config.Config = {
    threshold: 1n,
    checkpoint: 0n,
    topology: topology,
  };

  const imageHash = Bytes.toHex(Config.hashConfiguration(walletConfig));

  const updateImageHashTx: Payload.Call = {
    to: Address.from(walletAddress),
    value: 0n,
    data: AbiFunction.encodeData(UPDATE_IMAGE_HASH, [imageHash]),
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: 'revert',
  };

  const payload: Payload.Calls = {
    type: 'call',
    space: 0n,
    nonce: 0n,
    calls: [updateImageHashTx],
  };

  const bootstrapConfig: Config.Config = {
    threshold: 1n,
    checkpoint: 0n,
    topology: {
      type: 'signer',
      address: Address.from("IMMUTABLE_SIGNER_ADDRESS"),
      weight: 1n,
    },
  };

  const bootstrapEnvelope: Envelope.Envelope<Payload.Calls> = {
    wallet: Address.from(walletAddress),
    payload: payload,
    chainId: chainId,
    configuration: bootstrapConfig,
  };

  const immutableSigner = new Signers.Pk.Pk('IMMUTABLE_SIGNER_ADDRESS_PK' as `0x${string}`);
  const bootstrapSignature = await immutableSigner.sign(Address.from(walletAddress), chainId, payload);
  
  const signedBootstrapEnvelope = Envelope.toSigned(bootstrapEnvelope, [
    {
      address: Address.from(immutableSigner.address),
      signature: bootstrapSignature,
    },
  ]);

  const bootstrapRawSig = Envelope.encodeSignature(signedBootstrapEnvelope);
  const bootstrapEncodedSig = Bytes.toHex(
    Signature.encodeSignature({
      ...bootstrapRawSig,
      suffix: [],
    })
  );

  const updateImageHashCall: Payload.Call = {
    to: Address.from(walletAddress),
    value: 0n,
    data: AbiFunction.encodeData(Constants.EXECUTE, [
      Bytes.toHex(Payload.encode(payload)),
      bootstrapEncodedSig,
    ]),
    gasLimit: 0n,
    delegateCall: false,
    onlyFallback: false,
    behaviorOnError: 'revert',
  };

  flow.addEvent('endBuildUpdateImageHashCall');

  return updateImageHashCall;
}

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
): Promise<Payload.Call>  => {
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
}

// TODO replace this with multi-rollup api client
async function fetchDeploymentSalt(
  accessToken: string,
  multiRollupApiClients: MultiRollupApiClients,
): Promise<string> {
  const apiUrl = `http://localhost:8071/v2/passport/counterfactual-salt`;
  
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

