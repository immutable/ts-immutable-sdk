import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { imx } from '@imtbl/generated-clients';
import {
  Contracts,
  ERC20Token,
  ImmutableXConfiguration,
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
