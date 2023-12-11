import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { ChainId } from '@imtbl/checkout-sdk';
import { TransactionItem } from './TransactionItem';

export function TransactionInProgress() {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <TransactionItem
        label="zkTKN"
        caption={`${inProgress.stepInfo} 10 mins`}
        fiatAmount="USD $12345.12"
        amount="+1835.1234"
        fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
        toChain={ChainId.SEPOLIA}
        l1ToL2
      />
      <TransactionItem
        label="zkTKN"
        caption={`${inProgress.stepInfo} 10 mins`}
        fiatAmount="USD $12345.12"
        amount="+1835.1234"
        fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
        toChain={ChainId.SEPOLIA}
        action={() => {}}
      />
    </>
  );
}
