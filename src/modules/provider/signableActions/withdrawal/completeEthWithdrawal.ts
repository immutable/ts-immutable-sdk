import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Contracts, EncodingApi } from '@imtbl/core-sdk';
import { Immutable } from 'src/modules/apis/starkex';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';

async function executeRegisterAndWithdrawEth(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  contract: Registration,
  client: Immutable,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    client,
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

async function executeWithdrawEth(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkPublicKey,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function completeEthWithdrawalWorkflow(
  ethSigner: Signer,
  starkPublicKey: string,
  encodingApi: EncodingApi,
  client: Immutable,
) {
  const config = client.getConfiguration();
  const assetType = await getEncodeAssetInfo('asset', 'ETH', encodingApi);

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
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawEth(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      registrationContract,
      client
    );
  } else {
    return executeWithdrawEth(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      coreContract,
    );
  }
}
