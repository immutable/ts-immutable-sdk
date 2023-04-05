import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ETHAmount,
  ImmutableXConfiguration,
  UsersApi,
} from "@imtbl/core-sdk";
import { Configuration } from "@imtbl/config";
import { parseUnits } from "@ethersproject/units";
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from "../registration";
import { BigNumber } from "@ethersproject/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import { validateChain } from "../helpers";
import { EthSigner } from "types";
import { Signers } from "../types";

interface ETHTokenData {
  decimals: number;
}

type DepositEthParams = {
  signers: Signers;
  deposit: ETHAmount;
  config: Configuration;
};

export async function depositEth({
  signers: { ethSigner },
  deposit,
  config,
}: DepositEthParams) {
  await validateChain(ethSigner, config.getStarkExConfig());

  const user = await ethSigner.getAddress();
  const data: ETHTokenData = {
    decimals: 18,
  };
  const amount = parseUnits(deposit.amount, "wei");
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
    assetType: "asset",
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
    config
  );

  if (!isRegistered) {
    return executeRegisterAndDepositEth(
      ethSigner,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      starkExConfig,
      usersApi
    );
  } else {
    return executeDepositEth(
      ethSigner,
      amount,
      assetType,
      starkPublicKey,
      vaultId,
      starkExConfig
    );
  }
}

async function executeRegisterAndDepositEth(
  ethSigner: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
  usersApi: UsersApi
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner
  );

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi
  );

  const populatedTransaction =
    await coreContract.populateTransaction.registerAndDepositEth(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      vaultId
    );

  return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}

async function executeDepositEth(
  ethSigner: EthSigner,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner
  );

  const populatedTransaction = await coreContract.populateTransaction[
    "deposit(uint256,uint256,uint256)"
  ](starkPublicKey, assetType, vaultId);

  return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}
