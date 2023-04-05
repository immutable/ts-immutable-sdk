import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse } from "@ethersproject/providers";
import { Configuration } from "@imtbl/config";
import { ERC20Token } from "types";
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from "../registration";
import { getEncodeAssetInfo } from "./getEncodeAssetInfo";
import { Contracts, ImmutableXConfiguration, UsersApi } from "@imtbl/core-sdk";
import { validateChain } from "../helpers";

type ExecuteRegisterAndWithdrawERC20Params = {
  ethSigner: Signer;
  assetType: string;
  starkPublicKey: string;
  config: Configuration;
};

type CompleteERC20WithdrawalWorkflowParams = {
  ethSigner: Signer;
  starkPublicKey: string;
  token: ERC20Token;
  config: Configuration;
};

async function executeRegisterAndWithdrawERC20({
  ethSigner,
  assetType,
  starkPublicKey,
  config,
}: ExecuteRegisterAndWithdrawERC20Params): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const starkExConfig = config.getStarkExConfig();
  const usersApi = new UsersApi(starkExConfig.apiConfiguration);
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi
  );

  const contract = Contracts.Registration.connect(
    config.getStarkExConfig().ethConfiguration.registrationContractAddress,
    ethSigner
  );

  const populatedTransaction =
    await contract.populateTransaction.registerAndWithdraw(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType
    );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeWithdrawERC20(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  config: ImmutableXConfiguration
): Promise<TransactionResponse> {
  const contract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner
  );

  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkPublicKey,
    assetType
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

export async function completeERC20WithdrawalAction({
  ethSigner,
  starkPublicKey,
  token,
  config,
}: CompleteERC20WithdrawalWorkflowParams) {
  await validateChain(ethSigner, config.getStarkExConfig());

  const starkExConfig = config.getStarkExConfig();
  const assetType = await getEncodeAssetInfo("asset", "ERC20", starkExConfig, {
    token_address: token.tokenAddress,
  });
  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC20({
      ethSigner,
      assetType: assetType.asset_type,
      starkPublicKey,
      config,
    });
  } else {
    return executeWithdrawERC20(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      starkExConfig
    );
  }
}
