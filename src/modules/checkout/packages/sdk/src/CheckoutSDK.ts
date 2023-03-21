import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers';
import * as balances from './balances';
import { GetBalanceParams, GetERC20BalanceParams, GetERC20BalanceResult } from './balances/types';
import { connectWalletProvider, ConnectParams } from './connect'
import { SwitchNetworkParams, switchWalletNetwork } from './network';

export class CheckoutSDK {
  public async connect(params: ConnectParams): Promise<Web3Provider> {
    const provider = await connectWalletProvider(params);
    return provider;
  }

  public async switchNetwork(params: SwitchNetworkParams): Promise<void> {
    await switchWalletNetwork(params.provider, params.network);
  }

  public async getBalance(params: GetBalanceParams): Promise<BigNumber> {
    return await balances.getBalance(params.provider, params.walletAddress);
  }

  public async getERC20Balance(params: GetERC20BalanceParams): Promise<GetERC20BalanceResult> {
    return await balances.getERC20Balance(params.provider, params.contractAddress, params.walletAddress);
  }
}
