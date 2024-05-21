import { Signer } from '@ethersproject/abstract-signer';
import { ERC20Token, StarkSigner } from '@imtbl/x-client';
import { isRegisteredOnChain } from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';
import { ProviderConfiguration } from '../../config';
import { getWithdrawalBalances } from './getWithdrawalBalance';
import { executeRegisterAndWithdrawAllFungible, executeWithdrawAllFungible } from './completeEthWithdrawal';

type CompleteERC20WithdrawalWorkflowParams = {
  ethSigner: Signer;
  starkSigner: StarkSigner;
  starkPublicKey: string;
  token: ERC20Token;
  config: ProviderConfiguration;
};

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
      type: 'ERC20',
      tokenAddress: token.tokenAddress,
    },
    config,
  );

  if (v3Balance.isZero() && v4Balance.isZero()) {
    throw new Error('No balance to withdraw');
  }

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  const assetType = await getEncodeAssetInfo('asset', 'ERC20', config.immutableXConfig, {
    token_address: token.tokenAddress,
  });

  if (!isRegistered) {
    return executeRegisterAndWithdrawAllFungible(
      ethSigner,
      starkSigner,
      assetType.asset_type,
      starkPublicKey,
      config.immutableXConfig,
    );
  }
  return executeWithdrawAllFungible(
    ethSigner,
    assetType.asset_type,
    starkPublicKey,
    config.immutableXConfig,
  );
}
