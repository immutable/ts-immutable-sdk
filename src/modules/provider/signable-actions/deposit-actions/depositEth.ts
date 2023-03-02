import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ETHAmount,
  EthSigner,
  ImmutableXConfiguration,
  UsersApi,
} from '@imtbl/core-sdk';
import { Configuration } from 'src/config';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { validateChain } from '../helpers';

interface ETHTokenData {
  decimals: number;
}

export async function depositEth(
  signer: EthSigner,
  deposit: ETHAmount,
  config: Configuration,
) {
  await validateChain(signer, config.getStarkExConfig());

  const user = await signer.getAddress();
  const data: ETHTokenData = {
    decimals: 18,
  };
  const amount = parseUnits(deposit.amount, 'wei');
  const starkExConfig = config.getStarkExConfig();
  const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
  const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
  const usersApi = new UsersApi(starkExConfig.apiConfiguration);

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
    signer,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndDepositEth(
      signer,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      starkExConfig,
      usersApi,
    );
  }
  return executeDepositEth(
    signer,
    amount,
    assetType,
    starkPublicKey,
    vaultId,
    starkExConfig,
  );
}

async function executeRegisterAndDepositEth(
  signer: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
  usersApi: UsersApi,
): Promise<TransactionResponse> {
  const etherKey = await signer.getAddress();
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
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

  return signer.sendTransaction({ ...populatedTransaction, value: amount });
}

async function executeDepositEth(
  signer: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const populatedTransaction = await coreContract.populateTransaction[
    'deposit(uint256,uint256,uint256)'
  ](starkPublicKey, assetType, vaultId);

  return signer.sendTransaction({ ...populatedTransaction, value: amount });
}
