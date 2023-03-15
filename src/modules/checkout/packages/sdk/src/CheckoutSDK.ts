import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers';
import { getBalance } from './balances';
import { GetBalanceParams } from './balances/types';
import { connectWalletProvider, ConnectParams } from './connect'
import { SwitchNetworkParams, switchWalletNetwork } from './network';

export class CheckoutSDK {
  public async connect(params: ConnectParams): Promise<Web3Provider> {
    console.log('test hot reload sdk HOT')
    const provider = await connectWalletProvider(params);
    return provider;
  }

  public async switchNetwork(params: SwitchNetworkParams): Promise<void> {
    await switchWalletNetwork(params.provider, params.network);
  }

  public async getBalance(params: GetBalanceParams): Promise<BigNumber> {
    return await getBalance(params.provider, params.walletAddress);
  }
}
