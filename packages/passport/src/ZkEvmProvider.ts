import { RpcRelayer } from '@0xsequence/relayer';
import { Wallet } from '@0xsequence/wallet';
import ethers from 'ethers';
import ConfirmationScreen from './confirmation/confirmation';
import { User } from './types';

interface Payload {
  method: string;
  params: any[];
  jsonrpc: string;
  id: number;
}

export class ZkEvmProvider {
  private readonly sequenceRelayerUrl: string;

  private readonly provider: ethers.providers.ExternalProvider;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly user: User;

  constructor(
    sequenceRelayerUrl: string,
    provider: ethers.providers.ExternalProvider,
    confirmationScreen: ConfirmationScreen,
    user: User,
  ) {
    this.sequenceRelayerUrl = sequenceRelayerUrl;
    this.provider = provider;
    this.confirmationScreen = confirmationScreen;
    this.user = user;
  }

  public async sendAsync(payload: Payload, callback: (error: Error | null, result?: any) => void) {
    if (payload.method === 'eth_sendTransaction') {
      try {
        // @ts-ignore
        const confirmationResult = await this.confirmationScreen.startzkEvmTransaction(
          this.user.accessToken,
          // TODO: Should this be the transaction?
          // TODO: Or the MetaTransaction (e.g what gets sent to relayer)?
          payload.params[0],
        );

        if (confirmationResult.confirmed) {
          const relayedTx = await this.relayTransaction(payload.params[0]);
          callback(null, relayedTx);
        } else {
          callback(new Error('User rejected transaction'));
        }
      } catch (error) {
        if (error instanceof Error) {
          callback(error);
        }
      }
    } else if (this.provider.sendAsync) {
      this.provider.sendAsync(payload, callback);
    }
  }

  private async relayTransaction(transaction: any): Promise<any> {
    const web3Provider = new ethers.providers.Web3Provider(this.provider);
    const relayer = new RpcRelayer({
      url: this.sequenceRelayerUrl,
      provider: web3Provider,
    });

    const wallet = (
      await Wallet.singleOwner(web3Provider.getSigner())
    ).connect(web3Provider, relayer);

    const [config, context] = await Promise.all([
      wallet.getWalletConfig(),
      wallet.getWalletContext(),
    ]);
    const { options, quote } = await relayer.getFeeOptions(
      config[0],
      context,
      transaction,
    );

    const feeTransaction = {
      to: options[0].to,
      value: options[0].value,
      gasLimit: options[0].gasLimit,
      revertOnError: true,
    };

    const transactionResponse = await wallet.sendTransaction(
      [transaction, feeTransaction],
      undefined,
      undefined,
      quote,
    );

    return transactionResponse.wait();
  }
}
