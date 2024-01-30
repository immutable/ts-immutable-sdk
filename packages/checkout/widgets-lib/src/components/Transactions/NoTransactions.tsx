import {
  Box, Body, Link,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { Checkout } from '@imtbl/checkout-sdk';
import { useState, useEffect } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { PASSPORT_URL } from 'lib';
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

  const {
    status: { noTransactions },
  } = text.views[BridgeWidgetViews.TRANSACTIONS];

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
          {noTransactions.body}

        </Body>
        {isPassport && (
          <Body
            size="small"
            sx={passportBodyStyle}
          >
            {noTransactions.passport.body}
            {' '}
            <Link
              size="small"
              rc={<a target="_blank" href={passportLink} rel="noreferrer" />}
            >
              {noTransactions.passport.link}
            </Link>
          </Body>
        )}
      </Box>
    </Box>
  );
}
