import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Signers } from '../types';
import { Immutable } from "../../../apis/starkex";
import { ERC20Token } from '../../../../types';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { Contracts, EncodingApi } from '@imtbl/core-sdk';

type ExecuteRegisterAndWithdrawERC20Params = {
  ethSigner: Signer;
  assetType: string;
  starkPublicKey: string;
  contract: Registration;
  client: Immutable;
}

type CompleteERC20WithdrawalWorkflowParams = {
  signers: Signers;
  starkPublicKey: string;
  token: ERC20Token;
  client: Immutable;
}

async function executeRegisterAndWithdrawERC20(
  {
    ethSigner,
    assetType,
    starkPublicKey,
    contract,
    client
  }: ExecuteRegisterAndWithdrawERC20Params
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    client
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
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkPublicKey,
    assetType,
  );

  return signer.sendTransaction(populatedTransaction);
}

export async function completeERC20WithdrawalWorkflow({
    signers: { ethSigner },
    starkPublicKey,
    token,
    client,
  }: CompleteERC20WithdrawalWorkflowParams) {
  const config = client.getConfiguration()
  const encodingApi = new EncodingApi(config.apiConfiguration)
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', encodingApi, {
    token_address: token.tokenAddress,
  });

  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const registrationContract = Contracts.Registration.connect(
    config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC20({
      ethSigner,
      assetType: assetType.asset_type,
      contract: registrationContract,
      starkPublicKey,
      client
    }
    );
  } else {
    return executeWithdrawERC20(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      coreContract,
    );
  }
}
