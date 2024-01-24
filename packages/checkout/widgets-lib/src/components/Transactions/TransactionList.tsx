import {
  Box,
  EllipsizedText,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext, useEffect, useState,
} from 'react';
import { AXELAR_SCAN_URL } from 'lib';
import { Transaction, TransactionStatus } from 'lib/clients';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat } from 'lib/utils';
import { formatUnits } from 'ethers/lib/utils';
import { TransactionItem } from './TransactionItem';
import { KnownNetworkMap } from './transactionsType';
import { containerStyles, headingStyles, transactionsListStyle } from './TransactionListStyles';
import { TransactionItemWithdrawPending } from './TransactionItemWithdrawPending';

type TransactionListProps = {
  checkout: Checkout,
  transactions: Transaction[],
  knownTokenMap: KnownNetworkMap,
  isPassport: boolean;
};

export function TransactionList({
  checkout,
  transactions,
  knownTokenMap,
  isPassport,
}: TransactionListProps) {
  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const {
    status: {
      inProgress: { stepInfo }, // , heading, txnEstimate
    },
    fiatPricePrefix,
  } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [link, setLink] = useState('');

  useEffect(() => {
    if (!checkout) return;
    setLink(AXELAR_SCAN_URL[checkout.config.environment]);
  }, [checkout]);

  const sortWithdrawalPendingFirst = useCallback((txnA, txnB) => {
    if (
      txnA.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING
      && txnB.details.current_status.status !== TransactionStatus.WITHDRAWAL_PENDING) return -1;
    if (txnA.details.current_status.status === txnB.details.current_status.status) return 0;

    return 1;
  }, []);

  return (
    <Box sx={transactionsListStyle(isPassport)}>
      <Box sx={headingStyles}>
        <EllipsizedText leftSideLength={6} rightSideLength={4} text="0x1234567890" />
      </Box>
      <Box
        testId="move-transaction-list"
        sx={containerStyles}
      >
        {transactions
          .sort(sortWithdrawalPendingFirst)
          .map((t) => {
            const hash = t.blockchain_metadata.transaction_hash;
            const tokens = knownTokenMap[t.details.from_chain];
            if (!tokens) return false;

            const token = tokens[t.details.from_token_address.toLowerCase()];
            if (!token) return false;

            const amount = formatUnits(t.details.amount, token.decimals);
            const fiat = calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);

            if (t.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING) {
              return (
                <TransactionItemWithdrawPending
                  key={hash}
                  label={token.name}
                  transaction={t}
                  // token={token}
                  fiatAmount={`${fiatPricePrefix}${fiat}`}
                  amount={amount}
                />
              );
            }

            return (
              <TransactionItem
                key={hash}
                label={token.name}
                details={{ text: stepInfo, link, hash }}
                transaction={t}
                // token={token}
                fiatAmount={`${fiatPricePrefix}${fiat}`}
                amount={amount}
              />
            );
          })}
      </Box>
    </Box>
  );
}
