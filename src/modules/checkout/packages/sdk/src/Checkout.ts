import * as balances from './balances';
import * as tokens from './tokens';
import { connectWalletProvider, getNetworkInfo } from './connect';
import {
  ConnectParams,
  ConnectResult,
  GetBalanceParams,
  GetBalanceResult,
  SwitchNetworkParams,
  SwitchNetworkResult,
} from './types';
import { switchWalletNetwork } from './network';
import { GetTokenAllowListResult } from './tokens/types';

export class Checkout {
  public async connect(params: ConnectParams): Promise<ConnectResult> {
    const provider = await connectWalletProvider(params);
    const network = await getNetworkInfo(provider);

    return {
      provider,
      network,
    } as ConnectResult;
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

  public getTokenAllowList(): GetTokenAllowListResult {
    return tokens.getTokenAllowList();
  }
}
