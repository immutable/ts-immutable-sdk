import { Button, OptionKey } from '@biom3/react';
import { Checkout, GetBalanceResult } from '@imtbl/checkout-sdk';
import { Web3Provider, TransactionResponse } from '@ethersproject/providers';
import { utils } from 'ethers';
import { BridgeWidgetViews } from '../BridgeWidget';
import { Environment } from '@imtbl/config';

interface BridgeButtonProps {
  provider?: Web3Provider;
  amount?: string;
  balance?: GetBalanceResult;
  fromNetwork?: OptionKey;
  updateTransactionResponse: (transactionResponse: TransactionResponse) => void;
  updateView: (view: BridgeWidgetViews, err?: any) => void;
}

export const BridgeButton = (props: BridgeButtonProps) => {
  const {
    provider,
    amount,
    balance,
    fromNetwork,
    updateTransactionResponse,
    updateView,
  } = props;

  const isDisabled = (): boolean => {
    if (!amount || !balance || !fromNetwork || isNaN(Number(amount)))
      return true;

    const bnAmount = utils.parseUnits(amount, balance?.token.decimals);
    if (bnAmount.lte(0)) return true;
    if (bnAmount.gt(balance.balance)) return true;

    return false;
  };

  const getUnsignedTransaction = () => {
    // get the bridge transaction
    // Bridge.getBridgeTx(...)

    return {
      nonce: '0x00', // ignored by MetaMask
      gasPrice: '0x000', // customizable by user during MetaMask confirmation.
      gas: '0x000', // customizable by user during MetaMask confirmation.
      to: '', // To address.
      from: '', // User's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: '0x000', // Optional, but used for defining smart contract creation and interaction.
      chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };
  };

  const submitBridge = async () => {
    if (!provider) return;

    // get unsigned transaction from the bridge/exchange sdk
    const transaction = getUnsignedTransaction();

    // TODO: Refactor this checkout object into context and stop hardcoding to production
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    try {
      const response = await checkout.sendTransaction({
        provider,
        transaction,
      });
      updateTransactionResponse(response.transactionResponse);
      updateView(BridgeWidgetViews.SUCCESS);
    } catch (err: any) {
      updateView(BridgeWidgetViews.FAIL, err);
    }
  };

  return (
    <Button
      testId="bridge-button"
      disabled={isDisabled()}
      variant={isDisabled() ? 'tertiary' : 'primary'}
      onClick={submitBridge}
    >
      Bridge
    </Button>
  );
};
