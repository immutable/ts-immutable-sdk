import {
  Box, Divider,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
import { AXELAR_SCAN_URL } from 'lib';
import { TransactionItem } from './TransactionItem';
import { containerStyles } from './transactionItemStyles';

type TransactionsInProgressProps = {
  checkout: Checkout,
};

export function TransactionsInProgress({ checkout }: TransactionsInProgressProps) {
  const { status: { inProgress }, fiatPricePrefix } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [link, setLink] = useState('');

  useEffect(() => {
    if (!checkout) return;
    setLink(AXELAR_SCAN_URL[checkout.config.environment]);
  }, [checkout]);

  return (
    <>
      <Divider size="xSmall">{inProgress.heading}</Divider>
      <Box sx={containerStyles}>
        <TransactionItem
          label="zkTKN"
          details={{
            text: inProgress.stepInfo,
            link,
            hash: '0xd53c37d7575df21f5d6a0f61449ad3fa5d75e400c5ee2bb4fab3245267f648d3',
          }}
          fiatAmount={`${fiatPricePrefix}12345.12`}
          amount="1835.1234"
          fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
          toChain={ChainId.SEPOLIA}
        />
        <TransactionItem
          label="zkTKN"
          details={{
            text: inProgress.stepInfo,
            link,
            hash: '0x812d9ee12e7ef0365181acf4b21be86beb2f72a6f085b3831df01cfa55492150',
          }}
          fiatAmount={`${fiatPricePrefix}12345.12`}
          amount="1835.1234"
          fromChain={ChainId.IMTBL_ZKEVM_TESTNET}
          toChain={ChainId.SEPOLIA}
        />
      </Box>
    </>
  );
}
