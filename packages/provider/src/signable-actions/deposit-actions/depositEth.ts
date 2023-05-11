import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ETHAmount,
  EthSigner,
  ImmutableXConfiguration,
  UsersApi,
} from '@imtbl/core-sdk';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
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
  const depositsApi = new DepositsApi(imxConfig.apiConfiguration);
  const encodingApi = new EncodingApi(imxConfig.apiConfiguration);
  const usersApi = new UsersApi(imxConfig.apiConfiguration);

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

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndDepositEth(
      ethSigner,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      imxConfig,
      usersApi,
    );
  }
  return executeDepositEth(
    ethSigner,
    amount,
    assetType,
    starkPublicKey,
    vaultId,
    imxConfig,
  );
}

async function executeRegisterAndDepositEth(
  ethSigner: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
  usersApi: UsersApi,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const populatedTransaction = await coreContract.populateTransaction.registerAndDepositEth(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature,
    assetType,
    vaultId,
  );

  return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}

async function executeDepositEth(
  ethSigner: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await coreContract.populateTransaction[
    'deposit(uint256,uint256,uint256)'
  ](starkPublicKey, assetType, vaultId);

  return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}
