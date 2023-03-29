import * as balances from './balances';
import * as tokens from './tokens';
import * as connect from './connect';
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
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { switchWalletNetwork } from './network';

export class Checkout {

  public async checkIsWalletConnected(params: CheckConnectionParams): Promise<CheckConnectionResult> {
    return connect.checkIsWalletConnected(params.providerPreference);
  }
  
  public async connect(params: ConnectParams): Promise<ConnectResult> {
    const provider = await connect.connectWalletProvider(params);
    const network = await connect.getNetworkInfo(provider);

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

  public async getAllBalances(params: GetAllBalancesParams): Promise<GetAllBalancesResult> {
    return balances.getAllBalances(
        params.provider,
        params.walletAddress,
        params.chainId
      );
  }

  public getTokenAllowList(params: GetTokenAllowListParams): GetTokenAllowListResult {
    return tokens.getTokenAllowList(params.chainId);
  }
}
