import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { imx } from '@imtbl/generated-clients';
import {
  Contracts,
  ERC20Token,
  ImmutableXConfiguration,
  // WalletConnection,
} from '@imtbl/x-client';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';
import { ProviderConfiguration } from '../../config';

type ExecuteRegisterAndWithdrawERC20Params = {
  ethSigner: Signer;
  assetType: string;
  starkPublicKey: string;
  config: ProviderConfiguration;
};

type CompleteERC20WithdrawalWorkflowParams = {
  ethSigner: Signer;
  starkPublicKey: string;
  token: ERC20Token;
  config: ProviderConfiguration;
};

// type RegisterAndCompleteAllERC20WithdrawalWorkflowParams =
//   CompleteERC20WithdrawalWorkflowParams & { walletConnection: WalletConnection };

async function executeRegisterAndWithdrawERC20({
  ethSigner,
  assetType,
  starkPublicKey,
  config,
}: ExecuteRegisterAndWithdrawERC20Params): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const imxConfig = config.immutableXConfig;
  const usersApi = new imx.UsersApi(imxConfig.apiConfiguration);
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  // Core SDK uses v3 contract in this method
  const contract = Contracts.Registration.connect(
    config.immutableXConfig.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.populateTransaction.registerAndWithdraw(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeWithdrawERC20(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const contract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkPublicKey,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

// equivilant to Core SDK completeERC20WithdrawalV1Workflow
// in src/workflows/withdrawal/completeERC20Withdrawal.ts
export async function completeERC20WithdrawalAction({
  ethSigner,
  starkPublicKey,
  token,
  config,
}: CompleteERC20WithdrawalWorkflowParams) {
  await validateChain(ethSigner, config.immutableXConfig);

  const imxConfig = config.immutableXConfig;
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', imxConfig, {
    token_address: token.tokenAddress,
  });
  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC20({
      ethSigner,
      assetType: assetType.asset_type,
      starkPublicKey,
      config,
    });
  }
  return executeWithdrawERC20(
    ethSigner,
    assetType.asset_type,
    starkPublicKey,
    imxConfig,
  );
}

export async function completeERC20WithdrawalV2Workflow({
  ethSigner,
  token,
  config,
}: CompleteERC20WithdrawalWorkflowParams) {
  // is it fine to call validateChain here?
  await validateChain(ethSigner, config.immutableXConfig);

  const imxConfig = config.immutableXConfig;
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', imxConfig, {
    token_address: token.tokenAddress,
  });

  const coreContract = Contracts.CoreV4.connect(
    imxConfig.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const ownerKey = await ethSigner.getAddress();

  const populatedTransaction = await coreContract.populateTransaction.withdraw(
    ownerKey,
    assetType.asset_type,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function completeAllERC20WithdrawalWorkflow({
  ethSigner,
  starkPublicKey,
  token,
  config,
}: CompleteERC20WithdrawalWorkflowParams) {
  const imxConfig = config.immutableXConfig;
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', imxConfig, {
    token_address: token.tokenAddress,
  });

  const registrationContract = Contracts.RegistrationV4.connect(
    imxConfig.ethConfiguration.registrationV4ContractAddress,
    ethSigner,
  );

  const ethAddress = await ethSigner.getAddress();
  const populatedTransaction = await registrationContract.populateTransaction.withdrawAll(
    ethAddress,
    starkPublicKey,
    assetType.asset_id,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

// export async function registerAndCompleteAllERC20WithdrawalWorkflow({
//   walletConnection,
//   ethSigner,
//   starkPublicKey,
//   token,
//   config,
// }: RegisterAndCompleteAllERC20WithdrawalWorkflowParams) {
//   const imxConfig = config.immutableXConfig;
//   const assetType = await getEncodeAssetInfo('asset', 'ERC20', imxConfig, {
//     token_address: token.tokenAddress,
//   });

//   const registrationContract = Contracts.RegistrationV4.connect(
//     imxConfig.ethConfiguration.registrationV4ContractAddress,
//     walletConnection.ethSigner,
//   );

//   const ethAddress = await walletConnection.ethSigner.getAddress();

//   const starkSignature = await signRegisterEthAddress(
//     walletConnection.starkSigner,
//     ethAddress,
//     starkPublicKey,
//   );

//   const populatedTransaction =
//     await registrationContract.populateTransaction.registerAndWithdrawAll(
//       ethAddress,
//       starkPublicKey,
//       starkSignature,
//       assetType.asset_id,
//     );

//   return walletConnection.ethSigner.sendTransaction(populatedTransaction);
// }
