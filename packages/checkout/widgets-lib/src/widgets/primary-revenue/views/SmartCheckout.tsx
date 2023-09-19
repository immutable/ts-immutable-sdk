/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Body, Box, Button, Heading, Select, Option,
} from '@biom3/react';

import { useState } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { text } from '../../../resources/text/textConfig';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenuWidgetEvents';
import { SmartCheckoutDrawer } from '../components/SmartCheckoutDrawer/SmartCheckoutDrawer';

export function SmartCheckout() {
  const { options } = text.views[PrimaryRevenueWidgetViews.SMART_CHECKOUT];

  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);

  const mockSmartCheckoutOptions = [
    {
      label: 'ETH coins',
    },
    {
      label: 'GODS coins',
    },
    {
      label: 'ETH L1 coins',
    },
    {
      label: 'USDC L1 coins',
    },
  ];

  const onClickContinue = async () => null;

  const closeBottomSheet = () => {
    setSmartCheckoutDrawerVisible(false);
  };

  const onSmartCheckoutDropdownClick = (event) => {
    // event.stopPropagation();
    // eslint-disable-next-line no-console
    console.log('@@@@@ onSmartCheckoutDropdownClickevent', event);
    setSmartCheckoutDrawerVisible(true);
  };

  return (
    <SimpleLayout
      testId="payment-methods"
      header={<HeaderNavigation onCloseButtonClick={() => sendPrimaryRevenueWidgetCloseEvent()} />}
      footer={<FooterLogo />}
    >

      <Box
        id="smart-checkout-content"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            paddingX: 'base.spacing.x2',
            paddingY: 'base.spacing.x8',
            rowGap: 'base.spacing.x4',
          }}
        >
          <Heading size="small">
            Pay with your
          </Heading>
          {mockSmartCheckoutOptions.length === 1
            ? (mockSmartCheckoutOptions[0].label)
            : (

              <Select
                defaultLabel={mockSmartCheckoutOptions[0].label}
                targetClickOveride={onSmartCheckoutDropdownClick}
              >
                {/* {mockSmartCheckoutOptions.map((option, i) => (
                  <Option optionKey={i}>
                    <Option.Label>{option.label}</Option.Label>
                  </Option>
                ))} */}
              </Select>

            )}

        </Box>

        <Body size="small">
          We’ll swap ETH for USDC to fund this purchase
          <br />
          Estimated fees:  USD $0.10
        </Body>
        <Button variant="primary" onClick={onClickContinue}>
          {options.continue.text}
        </Button>
        <Button variant="tertiary">
          {options.payWithCard.text}
        </Button>
      </Box>
      <SmartCheckoutDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseBottomSheet={closeBottomSheet}
      />
    </SimpleLayout>
  );
}
