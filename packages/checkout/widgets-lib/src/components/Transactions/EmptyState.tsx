/* eslint-disable @typescript-eslint/no-unused-vars */
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionsActionRequired() {
  const { status: { actionRequired } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      asdf
    </>
  );
}
