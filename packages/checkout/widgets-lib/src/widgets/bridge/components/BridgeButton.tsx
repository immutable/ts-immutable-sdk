import { Button } from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { useContext } from 'react';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeContext } from '../context/BridgeContext';
import { BridgeFormContext } from '../context/BridgeFormContext';

interface BridgeButtonProps {
  updateTransactionResponse: (transactionResponse: TransactionResponse) => void;
}

export function BridgeButton(props: BridgeButtonProps) {
  const {
    updateTransactionResponse,
  } = props;

  // const { bridgeState } = useContext(BridgeContext);
  const { bridgeFormState: { bridgeFromAmount } } = useContext(BridgeFormContext);
  console.log(bridgeFromAmount);
  const { viewDispatch } = useContext(ViewContext);
  const { bridgeState: { provider } } = useContext(BridgeContext);

  // const isDisabled = (): boolean => {
  //   if (!bridgeFromAmount || !balance || Number.isNaN(Number(bridgeFromAmount))) return true;

  //   const bnAmount = utils.parseUnits(bridgeFromAmount, balance?.token.decimals);
  //   if (bnAmount.lte(0)) return true;
  //   if (bnAmount.gt(balance.balance)) return true;

  //   return false;
  // };

  const getUnsignedTransaction = () => ({
    // get the bridge transaction
    // Bridge.getBridgeTx(...)
    nonce: '0x00', // ignored by MetaMask
    gasPrice: '0x000', // customizable by user during MetaMask confirmation.
    gas: '0x000', // customizable by user during MetaMask confirmation.
    to: '', // To address.
    from: '', // User's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: '0x000', // Optional, but used for defining smart contract creation and interaction.
    chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  });

  const submitBridge = async () => {
    if (!provider) return;

    // get unsigned transaction from the bridge/exchange sdk
    const transaction = getUnsignedTransaction();

    // TODO: Refactor this checkout object into context and stop hardcoding to sandbox
    const checkout = new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    });
    try {
      const response = await checkout.sendTransaction({
        provider,
        transaction,
      });
      updateTransactionResponse(response.transactionResponse);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    } catch (err: any) {
      // TODO: fix this with fail view... always succeeed for now
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    }
  };

  return (
    <Button
      testId="bridge-button"
      variant="primary"
      onClick={submitBridge}
    >
      Bridge
    </Button>
  );
}
