// Note that this file contains withdrawal functions that are shared
// by both ERC20 and ETH in completeERC20WithdrawalAction and completeEthWithdrawalAction
import {
  Contracts,
  ERC20Token,
  ImmutableXConfiguration,
  StarkSigner,
  signRegisterEthAddress,
} from '@imtbl/x-client';
import { Signer, TransactionResponse } from 'ethers';
import { isRegisteredOnChain } from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';
import { ProviderConfiguration } from '../../config';
import { getWithdrawalBalances } from './getWithdrawalBalance';

type CompleteERC20WithdrawalWorkflowParams = {
  ethSigner: Signer;
  starkSigner: StarkSigner;
  starkPublicKey: string;
  token: ERC20Token;
  config: ProviderConfiguration;
};

const ERC20TokenType = 'ERC20';

export async function executeRegisterAndWithdrawAllFungible(
  ethSigner: Signer,
  starkSigner: StarkSigner,
  starkPublicKey: string,
  assetType: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();

  const starkSignature = await signRegisterEthAddress(
    starkSigner,
    etherKey,
    starkPublicKey,
  );

  // we use registration v4 contract as a wrapper for the core contract
  // so that v3 and v4 withdrawals, AND on-chain registration can be executed in a single transaction
  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.registerAndWithdrawAll.populateTransaction(
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
  // we use registration v4 contract as a wrapper for the core contract
  // so that v3 and v4 withdrawals can be executed in a single transaction
  // (if there are pending withdrawable funds for both)
  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.withdrawAll.populateTransaction(
    await ethSigner.getAddress(),
    starkPublicKey,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function executeWithdrawFungible(
  ethSigner: Signer,
  starkPublicKey: string,
  assetType: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const contract = Contracts.CoreV4.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.withdraw.populateTransaction(
    await ethSigner.getAddress(),
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

// equivilant to Core SDK completeERC20WithdrawalV1Workflow
// in src/workflows/withdrawal/completeERC20Withdrawal.ts
export async function completeERC20WithdrawalAction({
  ethSigner,
  starkSigner,
  starkPublicKey,
  token,
  config,
}: CompleteERC20WithdrawalWorkflowParams) {
  await validateChain(ethSigner, config.immutableXConfig);

  const {
    v3Balance,
    v4Balance,
  } = await getWithdrawalBalances(
    ethSigner,
    starkPublicKey,
    await ethSigner.getAddress(),
    {
      type: ERC20TokenType,
      tokenAddress: token.tokenAddress,
    },
    config.immutableXConfig,
  );

  const assetType = await getEncodeAssetInfo('asset', ERC20TokenType, config.immutableXConfig, {
    token_address: token.tokenAddress,
  });

  if (v3Balance > 0) {
    const isRegistered = await isRegisteredOnChain(
      starkPublicKey,
      ethSigner,
      config,
    );
    if (isRegistered) {
      return executeWithdrawAllFungible(ethSigner, starkPublicKey, assetType.asset_type, config.immutableXConfig);
    }
    return executeRegisterAndWithdrawAllFungible(
      ethSigner,
      starkSigner,
      starkPublicKey,
      assetType.asset_type,
      config.immutableXConfig,
    );
  }

  if (v4Balance > 0) {
    return executeWithdrawFungible(ethSigner, starkPublicKey, assetType.asset_type, config.immutableXConfig);
  }

  throw new Error('No balance to withdraw');
}
