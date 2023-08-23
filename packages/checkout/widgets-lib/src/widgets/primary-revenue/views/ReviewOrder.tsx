/* eslint-disable no-unused-vars */

import { Body, Box } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

export function ReviewOrder() {
  const { header } = text.views[PrimaryRevenueWidgetViews.REVIEW_ORDER];

  return (
    <SimpleLayout
      testId="review-order-view"
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
      </Box>
    </SimpleLayout>
  );
}
