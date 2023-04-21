import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as wallet from './wallet';
import { getNetworkInfo, switchWalletNetwork } from './network';
import * as transaction from './transaction';
import { Web3Provider } from '@ethersproject/providers';
import {
  CheckConnectionParams,
  CheckConnectionResult,
  ConnectParams,
  ConnectResult,
  GetAllBalancesParams,
  GetAllBalancesResult,
  GetBalanceParams,
  GetBalanceResult,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  NetworkInfo,
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { withCheckoutError, CheckoutErrorType, CheckoutError } from './errors';

export class Checkout {
  public async checkIsWalletConnected(
    params: CheckConnectionParams
  ): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(params.providerPreference);
  }

  public async connect(params: ConnectParams): Promise<ConnectResult> {
    const provider = await connect.connectWalletProvider(params);
    const network = await getNetworkInfo(provider);

    return {
      provider,
      network,
    };
  }

  public async switchNetwork(
    params: SwitchNetworkParams
  ): Promise<SwitchNetworkResult> {
    return await switchWalletNetwork(params.provider, params.chainId);
  }

  public async getBalance(params: GetBalanceParams): Promise<GetBalanceResult> {
    if (!params.contractAddress || params.contractAddress === '') {
      return await balances.getBalance(params.provider, params.walletAddress);
    }
    return await balances.getERC20Balance(
      params.provider,
      params.walletAddress,
      params.contractAddress
    );
  }

  public async getAllBalances(
    params: GetAllBalancesParams
  ): Promise<GetAllBalancesResult> {
    return balances.getAllBalances(
      params.provider,
      params.walletAddress,
      params.chainId
    );
  }

  public async getTokenAllowList(
    params: GetTokenAllowListParams
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(params);
  }

  public async getWalletsAllowList(
    params: GetWalletAllowListParams
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  public async sendTransaction(
    params: SendTransactionParams
  ): Promise<SendTransactionResult> {
    return await transaction.sendTransaction(params);
  }

  public async getNetworkInfo(provider: Web3Provider): Promise<NetworkInfo> {
    return await getNetworkInfo(provider);
  }
}
