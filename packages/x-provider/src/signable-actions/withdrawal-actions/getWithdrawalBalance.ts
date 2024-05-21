import { Signer } from '@ethersproject/abstract-signer';
import {
  AnyToken, Contracts, EncodingApi, ImmutableXConfiguration, MintsApi,
} from '@imtbl/x-client';
import { BigNumber } from '@ethersproject/bignumber';
import { ProviderConfiguration } from '../../config';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';

async function getWithdrawalBalance(
  signer: Signer,
  ownerKey: string,
  assetId: string,
  config: ImmutableXConfiguration,
) {
  const coreContract = Contracts.CoreV4.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );
  return coreContract.getWithdrawalBalance(ownerKey, assetId);
}

async function getETHWithdrawalBalance(
  signer: Signer,
  ownerKey: string,
  config: ImmutableXConfiguration,
): Promise<BigNumber> {
  const assetType = await getEncodeAssetInfo('asset', 'ETH', config);
  return await getWithdrawalBalance(
    signer,
    ownerKey,
    assetType.asset_id,
    config,
  );
}

async function getERC20WithdrawalBalance(
  signer: Signer,
  ownerKey: string,
  tokenAddress: string,
  config: ImmutableXConfiguration,
): Promise<BigNumber> {
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', config, {
    token_address: tokenAddress,
  });
  return await getWithdrawalBalance(
    signer,
    ownerKey,
    assetType.asset_id,
    config,
  );
}

// async function getERC721WithdrawalBalance(
//   signer: Signer,
//   ownerKey: string,
//   token: ERC721Token,
//   encodingApi: EncodingApi,
//   mintsApi: MintsApi,
//   config: ImmutableXConfiguration,
// ): Promise<BigNumber> {
//   const tokenAddress = token.tokenAddress;
//   const tokenId = token.tokenId;
//   return await mintsApi
//     .getMintableTokenDetailsByClientTokenId({
//       tokenAddress,
//       tokenId,
//     })
//     .then(async mintableToken => {
//       const assetType = await getEncodeAssetInfo(
//         'mintable-asset',
//         'ERC721',
//         encodingApi,
//         {
//           id: tokenId,
//           token_address: tokenAddress,
//           ...(mintableToken.data.blueprint && {
//             blueprint: mintableToken.data.blueprint,
//           }),
//         },
//       );
//       return await getWithdrawalBalance(
//         signer,
//         ownerKey,
//         assetType.asset_id,
//         config,
//       );
//     })
//     .catch(async error => {
//       if (error.response?.status === 404) {
//         // token is not a mintable ERC721 token
//         const assetType = await getEncodeAssetInfo(
//           'asset',
//           'ERC721',
//           encodingApi,
//           {
//             token_id: token.tokenId,
//             token_address: token.tokenAddress,
//           },
//         );
//         return await getWithdrawalBalance(
//           signer,
//           ownerKey,
//           assetType.asset_id,
//           config,
//         );
//       }
//       throw error; // unable to recover from any other kind of error
//     });
// }

export async function getWithdrawalBalanceWorkflow(
  signer: Signer,
  ownerKey: string,
  token: AnyToken,
  encodingApi: EncodingApi,
  mintsApi: MintsApi,
  config: ImmutableXConfiguration,
): Promise<BigNumber> {
  switch (token.type) {
    case 'ETH':
      return await getETHWithdrawalBalance(
        signer,
        ownerKey,
        config,
      );
    case 'ERC20':
      return await getERC20WithdrawalBalance(
        signer,
        ownerKey,
        token.tokenAddress,
        config,
      );
      // case 'ERC721':
      //   return await getERC721WithdrawalBalance(
      //     signer,
      //     ownerKey,
      //     token,
      //     encodingApi,
      //     mintsApi,
      //     config,
      //   );
    default:
      throw new Error('Unsupported token type');
  }
}

export async function getWithdrawalBalances(
  signer: Signer,
  starkPublicKey: string,
  ethAddress: string,
  token: AnyToken,
  config: ProviderConfiguration,
): Promise<{ v3Balance: BigNumber; v4Balance: BigNumber }> {
  const encodingApi = new EncodingApi(config.immutableXConfig.apiConfiguration);
  const mintsApi = new MintsApi(config.immutableXConfig.apiConfiguration);

  const v3Balance = await getWithdrawalBalanceWorkflow(
    signer,
    starkPublicKey,
    token,
    encodingApi,
    mintsApi,
    config.immutableXConfig,
  );
  const v4Balance = await getWithdrawalBalanceWorkflow(
    signer,
    ethAddress,
    token,
    encodingApi,
    mintsApi,
    config.immutableXConfig,
  );
  return {
    v3Balance,
    v4Balance,
  };
}
