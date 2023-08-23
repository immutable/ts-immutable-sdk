/* eslint-disable no-unused-vars */

import { Body, Box } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PaymentOptions } from '../components/PaymentOptions';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

export function PaymentMethods() {
  const { header } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];

  return (
    <SimpleLayout
      testId="payment-methods"
      header={
        <HeaderNavigation title={header.heading} onCloseButtonClick={() => {}} />
      }
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          rowGap: 'base.spacing.x9',
        }}
      >
        <Body
          size="small"
          sx={{
            color: 'base.color.text.secondary',
            paddingX: 'base.spacing.x2',
          }}
        >
          {header.caption}
        </Body>
        <PaymentOptions />
      </Box>
    </SimpleLayout>
  );
}
