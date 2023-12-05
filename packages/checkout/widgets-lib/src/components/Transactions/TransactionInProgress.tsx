import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { ChainId } from '@imtbl/checkout-sdk';
import { TransactionItem } from './TransactionItem';

export function TransactionInProgress({ key }: { key: string }) {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  console.log(key);

  return (
    <>
      <TransactionItem
        key={key}
        label="zkTKN"
        caption={`${inProgress.stepInfo} 10 mins`}
        fiatAmount="USD $12345.12"
        amount="+1835.1234"
        fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
        toChain={ChainId.SEPOLIA}
        l1ToL2
      />
      <TransactionItem
        key={key}
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
