import { Signer } from '@ethersproject/abstract-signer';
import { DepositsApi, EncodingApi, UsersApi } from '../../api';
import { parseEther } from 'ethers/lib/utils';
import { Core } from '../../contracts';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChainWorkflow,
} from '../registration';
import { ETHDeposit } from '../../types';
import { BigNumber } from 'ethers';

interface ETHTokenData {
  decimals: number;
}

export async function depositEthWorkflow(
  signer: Signer,
  deposit: ETHDeposit,
  depositsApi: DepositsApi,
  usersApi: UsersApi,
  encodingApi: EncodingApi,
  contract: Core,
): Promise<string> {
  // Configure request parameters
  const user = (await signer.getAddress()).toLowerCase();
  const data: ETHTokenData = {
    decimals: 18,
  };
  const amount = parseEther(deposit.amount);

  // Get signable deposit details
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

  const assetType = encodingResult.data.asset_type!;
  const starkPublicKey = signableDepositResult.data.stark_key!;
  const vaultId = signableDepositResult.data.vault_id!;

  // Check if user is registered onchain
  const isRegistered = await isRegisteredOnChainWorkflow(signer, contract);

  if (!isRegistered) {
    return executeRegisterAndDepositEth(
      signer,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      contract,
      usersApi,
    );
  } else {
    return executeDepositEth(
      signer,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      contract,
    );
  }
}

async function executeRegisterAndDepositEth(
  signer: Signer,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  contract: Core,
  usersApi: UsersApi,
): Promise<string> {
  const etherKey = await signer.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const trx = await contract.populateTransaction.registerAndDepositEth(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature!,
    assetType,
    vaultId,
  );

  return signer
    .sendTransaction({ ...trx, value: amount })
    .then(res => res.hash);
}

async function executeDepositEth(
  signer: Signer,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  contract: Core,
): Promise<string> {
  const trx = await contract.populateTransaction[
    'deposit(uint256,uint256,uint256)'
  ](starkPublicKey, assetType, vaultId);

  return signer
    .sendTransaction({ ...trx, value: amount })
    .then(res => res.hash);
}
