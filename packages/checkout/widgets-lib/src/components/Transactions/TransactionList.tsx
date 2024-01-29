import {
  Box,
  Button,
  Divider,
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
import { useTranslation } from 'react-i18next';
import { TransactionItem } from './TransactionItem';
import { KnownNetworkMap } from './transactionsType';
import { containerStyles, headingStyles, transactionsListStyle } from './TransactionListStyles';
import { TransactionItemWithdrawPending } from './TransactionItemWithdrawPending';

type TransactionListProps = {
  checkout: Checkout,
  transactions: Transaction[],
  knownTokenMap: KnownNetworkMap,
  isPassport: boolean;
  walletAddress: string;
  changeWallet: () => void,
};

export function TransactionList({
  checkout,
  transactions,
  knownTokenMap,
  isPassport,
  walletAddress,
  changeWallet,
}: TransactionListProps) {
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const { t } = useTranslation();

  const {
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
        <EllipsizedText leftSideLength={6} rightSideLength={4} text={walletAddress} />
        <Button size="small" onClick={changeWallet}>Change wallet</Button>
      </Box>
      <Divider
        size="small"
        sx={{
          pb: 'base.spacing.x2',
          color: 'base.color.translucent.emphasis.300',
          opacity: 0.1,
        }}
      />
      <Box
        testId="move-transaction-list"
        sx={containerStyles}
      >
        {transactions
          .sort(sortWithdrawalPendingFirst)
          .map((transaction) => {
            const hash = transaction.blockchain_metadata.transaction_hash;
            const tokens = knownTokenMap[transaction.details.from_chain];
            if (!tokens) return false;

            const token = tokens[transaction.details.from_token_address.toLowerCase()];
            if (!token) return false;

            const amount = formatUnits(transaction.details.amount, token.decimals);
            const fiat = calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);

            if (transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING) {
              return (
                <TransactionItemWithdrawPending
                  key={hash}
                  label={token.name}
                  transaction={transaction}
                  fiatAmount={`${fiatPricePrefix}${fiat}`}
                  amount={amount}
                />
              );
            }

            return (
              <TransactionItem
                key={hash}
                label={token.name}
                details={{ text: t('views.TRANSACTIONS.status.inProgress.stepInfo'), link, hash }}
                transaction={transaction}
                fiatAmount={`${fiatPricePrefix}${fiat}`}
                amount={amount}
              />
            );
          })}
      </Box>
    </Box>
  );
}
