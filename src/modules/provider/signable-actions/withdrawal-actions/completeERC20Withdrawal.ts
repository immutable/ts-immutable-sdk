import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Immutable } from "../../../apis/starkex";
import { ERC20Token } from '../../../../types';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { Contracts, ImmutableXConfiguration, UsersApi } from '@imtbl/core-sdk';

type ExecuteRegisterAndWithdrawERC20Params = {
  ethSigner: Signer;
  assetType: string;
  starkPublicKey: string;
  client: Immutable;
}

type CompleteERC20WithdrawalWorkflowParams = {
  ethSigner: Signer;
  starkPublicKey: string;
  token: ERC20Token;
  client: Immutable;
}

async function executeRegisterAndWithdrawERC20(
  {
    ethSigner,
    assetType,
    starkPublicKey,
    client,
  }: ExecuteRegisterAndWithdrawERC20Params
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const config = client.getConfiguration();
  const usersApi = new UsersApi(config.apiConfiguration)
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const contract = Contracts.Registration.connect(
    client.getConfiguration()
      .ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction =
    await contract.populateTransaction.registerAndWithdraw(
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
    client,
  }: CompleteERC20WithdrawalWorkflowParams) {
  const config = client.getConfiguration()
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', config, {
    token_address: token.tokenAddress,
  });
  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC20({
      ethSigner,
      assetType: assetType.asset_type,
      starkPublicKey,
      client
    });
  } else {
    return executeWithdrawERC20(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      config
    );
  }
}
