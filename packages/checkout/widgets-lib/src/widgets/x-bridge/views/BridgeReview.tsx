import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  Box, Button,
} from '@biom3/react';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';

import { BridgeReviewSummary } from '../components/BridgeReviewSummary';

export function BridgeReview() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { layoutHeading, footer } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

  return (
    <SimpleLayout
      testId="bridge-review"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'base.spacing.x4',
            paddingX: 'base.spacing.x4',
            backgroundColor: 'base.color.translucent.standard.200',
            width: '100%',
          }}
        >
          <Button size="large" sx={{ width: '100%' }}>
            {footer.buttonText}
          </Button>
          <FooterLogo />
        </Box>
      )}
    >
      <BridgeReviewSummary />
    </SimpleLayout>
  );
}
