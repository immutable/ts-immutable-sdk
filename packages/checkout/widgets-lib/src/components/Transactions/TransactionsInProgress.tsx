import {
  Box, Divider,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { ChainSlug, Checkout } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { AXELAR_SCAN_URL } from 'lib';
import { Transaction } from 'lib/clients';
import { getChainIdBySlug } from 'lib/chains';
import { ethers } from 'ethers';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat } from 'lib/utils';
import { TransactionItem } from './TransactionItem';
import { containerStyles } from './transactionItemStyles';
import { KnownNetworkMap } from './transactionsType';

type TransactionsInProgressProps = {
  checkout: Checkout,
  transactions: Transaction[],
  knownTokenMap: KnownNetworkMap
};

export function TransactionsInProgress({
  checkout,
  transactions,
  knownTokenMap,
}: TransactionsInProgressProps) {
  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const {
    status: {
      inProgress: { stepInfo, heading },
    },
    fiatPricePrefix,
  } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [link, setLink] = useState('');

  useEffect(() => {
    if (!checkout) return;
    setLink(AXELAR_SCAN_URL[checkout.config.environment]);
  }, [checkout]);

  return (
    <>
      <Divider size="xSmall">{heading}</Divider>
      <Box sx={containerStyles}>
        {transactions.map((t) => {
          const tokens = knownTokenMap[t.details.from_chain];
          if (!tokens) return <Box />;

          const token = tokens[t.details.from_token_address.toLowerCase()];
          if (!token) return <Box />;

          const amount = ethers.utils.formatUnits(t.details.amount, token.decimals);
          const fiat = calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);

          const hash = t.blockchain_metadata.transaction_hash;
          return (
            <TransactionItem
              key={hash}
              label={token.name}
              details={{ text: stepInfo, link, hash }}
              fiatAmount={`${fiatPricePrefix}${fiat}`}
              amount={amount}
              fromChain={getChainIdBySlug(t.details.from_chain as ChainSlug)}
              toChain={getChainIdBySlug(t.details.to_chain as ChainSlug)}
            />
          );
        })}
      </Box>
    </>
  );
}
