import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import {
  Contracts, ImmutableXConfiguration, signRegisterEthAddress, StarkSigner,
} from '@imtbl/x-client';
import { ProviderConfiguration } from '../../config';
import { isRegisteredOnChain } from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';
import { getWithdrawalBalances } from './getWithdrawalBalance';

type CompleteEthWithdrawalActionParams = {
  ethSigner: Signer;
  starkSigner: StarkSigner;
  starkPublicKey: string;
  config: ProviderConfiguration;
};

const EthTokenType = 'ETH';

// works with ETH or ERC20
export async function executeRegisterAndWithdrawAllFungible(
  ethSigner: Signer,
  starkSigner: StarkSigner,
  starkPublicKey: string,
  assetType: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();

  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const starkSignature = await signRegisterEthAddress(
    starkSigner,
    await ethSigner.getAddress(),
    starkPublicKey,
  );

  const populatedTransaction = await contract.populateTransaction.registerAndWithdrawAll(
    etherKey,
    starkPublicKey,
    starkSignature,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function executeWithdrawAllFungible(
  ethSigner: Signer,
  starkPublicKey: string,
  assetType: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.populateTransaction.withdrawAll(
    await ethSigner.getAddress(),
    starkPublicKey,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function completeEthWithdrawalAction({
  ethSigner,
  starkSigner,
  starkPublicKey,
  config,
}: CompleteEthWithdrawalActionParams): Promise<TransactionResponse> {
  await validateChain(ethSigner, config.immutableXConfig);

  // get withdrawal balances
  const {
    v3Balance,
    v4Balance,
  } = await getWithdrawalBalances(
    ethSigner,
    starkPublicKey,
    await ethSigner.getAddress(),
    { type: EthTokenType },
    config.immutableXConfig,
  );

  if (v3Balance.isZero() && v4Balance.isZero()) {
    throw new Error('No balance to withdraw');
  }

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  const assetType = await getEncodeAssetInfo('asset', EthTokenType, config.immutableXConfig);

  if (!isRegistered) {
    return executeRegisterAndWithdrawAllFungible(
      ethSigner,
      starkSigner,
      starkPublicKey,
      assetType.asset_type,
      config.immutableXConfig,
    );
  }
  return executeWithdrawAllFungible(ethSigner, starkPublicKey, assetType.asset_type, config.immutableXConfig);
}
