/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Body, Box, Button, Heading,
  Option,
  Select,
} from '@biom3/react';

import { useContext, useState } from 'react';
import { ChainId } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { text } from '../../../resources/text/textConfig';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenuWidgetEvents';
import { SmartCheckoutDrawer } from '../components/SmartCheckoutDrawer/SmartCheckoutDrawer';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';

export function SmartCheckout() {
  const { options } = text.views[PrimaryRevenueWidgetViews.SMART_CHECKOUT];
  const { viewDispatch } = useContext(ViewContext);

  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [activeFundingRouteIndex, setActiveFundingRouteIndex] = useState(0);

  const fundingRoutes = [
    {
      priority: 1,
      steps: [{
        type: 'BRIDGE',
        chainId: ChainId.SEPOLIA,
        asset: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      }],
    },
    {
      priority: 2,
      steps: [{
        type: 'SWAP',
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        asset: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
      }],
    },
  ];

  const onClickContinue = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PrimaryRevenueWidgetViews.SWAP,
        },
      },
    });
  };

  const closeBottomSheet = (selectedFundingRouteIndex: number) => {
    setActiveFundingRouteIndex(selectedFundingRouteIndex);
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
          {options.continue.text}
        </Button>
        <Button variant="tertiary">
          {options.payWithCard.text}
        </Button>
      </Box>
      <SmartCheckoutDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseBottomSheet={closeBottomSheet}
        fundingRoutes={fundingRoutes}
        activeFundingRouteIndex={activeFundingRouteIndex}
      />
    </SimpleLayout>
  );
}
