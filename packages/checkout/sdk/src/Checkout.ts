import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
import { getNetworkInfo, switchWalletNetwork } from './network';
import * as transaction from './transaction';
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
  SendTransactionParams,
  SendTransactionResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';

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

  public getTokenAllowList(
    params: GetTokenAllowListParams
  ): GetTokenAllowListResult {
    return tokens.getTokenAllowList(params);
  }

  public async sendTransaction(
    params: SendTransactionParams
  ): Promise<SendTransactionResult> {
    return await transaction.sendTransaction(params);
  }
}
