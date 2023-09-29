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
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { PurchaseMenuItem } from '../PurchaseMenuItem/PurchaseMenuItem';

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

  const onSmartCheckoutDropdownClick = () => {
    console.log('@@@@@ onSmartCheckoutDropdownClickevent');
    setSmartCheckoutDrawerVisible(true);
  };

  return (
    <SimpleLayout
      testId="funding-route-select"
      header={<HeaderNavigation onCloseButtonClick={() => {}} />}
      footer={<FooterLogo />}
    >

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
          height: '100%',
        }}
      >
        <Heading size="small">
          Pay with your
        </Heading>

        {fundingRoutes.length === 0
          ? (
            <Heading size="small">
              No funding routes available
            </Heading>
          )
          : (
            <FundingRouteMenuItem
              data-testid="funding-route-select-selected-route"
              onClick={fundingRoutes.length > 1 ? onSmartCheckoutDropdownClick : () => {}}
              fundingRoute={fundingRoutes[activeFundingRouteIndex]}
              selected
              toggleVisible={fundingRoutes.length > 1}
            />
          ) }

        {/* TODO add purchase data here */}
        <PurchaseMenuItem />

        <Button sx={{ mt: 'auto' }} variant="primary" onClick={onClickContinue}>
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
