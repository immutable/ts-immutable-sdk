import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ERC20Amount,
  TokensApi,
  UsersApi,
} from '@imtbl/core-sdk';
import { EthSigner } from 'types';
import { Configuration } from '@imtbl/config';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { validateChain } from '../helpers';
import { EthConfiguration } from '@imtbl/core-sdk';
import { Signers } from '../types';

interface ERC20TokenData {
  decimals: number;
  token_address: string;
}

type DepositERC20Params = {
  signers: Signers;
  deposit: ERC20Amount;
  config: Configuration;
};

export async function depositERC20({
  signers: { ethSigner },
  deposit,
  config,
}: DepositERC20Params): Promise<TransactionResponse> {
  await validateChain(ethSigner, config.getStarkExConfig());

  const { apiConfiguration, ethConfiguration } = config.getStarkExConfig();
  const user = await ethSigner.getAddress();
  const tokensApi = new TokensApi(apiConfiguration);
  const depositsApi = new DepositsApi(apiConfiguration);
  const encodingApi = new EncodingApi(apiConfiguration);
  const usersApi = new UsersApi(apiConfiguration);

  // Get decimals for this specific ERC20
  const token = await tokensApi.getToken({ address: deposit.tokenAddress });
  const decimals = parseInt(token.data.decimals);

  const data: ERC20TokenData = {
    decimals,
    token_address: deposit.tokenAddress,
  };

  const amount = parseUnits(deposit.amount, 0); // 0 to always use undecimalized value

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = Contracts.IERC20.connect(
    deposit.tokenAddress,
    ethSigner
  );
  const approveTransaction = await tokenContract.populateTransaction.approve(
    ethConfiguration.coreContractAddress,
    amount
  );
  await ethSigner.sendTransaction(approveTransaction);

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
    assetType: 'asset',
    encodeAssetRequest: {
      token: {
        type: deposit.type,
        data: {
          token_address: deposit.tokenAddress,
        },
      },
    },
  });

  const assetType = encodingResult.data.asset_type;
  const starkPublicKey = signableDepositResult.data.stark_key;
  const vaultId = signableDepositResult.data.vault_id;
  const quantizedAmount = BigNumber.from(signableDepositResult.data.amount);

  const isRegistered = await isRegisteredOnChain(
    starkPublicKey,
    ethSigner,
    config
  );

  if (!isRegistered) {
    return executeRegisterAndDepositERC20(
      ethSigner,
      quantizedAmount,
      assetType,
      starkPublicKey,
      vaultId,
      ethConfiguration,
      usersApi
    );
  } else {
    return executeDepositERC20(
      ethSigner,
      quantizedAmount,
      assetType,
      starkPublicKey,
      vaultId,
      ethConfiguration
    );
  }
}

async function executeDepositERC20(
  ethSigner: EthSigner,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: EthConfiguration
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.coreContractAddress,
    ethSigner
  );

  const populatedTransaction =
    await coreContract.populateTransaction.depositERC20(
      starkPublicKey,
      assetType,
      vaultId,
      quantizedAmount
    );

  return ethSigner.sendTransaction(populatedTransaction);
}

async function executeRegisterAndDepositERC20(
  ethSigner: EthSigner,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: EthConfiguration,
  usersApi: UsersApi
): Promise<TransactionResponse> {
  const etherKey = await ethSigner.getAddress();
  const coreContract = Contracts.Core.connect(
    config.coreContractAddress,
    ethSigner
  );
  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi
  );

  const populatedTransaction =
    await coreContract.populateTransaction.registerAndDepositERC20(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      vaultId,
      quantizedAmount
    );

  return ethSigner.sendTransaction(populatedTransaction);
}
