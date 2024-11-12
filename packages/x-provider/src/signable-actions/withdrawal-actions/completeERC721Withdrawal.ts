import {
  Contracts,
  ERC721Token,
  ImmutableXConfiguration,
  MintsApi,
  signRegisterEthAddress,
  StarkSigner,
} from '@imtbl/x-client';
import * as encUtils from 'enc-utils';
import { Signer, TransactionResponse } from 'ethers';
import { ProviderConfiguration } from '../../config';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { isRegisteredOnChain } from '../registration';
import { validateChain } from '../helpers';
import { getWithdrawalBalancesERC721 } from './getWithdrawalBalance';

interface MintableERC721Withdrawal {
  type: 'ERC721';
  data: {
    id: string;
    blueprint?: string;
    tokenAddress: string;
  };
}

type CompleteERC721WithdrawalActionParams = {
  ethSigner: Signer;
  starkSigner: StarkSigner;
  starkPublicKey: string;
  token: ERC721Token;
  config: ProviderConfiguration;
};

const ERC721TokenType = 'ERC721';

function getMintingBlob(token: MintableERC721Withdrawal): string {
  const { id } = token.data;
  const blueprint = token.data.blueprint || '';
  return encUtils.sanitizeHex(encUtils.utf8ToHex(`{${id}}:{${blueprint}}`));
}

async function executeERC721RegisterAndWithdraw(
  ethSigner: Signer,
  starkSigner: StarkSigner,
  token: ERC721Token,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const starkPublicKey = await starkSigner.getAddress();

  const assetType = await getEncodeAssetInfo('asset', ERC721TokenType, config, {
    token_id: token.tokenId,
    token_address: token.tokenAddress,
  });

  const registrationStarkSignature = await signRegisterEthAddress(
    starkSigner,
    etherKey,
    starkPublicKey,
  );

  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.registerAndWithdrawNft.populateTransaction(
    etherKey,
    starkPublicKey,
    registrationStarkSignature,
    assetType.asset_type,
    token.tokenId,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeMintableERC721RegisterAndWithdraw(
  ethSigner: Signer,
  starkSigner: StarkSigner,
  token: MintableERC721Withdrawal,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const starkPublicKey = await starkSigner.getAddress();

  const assetType = await getEncodeAssetInfo(
    'mintable-asset',
    ERC721TokenType,
    config,
    {
      id: token.data.id,
      token_address: token.data.tokenAddress,
      ...(token.data.blueprint && { blueprint: token.data.blueprint }),
    },
  );

  const mintingBlob = getMintingBlob(token);

  const starkSignature = await signRegisterEthAddress(
    starkSigner,
    etherKey,
    starkPublicKey,
  );

  const contract = Contracts.RegistrationV4.connect(
    config.ethConfiguration.registrationV4ContractAddress || config.ethConfiguration.registrationContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.registerWithdrawAndMint.populateTransaction(
    etherKey,
    starkPublicKey,
    starkSignature,
    assetType.asset_type,
    mintingBlob,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function completeERC721RegisterAndWithdrawal(
  mintsApi: MintsApi,
  ethSigner: Signer,
  starkSigner: StarkSigner,
  token: ERC721Token,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  return mintsApi
    .getMintableTokenDetailsByClientTokenId({
      tokenAddress: token.tokenAddress,
      tokenId: token.tokenId,
    })
    .then((mintableToken) => executeMintableERC721RegisterAndWithdraw(ethSigner, starkSigner, {
      type: ERC721TokenType,
      data: {
        id: token.tokenId,
        tokenAddress: token.tokenAddress,
        blueprint: mintableToken.data.blueprint,
      },
    }, config))
    .catch((error) => {
      if (error.response?.status === 404) {
        // token is already minted on L1
        return executeERC721RegisterAndWithdraw(ethSigner, starkSigner, token, config);
      }
      throw error; // unable to recover from any other kind of error
    });
}

async function executeMintableERC721Withdrawal(
  ethSigner: Signer,
  ownerKey: string,
  token: MintableERC721Withdrawal,
  config: ImmutableXConfiguration,
) {
  const assetType = await getEncodeAssetInfo(
    'mintable-asset',
    ERC721TokenType,
    config,
    {
      id: token.data.id,
      token_address: token.data.tokenAddress,
      ...(token.data.blueprint && { blueprint: token.data.blueprint }),
    },
  );

  const mintingBlob = getMintingBlob(token);

  const contract = Contracts.CoreV4.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.withdrawAndMint.populateTransaction(
    ownerKey,
    assetType.asset_type,
    mintingBlob,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeERC721Withdrawal(
  ethSigner: Signer,
  ownerKey: string,
  token: ERC721Token,
  config: ImmutableXConfiguration,
) {
  const assetType = await getEncodeAssetInfo('asset', ERC721TokenType, config, {
    token_id: token.tokenId,
    token_address: token.tokenAddress,
  });

  const contract = Contracts.CoreV4.connect(
    config.ethConfiguration.coreContractAddress,
    ethSigner,
  );

  const populatedTransaction = await contract.withdrawNft.populateTransaction(
    ownerKey,
    assetType.asset_type,
    token.tokenId,
  );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function completeERC721Withdrawal(
  mintsApi: MintsApi,
  ethSigner: Signer,
  ownerKey: string,
  token: ERC721Token,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  return mintsApi
    .getMintableTokenDetailsByClientTokenId({
      tokenAddress: token.tokenAddress,
      tokenId: token.tokenId,
    })
    .then((mintableToken) => executeMintableERC721Withdrawal(
      ethSigner,
      ownerKey,
      {
        type: ERC721TokenType,
        data: {
          id: token.tokenId,
          tokenAddress: token.tokenAddress,
          blueprint: mintableToken.data.blueprint,
        },
      },
      config,
    ))
    .catch((error) => {
      if (error.response?.status === 404) {
        // token is already minted on L1
        return executeERC721Withdrawal(
          ethSigner,
          ownerKey,
          token,
          config,
        );
      }
      throw error; // unable to recover from any other kind of error
    });
}

export async function completeERC721WithdrawalAction({
  ethSigner,
  starkSigner,
  starkPublicKey,
  token,
  config,
}: CompleteERC721WithdrawalActionParams, mintsApi: MintsApi) {
  await validateChain(ethSigner, config.immutableXConfig);
  const ethAddress = await ethSigner.getAddress();
  const {
    v3Balance,
    v4Balance,
  } = await getWithdrawalBalancesERC721(
    ethSigner,
    starkPublicKey,
    ethAddress,
    {
      type: ERC721TokenType,
      tokenAddress: token.tokenAddress,
      tokenId: token.tokenId,
    },
    config.immutableXConfig,
    mintsApi,
  );
  if (v3Balance > 0) {
    const isRegistered = await isRegisteredOnChain(
      starkPublicKey,
      ethSigner,
      config,
    );
    // if the user is already registered on-chain, we can withdraw using stark key as the owner key
    if (isRegistered) {
      return completeERC721Withdrawal(mintsApi, ethSigner, starkPublicKey, token, config.immutableXConfig);
    }
    // if not registered on-chain, we need to register the user on-chain using stark public key as the owner key
    return completeERC721RegisterAndWithdrawal(
      mintsApi,
      ethSigner,
      starkSigner,
      token,
      config.immutableXConfig,
    );
  }

  // if v4 balance is NOT zero, the withdrawal was prepared using eth address (using v2/withdrawals API)
  if (v4Balance > 0) {
    return completeERC721Withdrawal(mintsApi, ethSigner, ethAddress, token, config.immutableXConfig);
  }

  throw new Error('No balance to withdraw');
}
