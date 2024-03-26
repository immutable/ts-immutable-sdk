import { Body, Box, Link } from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { PASSPORT_URL } from 'lib';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportMessageBoxStyle, bodyStyle } from './SupportMessageStyles';

type SupportMessageProps = {
  checkout: Checkout,
  isPassport: boolean,
};

export function SupportMessage({
  checkout,
  isPassport,
}: SupportMessageProps) {
  const { t } = useTranslation();
  const [passportLink, setPassportLink] = useState('');

  useEffect(() => {
    if (!checkout) return;
    setPassportLink(PASSPORT_URL[checkout.config.environment]);
  }, [checkout]);

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
              rc={<a target="_blank" href={t('views.TRANSACTIONS.support.supportLink')} rel="noreferrer" />}
            >
              {t('views.TRANSACTIONS.support.body3')}
            </Link>
          </Body>
        </Box>
        {isPassport && (
          <Body
            size="small"
            sx={bodyStyle}
          >
            {t('views.TRANSACTIONS.support.passport.body1')}
            {' '}
            <Link
              size="small"
              rc={<a target="_blank" href={passportLink} rel="noreferrer" />}
            >
              {t('views.TRANSACTIONS.support.passport.body2')}
            </Link>
          </Body>
        )}
      </Box>
    </Box>
  );
}
