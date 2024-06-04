import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import {
  StarkSigner,
} from '@imtbl/x-client';
import { ProviderConfiguration } from '../../config';
import { isRegisteredOnChain } from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { validateChain } from '../helpers';
import { getWithdrawalBalances } from './getWithdrawalBalance';
import {
  executeRegisterAndWithdrawAllERC20,
  executeWithdrawAllERC20,
  executeWithdrawERC20,
} from './completeERC20Withdrawal';

type CompleteEthWithdrawalActionParams = {
  ethSigner: Signer;
  starkSigner: StarkSigner;
  starkPublicKey: string;
  config: ProviderConfiguration;
};

const EthTokenType = 'ETH';

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

  const assetType = await getEncodeAssetInfo('asset', EthTokenType, config.immutableXConfig);

  if (!v3Balance.isZero() && !v3Balance.isNegative()) {
    const isRegistered = await isRegisteredOnChain(
      starkPublicKey,
      ethSigner,
      config,
    );
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
  if (!v4Balance.isZero() && !v4Balance.isNegative()) {
    return executeWithdrawERC20(ethSigner, starkPublicKey, assetType.asset_type, config.immutableXConfig);
  }
  throw new Error('No balance to withdraw');
}
