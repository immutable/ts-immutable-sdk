import {
  Box,
} from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { formatUnits } from 'ethers';
import { AXELAR_SCAN_URL } from '../../lib';
import { Transaction, TransactionStatus } from '../../lib/clients';
import { CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, getTokenImageByAddress, isNativeToken } from '../../lib/utils';
import { TransactionItem } from './TransactionItem';
import { KnownNetworkMap } from './transactionsType';
import { containerStyles, transactionsListStyle } from './TransactionListStyles';
import { TransactionItemWithdrawPending } from './TransactionItemWithdrawPending';
import { ChangeWallet } from './ChangeWallet';
import { getNativeSymbolByChainSlug } from '../../lib/chains';

type TransactionListProps = {
  checkout: Checkout,
  transactions: Transaction[],
  knownTokenMap: KnownNetworkMap,
  isPassport: boolean;
  defaultTokenImage: string;
  changeWallet: () => void,
};

export function TransactionList({
  checkout,
  transactions,
  knownTokenMap,
  isPassport,
  defaultTokenImage,
  changeWallet,
}: TransactionListProps) {
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const { t } = useTranslation();
  const [link, setLink] = useState('');
  const { environment } = checkout.config;

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

  const getTransactionItemIcon = useCallback((transaction) => {
    if (isNativeToken(transaction.details.from_token_address)) {
      // Map transaction chain slug to native symbol icon asset
      return getTokenImageByAddress(
        checkout.config.environment,
        getNativeSymbolByChainSlug(transaction.details.from_chain),
      );
    }
    return getTokenImageByAddress(checkout.config.environment, transaction.details.from_token_address);
  }, [checkout]);

  return (
    <Box sx={transactionsListStyle(isPassport)}>
      <ChangeWallet onChangeWalletClick={changeWallet} />
      <Box
        testId="move-transaction-list"
        sx={containerStyles}
      >
        {transactions
          .sort(sortWithdrawalPendingFirst)
          .map((transaction) => {
            const hash = transaction.blockchain_metadata.transaction_hash;
            const tokens = knownTokenMap[transaction.details.from_chain];
            const token = tokens[transaction.details.from_token_address.toLowerCase()];
            const amount = formatUnits(transaction.details.amount, token.decimals);
            const fiat = calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);

            if (transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING) {
              return (
                <TransactionItemWithdrawPending
                  key={hash}
                  label={token.symbol}
                  transaction={transaction}
                  fiatAmount={`${t('views.TRANSACTIONS.fiatPricePrefix')}${fiat}`}
                  amount={amount}
                  icon={getTransactionItemIcon(transaction)}
                  defaultTokenImage={defaultTokenImage}
                  environment={environment}
                />
              );
            }

            return (
              <TransactionItem
                key={hash}
                label={token.symbol}
                details={{ text: t('views.TRANSACTIONS.status.inProgress.stepInfo'), link, hash }}
                transaction={transaction}
                fiatAmount={`${t('views.TRANSACTIONS.fiatPricePrefix')}${fiat}`}
                amount={amount}
                icon={getTransactionItemIcon(transaction)}
                defaultTokenImage={defaultTokenImage}
                environment={environment}
              />
            );
          })}
      </Box>
    </Box>
  );
}
