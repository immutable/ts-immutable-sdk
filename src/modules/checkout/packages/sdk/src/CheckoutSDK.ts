import * as balances from "./balances";
import { connectWalletProvider, getNetworkInfo } from "./connect";
import { 
  ConnectParams,
  ConnectResult,
  GetBalanceParams, 
  GetBalanceResult, 
  SwitchNetworkParams } from "./types";
import {switchWalletNetwork} from './network'

export class CheckoutSDK {

  public async connect(params: ConnectParams): Promise<ConnectResult> {
    const provider = await connectWalletProvider(params);
    const network = await getNetworkInfo(provider);

    return {
      provider,
      network
    } as ConnectResult;
  }

  public async switchNetwork(params: SwitchNetworkParams): Promise<void> {
    await switchWalletNetwork(params.provider, params.chainId);
  }

  public async getBalance(params: GetBalanceParams): Promise<GetBalanceResult> {
    return await balances.getBalance(params.provider, params.walletAddress, params.contractAddress);
  }
}
