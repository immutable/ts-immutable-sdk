import {
  Box, Divider,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { ChainId } from '@imtbl/checkout-sdk';
import { containerStyles } from './sectionStyles';
import { TransactionItem } from './TransactionItem';

export function TransactionsInProgress() {
  const { status: { inProgress }, fiatPricePrefix } = text.views[BridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <Divider size="xSmall">{inProgress.heading}</Divider>
      <Box sx={containerStyles}>
        <TransactionItem
          label="zkTKN"
          caption={inProgress.stepInfo}
          fiatAmount={`${fiatPricePrefix}12345.12`}
          amount="1835.1234"
          fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
          toChain={ChainId.SEPOLIA}
        />
        <TransactionItem
          label="zkTKN"
          caption={inProgress.stepInfo}
          fiatAmount={`${fiatPricePrefix}12345.12`}
          amount="1835.1234"
          fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
          toChain={ChainId.SEPOLIA}
        />
      </Box>
    </>
  );
}
