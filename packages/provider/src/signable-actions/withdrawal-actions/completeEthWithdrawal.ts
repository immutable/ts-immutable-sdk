import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Contracts, ImmutableXConfiguration, UsersApi } from '@imtbl/core-sdk';
import { ProviderConfiguration } from 'config';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';

type CompleteEthWithdrawalActionParams = {
  ethSigner: Signer;
  starkPublicKey: string;
  config: ProviderConfiguration;
};

async function executeRegisterAndWithdrawEth(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const usersApi = new UsersApi(config.apiConfiguration);
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const contract = Contracts.Registration.connect(
    config.ethConfiguration.registrationContractAddress,
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

async function executeWithdrawEth(
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

export async function completeEthWithdrawalAction({
  ethSigner,
  starkPublicKey,
  config,
}: CompleteEthWithdrawalActionParams) {
  await validateChain(ethSigner, config.immutableXConfig);

  const imxConfig = config.immutableXConfig;
  const assetType = await getEncodeAssetInfo('asset', 'ETH', imxConfig);

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawEth(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      imxConfig,
    );
  }
  return executeWithdrawEth(
    ethSigner,
    assetType.asset_type,
    starkPublicKey,
    imxConfig,
  );
}
