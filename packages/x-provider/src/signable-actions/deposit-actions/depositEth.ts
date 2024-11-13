import { imx } from '@imtbl/generated-clients';
import {
  Contracts,
  ETHAmount,
  EthSigner,
  ImmutableXConfiguration,
} from '@imtbl/x-client';
import { parseUnits, TransactionResponse } from 'ethers';
import { validateChain } from '../helpers';
import { Signers } from '../types';
import { ProviderConfiguration } from '../../config';

interface ETHTokenData {
  decimals: number;
}

type DepositEthParams = {
  signers: Signers;
  deposit: ETHAmount;
  config: ProviderConfiguration;
};

async function executeDepositEth(
  ethSigner: EthSigner,
  amount: bigint,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const coreContract = Contracts.CoreV4.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await coreContract['deposit(uint256,uint256,uint256)'].populateTransaction(
    starkPublicKey,
    assetType,
    vaultId,
  );

  return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}

export async function depositEth({
  signers: { ethSigner },
  deposit,
  config,
}: DepositEthParams) {
  await validateChain(ethSigner, config.immutableXConfig);

  const user = await ethSigner.getAddress();
  const data: ETHTokenData = {
    decimals: 18,
  };
  const amount = parseUnits(deposit.amount, 'wei');
  const imxConfig = config.immutableXConfig;
  const depositsApi = new imx.DepositsApi(imxConfig.apiConfiguration);
  const encodingApi = new imx.EncodingApi(imxConfig.apiConfiguration);

  const getSignableDepositRequest = {
    user,
    token: {
      type: deposit.type,
      data,
    },
    amount: amount.toString(),
  };

  const signableDepositResult = await depositsApi.getSignableDeposit({
    getSignableDepositRequest,
  });

  const encodingResult = await encodingApi.encodeAsset({
    assetType: 'asset',
    encodeAssetRequest: {
      token: {
        type: deposit.type,
      },
    },
  });

  const assetType = encodingResult.data.asset_type;
  const starkPublicKey = signableDepositResult.data.stark_key;
  const vaultId = signableDepositResult.data.vault_id;

  return executeDepositEth(
    ethSigner,
    amount,
    assetType,
    starkPublicKey,
    vaultId,
    imxConfig,
  );
}
