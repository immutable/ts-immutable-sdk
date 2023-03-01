import { Signer } from '@ethersproject/abstract-signer';
import { EncodingApi, MintsApi, Contracts, ImmutableXConfiguration, UsersApi } from '@imtbl/core-sdk';
import * as encUtils from 'enc-utils';
import { ERC721Token } from '../../../../types';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { TransactionResponse } from '@ethersproject/providers';
import { Immutable } from 'src/modules/apis/starkex';

interface MintableERC721Withdrawal {
  type: 'ERC721';
  data: {
    id: string;
    blueprint?: string;
    tokenAddress: string;
  };
}

async function executeWithdrawMintableERC721(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  mintingBlob: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const contract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction =
    await contract.populateTransaction.withdrawAndMint(
      starkPublicKey,
      assetType,
      mintingBlob,
    );
  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeRegisterAndWithdrawMintableERC721(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  mintingBlob: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const usersApi = new UsersApi(config.apiConfiguration);
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi
  );

  const contract = Contracts.Registration.connect(
    config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction =
    await contract.populateTransaction.regsiterAndWithdrawAndMint(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      mintingBlob,
    );

  return ethSigner.sendTransaction(populatedTransaction);
}

function getMintingBlob(token: MintableERC721Withdrawal): string {
  const id = token.data.id;
  const blueprint = token.data.blueprint || '';
  return encUtils.sanitizeHex(encUtils.utf8ToHex(`{${id}}:{${blueprint}}`));
}

async function completeMintableERC721Withdrawal(
  ethSigner: Signer,
  starkPublicKey: string,
  token: MintableERC721Withdrawal,
  client: Immutable
) {
  const config = client.getConfiguration();
  const encodingApi = new EncodingApi(config.apiConfiguration)
  const assetType = await getEncodeAssetInfo(
    'mintable-asset',
    'ERC721',
    encodingApi,
    {
      id: token.data.id,
      token_address: token.data.tokenAddress,
      ...(token.data.blueprint && { blueprint: token.data.blueprint }),
    },
  );

  const mintingBlob = getMintingBlob(token);

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawMintableERC721(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      mintingBlob,
      config,
    );
  } else {
    return executeWithdrawMintableERC721(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      mintingBlob,
      config,
    );
  }
}

async function executeRegisterAndWithdrawERC721(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  tokenId: string,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const usersApi = new UsersApi(config.apiConfiguration);
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const contract = Contracts.Registration.connect(
    config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction =
    await contract.populateTransaction.registerAndWithdrawNft(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      tokenId,
    );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeWithdrawERC721(
  ethSigner: Signer,
  assetType: string,
  starkPublicKey: string,
  tokenId: string,
  config: ImmutableXConfiguration
): Promise<TransactionResponse> {
  const contract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.populateTransaction.withdrawNft(
    starkPublicKey,
    assetType,
    tokenId,
  );
  return ethSigner.sendTransaction(populatedTransaction);
}

async function completeERC721Withdrawal(
  ethSigner: Signer,
  starkPublicKey: string,
  token: ERC721Token,
  encodingApi: EncodingApi,
  client: Immutable,
) {
  const config = client.getConfiguration();
  const assetType = await getEncodeAssetInfo('asset', 'ERC721', encodingApi, {
    token_id: token.tokenId,
    token_address: token.tokenAddress,
  });

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC721(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      token.tokenId,
      config,
    );
  } else {
    return executeWithdrawERC721(
      ethSigner,
      assetType.asset_type,
      starkPublicKey,
      token.tokenId,
      config,
    );
  }
}

export async function completeERC721WithdrawalAction(
  ethSigner: Signer,
  starkPublicKey: string,
  token: ERC721Token,
  encodingApi: EncodingApi,
  client: Immutable,
) {
  const tokenAddress = token.tokenAddress;
  const tokenId = token.tokenId;
  const config = client.getConfiguration();
  const mintsApi = new MintsApi(config.apiConfiguration)

  return await mintsApi
    .getMintableTokenDetailsByClientTokenId({
      tokenAddress,
      tokenId,
    })
    .then(mintableToken =>
      completeMintableERC721Withdrawal(
        ethSigner,
        starkPublicKey,
        {
          type: 'ERC721',
          data: {
            id: tokenId,
            tokenAddress: tokenAddress,
            blueprint: mintableToken.data.blueprint,
          },
        },
        client,
      ),
    )
    .catch(error => {
      if (error.response?.status === 404) {
        // token is already minted on L1
        return completeERC721Withdrawal(
          ethSigner,
          starkPublicKey,
          token,
          encodingApi,
          client,
        );
      }
      throw error; // unable to recover from any other kind of error
    });
}
