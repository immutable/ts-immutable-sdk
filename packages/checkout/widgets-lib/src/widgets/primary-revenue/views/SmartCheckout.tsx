/* eslint-disable no-unused-vars */

import {
  Body, Box, Button, Heading,
} from '@biom3/react';

import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { text } from '../../../resources/text/textConfig';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenuWidgetEvents';

export function SmartCheckout() {
  const { options } = text.views[PrimaryRevenueWidgetViews.SMART_CHECKOUT];

  return (
    <SimpleLayout
      testId="payment-methods"
      header={<HeaderNavigation onCloseButtonClick={() => sendPrimaryRevenueWidgetCloseEvent()} />}
      footer={<FooterLogo />}
    >

      <Box
        id="payment-methods-content"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Heading size="small">
          Pay with your ETH coins
        </Heading>
        <Body size="small">
          We’ll swap ETH for USDC to fund this purchase
          <br />
          Estimated fees:  USD $0.10
        </Body>
        <Button variant="primary">
          {options.continue.text}
        </Button>
        <Button variant="tertiary">
          {options.payWithCard.text}
        </Button>
      </Box>
    </SimpleLayout>
  );
}
