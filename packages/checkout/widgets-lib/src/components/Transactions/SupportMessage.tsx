import { Body, Box, Link } from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { PASSPORT_URL } from '../../lib';
import { supportMessageBoxStyle, bodyStyle } from './SupportMessageStyles';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';

type SupportMessageProps = {
  checkout: Checkout,
  isPassport: boolean,
};

function NeedHelpContactSupport() {
  const { t } = useTranslation();
  const { track } = useAnalytics();

  return (
    <Box>
      <Body
        size="small"
      >
        {t('views.TRANSACTIONS.support.body1')}
      </Body>
      <Body
        size="small"
        sx={bodyStyle}
      >
        {t('views.TRANSACTIONS.support.body2')}
        <Link
          size="small"
          rc={(
            <a
              target="_blank"
              onClick={() => track({
                userJourney: UserJourney.BRIDGE,
                screen: 'Transactions',
                control: 'Support',
                controlType: 'Link',
              })}
              href={t('views.TRANSACTIONS.support.supportLink')}
              rel="noreferrer"
            />
          )}
        >
          {t('views.TRANSACTIONS.support.body3')}
        </Link>
      </Body>
    </Box>
  );
}

function LookingForPastTransactions() {
  const { track } = useAnalytics();

  return (
    <Box sx={{ mb: '16px' }}>
      <Body>
        In progress and historical bridge transactions can be found on
        {' '}
        <Link rc={(
          <a
            target="_blank"
            onClick={() => track({
              userJourney: UserJourney.BRIDGE,
              screen: 'Transactions',
              control: 'Axelarscan',
              controlType: 'Link',
            })}
            href="https://axelarscan.io/"
            rel="noreferrer"
          />
        )}
        >
          Axelarscan
        </Link>
        . Search there with the non-Passport wallet address used in the transaction.
      </Body>
    </Box>
  );
}

export function SupportMessage({
  checkout,
  isPassport,
}: SupportMessageProps) {
  const { track } = useAnalytics();
  const { t } = useTranslation();
  const passportLink = PASSPORT_URL[checkout.config.environment];

  return (
    <Box
      sx={supportMessageBoxStyle}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LookingForPastTransactions />
        <NeedHelpContactSupport />
        {isPassport && (
          <Body
            size="small"
            sx={bodyStyle}
          >
            {t('views.TRANSACTIONS.support.passport.body1')}
            {' '}
            <Link
              size="small"
              rc={(
                <a
                  target="_blank"
                  onClick={() => track({
                    userJourney: UserJourney.BRIDGE,
                    screen: 'Transactions',
                    control: 'Passport',
                    controlType: 'Link',
                  })}
                  href={passportLink}
                  rel="noreferrer"
                />
              )}
            >
              {t('views.TRANSACTIONS.support.passport.body2')}
            </Link>
          </Body>
        )}
      </Box>
    </Box>
  );
}
