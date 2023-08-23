/* eslint-disable no-unused-vars */

import { Body, Box } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';

export function PayWithCard() {
  return (
    <SimpleLayout
      testId="review-order-view"
      header={
        <HeaderNavigation title="Transak" onCloseButtonClick={() => {}} />
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
          Will be redirecting you to Transak...
        </Body>
      </Box>
    </SimpleLayout>
  );
}
