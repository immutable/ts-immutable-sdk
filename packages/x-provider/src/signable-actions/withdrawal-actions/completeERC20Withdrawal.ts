import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import {
  Contracts,
  ERC20Token,
  ImmutableXConfiguration,
  StarkSigner,
  signRegisterEthAddress,
} from '@imtbl/x-client';
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

async function executeRegisterAndWithdrawAllERC20(
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

  const populatedTransaction = await contract.populateTransaction.registerAndWithdrawAll(
    etherKey,
    starkPublicKey,
    starkSignature,
    assetType,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeWithdrawAllERC20(
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

  const populatedTransaction = await contract.populateTransaction.withdrawAll(
    await ethSigner.getAddress(),
    starkPublicKey,
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

  if (v3Balance.isZero() && v4Balance.isZero()) {
    throw new Error('No balance to withdraw');
  }

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  const assetType = await getEncodeAssetInfo('asset', ERC20TokenType, config.immutableXConfig, {
    token_address: token.tokenAddress,
  });

  if (isRegistered) {
    return executeWithdrawAllERC20(ethSigner, starkPublicKey, assetType.asset_type, config.immutableXConfig);
  }
  return executeRegisterAndWithdrawAllERC20(
    ethSigner,
    starkSigner,
    starkPublicKey,
    assetType.asset_type,
    config.immutableXConfig,
  );
}
