import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import * as wallet from './wallet';
import * as network from './network';
import * as transaction from './transaction';
import { Web3Provider } from '@ethersproject/providers';
import {
  CheckConnectionParams,
  CheckConnectionResult,
  ConnectionProviders,
  ConnectParams,
  ConnectResult,
  GetAllBalancesParams,
  GetAllBalancesResult,
  GetBalanceParams,
  GetBalanceResult,
  GetNetworkAllowListParams,
  GetNetworkAllowListResult,
  GetNetworkParams,
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
import { CheckoutError, CheckoutErrorType } from './errors';

export class Checkout {
  private providerPreference: ConnectionProviders | undefined;

  public async checkIsWalletConnected(
    params: CheckConnectionParams
  ): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(params.providerPreference);
  }

  public async connect(params: ConnectParams): Promise<ConnectResult> {
    this.providerPreference = params.providerPreference;
    const provider = await connect.connectWalletProvider(params);
    const networkInfo = await network.getNetworkInfo(provider);

    return {
      provider,
      network: networkInfo,
    };
  }

  public async switchNetwork(
    params: SwitchNetworkParams
  ): Promise<SwitchNetworkResult> {
    if (!this.providerPreference) {
      throw new CheckoutError(
        `connect should be called before switchNetwork to set the provider preference`,
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR
      );
    }

    return await network.switchWalletNetwork(
      this.providerPreference,
      params.provider,
      params.chainId
    );
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

  public async getNetworkAllowList(
    params: GetNetworkAllowListParams
  ): Promise<GetNetworkAllowListResult> {
    return await network.getNetworkAllowList(params);
  }

  public async getTokenAllowList(
    params: GetTokenAllowListParams
  ): Promise<GetTokenAllowListResult> {
    return await tokens.getTokenAllowList(params);
  }

  public async getWalletAllowList(
    params: GetWalletAllowListParams
  ): Promise<GetWalletAllowListResult> {
    return await wallet.getWalletAllowList(params);
  }

  public async sendTransaction(
    params: SendTransactionParams
  ): Promise<SendTransactionResult> {
    return await transaction.sendTransaction(params);
  }

  public async getNetworkInfo(params: GetNetworkParams): Promise<NetworkInfo> {
    return await network.getNetworkInfo(params.provider);
  }
}
