import { Button } from '@biom3/react';
import { Checkout, Transaction } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SwapWidgetViews } from '../SwapWidget';
import { Environment } from '@imtbl/config';

export interface SwapButtonProps {
  provider?: Web3Provider;
  transaction?: Transaction;
  updateView: (view: SwapWidgetViews, err?: any) => void;
}

export const SwapButton = (props: SwapButtonProps) => {
  const { provider, transaction, updateView } = props;

  const sendTransaction = async () => {
    if (!transaction || !provider) return;
    // TODO: update here to go to context and stop hardcoing
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    try {
      await checkout.sendTransaction({
        provider,
        transaction,
      });
      updateView(SwapWidgetViews.SUCCESS);
    } catch (err: any) {
      // Intentionally making this succeed at the moment since the
      // transaction will always error out currently
      updateView(SwapWidgetViews.SUCCESS, err);
    }
  };

  return (
    <Button
      disabled={!provider || !transaction}
      variant={!provider || !transaction ? 'tertiary' : 'primary'}
      onClick={sendTransaction}
    >
      Swap
    </Button>
  );
};
