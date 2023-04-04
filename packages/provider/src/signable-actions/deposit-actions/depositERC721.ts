import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ERC721Token,
  ImmutableXConfiguration,
  UsersApi,
} from "@imtbl/core-sdk";
import { TransactionResponse } from "@ethersproject/providers";
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from "../registration";
import { Configuration } from "@imtbl/config";
import { validateChain } from "../helpers";
import { EthSigner } from "types";
import { Signers } from "../types";

interface ERC721TokenData {
  token_id: string;
  token_address: string;
}

type DepositERC721Params = {
  signers: Signers;
  deposit: ERC721Token;
  config: Configuration;
};

export async function depositERC721({
  signers: { ethSigner },
  deposit,
  config,
}: DepositERC721Params): Promise<TransactionResponse> {
  await validateChain(ethSigner, config.getStarkExConfig());

  const user = await ethSigner.getAddress();
  const starkExConfig = config.getStarkExConfig();
  const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
  const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
  const usersApi = new UsersApi(starkExConfig.apiConfiguration);

  const data: ERC721TokenData = {
    token_address: deposit.tokenAddress,
    token_id: deposit.tokenId,
  };

  const amount = "1";

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

  // Perform encoding on asset details to get an assetType (required for stark contract request)
  const encodingResult = await encodingApi.encodeAsset({
    assetType: "asset",
    encodeAssetRequest: {
      token: {
        type: deposit.type,
        data: {
          token_address: deposit.tokenAddress,
          token_id: deposit.tokenId,
        },
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

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = Contracts.IERC721.connect(
    deposit.tokenAddress,
    ethSigner
  );
  const operator = starkExConfig.ethConfiguration.coreContractAddress;
  const isApprovedForAll = await tokenContract.isApprovedForAll(user, operator);
  if (!isApprovedForAll) {
    await tokenContract.setApprovalForAll(operator, true);
  }

  if (!isRegistered) {
    const signableResult = await getSignableRegistrationOnchain(
      user,
      starkPublicKey,
      usersApi
    );

    const coreContract = Contracts.Core.connect(
      starkExConfig.ethConfiguration.coreContractAddress,
      ethSigner
    );
    // Note: proxy registration contract registerAndDepositNft method is not used as it currently fails erc721 transfer ownership check
    await coreContract.registerUser(
      user,
      starkPublicKey,
      signableResult.operator_signature
    );
  }

  return executeDepositERC721(
    ethSigner,
    deposit.tokenId,
    assetType,
    starkPublicKey,
    vaultId,
    starkExConfig
  );
}

async function executeDepositERC721(
  ethSigner: EthSigner,
  tokenId: string,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner
  );
  const populatedTransaction =
    await coreContract.populateTransaction.depositNft(
      starkPublicKey,
      assetType,
      vaultId,
      tokenId
    );

  return ethSigner.sendTransaction(populatedTransaction);
}
