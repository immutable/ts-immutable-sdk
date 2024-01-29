import {
  Box, Body, Link, Button, EllipsizedText, Divider,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { Checkout } from '@imtbl/checkout-sdk';
import { useState, useEffect } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { PASSPORT_URL } from 'lib';
import {
  noTransactionsBodyStyle, noTransactionsContainerStyle, passportBodyStyle, containerStyles, headingStyles,
} from './noTransactionStyles';

type NoTransactionsProps = {
  checkout: Checkout,
  isPassport: boolean,
  walletAddress: string,
  changeWallet: () => void
};

export function NoTransactions(
  {
    checkout,
    isPassport,
    walletAddress,
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
