/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Body, Box,
  Button, Heading, Select,
} from '@biom3/react';
import { useState } from 'react';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FundingRouteDrawer } from '../FundingRouteSelectDrawer/FundingRouteDrawer';

type FundingRouteSelectProps = {
  fundingRoutes: any[];
};

export function FundingRouteSelect({ fundingRoutes }: FundingRouteSelectProps) {
  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [activeFundingRouteIndex, setActiveFundingRouteIndex] = useState(0);

  const onClickContinue = () => {
    console.log('@@@ onClickContinue');
  };

  const closeBottomSheet = (selectedFundingRouteIndex: number) => {
    setActiveFundingRouteIndex(selectedFundingRouteIndex);
    setSmartCheckoutDrawerVisible(false);
  };

  const onSmartCheckoutDropdownClick = (event) => {
    console.log('@@@@@ onSmartCheckoutDropdownClickevent', event);
    setSmartCheckoutDrawerVisible(true);
  };

  return (
    <SimpleLayout
      testId="funding-route-select"
      header={<HeaderNavigation onCloseButtonClick={() => {}} />}
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
          {fundingRoutes.length === 1
            ? (fundingRoutes[activeFundingRouteIndex].steps[0].type)
            : (

              <Select
                defaultLabel={fundingRoutes[activeFundingRouteIndex].steps[0].type}
                targetClickOveride={onSmartCheckoutDropdownClick}
              />

            )}

        </Box>

        <Body size="small">
          We’ll swap ETH for USDC to fund this purchase
          <br />
          Estimated fees:  USD $0.10
        </Body>
        <Button variant="primary" onClick={onClickContinue}>
          {/* {options.continue.text} */}
          continue
        </Button>
        <Button variant="tertiary">
          {/* {options.payWithCard.text} */}
          pay with card
        </Button>
      </Box>
      <FundingRouteDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseBottomSheet={closeBottomSheet}
        fundingRoutes={fundingRoutes}
        activeFundingRouteIndex={activeFundingRouteIndex}
      />
    </SimpleLayout>
  );
}
