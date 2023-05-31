import ethers from 'ethers';
import { RpcRelayer } from '@0xsequence/relayer';
import { Transaction } from '@0xsequence/transactions';
import { Wallet } from '@0xsequence/wallet';
import ConfirmationScreen from '../confirmation/confirmation';
import { PassportConfiguration } from '../config';

export const ethSendTransaction = async (
  request: ethers.providers.TransactionRequest,
  magicProvider: ethers.providers.ExternalProvider,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
): Promise<string> => {
  if (!request.to) {
    throw new Error('eth_sendTransaction requires a "to" field');
  }

  const magicWeb3Provider = new ethers.providers.Web3Provider(magicProvider);

  // If smart contract deployed, get nonce from storage, otherwise default to 0
  let nonce = 0;
  // TODO: Pass counterfactual address to determine if SCW has been deployed.
  const storageValue = await magicWeb3Provider.getStorageAt('0x0', 0, 0);
  if (storageValue) {
    nonce = parseInt(storageValue, 10);
  }

  const relayer = new RpcRelayer({
    url: config.relayerUrl,
    provider: magicWeb3Provider,
  });

  const wallet = (
    await Wallet.singleOwner(magicWeb3Provider.getSigner())
  ).connect(magicWeb3Provider, relayer);

  const transaction: Transaction = {
    to: request.to,
    data: request.data,
    nonce, // request.nonce,
    value: request.value,
  };

  const [walletConfig, context] = await Promise.all([
    wallet.getWalletConfig(),
    wallet.getWalletContext(),
  ]);
  const { options, quote } = await relayer.getFeeOptions(
    walletConfig[0],
    context,
    transaction,
  );

  const feeTransaction: Transaction = {
    // TODO: How do we choose a fee option?
    //  Pass all to transaction-confirmation & let user select?
    to: options[0].to,
    value: options[0].value,
    gasLimit: options[0].gasLimit,
    revertOnError: true,
  };

  // @ts-ignore
  const confirmationResult = await confirmationScreen.startzkEvmTransaction(
    // TODO: What should the format of this be?
    //  Likely need to pass transaction & feeTransaction
    transaction,
    feeTransaction,
  );

  if (!confirmationResult.confirmed) {
    return Promise.reject(new Error('User rejected transaction'));
  }

  const transactionResponse = await wallet.sendTransaction(
    [transaction, feeTransaction],
    config.zkEvmChainId,
    undefined,
    quote,
  );

  const transactionReceipt = await transactionResponse.wait();
  return transactionReceipt.transactionHash;
};
