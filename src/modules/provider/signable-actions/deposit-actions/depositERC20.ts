import {
  Contracts,
  DepositsApi,
  EncodingApi,
  ERC20Amount,
  EthSigner,
  ImmutableXConfiguration,
  TokensApi,
  UsersApi,
} from '@imtbl/core-sdk';
import { Configuration } from 'src/config';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { validateChain } from '../helpers';

interface ERC20TokenData {
  decimals: number;
  token_address: string;
}

export async function depositERC20(
  signer: EthSigner,
  deposit: ERC20Amount,
  config: Configuration,
): Promise<TransactionResponse> {
  await validateChain(signer, config.getStarkExConfig());

  const user = await signer.getAddress();
  const starkExConfig = config.getStarkExConfig();
  const tokensApi = new TokensApi(starkExConfig.apiConfiguration);
  const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
  const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
  const usersApi = new UsersApi(starkExConfig.apiConfiguration);

  // Get decimals for this specific ERC20
  const token = await tokensApi.getToken({ address: deposit.tokenAddress });
  const decimals = parseInt(token.data.decimals);

  const data: ERC20TokenData = {
    decimals,
    token_address: deposit.tokenAddress,
  };

  const amount = parseUnits(deposit.amount, 0); // 0 to always use undecimalized value

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = Contracts.IERC20.connect(deposit.tokenAddress, signer);
  const approveTransaction = await tokenContract.populateTransaction.approve(
    starkExConfig.ethConfiguration.coreContractAddress,
    amount,
  );
  await signer.sendTransaction(approveTransaction);

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
    signer,
    config,
  );

  if (!isRegistered) {
    return executeRegisterAndDepositERC20(
      signer,
      quantizedAmount,
      assetType,
      starkPublicKey,
      vaultId,
      starkExConfig,
      usersApi,
    );
  }
  return executeDepositERC20(
    signer,
    quantizedAmount,
    assetType,
    starkPublicKey,
    vaultId,
    starkExConfig,
  );
}

async function executeDepositERC20(
  signer: EthSigner,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  config: ImmutableXConfiguration,
): Promise<TransactionResponse> {
  const coreContract = Contracts.Core.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const populatedTransaction = await coreContract.populateTransaction.depositERC20(
    starkPublicKey,
    assetType,
    vaultId,
    quantizedAmount,
  );

  return signer.sendTransaction(populatedTransaction);
}

async function executeRegisterAndDepositERC20(
  signer: EthSigner,
  quantizedAmount: BigNumber,
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

  const populatedTransaction = await coreContract.populateTransaction.registerAndDepositERC20(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature,
    assetType,
    vaultId,
    quantizedAmount,
  );

  return signer.sendTransaction(populatedTransaction);
}
