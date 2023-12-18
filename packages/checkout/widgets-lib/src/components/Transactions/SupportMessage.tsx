import { Body, Box, Link } from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { Checkout } from '@imtbl/checkout-sdk';
import { PASSPORT_URL } from 'lib';
import { useState, useEffect } from 'react';
import { supportMessageBoxStyle, bodyStyle } from './SupportMessageStyles';

type SupportMessageProps = {
  checkout: Checkout,
  isPassport: boolean,
};

export function SupportMessage({
  checkout,
  isPassport,
}: SupportMessageProps) {
  const {
    support: {
      body1,
      body2,
      body3,
      supportLink,
      passport,
    },
  } = text.views[BridgeWidgetViews.TRANSACTIONS];

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
            {body1}
          </Body>
          <Body
            size="small"
            sx={bodyStyle}
          >
            {body2}
            <Link
              size="small"
              rc={<a target="_blank" href={supportLink} rel="noreferrer" />}
            >
              {body3}
            </Link>
          </Body>
        </Box>
        {isPassport && (
          <Body
            size="small"
            sx={bodyStyle}
          >
            {passport.body1}
            {' '}
            <Link
              size="small"
              rc={<a target="_blank" href={passportLink} rel="noreferrer" />}
            >
              {passport.body2}
            </Link>
          </Body>
        )}
      </Box>
    </Box>
  );
}
