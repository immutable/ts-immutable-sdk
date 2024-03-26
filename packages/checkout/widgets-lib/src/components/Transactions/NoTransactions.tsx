import {
  Box, Body, Link,
} from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { useState, useEffect } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { PASSPORT_URL } from 'lib';
import { useTranslation } from 'react-i18next';
import {
  noTransactionsBodyStyle, noTransactionsContainerStyle, passportBodyStyle, containerStyles,
} from './noTransactionStyles';
import { ChangeWallet } from './ChangeWallet';

type NoTransactionsProps = {
  checkout: Checkout,
  isPassport: boolean,
  changeWallet: () => void
};

export function NoTransactions(
  {
    checkout,
    isPassport,
    changeWallet,
  }: NoTransactionsProps,
) {
  const { page } = useAnalytics();
  const { t } = useTranslation();
  const [passportLink, setPassportLink] = useState('');

  useEffect(() => {
    if (!checkout) return;
    setPassportLink(PASSPORT_URL[checkout.config.environment]);
  }, [checkout]);

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'NoTransactions',
    });
  }, []);

  return (
    <Box sx={containerStyles}>
      <ChangeWallet onChangeWalletClick={changeWallet} />
      <Box sx={noTransactionsContainerStyle}>
        <Body
          size="small"
          sx={noTransactionsBodyStyle}
        >
          {t('views.TRANSACTIONS.status.noTransactions.body')}
        </Body>
        {isPassport && (
          <Body
            size="small"
            sx={passportBodyStyle}
          >
            {t('views.TRANSACTIONS.status.noTransactions.passport.body')}
            {' '}
            <Link
              size="small"
              rc={<a target="_blank" href={passportLink} rel="noreferrer" />}
            >
              {t('views.TRANSACTIONS.status.noTransactions.passport.link')}
            </Link>
          </Body>
        )}
      </Box>
    </Box>
  );
}
